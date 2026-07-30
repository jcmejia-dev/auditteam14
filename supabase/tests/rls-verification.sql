-- Audit Team 14 RLS verification queries.
--
-- These queries are read-only. Run them only after applying the migration to a
-- disposable local/test database. They do not create users, roles, or content.
-- Replace no placeholders in the executable section.

-- 1. Every application table must have Row Level Security enabled.
select
  table_schema,
  table_name,
  row_security_enabled
from (
  select
    namespace.nspname as table_schema,
    class.relname as table_name,
    class.relrowsecurity as row_security_enabled
  from pg_catalog.pg_class as class
  join pg_catalog.pg_namespace as namespace
    on namespace.oid = class.relnamespace
  where class.relkind = 'r'
    and (
      (
        namespace.nspname = 'public'
        and class.relname in (
          'profiles',
          'site_settings',
          'team_members',
          'announcements',
          'activities',
          'jurisdictions',
          'albums',
          'media_items',
          'public_documents',
          'audit_logs'
        )
      )
      or (
        namespace.nspname = 'private'
        and class.relname = 'user_roles'
      )
    )
) as application_tables
order by table_schema, table_name;

-- Expected: 11 rows and row_security_enabled = true for every row.

-- 2. No expected table may be missing RLS.
select
  namespace.nspname as table_schema,
  class.relname as table_name
from pg_catalog.pg_class as class
join pg_catalog.pg_namespace as namespace
  on namespace.oid = class.relnamespace
where class.relkind = 'r'
  and not class.relrowsecurity
  and (
    (
      namespace.nspname = 'public'
      and class.relname in (
        'profiles',
        'site_settings',
        'team_members',
        'announcements',
        'activities',
        'jurisdictions',
        'albums',
        'media_items',
        'public_documents',
        'audit_logs'
      )
    )
    or (
      namespace.nspname = 'private'
      and class.relname = 'user_roles'
    )
  );

-- Expected: zero rows.

-- 3. Inspect every policy, command, target role, USING expression, and
-- WITH CHECK expression.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual as using_expression,
  with_check as with_check_expression
from pg_catalog.pg_policies
where schemaname in ('public', 'private')
  and tablename in (
    'user_roles',
    'profiles',
    'site_settings',
    'team_members',
    'announcements',
    'activities',
    'jurisdictions',
    'albums',
    'media_items',
    'public_documents',
    'audit_logs'
  )
order by schemaname, tablename, cmd, policyname;

-- Expected:
-- - Every policy targets anon or authenticated explicitly.
-- - INSERT policies have WITH CHECK.
-- - UPDATE policies have USING and WITH CHECK.
-- - DELETE policies have USING and exist only for admins.
-- - Both announcement SELECT policies require a published row to be unexpired,
--   while the authenticated policy also permits staff access.

-- 4. Detect malformed mutation policies.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_catalog.pg_policies
where schemaname = 'public'
  and (
    (cmd = 'INSERT' and with_check is null)
    or (cmd = 'UPDATE' and (qual is null or with_check is null))
    or (cmd = 'DELETE' and qual is null)
  );

-- Expected: zero rows.

-- 5. Editor policies must be draft-only and must never contain DELETE.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_catalog.pg_policies
where schemaname = 'public'
  and policyname like '%editor%';

-- Expected:
-- - INSERT and UPDATE only.
-- - Every WITH CHECK expression requires status = draft.
-- - Every UPDATE USING expression requires the existing status = draft.
-- - No DELETE row.

-- 6. The private role ledger must have no client policies or privileges.
select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'private'
  and table_name = 'user_roles'
  and grantee in ('PUBLIC', 'anon', 'authenticated');

-- Expected: zero rows.

select
  schemaname,
  tablename,
  policyname
from pg_catalog.pg_policies
where schemaname = 'private'
  and tablename = 'user_roles';

-- Expected: zero rows. Role lookup is permitted only through the narrowly
-- scoped private.has_role/private.is_staff helpers.
--
-- MANUAL DASHBOARD CHECK: confirm `private` is not listed in the Supabase
-- project's exposed schemas. PostgreSQL catalog queries cannot prove the
-- external Data API dashboard configuration.

