-- Machine identity is intentionally separate from physical device identity
-- (PRD §7 / Backend Schema §18). A machine name must not change automatically
-- when a physical device changes.
create table machine_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id),
  machine_name text not null,
  operating_system text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_machine_profiles_updated_at
  before update on machine_profiles
  for each row execute function set_updated_at();

create index idx_machine_profiles_machine_name on machine_profiles(machine_name);

alter table machine_profiles enable row level security;
