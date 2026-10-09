-- Self-caught regression: Supabase's default privileges on schema `public`
-- auto-grant EXECUTE to `anon` on every newly created function, independent
-- of the `revoke all ... from public` already issued in 0044 (that revoke
-- only strips privileges held by the PUBLIC pseudo-role, not the separate
-- direct grants default privileges hand to anon/authenticated/service_role).
-- These 4 functions write bookings/audit_logs/notifications as table owner
-- and must never be callable without a signed-in session.
revoke execute on function public.create_room_booking(uuid, timestamptz, timestamptz, text, text) from anon;
revoke execute on function public.create_car_booking(uuid, timestamptz, timestamptz, text, text) from anon;
revoke execute on function public.set_room_booking_status(uuid, text, text) from anon;
revoke execute on function public.set_car_booking_status(uuid, text, text) from anon;
