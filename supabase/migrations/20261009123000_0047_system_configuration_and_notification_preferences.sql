-- 0047: System Configuration and Notification Preferences
--
-- 1. system_configuration: System-wide operational settings controlled by IT Administrators.
--    Single-row table (id='default') with strict RLS: readable by all authenticated users,
--    modifiable only by IT Administrators.
--
-- 2. notification_preferences: Per-user preferences for notification channels and categories.
--    Self-scoped RLS: each user can only read and update their own preference record.

-- ============================================================================
-- 1. System Configuration
-- ============================================================================

create table if not exists public.system_configuration (
  id text primary key default 'default' check (id = 'default'),
  app_name text not null default 'ECI User Management',
  maintenance_mode boolean not null default false,
  maintenance_message text,
  max_booking_advance_days integer not null default 30 check (max_booking_advance_days between 1 and 365),
  max_booking_duration_hours integer not null default 8 check (max_booking_duration_hours between 1 and 24),
  support_auto_acknowledge boolean not null default false,
  support_ticket_prefix text not null default 'ECI-IT',
  updated_by uuid references public.users(id),
  updated_at timestamptz not null default now()
);

alter table public.system_configuration enable row level security;

create policy "system_configuration_select" on public.system_configuration
  for select to authenticated
  using (true);

create policy "system_configuration_insert" on public.system_configuration
  for insert to authenticated
  with check (public.is_it_administrator());

create policy "system_configuration_update" on public.system_configuration
  for update to authenticated
  using (public.is_it_administrator())
  with check (public.is_it_administrator());

create trigger trg_system_configuration_updated_at
  before update on public.system_configuration
  for each row execute function public.set_updated_at();

-- Seed initial row
insert into public.system_configuration (
  id,
  app_name,
  maintenance_mode,
  max_booking_advance_days,
  max_booking_duration_hours,
  support_auto_acknowledge,
  support_ticket_prefix
) values (
  'default',
  'ECI User Management',
  false,
  30,
  8,
  false,
  'ECI-IT'
) on conflict (id) do nothing;

-- ============================================================================
-- 2. Notification Preferences
-- ============================================================================

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  notify_support boolean not null default true,
  notify_bookings boolean not null default true,
  push_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notification_preferences_user_id
  on public.notification_preferences(user_id);

alter table public.notification_preferences enable row level security;

create policy "notification_preferences_select" on public.notification_preferences
  for select to authenticated
  using (user_id = public.current_user_id() or public.is_it_administrator());

create policy "notification_preferences_insert" on public.notification_preferences
  for insert to authenticated
  with check (user_id = public.current_user_id());

create policy "notification_preferences_update" on public.notification_preferences
  for update to authenticated
  using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

create policy "notification_preferences_delete" on public.notification_preferences
  for delete to authenticated
  using (user_id = public.current_user_id());

create trigger trg_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();
