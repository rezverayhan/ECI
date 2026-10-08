-- The PUBLIC pseudo-role still held EXECUTE on these two (granted
-- automatically at creation time, before migration 0032 ran), which
-- implicitly grants every role regardless of the explicit per-role revokes
-- already applied. Revoking from anon/authenticated alone was insufficient.
revoke execute on function public.enforce_users_self_update() from public;
revoke execute on function public.enforce_notifications_self_update() from public;
