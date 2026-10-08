create table meeting_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text,
  capacity integer check (capacity is null or capacity > 0),
  description text,
  status resource_status_enum not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_meeting_rooms_updated_at
  before update on meeting_rooms
  for each row execute function set_updated_at();

alter table meeting_rooms enable row level security;

create table meeting_room_bookings (
  id uuid primary key default gen_random_uuid(),
  meeting_room_id uuid not null references meeting_rooms(id),
  user_id uuid not null references users(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  title text,
  purpose text,
  status booking_status_enum not null default 'confirmed',
  admin_action text,
  admin_action_reason text,
  cancelled_at timestamptz,
  cancelled_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meeting_room_bookings_time_check check (end_at > start_at)
);

create trigger trg_meeting_room_bookings_updated_at
  before update on meeting_room_bookings
  for each row execute function set_updated_at();

-- Database-enforced conflict prevention: no two confirmed bookings for the
-- same room may overlap in time (PRD §14 / Backend Schema §33, §56).
-- Frontend availability is a convenience view only, never authoritative.
alter table meeting_room_bookings
  add constraint meeting_room_bookings_no_overlap
  exclude using gist (
    meeting_room_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  )
  where (status = 'confirmed');

create index idx_meeting_room_bookings_room_id on meeting_room_bookings(meeting_room_id);
create index idx_meeting_room_bookings_user_id on meeting_room_bookings(user_id);
create index idx_meeting_room_bookings_status on meeting_room_bookings(status);

alter table meeting_room_bookings enable row level security;
