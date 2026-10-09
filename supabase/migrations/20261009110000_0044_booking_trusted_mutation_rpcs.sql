-- Audit logging security fix for the Bookings module.
--
-- Root cause: audit_logs_insert requires is_it_administrator() AND
-- actor_user_id = current_user_id(). Every pre-existing logAuditEvent() call
-- site is IT-Administrator-driven (Users/Devices/IP/IP Phone/Printers/
-- Applications/Support are all gated behind RequireAccessLevel
-- ['it_administrator']), so that policy was never actually wrong for them.
-- Bookings is the first module where a General User mutates their own data
-- (self-service booking) or an 'admin' (not 'it_administrator') mutates
-- someone else's row (cancel/pause/deny) — both cases silently fail the
-- audit_logs RLS check when the client inserts the audit row directly, and
-- the same gap exists for notifications sent to a user other than the actor.
--
-- Fix: move booking create/cancel/pause/deny entirely into narrowly-scoped
-- SECURITY DEFINER functions, mirroring the existing current_user_id() /
-- is_it_administrator() trusted-helper pattern already used throughout this
-- schema. The actor is always derived server-side from auth.uid() via
-- current_user_id() — never accepted as a parameter. Each function performs
-- authorization + state validation, the booking mutation, the audit_logs
-- insert, and the notifications insert as one atomic function call: if any
-- step fails (including the audit insert), the whole call rolls back, so a
-- mutation can never succeed while its audit event is silently lost.
--
-- Direct table INSERT/UPDATE on the two booking tables is then revoked for
-- `authenticated` (SELECT is untouched) so this trusted path cannot be
-- bypassed by writing to the tables directly — the functions themselves run
-- as table owner `postgres` and are therefore unaffected by that revocation.

create or replace function public.create_room_booking(
  p_meeting_room_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_title text default null,
  p_purpose text default null
)
returns public.meeting_room_bookings
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_user_id uuid := public.current_user_id();
  v_room_status public.resource_status_enum;
  v_booking public.meeting_room_bookings;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to create a booking.';
  end if;

  select status into v_room_status from public.meeting_rooms where id = p_meeting_room_id;
  if v_room_status is null then
    raise exception 'This meeting room no longer exists.';
  end if;
  if v_room_status <> 'available' then
    raise exception 'This meeting room is not currently available for booking.';
  end if;

  if p_end_at <= p_start_at then
    raise exception 'Start time must be before end time.';
  end if;
  if p_start_at < now() then
    raise exception 'This booking starts in the past. Choose a current or future time.';
  end if;

  insert into public.meeting_room_bookings (user_id, meeting_room_id, start_at, end_at, title, purpose)
  values (v_user_id, p_meeting_room_id, p_start_at, p_end_at, nullif(trim(p_title), ''), nullif(trim(p_purpose), ''))
  returning * into v_booking;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, new_values)
  values (v_user_id, 'ROOM_BOOKING_CONFIRMED', 'meeting_room_bookings', v_booking.id, to_jsonb(v_booking));

  insert into public.notifications (recipient_user_id, notification_type, title, message, related_entity_type, related_entity_id)
  values (
    v_user_id,
    'ROOM_BOOKING_STATUS_CHANGED',
    'Meeting room booking confirmed',
    case when v_booking.title is not null then 'Your booking "' || v_booking.title || '" has been confirmed.'
         else 'Your meeting room booking has been confirmed.' end,
    'meeting_room_bookings',
    v_booking.id
  );

  return v_booking;
end;
$$;

create or replace function public.create_car_booking(
  p_car_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_destination text default null,
  p_purpose text default null
)
returns public.car_bookings
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_user_id uuid := public.current_user_id();
  v_car_status public.resource_status_enum;
  v_booking public.car_bookings;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to create a booking.';
  end if;

  select status into v_car_status from public.cars where id = p_car_id;
  if v_car_status is null then
    raise exception 'This car no longer exists.';
  end if;
  if v_car_status <> 'available' then
    raise exception 'This car is not currently available for booking.';
  end if;

  if p_end_at <= p_start_at then
    raise exception 'Start time must be before end time.';
  end if;
  if p_start_at < now() then
    raise exception 'This booking starts in the past. Choose a current or future time.';
  end if;

  insert into public.car_bookings (user_id, car_id, start_at, end_at, destination, purpose)
  values (v_user_id, p_car_id, p_start_at, p_end_at, nullif(trim(p_destination), ''), nullif(trim(p_purpose), ''))
  returning * into v_booking;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, new_values)
  values (v_user_id, 'CAR_BOOKING_CONFIRMED', 'car_bookings', v_booking.id, to_jsonb(v_booking));

  insert into public.notifications (recipient_user_id, notification_type, title, message, related_entity_type, related_entity_id)
  values (
    v_user_id,
    'CAR_BOOKING_STATUS_CHANGED',
    'Car booking confirmed',
    case when v_booking.destination is not null then 'Your car booking to "' || v_booking.destination || '" has been confirmed.'
         else 'Your car booking has been confirmed.' end,
    'car_bookings',
    v_booking.id
  );

  return v_booking;
end;
$$;

create or replace function public.set_room_booking_status(
  p_booking_id uuid,
  p_action text,
  p_reason text default null
)
returns public.meeting_room_bookings
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_actor uuid := public.current_user_id();
  v_allowed public.booking_status_enum[];
  v_old public.meeting_room_bookings;
  v_booking public.meeting_room_bookings;
