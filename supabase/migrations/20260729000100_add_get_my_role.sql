-- Caller-only role lookup for the Audit Team 14 staff portal.
-- Review before applying. This migration does not modify tables or RLS policies.

begin;

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select user_role.role::text
  from private.user_roles as user_role
  where user_role.user_id = (select auth.uid())
    and user_role.is_active
  limit 1;
$$;

comment on function public.get_my_role() is
  'Returns only the authenticated caller''s active application role, or null.';

revoke execute on function public.get_my_role() from public, anon;
grant execute on function public.get_my_role() to authenticated;

commit;
