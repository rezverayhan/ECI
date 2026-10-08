-- Strictly own-record, with no exception for IT Administrator: a
-- notification is a personal inbox, not an operational record IT needs to
-- browse (Task 02 §12: "User A must never be able to query User B's
-- notifications" — read literally, with no admin carve-out).
create policy notifications_select on notifications
  for select to authenticated using (recipient_user_id = current_user_id());

-- Row-level access is self-only; the trg_notifications_enforce_self_update
-- trigger (migration 0023) further restricts updates to is_read/read_at.
create policy notifications_update on notifications
  for update to authenticated
  using (recipient_user_id = current_user_id())
  with check (recipient_user_id = current_user_id());

create policy notifications_delete on notifications
  for delete to authenticated using (recipient_user_id = current_user_id());

-- Notifications are created through trusted server-side mechanisms (Edge
-- Functions using the service role, which bypasses RLS entirely), not by
-- arbitrary client inserts — that would let any user spam/spoof notices to
-- anyone. The one direct-client path left open is an IT Administrator.
create policy notifications_insert on notifications
  for insert to authenticated with check (is_it_administrator());

-- Push subscriptions are device registrations belonging to exactly one
-- user; nobody else — including IT Administrators — has a legitimate reason
-- to read or modify another user's.
create policy push_subscriptions_all on push_subscriptions
  for all to authenticated
  using (user_id = current_user_id())
  with check (user_id = current_user_id());

-- Audit logs: IT Administrator read access only (Task 02 §14). UPDATE/DELETE
-- already has no GRANT at the SQL privilege level (migration 0018), so no
-- RLS policy is added for either — they are unreachable regardless of role.
-- INSERT requires actor_user_id to be the caller's own id, so even an IT
-- Administrator cannot forge an entry claiming to be a different actor from
-- the browser; only a trusted service-role path (which bypasses RLS) can
-- record an action on another actor's behalf.
create policy audit_logs_select on audit_logs
  for select to authenticated using (is_it_administrator());
create policy audit_logs_insert on audit_logs
  for insert to authenticated with check (
    is_it_administrator() and actor_user_id = current_user_id()
  );
