create table user_licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  license_name text not null,
  license_type text,
  status license_status_enum not null default 'active',
  start_date date,
  expiry_date date,
  auto_renew boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_user_licenses_updated_at
  before update on user_licenses
  for each row execute function set_updated_at();

create index idx_user_licenses_user_id on user_licenses(user_id);
create index idx_user_licenses_expiry_date on user_licenses(expiry_date);
create index idx_user_licenses_status on user_licenses(status);

alter table user_licenses enable row level security;

-- Preserves annual renewal history; never overwrites previous renewal records
-- (Backend Schema §24 / §58).
create table license_renewals (
  id uuid primary key default gen_random_uuid(),
  user_license_id uuid not null references user_licenses(id),
  user_id uuid not null references users(id),
  previous_expiry_date date,
  renewed_on date not null default current_date,
  new_expiry_date date not null,
  renewed_by uuid references users(id),
  notes text,
  created_at timestamptz not null default now()
);

create index idx_license_renewals_user_license_id on license_renewals(user_license_id);
create index idx_license_renewals_user_id on license_renewals(user_id);

alter table license_renewals enable row level security;
