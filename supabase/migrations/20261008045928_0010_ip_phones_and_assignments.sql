create table ip_phones (
  id uuid primary key default gen_random_uuid(),
  extension text not null unique,
  phone_type text,
  status ip_phone_status_enum not null default 'active',
  department_id uuid references departments(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_ip_phones_updated_at
  before update on ip_phones
  for each row execute function set_updated_at();

create index idx_ip_phones_department_id on ip_phones(department_id);

alter table ip_phones enable row level security;

create table ip_phone_assignments (
  id uuid primary key default gen_random_uuid(),
  ip_phone_id uuid not null references ip_phones(id),
  user_id uuid not null references users(id),
  assigned_at timestamptz not null default now(),
  released_at timestamptz,
  assigned_by uuid references users(id),
  released_by uuid references users(id),
  assignment_status assignment_state_enum not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ip_phone_assignments_dates_check check (
    released_at is null or released_at >= assigned_at
  )
);

create trigger trg_ip_phone_assignments_updated_at
  before update on ip_phone_assignments
  for each row execute function set_updated_at();

-- An extension may have at most one active user assignment (Backend Schema §66).
create unique index uq_ip_phone_assignments_active_phone
  on ip_phone_assignments(ip_phone_id) where (assignment_status = 'active');

create unique index uq_ip_phone_assignments_active_user
  on ip_phone_assignments(user_id) where (assignment_status = 'active');

create index idx_ip_phone_assignments_ip_phone_id on ip_phone_assignments(ip_phone_id);
create index idx_ip_phone_assignments_user_id on ip_phone_assignments(user_id);

alter table ip_phone_assignments enable row level security;
