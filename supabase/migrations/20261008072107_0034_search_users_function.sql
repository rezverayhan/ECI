-- Reconstructed during the staging-feasibility audit: this file (and 0035
-- below) exist in the remote production project's applied migration history
-- (supabase_migrations.schema_migrations) but were missing from this local
-- supabase/migrations/ directory — a local/remote tracking drift discovered
-- while checking whether this folder alone can reproduce the full schema on
-- a fresh project. Without it, search_users() would not exist on a fresh
-- replay, breaking the Users list page and every manager-picker combobox
-- that depends on it.
--
-- This is reconstructed from the function's current live definition
-- (pg_get_functiondef against production), which already incorporates
-- 0035's citext-cast fix — the original, separately-buggy 0034 content is
-- not recoverable and is not guessed at here. See 0035 for why it's kept
-- as a near-empty placeholder rather than merged away.
create or replace function public.search_users(
  p_query text default null,
  p_department_id uuid default null,
  p_designation_id uuid default null,
  p_employment_status employment_status_enum default null,
  p_manager_id uuid default null,
  p_limit integer default 25,
  p_offset integer default 0,
  p_sort_by text default 'full_name',
  p_sort_dir text default 'asc'
)
returns table (
  id uuid,
  employee_id text,
  user_id text,
  full_name text,
  official_email text,
  phone text,
  profile_photo_path text,
  department_id uuid,
  department_name text,
  designation_id uuid,
  designation_name text,
  manager_id uuid,
  manager_name text,
  employment_status employment_status_enum,
  access_level access_level_enum,
  is_active boolean,
  join_date date,
  total_count bigint
)
language plpgsql
stable
set search_path to ''
as $function$
declare
  v_sort_column text;
  v_sort_dir text;
begin
  v_sort_column := case p_sort_by
    when 'employee_id' then 'u.employee_id'
    when 'department' then 'd.name'
    when 'status' then 'u.employment_status::text'
    when 'join_date' then 'u.join_date'
    else 'u.full_name'
  end;
  v_sort_dir := case lower(coalesce(p_sort_dir, 'asc')) when 'desc' then 'desc' else 'asc' end;

  return query execute format(
    $q$
    select
      u.id, u.employee_id, u.user_id, u.full_name, u.official_email::text, u.phone,
      u.profile_photo_path, u.department_id, d.name, u.designation_id, des.name,
      u.manager_id, m.full_name, u.employment_status, u.access_level, u.is_active,
      u.join_date,
      count(*) over()::bigint as total_count
    from public.users u
    left join public.departments d on d.id = u.department_id
    left join public.designations des on des.id = u.designation_id
    left join public.users m on m.id = u.manager_id
    left join public.machine_profiles mp on mp.user_id = u.id
    left join public.device_assignments da
      on da.user_id = u.id and da.assignment_status = 'active'
    left join public.devices dev on dev.id = da.device_id
    left join public.ip_assignments ia
      on ia.user_id = u.id and ia.assignment_status = 'active'
    left join public.ip_addresses ip on ip.id = ia.ip_address_id
    left join public.ip_phone_assignments ipa
      on ipa.user_id = u.id and ipa.assignment_status = 'active'
    left join public.ip_phones ph on ph.id = ipa.ip_phone_id
    where u.deleted_at is null
      and ($1 is null or $1 = '' or (
        u.full_name ilike '%%' || $1 || '%%'
        or u.employee_id ilike '%%' || $1 || '%%'
        or u.user_id ilike '%%' || $1 || '%%'
        or u.official_email ilike '%%' || $1 || '%%'
        or u.phone ilike '%%' || $1 || '%%'
        or mp.machine_name ilike '%%' || $1 || '%%'
        or dev.asset_id ilike '%%' || $1 || '%%'
        or host(ip.ip_address) ilike '%%' || $1 || '%%'
        or ph.extension ilike '%%' || $1 || '%%'
      ))
      and ($2 is null or u.department_id = $2)
      and ($3 is null or u.designation_id = $3)
      and ($4 is null or u.employment_status = $4)
      and ($5 is null or u.manager_id = $5)
    order by %s %s nulls last, u.full_name asc
    limit $6 offset $7
    $q$,
    v_sort_column, v_sort_dir
  )
  using p_query, p_department_id, p_designation_id, p_employment_status, p_manager_id, p_limit, p_offset;
end;
$function$;

-- Matches the live grant set: authenticated may call it, anon may not.
revoke all on function public.search_users(text, uuid, uuid, employment_status_enum, uuid, integer, integer, text, text) from public;
grant execute on function public.search_users(text, uuid, uuid, employment_status_enum, uuid, integer, integer, text, text) to authenticated;
