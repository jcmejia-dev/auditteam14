-- REVIEW-ONLY MIGRATION
-- Creates the private media bucket and narrowly scoped object policies needed
-- by the media gallery. Do not execute without the normal database review and
-- deployment process. The application does not use a service-role key.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'audit-team-14-media',
  'audit-team-14-media',
  false,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "media_objects_select_staff"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'audit-team-14-media'
  and (select private.is_staff())
);

create policy "media_objects_select_published_anon"
on storage.objects
for select
to anon
using (
  bucket_id = 'audit-team-14-media'
  and storage.allow_any_operation(
    array[
      'object.get_authenticated',
      'object.get_authenticated_info',
      'object.get_public'
    ]
  )
  and exists (
    select 1
    from public.media_items
    join public.albums
      on albums.id = media_items.album_id
    where media_items.storage_path = storage.objects.name
      and media_items.media_type = 'image'
      and media_items.status = 'published'::public.publication_status
      and albums.status = 'published'::public.publication_status
  )
);

create policy "media_objects_insert_staff_draft"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'audit-team-14-media'
  and name ~
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$'
  and lower(storage.extension(name)) in ('jpg', 'png', 'webp')
  and exists (
    select 1
    from public.albums
    where albums.id::text = (storage.foldername(name))[1]
      and (
        (select private.has_role('admin'::private.app_role))
        or (
          (select private.has_role('editor'::private.app_role))
          and albums.status = 'draft'::public.publication_status
        )
      )
  )
);

create policy "media_objects_delete_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'audit-team-14-media'
  and (select private.has_role('admin'::private.app_role))
);

-- Editors receive only the narrow cleanup permission required when a validated
-- upload succeeds but its draft media_items insert fails. No interface exposes
-- deletion to editors, and linked published objects are never eligible.
create policy "media_objects_delete_editor_unlinked_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'audit-team-14-media'
  and (select private.has_role('editor'::private.app_role))
  and owner_id = (select auth.uid()::text)
  and not exists (
    select 1
    from public.media_items
    where media_items.storage_path = storage.objects.name
  )
);

comment on policy "media_objects_insert_staff_draft" on storage.objects is
  'Server-generated UUID paths only. Bucket limits MIME and size; the application also verifies extension, declared MIME, size, and file signature without Sharp.';

comment on policy "media_objects_select_published_anon" on storage.objects is
  'Anonymous object reads require a published image attached to a published album. Object listing is not permitted.';
