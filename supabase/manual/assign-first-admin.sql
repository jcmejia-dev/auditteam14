-- MANUAL FIRST-ADMIN BOOTSTRAP TEMPLATE
--
-- DO NOT execute this file without manual review.
-- DO NOT run it automatically during deployment or user registration.
-- Replace the all-zero UUID below with one explicitly verified Auth user UUID.
-- Confirm the selected person is authorized to administer Audit Team 14.
--
-- This template ends with ROLLBACK by default. After reviewing the verification
-- query result, change the final ROLLBACK to COMMIT in an approved maintenance
-- window. The protected setter below validates the UUID and stores it only for
-- this transaction. Never promote the first registered user automatically.

begin;

do $$
declare
  first_admin_user_id uuid := '00000000-0000-0000-0000-000000000000';
begin
  if first_admin_user_id = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception
      'Replace first_admin_user_id with an explicitly verified Auth user UUID.';
  end if;

  if not exists (
    select 1
    from auth.users
    where id = first_admin_user_id
  ) then
    raise exception 'The specified Auth user UUID does not exist.';
  end if;

  if exists (
    select 1
    from private.user_roles
    where user_id = first_admin_user_id
      and is_active
  ) then
    raise exception 'The specified Auth user already has an active role.';
  end if;

  -- Required before any approved direct-SQL mutation. The audit trigger resolves
  -- this transaction-local actor instead of inferring an actor from row fields.
  perform private.set_maintenance_actor(first_admin_user_id);

  insert into private.user_roles (
    user_id,
    role,
    is_active,
    assigned_by
  )
  values (
    first_admin_user_id,
    'admin'::private.app_role,
    true,
    first_admin_user_id
  );
end;
$$;

-- Review this result before deciding whether to commit.
select
  user_id,
  role,
  is_active,
  assigned_by,
  assigned_at
from private.user_roles
where role = 'admin'::private.app_role
  and is_active
order by assigned_at;

-- SAFE DEFAULT: no role assignment is persisted.
-- Change ROLLBACK to COMMIT only after explicit authorization and review.
rollback;
