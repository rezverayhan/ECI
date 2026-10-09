-- Bookings must notify the requester on automatic confirmation (approved business
-- rule), but booking creation is normally self-service, not admin-initiated — the
-- existing notifications_insert policy (is_it_administrator() only) would silently
-- reject that self-notification. Widen it minimally: a caller may insert a
-- notification only when they are the recipient (self-notify), in addition to the
-- existing IT-Admin-can-notify-anyone grant used by admin-initiated actions
-- (cancel/pause/deny on someone else's booking, IT Support lifecycle events, etc).
-- No escalation: a user already fully controls read/update of their own
-- notification row; this only lets them also create one, and only for themselves.
drop policy "notifications_insert" on notifications;
create policy "notifications_insert" on notifications
for insert
with check (is_it_administrator() OR recipient_user_id = current_user_id());
