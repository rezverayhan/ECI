-- Supabase's default privileges grant `anon` + `authenticated` EXECUTE on
-- every new function in `public` automatically; revoking from the PUBLIC
-- pseudo-role (migration 0021) does not remove those explicit per-role
-- grants. Anonymous (unauthenticated) requests have no legitimate reason to
-- call any of these — auth.uid() is null for anon regardless, so nothing
-- sensitive would actually leak, but they should not be exposed at all.
revoke execute on function public.current_user_id() from anon;
revoke execute on function public.current_access_level() from anon;
revoke execute on function public.is_it_administrator() from anon;
revoke execute on function public.is_general_manager() from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_general_user() from anon;

-- Trigger functions are invoked by the executor as part of the triggering
-- DML, not via a direct SQL function call, so no role needs explicit EXECUTE
-- on them at all.
revoke execute on function public.enforce_users_self_update() from anon, authenticated;
revoke execute on function public.enforce_notifications_self_update() from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.stamp_support_issue_status_timestamps() from anon, authenticated;
