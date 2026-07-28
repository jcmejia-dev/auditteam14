-- Audit Team 14 content schema and Row Level Security foundation.
-- Review in a disposable Supabase project before any remote execution.
-- This migration creates no users, seed content, or Storage buckets.

begin;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

alter default privileges in schema private
  revoke all on tables from public, anon, authenticated;
alter default privileges in schema private
  revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public
  revoke all on tables from public, anon, authenticated;
alter default privileges in schema public
  revoke execute on functions from public, anon, authenticated;

create type private.app_role as enum ('admin', 'editor', 'viewer');
create type public.publication_status as enum (
  'draft',
  'published',
  'archived'
);

revoke usage on type private.app_role from public, anon, authenticated;
grant usage on type private.app_role to authenticated;
revoke usage on type public.publication_status from public, anon, authenticated;
grant usage on type public.publication_status to anon, authenticated;

comment on type private.app_role is
  'Private application authorization roles. Never derive these from user-editable metadata.';
comment on type public.publication_status is
  'Editorial publication lifecycle for public website content.';

create table private.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role private.app_role not null,
  is_active boolean not null default true,
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default statement_timestamp(),
  revoked_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  updated_at timestamptz not null default statement_timestamp(),
  constraint user_roles_revocation_state_check check (
    (is_active and revoked_at is null)
    or
    (not is_active and revoked_at is not null)
  )
);

comment on table private.user_roles is
  'Protected role-assignment history. Client roles receive no direct table access.';

create unique index user_roles_one_active_assignment_idx
  on private.user_roles (user_id)
  where is_active;
create index user_roles_active_lookup_idx
  on private.user_roles (user_id, role, is_active);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Staff member',
  job_title text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint profiles_display_name_check check (
    char_length(trim(display_name)) between 1 and 100
  ),
  constraint profiles_job_title_check check (
    job_title is null or char_length(trim(job_title)) between 1 and 120
  ),
  constraint profiles_timestamp_order_check check (updated_at >= created_at)
);

comment on table public.profiles is
  'Minimal user-editable staff profile. Authorization roles must never be stored here.';

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  public_value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  display_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint site_settings_key_check check (
    setting_key ~ '^[a-z][a-z0-9_]{1,79}$'
  ),
  constraint site_settings_display_order_check check (display_order >= 0),
  constraint site_settings_publication_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
    or status = 'archived'
  ),
  constraint site_settings_timestamp_order_check check (updated_at >= created_at)
);

comment on table public.site_settings is
  'Public-safe website settings only. Never store secrets or private operational configuration.';

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  position_title text not null,
  biography text,
  photo_path text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  display_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint team_members_name_check check (
    char_length(trim(name)) between 1 and 160
  ),
  constraint team_members_slug_check check (
    char_length(slug) <= 160
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint team_members_position_check check (
    char_length(trim(position_title)) between 1 and 160
  ),
  constraint team_members_biography_check check (
    biography is null or char_length(biography) <= 4000
  ),
  constraint team_members_photo_path_check check (
    photo_path is null
    or (
      char_length(photo_path) between 2 and 500
      and photo_path ~
        '^/[A-Za-z0-9][A-Za-z0-9._() -]*(?:/[A-Za-z0-9][A-Za-z0-9._() -]*)*$'
      and photo_path !~ '(^|/)\.{1,2}(/|$)'
      and photo_path !~ '//'
      and photo_path !~ ':'
      and photo_path !~ E'\\\\'
    )
  ),
  constraint team_members_display_order_check check (display_order >= 0),
  constraint team_members_publication_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
    or status = 'archived'
  ),
  constraint team_members_timestamp_order_check check (updated_at >= created_at)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  body text not null,
  is_featured boolean not null default false,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  expires_at timestamptz,
  display_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint announcements_title_check check (
    char_length(trim(title)) between 1 and 240
  ),
  constraint announcements_slug_check check (
    char_length(slug) <= 160
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint announcements_summary_check check (
    summary is null or char_length(summary) <= 600
  ),
  constraint announcements_body_check check (char_length(trim(body)) > 0),
  constraint announcements_display_order_check check (display_order >= 0),
  constraint announcements_expiry_check check (
    expires_at is null
    or published_at is null
    or expires_at > published_at
  ),
  constraint announcements_publication_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
    or status = 'archived'
  ),
  constraint announcements_timestamp_order_check check (updated_at >= created_at)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  body text,
  activity_date date,
  location_text text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  display_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint activities_title_check check (
    char_length(trim(title)) between 1 and 240
  ),
  constraint activities_slug_check check (
    char_length(slug) <= 160
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint activities_summary_check check (
    summary is null or char_length(summary) <= 600
  ),
  constraint activities_location_check check (
    location_text is null or char_length(location_text) <= 240
  ),
  constraint activities_display_order_check check (display_order >= 0),
  constraint activities_publication_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
    or status = 'archived'
  ),
  constraint activities_timestamp_order_check check (updated_at >= created_at)
);

