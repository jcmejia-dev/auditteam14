-- READ-ONLY VIDEO STORAGE VERIFICATION
-- Run only after the review-only video migration is applied to a disposable
-- project. These queries do not upload, modify, or delete records or objects.

select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'audit-team-14-videos';

-- Expected: private (`public = false`), exactly 52,428,800 bytes, and only
-- video/mp4 plus video/webm.

select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'media_items'
  and column_name in ('event_date', 'video_upload_completed_at')
order by column_name;

select
  conname,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.media_items'::regclass
  and conname in (
    'media_items_event_date_check',
    'media_items_video_completion_type_check',
    'media_items_published_video_complete_check'
  )
order by conname;

select
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'video_objects_%'
order by policyname;

select count(*) as video_object_update_policy_count
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'video_objects_%'
  and cmd = 'UPDATE';

-- Expected structural results:
-- 1. UPDATE policy count is zero; TUS uploads cannot overwrite existing keys.
-- 2. INSERT accepts only <32-hex-token>/<same-token>.(mp4|webm), requires
--    the caller-owned draft video reservation, and applies role/album checks.
-- 3. anon SELECT is operation-aware and requires a completed published video
--    plus a published album when album_id is present.
-- 4. staff SELECT requires an active role.
-- 5. admin DELETE is bucket-scoped.
-- 6. editor DELETE is limited to the editor's own unfinished draft upload.
-- 7. the published-video constraint requires completion verification.

-- Manual disposable-project tests required before remote approval:
-- - anon cannot list the bucket or sign/read draft, archived, incomplete, or
--   unpublished-album objects.
-- - anon can sign/read only a completed published video.
-- - viewer cannot upload, update, overwrite, or delete video objects.
-- - editor can upload only an exact own reserved draft path and cannot attach
--   a new upload to a published album.
-- - editor can clean only their own unfinished draft upload.
-- - admin can upload and delete through the reviewed application workflow.
-- - a second TUS creation for an existing path fails because no UPDATE policy
--   exists and the client never sends x-upsert=true.
-- - the bucket rejects objects over 52,428,800 bytes and every MIME except
--   video/mp4 and video/webm.
-- - renamed/spoofed MP4/WebM files fail the browser signature check before
--   reservation or transfer; Storage independently rechecks MIME and size.
-- - signed playback expires and supports browser Range requests and seeking.
