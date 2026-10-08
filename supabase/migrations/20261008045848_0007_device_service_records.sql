create table device_service_records (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references devices(id),
  service_date date not null default current_date,
  service_type service_type_enum not null,
  problem text,
  description text,
  provider text,
  service_center text,
  technician text,
  warranty_covered boolean,
  cost numeric(12, 2) check (cost is null or cost >= 0),
  status service_status_enum not null default 'open',
  resolution text,
  completed_date date,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_device_service_records_updated_at
  before update on device_service_records
  for each row execute function set_updated_at();

create index idx_device_service_records_device_id on device_service_records(device_id);
create index idx_device_service_records_status on device_service_records(status);

alter table device_service_records enable row level security;