create table public.jurisdictions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text,
  category text not null,
  general_location text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  maps_url text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  display_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint jurisdictions_name_check check (
    char_length(trim(name)) between 1 and 240
  ),
  constraint jurisdictions_abbreviation_check check (
    abbreviation is null or char_length(trim(abbreviation)) between 1 and 40
  ),
  constraint jurisdictions_category_check check (
    category in ('hospital', 'office')
  ),
  constraint jurisdictions_location_check check (
    char_length(trim(general_location)) between 1 and 300
  ),
  constraint jurisdictions_latitude_check check (
    latitude is null or latitude between -90 and 90
  ),
  constraint jurisdictions_longitude_check check (
    longitude is null or longitude between -180 and 180
  ),
  constraint jurisdictions_maps_url_check check (
    maps_url is null or maps_url ~ '^https://'
  ),
  constraint jurisdictions_display_order_check check (display_order >= 0),
  constraint jurisdictions_publication_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
    or status = 'archived'
  ),
  constraint jurisdictions_timestamp_order_check check (updated_at >= created_at)
);

comment on table public.jurisdictions is
  'Jurisdiction content. Legacy records must be stakeholder-confirmed before insertion or publication.';

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  display_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint albums_title_check check (
    char_length(trim(title)) between 1 and 240
  ),
  constraint albums_slug_check check (
    char_length(slug) <= 160
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint albums_description_check check (
    description is null or char_length(description) <= 2000
  ),
  constraint albums_display_order_check check (display_order >= 0),
  constraint albums_publication_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
    or status = 'archived'
  ),
  constraint albums_timestamp_order_check check (updated_at >= created_at)
);

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.albums (id) on delete restrict,
  media_type text not null,
  title text not null,
  alt_text text,
  caption text,
  storage_path text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  display_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint media_items_type_check check (
    media_type in ('image', 'video')
  ),
  constraint media_items_title_check check (
    char_length(trim(title)) between 1 and 240
  ),
  constraint media_items_alt_text_check check (
    alt_text is null or char_length(alt_text) <= 500
  ),
  constraint media_items_caption_check check (
    caption is null or char_length(caption) <= 2000
  ),
  constraint media_items_storage_path_check check (
    storage_path is null
    or (
      char_length(storage_path) between 1 and 500
      and storage_path ~
        '^[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*$'
      and storage_path !~ '^/'
      and storage_path !~ '(^|/)\.{1,2}(/|$)'
      and storage_path !~ '//'
      and storage_path !~ ':'
      and storage_path !~ E'\\\\'
    )
  ),
  constraint media_items_publishable_asset_check check (
    status <> 'published' or storage_path is not null
  ),
  constraint media_items_display_order_check check (display_order >= 0),
  constraint media_items_publication_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
    or status = 'archived'
  ),
  constraint media_items_timestamp_order_check check (updated_at >= created_at)
);

comment on table public.media_items is
  'Media metadata only. No Storage bucket is created by this migration.';

create table public.public_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  document_date date,
  file_path text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  display_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint public_documents_title_check check (
    char_length(trim(title)) between 1 and 240
  ),
  constraint public_documents_slug_check check (
    char_length(slug) <= 160
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint public_documents_summary_check check (
    summary is null or char_length(summary) <= 1000
  ),
  constraint public_documents_file_path_check check (
    file_path is null
    or (
      char_length(file_path) between 1 and 500
      and file_path ~
        '^[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*$'
      and file_path !~ '^/'
      and file_path !~ '(^|/)\.{1,2}(/|$)'
      and file_path !~ '//'
      and file_path !~ ':'
      and file_path !~ E'\\\\'
    )
  ),
  constraint public_documents_publishable_file_check check (
    status <> 'published' or file_path is not null
  ),
  constraint public_documents_display_order_check check (display_order >= 0),
  constraint public_documents_publication_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
    or status = 'archived'
  ),
  constraint public_documents_timestamp_order_check check (updated_at >= created_at)
);

