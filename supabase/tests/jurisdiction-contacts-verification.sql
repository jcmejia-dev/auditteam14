-- Read-only structural verification for
-- 20260730000100_add_jurisdiction_public_contacts.sql.
-- Run only after applying the reviewed migration in a disposable project.
-- These queries do not create, update, or delete data.

select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'jurisdictions'
  and column_name in (
    'primary_contact_role',
    'primary_contact_name',
    'secondary_contact_role',
    'secondary_contact_name'
  )
order by ordinal_position;

select
  conname,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.jurisdictions'::regclass
  and conname in (
    'jurisdictions_primary_contact_pair_check',
    'jurisdictions_secondary_contact_pair_check'
  )
order by conname;

select
  grantee,
  privilege_type,
  column_name
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'jurisdictions'
  and column_name in (
    'primary_contact_role',
    'primary_contact_name',
    'secondary_contact_role',
    'secondary_contact_name'
  )
order by grantee, column_name, privilege_type;

select
  polname,
  polcmd,
  polroles::regrole[] as roles,
  pg_get_expr(polqual, polrelid) as using_expression,
  pg_get_expr(polwithcheck, polrelid) as check_expression
from pg_policy
where polrelid = 'public.jurisdictions'::regclass
order by polname;

-- Manual transactional negative cases for a disposable project:
--
-- 1. A row with primary_contact_role but no primary_contact_name must fail the
--    jurisdictions_primary_contact_pair_check constraint.
-- 2. A role longer than 100 characters or name longer than 180 characters
--    must fail its pair constraint.
-- 3. anon must still see contacts only on published jurisdiction rows.
-- 4. editor must remain unable to edit published rows or publish drafts.
-- 5. viewer must remain read-only.
-- 6. admin may manage the fields under the existing jurisdiction policies.
