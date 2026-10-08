-- Preserves complete physical-device lifecycle history (PRD §8.3).
-- Historical assignments are never overwritten, only closed via returned_at.
create table device_assignments (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references devices(id),
  user_id uuid not null references users(id),
  assigned_at timestamptz not null default now(),
  returned_at timestamptz,
  assigned_by uuid references users(id),
  returned_by uuid references users(id),
  assignment_status assignment_state_enum not null default 'active',
  replacement_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint device_assignments_dates_check check (
    returned_at is null or returned_at >= assigned_at
  )
);

create trigger trg_device_assignments_updated_at
  before update on device_assignments
  for each row execute function set_updated_at();

-- A device may have at most one active assignment (Backend Schema §64).
create unique index uq_device_assignments_active_device
  on device_assignments(device_id) where (assignment_status = 'active');

-- A user may have at most one active primary device for the current MVP.
create unique index uq_device_assignments_active_user
  on device_assignments(user_id) where (assignment_status = 'active');

create index idx_device_assignments_device_id on device_assignments(device_id);
create index idx_device_assignments_user_id on device_assignments(user_id);
create index idx_device_assignments_assigned_at on device_assignments(assigned_at);
create index idx_device_assignments_returned_at on device_assignments(returned_at);

alter table device_assignments enable row level security;
