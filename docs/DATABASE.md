# Database

## Status

Supabase PostgreSQL, Auth, and Storage remain the selected service direction.
The secure content schema and Row Level Security migration was applied on July
29, 2026, and read-only structural verification passed. The private schema is
not exposed through the Data API, and the first explicitly authorized
administrator is active. No jurisdiction records, media, Storage buckets, or
public content were seeded.

A follow-up review-only migration defines `public.get_my_role()`. It has not
been executed against the remote project.

The database must never store confidential audit evidence, findings, working
papers, unnecessary personal data, or unreleased reports.

## Designed schemas and types

- `private.app_role`: `admin`, `editor`, or `viewer`.
- `public.publication_status`: `draft`, `published`, or `archived`.
- `private`: unexposed authorization functions and the protected role ledger.
- `public`: API-facing profiles, website content, and audit-event metadata.

The `private` schema is not an API schema. Client roles receive no table access
to `private.user_roles`. Row Level Security helpers may reference it without
exposing the table through PostgREST.

## Table purposes and relationships

| Table | Purpose | Important relationships and constraints |
| --- | --- | --- |
| `private.user_roles` | Active and historical staff role assignments | References `auth.users`; at most one active role of any kind per user; inactive history is retained; no client table policies or privileges |
| `public.profiles` | Minimal staff-controlled display name and job title | One-to-one with `auth.users`; contains no role or authorization field |
| `public.site_settings` | Public-safe website settings and approved values | Only rows marked public and published are visible publicly; secrets are prohibited |
| `public.team_members` | Approved public leadership/team entries | Publication state, slug, ordering, and optional local asset path |
| `public.announcements` | Public announcements | Publication state, slug, optional expiry, and featured ordering; expired rows remain staff-visible but are excluded publicly |
| `public.activities` | Approved activity information | Publication state, activity date, general location, and ordering |
| `public.jurisdictions` | Confirmed audit-jurisdiction locations | Publication state and constrained coordinates; no legacy data is seeded |
| `public.albums` | Grouping metadata for approved media | Parent of optional `media_items` records |
| `public.media_items` | Image/video metadata for approved assets | Optional album relationship; publication requires a constrained relative object key; the review-only video migration adds an optional event date and a protected upload-completion timestamp |
| `public.public_documents` | Metadata for approved public documents | Publication requires a constrained relative object key, but no bucket exists |
| `public.audit_logs` | Append-only mutation event metadata | Records actor, operation, table, entity UUID, and time without copying row contents |

Content tables use UUID primary keys, timestamps, publication state,
`published_at`, display ordering, and `created_by`/`updated_by` where
appropriate. Public/client SELECT privileges intentionally omit actor UUID
columns; administrative attribution is available through protected audit logs.

## Authorization design

Authorization comes from active rows in `private.user_roles`. It does not come
from `profiles`, `raw_user_meta_data`, browser state, or a user-editable JWT
claim. New Auth users receive a safe profile automatically and no application
role. A partial unique index on `user_id` permits role history while enforcing
at most one active `admin`, `editor`, or `viewer` assignment for each user.

`private.has_role(...)` and `private.is_staff()` are narrowly scoped
security-definer helpers. They use an explicit empty `search_path`, fully
qualified object names, revoked default execution, and cached calls inside RLS
policies.

### Caller-only role lookup

The pending `public.get_my_role()` helper takes no arguments and returns only
the authenticated caller's active role as text, or null when no active role is
assigned. It reads `private.user_roles` using `auth.uid()`, uses an empty
`search_path`, and grants execution only to `authenticated`. It does not expose
the role ledger or accept a user identifier supplied by a client.

### Access matrix

| Actor | Public published content | Draft/archived content | Create | Update | Publish/archive | Delete | Roles | Audit logs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `anon` | Read non-expired published rows | No | No | No | No | No | No | No |
| Authenticated, no active role | Read non-expired published rows | No | No | Own safe profile only | No | No | No | No |
| `viewer` | Read | Read | No | Own safe profile only | No | No | No | No |
| `editor` | Read | Read | Drafts only | Drafts only; never published rows | No | No | No | No |
| `admin` | Read | Read | All content states | All content states | Yes | Yes | Protected workflow later; never direct client table access | Read |

Every policy targets `anon` or `authenticated` explicitly. INSERT policies use
`WITH CHECK`; UPDATE policies use both `USING` and `WITH CHECK`; DELETE exists
only for administrators. Role and `auth.uid()` checks use statement-cached
`select` wrappers, with indexes on policy predicates.

## Profiles

The Auth-user trigger creates `public.profiles` with the neutral display name
`Staff member`. It deliberately does not copy `raw_user_meta_data` and does not
assign a role. Authenticated users can read only their own profile and update
only `display_name` and `job_title`.

Roles are kept outside profiles because profile fields and Auth user metadata
are client-editable. Using either for authorization would let users influence
their own privileges.

## Audit and timestamp integrity

Protected triggers set `created_by`, `updated_by`, `created_at`, `updated_at`,
and publication timestamps for content mutations. They preserve immutable IDs
and creation metadata during updates.

`private.resolve_actor_id()` is the only source of mutation attribution:

