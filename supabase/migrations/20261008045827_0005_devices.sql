create table devices (
  id uuid primary key default gen_random_uuid(),
  device_type device_type_enum not null,
  brand text,
  model text not null,
  serial_number text unique,
  asset_id text not null unique,
  purchase_date date,
  purchased_by uuid references users(id),
  purchase_price numeric(12, 2) check (purchase_price is null or purchase_price >= 0),
  warranty_duration_months integer check (warranty_duration_months is null or warranty_duration_months >= 0),
  warranty_start_date date,
  warranty_end_date date,
  status asset_status_enum not null default 'available',
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint devices_warranty_dates_check check (
    warranty_start_date is null or warranty_end_date is null or warranty_end_date >= warranty_start_date
  )
);

create trigger trg_devices_updated_at
  before update on devices
  for each row execute function set_updated_at();

create index idx_devices_asset_id on devices(asset_id);
create index idx_devices_serial_number on devices(serial_number);
create index idx_devices_status on devices(status);

alter table devices enable row level security;
