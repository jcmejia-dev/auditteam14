-- REVIEW-ONLY FORWARD MIGRATION
-- Adds the minimum metadata needed for direct video uploads and creates a
-- separate private video bucket. Do not execute without the normal database
-- review and deployment process. The application uses no service-role key.

alter table public.media_items
  add column event_date date,
  add column video_upload_completed_at timestamptz;

alter table public.media_items
  add constraint media_items_event_date_check check (
    event_date is null or event_date >= date '1900-01-01'
  ),
  add constraint media_items_video_completion_type_check check (
    media_type = 'video' or video_upload_completed_at is null
  ),
  add constraint media_items_published_video_complete_check check (
    status <> 'published'::public.publication_status
    or media_type <> 'video'
    or video_upload_completed_at is not null
  );

create index media_items_public_video_idx
  on public.media_items (
    media_type,
    status,
    event_date desc,
    display_order,
    published_at desc
  );

grant select (event_date) on table public.media_items to anon, authenticated;
grant select (video_upload_completed_at)
  on table public.media_items to authenticated;

comment on column public.media_items.event_date is
  'Optional approved event date for stored media. This is distinct from publication time.';

comment on column public.media_items.video_upload_completed_at is
  'Set only after the application verifies a completed MP4/WebM object through the authenticated Storage metadata API. Never exposed on public pages.';

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'audit-team-14-videos',
  'audit-team-14-videos',
  false,
  52428800,
  array['video/mp4', 'video/webm']
);

create policy "video_objects_select_staff"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'audit-team-14-videos'
  and (select private.is_staff())
);

create policy "video_objects_select_published_anon"
on storage.objects
for select
to anon
using (
  bucket_id = 'audit-team-14-videos'
  and storage.allow_any_operation(
    array[
      'object.get_authenticated',
      'object.get_authenticated_info'
    ]
  )
  and exists (
    select 1
    from public.media_items
    left join public.albums
      on albums.id = media_items.album_id
    where media_items.storage_path = storage.objects.name
      and media_items.media_type = 'video'
      and media_items.status = 'published'::public.publication_status
      and media_items.video_upload_completed_at is not null
      and (
        media_items.album_id is null
        or albums.status = 'published'::public.publication_status
      )
  )
);

create policy "video_objects_insert_reserved_draft"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'audit-team-14-videos'
  and name ~
    '^([0-9a-f]{32})/\1\.(mp4|webm)$'
  and lower(storage.extension(name)) in ('mp4', 'webm')
  and exists (
    select 1
    from public.media_items
    left join public.albums
      on albums.id = media_items.album_id
    where media_items.storage_path = storage.objects.name
      and media_items.media_type = 'video'
      and media_items.status = 'draft'::public.publication_status
      and media_items.published_at is null
      and media_items.video_upload_completed_at is null
      and media_items.created_by = (select auth.uid())
      and (
        (select private.has_role('admin'::private.app_role))
        or (
          (select private.has_role('editor'::private.app_role))
          and (
            media_items.album_id is null
            or albums.status = 'draft'::public.publication_status
          )
        )
      )
  )
);

create policy "video_objects_delete_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'audit-team-14-videos'
  and (select private.has_role('admin'::private.app_role))
);

-- Editors may terminate and clean only their own unfinished reserved upload.
-- Completed draft, published, archived, and another user's objects are not
-- eligible. Editor content-record deletion remains prohibited.
create policy "video_objects_delete_editor_unfinished_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'audit-team-14-videos'
  and (select private.has_role('editor'::private.app_role))
  and owner_id = (select auth.uid()::text)
  and exists (
    select 1
    from public.media_items
    where media_items.storage_path = storage.objects.name
      and media_items.media_type = 'video'
      and media_items.status = 'draft'::public.publication_status
      and media_items.video_upload_completed_at is null
      and media_items.created_by = (select auth.uid())
  )
);

comment on policy "video_objects_insert_reserved_draft"
on storage.objects is
  'Direct TUS upload only to an exact server-reserved opaque path backed by the caller-owned draft video row. No UPDATE policy exists and overwrite/upsert is prohibited.';

comment on policy "video_objects_select_published_anon"
on storage.objects is
  'Anonymous signing/read operations require a completed, published video and, when attached, a published album. Object listing is not permitted.';