-- 7. Exactly one active role of any kind is permitted per user.
select
  indexname,
  indexdef,
  (
    indexdef like '%UNIQUE INDEX%'
    and indexdef like '% (user_id) WHERE is_active%'
    and indexdef not like '%(user_id, role)%'
  ) as is_one_active_role_per_user
from pg_catalog.pg_indexes
where schemaname = 'private'
  and tablename = 'user_roles'
  and indexname = 'user_roles_one_active_assignment_idx';

-- Expected: one row with is_one_active_role_per_user = true. Historical
-- inactive assignments remain allowed.

-- 8. Security-definer functions must use an explicit empty search_path.
select
  namespace.nspname as function_schema,
  procedure.proname as function_name,
  procedure.prosecdef as is_security_definer,
  procedure.proconfig as function_configuration
from pg_catalog.pg_proc as procedure
join pg_catalog.pg_namespace as namespace
  on namespace.oid = procedure.pronamespace
where namespace.nspname = 'private'
  and procedure.proname in (
    'has_role',
    'is_staff',
    'set_maintenance_actor',
    'resolve_actor_id',
    'set_updated_at',
    'set_content_audit_fields',
    'set_publication_timestamp',
    'create_profile_for_new_user',
    'write_audit_event'
  )
order by procedure.proname;

-- Expected: is_security_definer = true and function_configuration includes
-- search_path="" for every row.

-- 9. Only authenticated users may execute the role-check helpers. Trigger,
-- actor-resolution, and maintenance functions must not be executable by
-- client roles.
select
  routine_schema,
  routine_name,
  grantee,
  privilege_type
from information_schema.role_routine_grants
where routine_schema = 'private'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by routine_name, grantee;

-- Expected: authenticated EXECUTE only for has_role and is_staff.

-- 10. Audit attribution must use only the protected actor resolver. It must
-- never infer the current actor from row ownership or assignment fields.
with function_definitions as (
  select
    pg_catalog.pg_get_functiondef(
      'private.write_audit_event()'::regprocedure
    ) as audit_definition,
    pg_catalog.pg_get_functiondef(
      'private.set_content_audit_fields()'::regprocedure
    ) as content_definition,
    pg_catalog.pg_get_functiondef(
      'private.resolve_actor_id()'::regprocedure
    ) as resolver_definition,
    pg_catalog.pg_get_functiondef(
      'private.set_maintenance_actor(uuid)'::regprocedure
    ) as setter_definition
)
select
  audit_definition like '%private.resolve_actor_id()%' as audit_uses_resolver,
  content_definition like '%private.resolve_actor_id()%'
    as content_fields_use_resolver,
  audit_definition not like '%updated_by%'
    and audit_definition not like '%created_by%'
    and audit_definition not like '%assigned_by%'
    and audit_definition not like '%revoked_by%'
    as audit_has_no_row_actor_fallback,
  resolver_definition like '%auth.uid()%'
    and resolver_definition like '%auth.users%'
    and resolver_definition like '%current_setting%'
    and resolver_definition like '%audit_team_14.maintenance_actor_id%'
    as resolver_validates_auth_and_maintenance_actors,
  setter_definition like '%auth.users%'
    and setter_definition like '%set_config%'
    and setter_definition like '%audit_team_14.maintenance_actor_id%'
    and setter_definition like '%true%'
    as maintenance_actor_is_validated_and_transaction_local
from function_definitions;

-- Expected: every value is true. The setter's third set_config argument is
-- true, so the setting is LOCAL to the current transaction.

-- 11. Storage-object keys and trusted local portrait paths are constrained.
select
  namespace.nspname as table_schema,
  class.relname as table_name,
  constraint_record.conname as constraint_name,
  pg_catalog.pg_get_constraintdef(
    constraint_record.oid,
    true
  ) as constraint_definition
from pg_catalog.pg_constraint as constraint_record
join pg_catalog.pg_class as class
  on class.oid = constraint_record.conrelid
