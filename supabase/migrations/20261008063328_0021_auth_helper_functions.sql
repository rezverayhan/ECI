-- Authorization helpers used throughout RLS policies.
--
-- These are SECURITY DEFINER because policies on `public.users` itself would
-- otherwise create a circular dependency: a policy that queries `users` to
-- determine the caller's access level would itself be subject to RLS. Running
-- as the function owner (which bypasses RLS) breaks that cycle. search_path
-- is pinned to '' and every reference is schema-qualified to prevent
-- search_path hijacking. EXECUTE is restricted to `authenticated` only.
--
-- A deactivated or soft-deleted account (is_active = false or deleted_at set)
-- resolves to NULL/false everywhere below, so losing employment status
-- immediately revokes all application access even if the Supabase Auth
-- session is still technically valid.

create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id
  from public.users u
  where u.auth_user_id = auth.uid()
    and u.is_active = true
    and u.deleted_at is null
  limit 1;
$$;

create or replace function public.current_access_level()
returns access_level_enum
language sql
stable
security definer
set search_path = ''
as $$
  select u.access_level
  from public.users u
  where u.auth_user_id = auth.uid()
    and u.is_active = true
    and u.deleted_at is null
  limit 1;
$$;

create or replace function public.is_it_administrator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_access_level() = 'it_administrator';
$$;

create or replace function public.is_general_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_access_level() = 'general_manager';
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_access_level() = 'admin';
$$;

create or replace function public.is_general_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_access_level() = 'general_user';
$$;

revoke execute on function public.current_user_id() from public;
revoke execute on function public.current_access_level() from public;
revoke execute on function public.is_it_administrator() from public;
revoke execute on function public.is_general_manager() from public;
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_general_user() from public;

grant execute on function public.current_user_id() to authenticated;
grant execute on function public.current_access_level() to authenticated;
grant execute on function public.is_it_administrator() to authenticated;
grant execute on function public.is_general_manager() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_general_user() to authenticated;
