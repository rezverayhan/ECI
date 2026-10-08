create table users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  employee_id text not null unique,
  user_id text not null unique,
  full_name text not null,
  official_email citext not null unique,
  phone text,
  profile_photo_path text,
  designation_id uuid not null references designations(id),
  department_id uuid not null references departments(id),
  manager_id uuid references users(id),
  join_date date,
  employment_status employment_status_enum not null default 'active',
  access_level access_level_enum not null default 'general_user',
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

create index idx_users_employee_id on users(employee_id);
create index idx_users_user_id on users(user_id);
create index idx_users_official_email on users(official_email);
create index idx_users_department_id on users(department_id);
create index idx_users_designation_id on users(designation_id);
create index idx_users_manager_id on users(manager_id);
create index idx_users_employment_status on users(employment_status);
create index idx_users_full_name_trgm on users using gin (full_name extensions.gin_trgm_ops);

alter table users enable row level security;
