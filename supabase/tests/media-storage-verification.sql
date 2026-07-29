-- READ-ONLY MEDIA STORAGE VERIFICATION
-- Run only after the review-only media migration is applied to a disposable
-- project. These queries do not upload, modify, or delete any object.

select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'audit-team-14-media';

select
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'media_objects_%'
order by policyname;

-- Expected structural results:
-- 1. The bucket is private, has a 4 MB limit, and allows only image/jpeg,
--    image/png, and image/webp.
-- 2. anon has SELECT only for operation-aware object reads linked to a
--    published image in a published album.
-- 3. authenticated staff SELECT exists for internal preview/readiness checks.
-- 4. INSERT requires an admin/editor role, an existing permitted album, and
--    the exact server-generated <album-uuid>/<media-uuid>.(jpg|png|webp) shape.
-- 5. No UPDATE policy exists; overwrite/upsert remains unavailable.
-- 6. Linked-object DELETE is administrator-only.
-- 7. Editor DELETE is limited to an object owned by that editor and not linked
--    to any media_items row, solely for failed-upload cleanup.

select count(*) as media_object_update_policy_count
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'media_objects_%'
  and cmd = 'UPDATE';

-- Expected result: 0.

-- Manual disposable-project tests required before remote approval:
-- - anon cannot list the bucket.
-- - anon cannot read an unlinked, draft, archived, or unpublished-album object.
-- - anon can read only a published image linked to a published album.
-- - viewer cannot upload, overwrite, or delete.
-- - editor can upload a server-shaped JPEG/PNG/WebP object only for a draft
--   album and cannot delete a linked object.
-- - admin can upload and delete through the Storage API.
-- - declared GIF, TIFF, SVG, PDF, video, HTML, executable, unknown MIME, and
--   objects larger than 4 MB are rejected.
-- - invalid paths, traversal, extra folders, cross-album IDs, and duplicate
--   upsert attempts are rejected.
-- - the application signature check rejects a renamed or MIME-spoofed file.