- authenticated application requests resolve to `auth.uid()`;
- approved direct SQL resolves to an explicitly configured, existing Auth user;
- row fields such as `created_by`, `updated_by`, `assigned_by`, and `revoked_by`
  are never treated as the current actor;
- the mutation is rejected when neither valid source is available.

The content attribution trigger and audit trigger call the same resolver.
`private.set_maintenance_actor(uuid)` and the resolver are security-definer
functions with an empty `search_path` and no client execution privilege.

Audit triggers append an event containing only:

- actor Auth UUID;
- `INSERT`, `UPDATE`, or `DELETE`;
- schema/table name;
- entity UUID;
- event timestamp.

They do not store complete old/new rows. Client roles cannot insert, update, or
delete audit events; only admins can read them.

### Safe direct-SQL maintenance

Use direct SQL only in an approved maintenance window and only for a reviewed
operation. The safe sequence is:

```sql
begin;
select private.set_maintenance_actor(
  '<explicitly-verified-existing-auth-user-uuid>'::uuid
);
-- Perform the reviewed mutation.
-- Inspect the affected row and audit event.
rollback; -- Change to COMMIT only after explicit approval.
```

The setter verifies the UUID in `auth.users` and uses transaction-local
`set_config(..., true)`. It must be called after `BEGIN`; the value disappears
at transaction end. Execute it only through an approved direct-SQL role; never
grant it to `anon` or `authenticated`. Do not set the custom configuration
value directly, reuse an old row's attribution fields, or perform audited
maintenance without this transaction wrapper.

## First-admin bootstrap

`supabase/manual/assign-first-admin.sql` is a manual, rollback-by-default
template:

1. Confirm the target person is authorized.
2. Replace the all-zero placeholder with that exact existing Auth user UUID.
3. Review the file and run it only in an approved maintenance window. It
   validates the user, establishes that UUID as the transaction-local
   maintenance actor, and only then inserts the role.
4. Inspect the verification query.
5. Change the final `ROLLBACK` to `COMMIT` only after explicit approval.

The migration never promotes the first registered user. Later role management
requires a separate protected server workflow that rechecks the caller's admin
role and is reviewed independently.

## Jurisdiction and Storage gates

The six jurisdiction entries inherited from the legacy website are not seeded.
Their names, categories, locations, coordinates, and inclusion must be
stakeholder-confirmed before insertion or publication.

The deployed foundation migration creates media/document metadata tables but
no buckets or Storage policies. A later review-only migration,
`20260729000200_create_secure_media_storage.sql`, defines a private media
bucket and narrowly scoped object policies; it has not been executed remotely.
`media_items.storage_path` and
`public_documents.file_path` accept only relative object keys of 1–500
characters using letters, numbers, dot, underscore, hyphen, and forward slash.
Leading slashes, schemes and colons, backslashes, empty segments, double
slashes, and `.` or `..` segments are rejected.

`team_members.photo_path` remains a separate trusted local-public-asset path.
It requires a leading slash, permits only the limited characters needed by
approved committed assets, and rejects traversal, colons, backslashes, and
double slashes.

The review-only media migration limits the bucket to JPEG, PNG, and WebP at
4 MB per object. Its object keys use a server-generated
`<album-uuid>/<media-uuid>.<allowed-extension>` shape. Authenticated
administrators and editors may upload only through the reviewed draft
workflow; anonymous reads require both a published image record and published
album. Object overwrite is not permitted, and only administrators can remove
linked objects. Editors receive a narrow own-object cleanup policy only for an
upload that was never linked to a media record.

The application independently checks declared MIME type, extension, size, and
JPEG/PNG/WebP signature before upload and never processes the file with Sharp.
The upload form performs a read-only readiness check and remains disabled until
the private bucket and policies are applied and verified.

The current `albums` table has no separate event-date field. Public gallery
dates are therefore labeled as publication dates. The current `media_items`
table has no external-video provider or source field, and arbitrary URLs, HTML,
and iframe code remain prohibited.

A forward-only review migration,
`20260729000300_create_secure_video_storage.sql`, adds
`media_items.event_date` and `video_upload_completed_at`, plus a private
`audit-team-14-videos` bucket. It does not alter the existing photo bucket or
policies. Video publication requires a non-null completion timestamp, which
the application sets only after authenticated Storage metadata confirms the
server-reserved MP4/WebM object, MIME type, and size.

Video object keys use a server-generated opaque
`<32-hex-token>/<same-token>.(mp4|webm)` shape. Storage INSERT requires the exact
caller-owned draft `media_items` reservation and the existing admin/editor
role rules. No Storage UPDATE policy exists, so overwrite/upsert remains
unavailable. Anonymous signing/read operations require a completed published
video and, when attached, a published album. The migration and its read-only
verification file have not been executed remotely.

## Required review before the follow-up migration

- Apply and test only in a disposable non-production Supabase project first.
- Confirm `get_my_role()` has no arguments and returns only the caller's role.
- Confirm `PUBLIC` and `anon` have no execution privilege.
- Confirm only `authenticated` receives execution privilege.
- Confirm the project exposes `public` but not `private`.
- Exercise authorized and unassigned synthetic users without recording
  credentials or identifiers.
- Obtain explicit approval before applying the follow-up migration remotely.