begin
  if v_actor is null then
    raise exception 'You must be signed in to perform this action.';
  end if;
  if not (public.is_it_administrator() or public.is_admin()) then
    raise exception 'You are not authorized to modify this booking.';
  end if;
  if p_action not in ('cancelled', 'paused', 'denied') then
    raise exception 'Invalid booking action.';
  end if;

  v_allowed := case p_action
    when 'paused' then array['confirmed']::public.booking_status_enum[]
    else array['confirmed', 'pending', 'paused']::public.booking_status_enum[]
  end;

  select * into v_old from public.meeting_room_bookings where id = p_booking_id;
  if v_old.id is null then
    raise exception 'Booking not found.';
  end if;
  if not (v_old.status = any(v_allowed)) then
    raise exception 'This booking is no longer in a state that allows this action. Refresh and try again.';
  end if;

  update public.meeting_room_bookings
  set status = p_action::public.booking_status_enum,
      admin_action = p_action,
      admin_action_reason = nullif(trim(p_reason), ''),
      cancelled_at = now(),
      cancelled_by = v_actor
  where id = p_booking_id
  returning * into v_booking;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, old_values, new_values)
  values (v_actor, 'ROOM_BOOKING_' || upper(p_action), 'meeting_room_bookings', v_booking.id, to_jsonb(v_old), to_jsonb(v_booking));

  insert into public.notifications (recipient_user_id, notification_type, title, message, related_entity_type, related_entity_id)
  values (
    v_booking.user_id,
    'ROOM_BOOKING_STATUS_CHANGED',
    'Meeting room booking update',
    case p_action
      when 'cancelled' then 'Your meeting room booking has been cancelled.'
      when 'paused' then 'Your meeting room booking has been paused by IT/Admin.'
      else 'Your meeting room booking has been denied.'
    end,
    'meeting_room_bookings',
    v_booking.id
  );

  return v_booking;
end;
$$;

create or replace function public.set_car_booking_status(
  p_booking_id uuid,
  p_action text,
  p_reason text default null
)
returns public.car_bookings
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_actor uuid := public.current_user_id();
  v_allowed public.booking_status_enum[];
  v_old public.car_bookings;
  v_booking public.car_bookings;
begin
  if v_actor is null then
    raise exception 'You must be signed in to perform this action.';
  end if;
  if not (public.is_it_administrator() or public.is_admin()) then
    raise exception 'You are not authorized to modify this booking.';
  end if;
  if p_action not in ('cancelled', 'paused', 'denied') then
    raise exception 'Invalid booking action.';
  end if;

  v_allowed := case p_action
    when 'paused' then array['confirmed']::public.booking_status_enum[]
    else array['confirmed', 'pending', 'paused']::public.booking_status_enum[]
  end;

  select * into v_old from public.car_bookings where id = p_booking_id;
  if v_old.id is null then
    raise exception 'Booking not found.';
  end if;
  if not (v_old.status = any(v_allowed)) then
    raise exception 'This booking is no longer in a state that allows this action. Refresh and try again.';
  end if;

  update public.car_bookings
  set status = p_action::public.booking_status_enum,
      admin_action = p_action,
      admin_action_reason = nullif(trim(p_reason), ''),
      cancelled_at = now(),
      cancelled_by = v_actor
  where id = p_booking_id
  returning * into v_booking;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, old_values, new_values)
  values (v_actor, 'CAR_BOOKING_' || upper(p_action), 'car_bookings', v_booking.id, to_jsonb(v_old), to_jsonb(v_booking));

  insert into public.notifications (recipient_user_id, notification_type, title, message, related_entity_type, related_entity_id)
  values (
    v_booking.user_id,
    'CAR_BOOKING_STATUS_CHANGED',
    'Car booking update',
    case p_action
      when 'cancelled' then 'Your car booking has been cancelled.'
      when 'paused' then 'Your car booking has been paused by IT/Admin.'
      else 'Your car booking has been denied.'
    end,
    'car_bookings',
    v_booking.id
  );

  return v_booking;
end;
$$;

-- Lock down execution: only `authenticated` may call these, never anon/public.
revoke all on function public.create_room_booking(uuid, timestamptz, timestamptz, text, text) from public;
revoke all on function public.create_car_booking(uuid, timestamptz, timestamptz, text, text) from public;
revoke all on function public.set_room_booking_status(uuid, text, text) from public;
revoke all on function public.set_car_booking_status(uuid, text, text) from public;

grant execute on function public.create_room_booking(uuid, timestamptz, timestamptz, text, text) to authenticated;
grant execute on function public.create_car_booking(uuid, timestamptz, timestamptz, text, text) to authenticated;
grant execute on function public.set_room_booking_status(uuid, text, text) to authenticated;
grant execute on function public.set_car_booking_status(uuid, text, text) to authenticated;

-- Close the bypass: direct table writes are no longer a supported path for
-- these two tables. All mutation now happens inside the functions above
-- (which run as table owner `postgres` and are unaffected by this). SELECT
-- policies are untouched — reading bookings still works exactly as before.
drop policy if exists meeting_room_bookings_insert on meeting_room_bookings;
drop policy if exists meeting_room_bookings_update on meeting_room_bookings;
drop policy if exists car_bookings_insert on car_bookings;
drop policy if exists car_bookings_update on car_bookings;
