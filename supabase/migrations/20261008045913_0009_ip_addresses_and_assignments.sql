create table ip_addresses (
  id uuid primary key default gen_random_uuid(),
  ip_address inet not null unique,
  status ip_status_enum not null default 'free',
  reserved_for uuid references users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_ip_addresses_updated_at
  before update on ip_addresses
  for each row execute function set_updated_at();

create index idx_ip_addresses_status on ip_addresses(status);

alter table ip_addresses enable row level security;

-- The same IP cannot be actively assigned to two users simultaneously
-- (Backend Schema §17 / §62). Enforced here, not only in the frontend.
create table ip_assignments (
  id uuid primary key default gen_random_uuid(),
  ip_address_id uuid not null references ip_addresses(id),
  user_id uuid not null references users(id),
  assigned_at timestamptz not null default now(),
  released_at timestamptz,
  assigned_by uuid references users(id),
  released_by uuid references users(id),
  assignment_status assignment_state_enum not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ip_assignments_dates_check check (
    released_at is null or released_at >= assigned_at
  )
);

create trigger trg_ip_assignments_updated_at
  before update on ip_assignments
  for each row execute function set_updated_at();

create unique index uq_ip_assignments_active_ip
  on ip_assignments(ip_address_id) where (assignment_status = 'active');

create unique index uq_ip_assignments_active_user
  on ip_assignments(user_id) where (assignment_status = 'active');

create index idx_ip_assignments_ip_address_id on ip_assignments(ip_address_id);
create index idx_ip_assignments_user_id on ip_assignments(user_id);

alter table ip_assignments enable row level security;