comment on table public.public_documents is
  'Approved public-document metadata only. Storage remains deferred.';

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  operation text not null,
  entity_table text not null,
  entity_id uuid not null,
  occurred_at timestamptz not null default statement_timestamp(),
  constraint audit_logs_operation_check check (
    operation in ('INSERT', 'UPDATE', 'DELETE')
  ),
  constraint audit_logs_entity_table_check check (
    entity_table ~ '^(public|private)\.[a-z][a-z0-9_]*$'
  )
);

comment on table public.audit_logs is
  'Append-only event metadata. Full old/new records are intentionally not stored.';

create index site_settings_publication_idx
  on public.site_settings (is_public, status, display_order);
create index team_members_publication_idx
  on public.team_members (status, display_order, published_at desc);
create index announcements_publication_idx
  on public.announcements (
    status,
    expires_at,
    is_featured,
    published_at desc
  );
create index activities_publication_idx
  on public.activities (status, activity_date desc, published_at desc);
create index jurisdictions_publication_idx
  on public.jurisdictions (status, display_order);
create index albums_publication_idx
  on public.albums (status, display_order, published_at desc);
create index media_items_album_idx
  on public.media_items (album_id);
create index media_items_publication_idx
  on public.media_items (status, album_id, display_order);
create index public_documents_publication_idx
  on public.public_documents (status, document_date desc, published_at desc);
create index audit_logs_actor_idx
  on public.audit_logs (actor_id, occurred_at desc);
create index audit_logs_entity_idx
  on public.audit_logs (entity_table, entity_id, occurred_at desc);
create index audit_logs_occurred_at_idx
  on public.audit_logs (occurred_at desc);

create or replace function private.has_role(role_to_check private.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.user_roles as user_role
    where user_role.user_id = (select auth.uid())
      and user_role.role = role_to_check
      and user_role.is_active
  );
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.user_roles as user_role
    where user_role.user_id = (select auth.uid())
      and user_role.is_active
  );
$$;

revoke execute on function private.has_role(private.app_role)
  from public, anon, authenticated;
revoke execute on function private.is_staff()
  from public, anon, authenticated;
grant execute on function private.has_role(private.app_role) to authenticated;
grant execute on function private.is_staff() to authenticated;

-- Approved direct-SQL maintenance must call this inside an explicit
-- transaction. No client role receives EXECUTE.
create or replace function private.set_maintenance_actor(actor_to_set uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if actor_to_set is null
     or not exists (
       select 1
       from auth.users
       where auth.users.id = actor_to_set
     ) then
    raise exception
      'Maintenance actor must be an existing Auth user UUID.';
  end if;

  perform pg_catalog.set_config(
    'audit_team_14.maintenance_actor_id',
    actor_to_set::text,
    true
  );
end;
$$;

create or replace function private.resolve_actor_id()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  authenticated_actor_id uuid := (select auth.uid());
  maintenance_actor_setting text;
  maintenance_actor_id uuid;
begin
  -- Authenticated application requests always use their authenticated subject,
  -- even if a maintenance setting is present.
  if authenticated_actor_id is not null then
    if not exists (
      select 1
      from auth.users
      where auth.users.id = authenticated_actor_id
    ) then
      raise exception 'Authenticated actor does not exist in auth.users.';
    end if;

    return authenticated_actor_id;
  end if;

  maintenance_actor_setting := pg_catalog.current_setting(
    'audit_team_14.maintenance_actor_id',
    true
  );

  if maintenance_actor_setting is null
     or pg_catalog.btrim(maintenance_actor_setting) = '' then
    raise exception
      'Mutation requires auth.uid() or an explicit transaction-local maintenance actor.';
  end if;

  begin
    maintenance_actor_id := maintenance_actor_setting::uuid;
  exception
    when invalid_text_representation then
      raise exception 'Configured maintenance actor is not a valid UUID.';
  end;

  if not exists (
    select 1
    from auth.users
    where auth.users.id = maintenance_actor_id
  ) then
    raise exception
      'Configured maintenance actor does not exist in auth.users.';
  end if;

  return maintenance_actor_id;
end;
$$;

revoke execute on function private.set_maintenance_actor(uuid)
  from public, anon, authenticated;
revoke execute on function private.resolve_actor_id()
  from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := statement_timestamp();
  return new;
end;
$$;

create or replace function private.set_content_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := private.resolve_actor_id();
begin
  if tg_op = 'INSERT' then
    new.created_by := actor_id;
    new.updated_by := actor_id;
    new.created_at := statement_timestamp();
    new.updated_at := new.created_at;
  else
    new.id := old.id;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_by := actor_id;
    new.updated_at := statement_timestamp();
  end if;

  return new;
end;
$$;

create or replace function private.set_publication_timestamp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published'::public.publication_status
     and new.published_at is null then
    new.published_at := statement_timestamp();
  elsif new.status = 'draft'::public.publication_status then
    new.published_at := null;
  end if;

  return new;
end;
$$;

create or replace function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, 'Staff member')
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function private.write_audit_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb;
  event_actor_id uuid := private.resolve_actor_id();
  event_entity_id uuid;
