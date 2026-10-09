-- enforce_notifications_recipient_update is a trigger-only function and must never
-- be callable directly as a client RPC. Matches the existing lock-down already
-- applied to enforce_users_self_update (migrations 0032/0033).
revoke execute on function public.enforce_notifications_recipient_update() from public, anon, authenticated;
