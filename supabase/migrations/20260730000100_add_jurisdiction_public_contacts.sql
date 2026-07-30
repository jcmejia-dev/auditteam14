-- Review-only forward migration.
-- Adds two optional, public-approved role/name pairs to jurisdiction records.
-- Do not execute without reviewing the named personnel and testing in a
-- disposable Supabase project first.

alter table public.jurisdictions
  add column primary_contact_role text,
  add column primary_contact_name text,
  add column secondary_contact_role text,
  add column secondary_contact_name text;

alter table public.jurisdictions
  add constraint jurisdictions_primary_contact_pair_check check (
    (
      primary_contact_role is null
      and primary_contact_name is null
    )
    or (
      char_length(trim(primary_contact_role)) between 1 and 100
      and char_length(trim(primary_contact_name)) between 1 and 180
    )
  ),
  add constraint jurisdictions_secondary_contact_pair_check check (
    (
      secondary_contact_role is null
      and secondary_contact_name is null
    )
    or (
      char_length(trim(secondary_contact_role)) between 1 and 100
      and char_length(trim(secondary_contact_name)) between 1 and 180
    )
  );

comment on column public.jurisdictions.primary_contact_role is
  'Approved public-facing role label for the first jurisdiction contact.';
comment on column public.jurisdictions.primary_contact_name is
  'Approved public-facing name for the first jurisdiction contact.';
comment on column public.jurisdictions.secondary_contact_role is
  'Approved public-facing role label for the second jurisdiction contact.';
comment on column public.jurisdictions.secondary_contact_name is
  'Approved public-facing name for the second jurisdiction contact.';

-- The original migration intentionally uses column-level SELECT grants.
-- Extend only those existing read grants; table RLS still determines which
-- rows anon and authenticated callers may read.
grant select (
  primary_contact_role,
  primary_contact_name,
  secondary_contact_role,
  secondary_contact_name
) on table public.jurisdictions to anon, authenticated;