begin
  if tg_op = 'DELETE' then
    row_data := to_jsonb(old);
  else
    row_data := to_jsonb(new);
  end if;

  event_entity_id := nullif(row_data ->> 'id', '')::uuid;

  insert into public.audit_logs (
    actor_id,
    operation,
    entity_table,
    entity_id
  )
  values (
    event_actor_id,
    tg_op,
    tg_table_schema || '.' || tg_table_name,
    event_entity_id
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke execute on function private.set_updated_at()
  from public, anon, authenticated;
revoke execute on function private.set_content_audit_fields()
  from public, anon, authenticated;
revoke execute on function private.set_publication_timestamp()
  from public, anon, authenticated;
revoke execute on function private.create_profile_for_new_user()
  from public, anon, authenticated;
revoke execute on function private.write_audit_event()
  from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger user_roles_set_updated_at
before update on private.user_roles
for each row execute function private.set_updated_at();

create trigger create_profile_after_auth_user
after insert on auth.users
for each row execute function private.create_profile_for_new_user();

create trigger site_settings_set_audit_fields
before insert or update on public.site_settings
for each row execute function private.set_content_audit_fields();
create trigger site_settings_set_publication_timestamp
before insert or update on public.site_settings
for each row execute function private.set_publication_timestamp();

create trigger team_members_set_audit_fields
before insert or update on public.team_members
for each row execute function private.set_content_audit_fields();
create trigger team_members_set_publication_timestamp
before insert or update on public.team_members
for each row execute function private.set_publication_timestamp();

create trigger announcements_set_audit_fields
before insert or update on public.announcements
for each row execute function private.set_content_audit_fields();
create trigger announcements_set_publication_timestamp
before insert or update on public.announcements
for each row execute function private.set_publication_timestamp();

create trigger activities_set_audit_fields
before insert or update on public.activities
for each row execute function private.set_content_audit_fields();
create trigger activities_set_publication_timestamp
before insert or update on public.activities
for each row execute function private.set_publication_timestamp();

create trigger jurisdictions_set_audit_fields
before insert or update on public.jurisdictions
for each row execute function private.set_content_audit_fields();
create trigger jurisdictions_set_publication_timestamp
before insert or update on public.jurisdictions
for each row execute function private.set_publication_timestamp();

create trigger albums_set_audit_fields
before insert or update on public.albums
for each row execute function private.set_content_audit_fields();
create trigger albums_set_publication_timestamp
before insert or update on public.albums
for each row execute function private.set_publication_timestamp();

create trigger media_items_set_audit_fields
before insert or update on public.media_items
for each row execute function private.set_content_audit_fields();
create trigger media_items_set_publication_timestamp
before insert or update on public.media_items
for each row execute function private.set_publication_timestamp();

create trigger public_documents_set_audit_fields
before insert or update on public.public_documents
for each row execute function private.set_content_audit_fields();
create trigger public_documents_set_publication_timestamp
before insert or update on public.public_documents
for each row execute function private.set_publication_timestamp();

create trigger audit_site_settings_changes
after insert or update or delete on public.site_settings
for each row execute function private.write_audit_event();
create trigger audit_team_members_changes
after insert or update or delete on public.team_members
for each row execute function private.write_audit_event();
create trigger audit_announcements_changes
after insert or update or delete on public.announcements
for each row execute function private.write_audit_event();
create trigger audit_activities_changes
after insert or update or delete on public.activities
for each row execute function private.write_audit_event();
create trigger audit_jurisdictions_changes
after insert or update or delete on public.jurisdictions
for each row execute function private.write_audit_event();
create trigger audit_albums_changes
after insert or update or delete on public.albums
for each row execute function private.write_audit_event();
create trigger audit_media_items_changes
after insert or update or delete on public.media_items
for each row execute function private.write_audit_event();
create trigger audit_public_documents_changes
after insert or update or delete on public.public_documents
for each row execute function private.write_audit_event();
create trigger audit_user_roles_changes
after insert or update or delete on private.user_roles
for each row execute function private.write_audit_event();

alter table private.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.team_members enable row level security;
alter table public.announcements enable row level security;
alter table public.activities enable row level security;
alter table public.jurisdictions enable row level security;
alter table public.albums enable row level security;
alter table public.media_items enable row level security;
alter table public.public_documents enable row level security;
alter table public.audit_logs enable row level security;

revoke all on table private.user_roles from public, anon, authenticated;
revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.site_settings from public, anon, authenticated;
revoke all on table public.team_members from public, anon, authenticated;
revoke all on table public.announcements from public, anon, authenticated;
revoke all on table public.activities from public, anon, authenticated;
revoke all on table public.jurisdictions from public, anon, authenticated;
revoke all on table public.albums from public, anon, authenticated;
revoke all on table public.media_items from public, anon, authenticated;
revoke all on table public.public_documents from public, anon, authenticated;
revoke all on table public.audit_logs from public, anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, job_title) on table public.profiles to authenticated;

