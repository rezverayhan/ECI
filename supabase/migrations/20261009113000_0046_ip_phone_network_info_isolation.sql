-- Security fix: ip_phones.ip_address (added by migration 0042) inherited the
-- table's pre-existing `ip_phones_select ... using (true)` policy from
-- 0024_rls_reference_data.sql, which was written when the comment there said
-- "ip_phones ... never stores an IP address, so broad read access does not
-- leak network information." That assumption broke the moment 0042 landed:
-- RLS is row-level only, so every authenticated user — not just IT
-- Administrators — can read every phone's IP address directly off the table,
-- regardless of what the application's own queries choose to select.
--
-- Fix: move the one sensitive column into its own table with its own strict
-- RLS, rather than touching `ip_phones_select`/`ip_phones_write`. Tightening
-- those policies to is_it_administrator() instead would also hide extension/
-- phone_type/status/department from the org-wide directory and from a
-- General User's own Employee 360 self-view — both explicitly required to
-- stay open (PRD §10, App Flow). Splitting the column means the directory
-- and self-view keep working unmodified, while ip_address becomes
-- unreachable for anyone but an IT Administrator at the database level, not
-- just by app-layer convention.

create table public.ip_phone_network_info (
  ip_phone_id uuid primary key references public.ip_phones(id) on delete cascade,
  ip_address inet,
  updated_at timestamptz not null default now()
);

create trigger trg_ip_phone_network_info_updated_at
  before update on public.ip_phone_network_info
  for each row execute function public.set_updated_at();

alter table public.ip_phone_network_info enable row level security;

-- Single `for all` policy, matching the existing admin-only-write convention
-- used throughout this schema (e.g. ip_phones_write, user_licenses_write).
create policy ip_phone_network_info_all on public.ip_phone_network_info
  for all to authenticated
  using (public.is_it_administrator())
  with check (public.is_it_administrator());

-- Explicit belt-and-suspenders: this table holds nothing but network
-- addresses, so anon never gets table-level privileges at all (RLS is the
-- primary gate above; this removes the object-level grant too).
revoke all on public.ip_phone_network_info from anon;
grant select, insert, update, delete on public.ip_phone_network_info to authenticated;

-- Carry forward any IP addresses already recorded before dropping the column.
insert into public.ip_phone_network_info (ip_phone_id, ip_address)
select id, ip_address from public.ip_phones where ip_address is not null;

alter table public.ip_phones drop column ip_address;

-- Replacement for the direct insert createIpPhone() used to perform: creating
-- the phone row and (optionally) its network-info row must succeed or fail
-- together, so a failed second insert never leaves a phone registered with a
-- silently-dropped IP. A single SECURITY DEFINER function call is one
-- transaction, mirroring the create_room_booking/create_car_booking pattern
-- in 0044_booking_trusted_mutation_rpcs.sql. Authorization is re-checked
-- inside the function — it is never trusted from the caller.
create or replace function public.create_ip_phone(
  p_extension text,
  p_phone_type text default null,
  p_department_id uuid default null,
  p_ip_address inet default null,
  p_notes text default null
)
returns public.ip_phones
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_phone public.ip_phones;
begin
  if not public.is_it_administrator() then
    raise exception 'You are not authorized to register IP Phone extensions.';
  end if;

  insert into public.ip_phones (extension, phone_type, department_id, status, notes)
  values (p_extension, p_phone_type, p_department_id, 'active', p_notes)
  returning * into v_phone;

  if p_ip_address is not null then
    insert into public.ip_phone_network_info (ip_phone_id, ip_address)
    values (v_phone.id, p_ip_address);
  end if;

  return v_phone;
end;
$$;

-- `from public` alone does not strip Supabase's default auto-grant of EXECUTE to
-- `anon` on new functions — this project already hit that exact gap twice (0032,
-- 0045), so anon is revoked explicitly here too, not just the PUBLIC pseudo-role.
revoke all on function public.create_ip_phone(text, text, uuid, inet, text) from public;
revoke execute on function public.create_ip_phone(text, text, uuid, inet, text) from anon;
grant execute on function public.create_ip_phone(text, text, uuid, inet, text) to authenticated;