join pg_catalog.pg_namespace as namespace
  on namespace.oid = class.relnamespace
where namespace.nspname = 'public'
  and constraint_record.conname in (
    'team_members_photo_path_check',
    'media_items_storage_path_check',
    'public_documents_file_path_check'
  )
order by class.relname, constraint_record.conname;

-- Expected:
-- - Three rows.
-- - Storage/file keys allow only letters, numbers, dot, underscore, hyphen,
--   and forward slash; are relative; and reject colons, backslashes, empty
--   segments, double slashes, and `.`/`..` segments.
-- - photo_path requires a rooted trusted local public path, allows the limited
--   filename characters needed by existing assets, and rejects traversal,
--   colons, backslashes, and double slashes.

-- 12. Expired announcements must be excluded from both public policy branches.
select
  policyname,
  roles,
  qual as using_expression,
  (
    qual like '%expires_at IS NULL%'
    and qual like '%expires_at >%'
    and qual like '%statement_timestamp()%'
  ) as excludes_expired_public_rows
from pg_catalog.pg_policies
where schemaname = 'public'
  and tablename = 'announcements'
  and policyname in (
    'announcements_select_published_anon',
    'announcements_select_published_or_staff'
  )
order by policyname;

-- Expected: two rows with excludes_expired_public_rows = true. The
-- authenticated policy must retain `private.is_staff()` so staff can still
-- inspect expired rows.

-- 13. Audit logs must expose SELECT only; no client mutation privilege exists.
select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'audit_logs'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by grantee, privilege_type;

-- Expected: authenticated SELECT only.

-- 14. Confirm audit triggers exist on every content table and user_roles.
select
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_name like 'audit_%_changes'
order by event_object_schema, event_object_table, event_manipulation;

-- Expected: INSERT, UPDATE, and DELETE rows for the eight content tables and
-- private.user_roles.

-- 15. Confirm no Storage objects are created by this migration.
-- This is a source-review requirement: the migration must contain no INSERT,
-- UPDATE, or DELETE against storage.buckets or storage.objects.

-- Documented role-test cases
-- ==========================
-- Perform mutation tests only in a disposable test database and wrap each case
-- in BEGIN/ROLLBACK. Use explicit synthetic Auth user UUIDs. Do not run these
-- cases against production data.
--
-- anon:
--   - SELECT sees only status = published rows (and is_public site settings).
--   - Published announcements with expires_at <= statement time are excluded.
--   - SELECT cannot see drafts or archived rows.
--   - INSERT, UPDATE, and DELETE are denied.
--
-- authenticated with no active application role:
--   - SELECT sees the same published public rows as anon.
--   - Internal drafts, archived content, user_roles, and audit_logs are denied.
--   - All content mutations are denied.
--
-- viewer:
--   - SELECT sees draft, published, and archived content.
--   - Expired announcements remain visible for internal review.
--   - INSERT, UPDATE, DELETE, role management, and audit-log viewing are denied.
--
-- editor:
--   - SELECT sees all content states.
--   - INSERT succeeds only when status = draft.
--   - UPDATE succeeds only when both old and new status are draft.
--   - Publishing, archiving, editing published rows, and DELETE are denied.
--   - user_roles and audit_logs remain inaccessible.
--
-- admin:
--   - SELECT, INSERT, UPDATE, publish, archive, and DELETE content are allowed.
--   - SELECT audit_logs is allowed.
--   - Direct client access to private.user_roles is still denied; role changes
--     must use a separately reviewed protected server workflow.
--
-- profile:
--   - Every authenticated user can SELECT only their own profile.
--   - They can UPDATE only display_name and job_title on their own row.
--   - They cannot INSERT, DELETE, change the profile id, or store a role.