grant select (
  id,
  setting_key,
  public_value,
  is_public,
  status,
  published_at,
  display_order,
  created_at,
  updated_at
) on table public.site_settings to anon, authenticated;
grant insert, update, delete on table public.site_settings to authenticated;

grant select (
  id,
  name,
  slug,
  position_title,
  biography,
  photo_path,
  status,
  published_at,
  display_order,
  created_at,
  updated_at
) on table public.team_members to anon, authenticated;
grant insert, update, delete on table public.team_members to authenticated;

grant select (
  id,
  title,
  slug,
  summary,
  body,
  is_featured,
  status,
  published_at,
  expires_at,
  display_order,
  created_at,
  updated_at
) on table public.announcements to anon, authenticated;
grant insert, update, delete on table public.announcements to authenticated;

grant select (
  id,
  title,
  slug,
  summary,
  body,
  activity_date,
  location_text,
  status,
  published_at,
  display_order,
  created_at,
  updated_at
) on table public.activities to anon, authenticated;
grant insert, update, delete on table public.activities to authenticated;

grant select (
  id,
  name,
  abbreviation,
  category,
  general_location,
  latitude,
  longitude,
  maps_url,
  status,
  published_at,
  display_order,
  created_at,
  updated_at
) on table public.jurisdictions to anon, authenticated;
grant insert, update, delete on table public.jurisdictions to authenticated;

grant select (
  id,
  title,
  slug,
  description,
  status,
  published_at,
  display_order,
  created_at,
  updated_at
) on table public.albums to anon, authenticated;
grant insert, update, delete on table public.albums to authenticated;

grant select (
  id,
  album_id,
  media_type,
  title,
  alt_text,
  caption,
  storage_path,
  status,
  published_at,
  display_order,
  created_at,
  updated_at
) on table public.media_items to anon, authenticated;
grant insert, update, delete on table public.media_items to authenticated;

grant select (
  id,
  title,
  slug,
  summary,
  document_date,
  file_path,
  status,
  published_at,
  display_order,
  created_at,
  updated_at
) on table public.public_documents to anon, authenticated;
grant insert, update, delete on table public.public_documents to authenticated;

