create table printers (
  id uuid primary key default gen_random_uuid(),
  printer_name text not null,
  brand text,
  model text,
  serial_number text unique,
  asset_id text not null unique,
  printer_type text,
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
  constraint printers_warranty_dates_check check (
    warranty_start_date is null or warranty_end_date is null or warranty_end_date >= warranty_start_date
  )
);

create trigger trg_printers_updated_at
  before update on printers
  for each row execute function set_updated_at();

create index idx_printers_asset_id on printers(asset_id);
create index idx_printers_status on printers(status);

alter table printers enable row level security;

create table printer_assignments (
  id uuid primary key default gen_random_uuid(),
  printer_id uuid not null references printers(id),
  user_id uuid not null references users(id),
  assigned_at timestamptz not null default now(),
  returned_at timestamptz,
  assigned_by uuid references users(id),
  returned_by uuid references users(id),
  assignment_status assignment_state_enum not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint printer_assignments_dates_check check (
    returned_at is null or returned_at >= assigned_at
  )
);

create trigger trg_printer_assignments_updated_at
  before update on printer_assignments
  for each row execute function set_updated_at();

-- A printer may have at most one active primary assignment (Backend Schema §65).
create unique index uq_printer_assignments_active_printer
  on printer_assignments(printer_id) where (assignment_status = 'active');

create index idx_printer_assignments_printer_id on printer_assignments(printer_id);
create index idx_printer_assignments_user_id on printer_assignments(user_id);

alter table printer_assignments enable row level security;
