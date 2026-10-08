create table cars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text unique,
  model text,
  driver_information text,
  status resource_status_enum not null default 'available',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_cars_updated_at
  before update on cars
  for each row execute function set_updated_at();

alter table cars enable row level security;

create table car_bookings (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references cars(id),
  user_id uuid not null references users(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  destination text,
  purpose text,
  status booking_status_enum not null default 'confirmed',
  admin_action text,
  admin_action_reason text,
  cancelled_at timestamptz,
  cancelled_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint car_bookings_time_check check (end_at > start_at)
);

create trigger trg_car_bookings_updated_at
  before update on car_bookings
  for each row execute function set_updated_at();

alter table car_bookings
  add constraint car_bookings_no_overlap
  exclude using gist (
    car_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  )
  where (status = 'confirmed');

create index idx_car_bookings_car_id on car_bookings(car_id);
create index idx_car_bookings_user_id on car_bookings(user_id);
create index idx_car_bookings_status on car_bookings(status);

alter table car_bookings enable row level security;