grant select on table public.audit_logs to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "site_settings_select_public_anon"
on public.site_settings
for select
to anon
using (
  is_public
  and status = 'published'::public.publication_status
);

create policy "site_settings_select_public_or_staff"
on public.site_settings
for select
to authenticated
using (
  (
    is_public
    and status = 'published'::public.publication_status
  )
  or (select private.is_staff())
);

create policy "site_settings_insert_admin"
on public.site_settings
for insert
to authenticated
with check ((select private.has_role('admin'::private.app_role)));

create policy "site_settings_insert_editor_draft"
on public.site_settings
for insert
to authenticated
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy "site_settings_update_admin"
on public.site_settings
for update
to authenticated
using ((select private.has_role('admin'::private.app_role)))
with check ((select private.has_role('admin'::private.app_role)));

create policy "site_settings_update_editor_draft"
on public.site_settings
for update
to authenticated
using (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
)
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
);

create policy "site_settings_delete_admin"
on public.site_settings
for delete
to authenticated
using ((select private.has_role('admin'::private.app_role)));

create policy "team_members_select_published_anon"
on public.team_members
for select
to anon
using (status = 'published'::public.publication_status);

create policy "team_members_select_published_or_staff"
on public.team_members
for select
to authenticated
using (
  status = 'published'::public.publication_status
  or (select private.is_staff())
);

create policy "team_members_insert_admin"
on public.team_members
for insert
to authenticated
with check ((select private.has_role('admin'::private.app_role)));

create policy "team_members_insert_editor_draft"
on public.team_members
for insert
to authenticated
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy "team_members_update_admin"
on public.team_members
for update
to authenticated
using ((select private.has_role('admin'::private.app_role)))
with check ((select private.has_role('admin'::private.app_role)));

create policy "team_members_update_editor_draft"
on public.team_members
for update
to authenticated
using (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
)
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
);

create policy "team_members_delete_admin"
on public.team_members
for delete
to authenticated
using ((select private.has_role('admin'::private.app_role)));

create policy "announcements_select_published_anon"
on public.announcements
for select
to anon
using (
  status = 'published'::public.publication_status
  and (
    expires_at is null
    or expires_at > (select statement_timestamp())
  )
);

create policy "announcements_select_published_or_staff"
on public.announcements
for select
to authenticated
using (
  (
    status = 'published'::public.publication_status
    and (
      expires_at is null
      or expires_at > (select statement_timestamp())
    )
  )
  or (select private.is_staff())
);

create policy "announcements_insert_admin"
on public.announcements
for insert
to authenticated
with check ((select private.has_role('admin'::private.app_role)));

create policy "announcements_insert_editor_draft"
on public.announcements
for insert
to authenticated
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy "announcements_update_admin"
on public.announcements
for update
to authenticated
using ((select private.has_role('admin'::private.app_role)))
with check ((select private.has_role('admin'::private.app_role)));

create policy "announcements_update_editor_draft"
on public.announcements
for update
to authenticated
using (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
)
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
);

create policy "announcements_delete_admin"
on public.announcements
for delete
to authenticated
using ((select private.has_role('admin'::private.app_role)));

create policy "activities_select_published_anon"
on public.activities
for select
to anon
using (status = 'published'::public.publication_status);

create policy "activities_select_published_or_staff"
on public.activities
for select
to authenticated
using (
  status = 'published'::public.publication_status
  or (select private.is_staff())
);

create policy "activities_insert_admin"
on public.activities
for insert
to authenticated
with check ((select private.has_role('admin'::private.app_role)));

create policy "activities_insert_editor_draft"
on public.activities
for insert
to authenticated
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy "activities_update_admin"
on public.activities
for update
to authenticated
using ((select private.has_role('admin'::private.app_role)))
with check ((select private.has_role('admin'::private.app_role)));

create policy "activities_update_editor_draft"
on public.activities
for update
to authenticated
using (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
)
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
);

create policy "activities_delete_admin"
on public.activities
for delete
to authenticated
using ((select private.has_role('admin'::private.app_role)));

create policy "jurisdictions_select_published_anon"
on public.jurisdictions
for select
to anon
using (status = 'published'::public.publication_status);

create policy "jurisdictions_select_published_or_staff"
on public.jurisdictions
for select
to authenticated
using (
  status = 'published'::public.publication_status
  or (select private.is_staff())
);

