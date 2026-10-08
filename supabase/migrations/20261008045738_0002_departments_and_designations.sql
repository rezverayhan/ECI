create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_departments_updated_at
  before update on departments
  for each row execute function set_updated_at();

alter table departments enable row level security;

-- Designations are job-title reference data (e.g. "IT Executive"), distinct
-- from the access_level_enum classification used for authorization. This is
-- deliberately NOT a permissions table.
create table designations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_designations_updated_at
  before update on designations
  for each row execute function set_updated_at();

alter table designations enable row level security;
