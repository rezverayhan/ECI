create table applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vendor text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_applications_updated_at
  before update on applications
  for each row execute function set_updated_at();

alter table applications enable row level security;

create table user_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  application_id uuid not null references applications(id),
  version text,
  license_type text,
  license_status text,
  assigned_date date,
  renewal_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_user_applications_updated_at
  before update on user_applications
  for each row execute function set_updated_at();

create index idx_user_applications_user_id on user_applications(user_id);
create index idx_user_applications_application_id on user_applications(application_id);

alter table user_applications enable row level security;