create policy "jurisdictions_insert_admin"
on public.jurisdictions
for insert
to authenticated
with check ((select private.has_role('admin'::private.app_role)));

create policy "jurisdictions_insert_editor_draft"
on public.jurisdictions
for insert
to authenticated
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy "jurisdictions_update_admin"
on public.jurisdictions
for update
to authenticated
using ((select private.has_role('admin'::private.app_role)))
with check ((select private.has_role('admin'::private.app_role)));

create policy "jurisdictions_update_editor_draft"
on public.jurisdictions
for update
to authenticated
using (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
)
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
);

create policy "jurisdictions_delete_admin"
on public.jurisdictions
for delete
to authenticated
using ((select private.has_role('admin'::private.app_role)));

create policy "albums_select_published_anon"
on public.albums
for select
to anon
using (status = 'published'::public.publication_status);

create policy "albums_select_published_or_staff"
on public.albums
for select
to authenticated
using (
  status = 'published'::public.publication_status
  or (select private.is_staff())
);

create policy "albums_insert_admin"
on public.albums
for insert
to authenticated
with check ((select private.has_role('admin'::private.app_role)));

create policy "albums_insert_editor_draft"
on public.albums
for insert
to authenticated
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy "albums_update_admin"
on public.albums
for update
to authenticated
using ((select private.has_role('admin'::private.app_role)))
with check ((select private.has_role('admin'::private.app_role)));

create policy "albums_update_editor_draft"
on public.albums
for update
to authenticated
using (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
)
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
);

create policy "albums_delete_admin"
on public.albums
for delete
to authenticated
using ((select private.has_role('admin'::private.app_role)));

create policy "media_items_select_published_anon"
on public.media_items
for select
to anon
using (
  status = 'published'::public.publication_status
  and (
    album_id is null
    or exists (
      select 1
      from public.albums
      where albums.id = media_items.album_id
        and albums.status = 'published'::public.publication_status
    )
  )
);

create policy "media_items_select_published_or_staff"
on public.media_items
for select
to authenticated
using (
  (
    status = 'published'::public.publication_status
    and (
      album_id is null
      or exists (
        select 1
        from public.albums
        where albums.id = media_items.album_id
          and albums.status = 'published'::public.publication_status
      )
    )
  )
  or (select private.is_staff())
);

create policy "media_items_insert_admin"
on public.media_items
for insert
to authenticated
with check ((select private.has_role('admin'::private.app_role)));

create policy "media_items_insert_editor_draft"
on public.media_items
for insert
to authenticated
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy "media_items_update_admin"
on public.media_items
for update
to authenticated
using ((select private.has_role('admin'::private.app_role)))
with check ((select private.has_role('admin'::private.app_role)));

create policy "media_items_update_editor_draft"
on public.media_items
for update
to authenticated
using (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
)
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
);

create policy "media_items_delete_admin"
on public.media_items
for delete
to authenticated
using ((select private.has_role('admin'::private.app_role)));

create policy "public_documents_select_published_anon"
on public.public_documents
for select
to anon
using (status = 'published'::public.publication_status);

create policy "public_documents_select_published_or_staff"
on public.public_documents
for select
to authenticated
using (
  status = 'published'::public.publication_status
  or (select private.is_staff())
);

create policy "public_documents_insert_admin"
on public.public_documents
for insert
to authenticated
with check ((select private.has_role('admin'::private.app_role)));

create policy "public_documents_insert_editor_draft"
on public.public_documents
for insert
to authenticated
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy "public_documents_update_admin"
on public.public_documents
for update
to authenticated
using ((select private.has_role('admin'::private.app_role)))
with check ((select private.has_role('admin'::private.app_role)));

create policy "public_documents_update_editor_draft"
on public.public_documents
for update
to authenticated
using (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
)
with check (
  (select private.has_role('editor'::private.app_role))
  and status = 'draft'::public.publication_status
  and published_at is null
);

create policy "public_documents_delete_admin"
on public.public_documents
for delete
to authenticated
using ((select private.has_role('admin'::private.app_role)));

create policy "audit_logs_select_admin"
on public.audit_logs
for select
to authenticated
using ((select private.has_role('admin'::private.app_role)));

commit;