-- Documented transactional negative tests
-- =======================================
-- The following examples are comments, not executable verification queries.
-- Replace every placeholder only in a disposable database, keep the transaction
-- wrappers, verify the expected error/result, and retain ROLLBACK.
--
-- Second simultaneous active role (expected: unique-constraint violation):
-- The verified maintenance actor and synthetic target UUID must both already
-- exist as Auth users in the disposable test project.
--
-- begin;
-- select private.set_maintenance_actor('<verified-maintainer-uuid>'::uuid);
-- insert into private.user_roles (user_id, role, assigned_by)
-- values (
--   '<synthetic-target-user-uuid>'::uuid,
--   'viewer'::private.app_role,
--   '<verified-maintainer-uuid>'::uuid
-- );
-- insert into private.user_roles (user_id, role, assigned_by)
-- values (
--   '<synthetic-target-user-uuid>'::uuid,
--   'editor'::private.app_role,
--   '<verified-maintainer-uuid>'::uuid
-- );
-- rollback;
--
-- Unattributed direct SQL mutation (expected: the UPDATE raises an
-- actor-resolution exception, and the final ROLLBACK preserves no test row or
-- audit event):
--
-- begin;
-- select private.set_maintenance_actor('<verified-maintainer-uuid>'::uuid);
-- select pg_catalog.set_config(
--   'audit_team_14.verification_announcement_slug',
--   'rls-unattributed-' ||
--     pg_catalog.replace(gen_random_uuid()::text, '-', ''),
--   true
-- );
-- insert into public.announcements (title, slug, body)
-- values (
--   'Synthetic unattributed mutation ' ||
--     pg_catalog.current_setting(
--       'audit_team_14.verification_announcement_slug'
--     ),
--   pg_catalog.current_setting(
--     'audit_team_14.verification_announcement_slug'
--   ),
--   'Synthetic rollback-only verification record.'
-- );
-- select pg_catalog.set_config(
--   'audit_team_14.maintenance_actor_id',
--   '',
--   true
-- );
-- do $$
-- begin
--   if (
--     select count(*)
--     from public.announcements
--     where slug = pg_catalog.current_setting(
--       'audit_team_14.verification_announcement_slug'
--     )
--   ) <> 1 then
--     raise exception
--       'Expected exactly one synthetic announcement before mutation test.';
--   end if;
-- end;
-- $$;
-- update public.announcements
-- set title = title || ' must not persist'
-- where slug = pg_catalog.current_setting(
--   'audit_team_14.verification_announcement_slug'
-- );
-- rollback;
--
-- Invalid maintenance actor (expected: setter exception because the UUID is
-- absent from auth.users, with no persistent transaction setting):
--
-- begin;
-- select private.set_maintenance_actor(
--   '<uuid-that-does-not-exist-in-auth-users>'::uuid
-- );
-- rollback;
--
-- javascript: document key (expected: file-path check violation):
--
-- begin;
-- select private.set_maintenance_actor('<verified-maintainer-uuid>'::uuid);
-- insert into public.public_documents (title, slug, file_path)
-- values ('Unsafe scheme', 'unsafe-scheme', 'javascript:alert.js');
-- rollback;
--
-- Parent traversal media key (expected: storage-path check violation):
--
-- begin;
-- select private.set_maintenance_actor('<verified-maintainer-uuid>'::uuid);
-- insert into public.media_items (media_type, title, storage_path)
-- values ('image', 'Unsafe traversal', '../private/evidence.png');
-- rollback;
--
-- Additional path cases that must fail in the same rollback-only manner:
--   - `https://example.invalid/file.pdf`
--   - `folder\\file.pdf`
--   - `folder//file.pdf`
--   - `folder/./file.pdf`
--
-- Expired announcement public visibility (expected: the anon SELECT returns
-- zero rows while a viewer/editor/admin SELECT can see the row):
--
-- begin;
-- select private.set_maintenance_actor('<verified-maintainer-uuid>'::uuid);
-- insert into public.announcements (
--   title,
--   slug,
--   body,
--   status,
--   published_at,
--   expires_at
-- )
-- values (
--   'Expired test',
--   'expired-policy-test',
--   'Synthetic rollback-only test.',
--   'published'::public.publication_status,
--   statement_timestamp() - interval '2 days',
--   statement_timestamp() - interval '1 day'
-- );
-- set local role anon;
-- select count(*) as expected_zero
-- from public.announcements
-- where slug = 'expired-policy-test';
-- reset role;
-- rollback;
