# Security

## Non-negotiable rules

- Never commit passwords, access tokens, service-role keys, AI keys, credentials, or environment files.
- Never expose privileged secrets in browser code, public build variables, logs, screenshots, or documentation.
- Never place confidential audit evidence, findings, working papers, personal data, or unreleased reports on public pages or in AI systems.
- AI may use only approved public content, and AI-generated content requires human review before publication.
- Enforce authentication and authorization on the server. Interface visibility is not a security boundary.

## Data classification

| Class | Examples | Allowed handling |
| --- | --- | --- |
| Approved public | Published mandate, contact details, approved announcements | Public website; eligible for approved future AI use |
| Internal operational | Draft website copy, review comments, staff workflow metadata | Authenticated dashboard only; no public AI |
| Confidential/prohibited | Audit evidence, findings, working papers, personal data, unreleased reports | Outside this system and all AI workflows |

When classification is uncertain, treat information as confidential until an authorized owner approves otherwise.

## Application controls

- Use least privilege and deny-by-default authorization.
- Validate and normalize all server inputs.
- Encode output through framework-safe rendering; avoid untrusted raw HTML.
- Protect state-changing actions against cross-site request forgery as appropriate to the chosen session model.
- Rate-limit sensitive endpoints such as login, upload, search, and any future AI endpoint.
- Restrict uploads by type and size; scan or quarantine when operationally available.
- Return generic public errors while preserving useful, access-controlled operational logs.
- Record content approval and publication actions without logging secrets or confidential content.

## Database authorization

- Application roles are stored only in the protected, unexposed
  `private.user_roles` table. Never use `raw_user_meta_data`, profiles, browser
  state, or other user-editable fields for authorization.
- New Auth users receive no role automatically. Authenticated clients cannot
  enumerate, insert, update, or delete role assignments. Role history is
  retained, but a partial unique index permits only one active role per user.
- RLS policies explicitly target `anon` or `authenticated`, use cached
  `auth.uid()` and role-helper calls, and require both `USING` and `WITH CHECK`
  for updates.
- Security-definer functions must remain narrowly scoped, use an empty
  `search_path`, fully qualify referenced objects, and revoke unnecessary
  execution.
- Editors can create and edit drafts only. They cannot publish, archive, delete,
  edit published rows, assign roles, or view audit logs.
- Audit events are trigger-created and append-only. Store event metadata, not
  full old/new content records. Audit attribution and content
  `created_by`/`updated_by` fields must use the same protected actor resolver;
  never infer the current actor from ownership or assignment fields on a row.
- Authenticated mutations resolve their actor from `auth.uid()`. Approved
  direct-SQL maintenance must begin a transaction and call
  `private.set_maintenance_actor(<verified-auth-user-uuid>)` before mutation.
  The setter validates `auth.users`, stores the value transaction-locally, and
  is not executable by client roles. Missing or invalid attribution aborts the
  mutation.
- Public announcement access excludes expired published rows. Staff may retain
  access for review and records-management work.
- Future Storage object keys must remain relative and restricted to the
  documented conservative character set. Schemes, colons, backslashes, empty
  path segments, double slashes, and traversal segments are prohibited.
- The first administrator is assigned only through the manually reviewed,
  rollback-by-default bootstrap template. Never promote the first registered
  user automatically.

## Temporary dependency risk

- Next.js `16.2.12` currently carries nested `postcss@8.4.31` and `sharp@0.34.5` versions with published security advisories.
- The current site accepts only trusted, committed CSS and trusted local images. User-supplied CSS, arbitrary remote-image optimization, and public uploads are prohibited while these affected versions remain installed.
- Before implementing media uploads, upgrade to patched dependencies or document and validate explicit mitigations. GIF, TIFF, and VIPS uploads must remain blocked while an affected Sharp version is present.
- Never use `npm audit fix --force` or downgrade Next.js as an advisory workaround.
- Recheck production advisories during every dependency upgrade and before production deployment.

The media-gallery task approves a narrow mitigation design without changing
the affected dependencies. A review-only migration may create one private
media bucket only after database review. Until that migration is applied and
verified, the application keeps the upload form disabled.

### Media upload controls

- Accept JPEG, PNG, and WebP images only, with a maximum size of 4 MB. This
  remains below Vercel's 4.5 MB Function request-body limit.
- Keep the Next.js Server Action request cap at 4.25 MB solely to accommodate a
  4 MB image plus multipart form overhead; application and bucket limits remain
  4 MB.
- Validate declared MIME type, filename extension, size, and actual file
  signature on the server. A matching extension or browser MIME value alone is
  insufficient.
- Reject GIF, TIFF, SVG, VIPS, PDF, video, executable, HTML, and unknown
  formats.
- Never pass an uploaded image to Sharp/libvips and never automatically resize,
  convert, optimize, or generate derivatives.
- Use a private bucket with server-generated UUID object keys. Reject client
  paths, overwrite/upsert behavior, traversal, arbitrary remote URLs, and
  cross-album paths.
- Permit uploads only for authenticated administrators and editors. Editors
  may upload drafts only. Only administrators may publish, archive, or
  permanently delete media.
- Permit anonymous object reads only when the object is linked to a published
  image inside a published album. Do not permit anonymous object listing.
- Serve public images through the same-origin media route without exposing
  database UUIDs or Storage object keys. Recheck the downloaded signature and
  send `X-Content-Type-Options: nosniff`.
- Do not accept video files or external iframe/HTML input. External video
  providers remain unsupported until the schema records a reviewed allowlisted
  provider and normalized source identifier.
- Apply Storage changes only through the reviewed migration. Never modify
  `storage.objects` directly; object upload and deletion use the Storage API.
- If finalization fails after upload, attempt immediate cleanup and return a
  safe operational message. Permanent deletion first archives the database
  record, then removes the object, clears its path, and finally deletes the
  row so partial failure remains recoverable.

### Direct video upload controls

- Accept only MP4 (`video/mp4`) and WebM (`video/webm`), with an exact maximum
  of 52,428,800 bytes (50 MB). Recommend MP4 with H.264 video and AAC audio
  without claiming that every MP4/WebM codec works in every browser.
- The browser checks extension, declared MIME type, size, and recognizable
  MP4/WebM signature before reserving a draft. The private bucket independently
  enforces MIME and size; its INSERT policy independently enforces the exact
  server-reserved opaque path, caller-owned draft row, active role, media type, and
  permitted album state. Client checks are never authorization.
- Video bytes travel directly from the authenticated browser to the Supabase
  TUS endpoint on the direct Storage hostname. They must never pass through a
  Server Action, Route Handler, Server Component, Proxy, or Vercel Function.
- The browser obtains the active access token only to authenticate the Storage
  transfer. Never log or persist the token, and never log the original
  filename, file contents, signed playback URL, or TUS URL. Upload recovery is
  kept in page memory, so staff are instructed to keep the page open.
- Never send `x-upsert=true`. Use a new opaque path for every reservation and
  define no `storage.objects` UPDATE policy.
- Failed, cancelled, and interrupted uploads remain private drafts and can
  never satisfy the database publication constraint. Finalization rechecks the
  completed object metadata before recording completion.
- Do not use FFmpeg, Sharp, transcoding, conversion, thumbnail extraction, or
  server-side video processing. Reject AVI, MKV, WMV, MPEG transport streams,
  executable, HTML, SVG, GIF, image, and unknown inputs.
- Keep the video bucket private. Public playback uses short-lived signed URLs
  created only after anonymous RLS confirms published metadata. Staff draft
  previews require an active staff role. Signed URLs must not be publicly
  cached.
- Native playback uses controls, no autoplay, metadata-only preload, and
  mobile inline playback. Direct Storage delivery preserves Range requests and
  seeking without Vercel response limits.
- Apply and test the video migration only through the reviewed database
  process. Until it is applied and verified, the Add Video page remains in a
  disabled readiness state.

## Staff authentication

- Staff email/password authentication uses the Supabase SSR server client and a
  server action. Passwords, email addresses, tokens, and complete provider
  errors must never be logged.
- Every staff request validates signed identity with `auth.getClaims()` and
  verifies the active database role through the no-argument
  `public.get_my_role()` helper. Proxy refreshes sessions but is not an
  authorization boundary.
- The role helper derives identity only from `auth.uid()`. Browser input, URL
  values, cookies, profiles, and user metadata are never accepted as role
  authority.
- Login failures remain generic. Authenticated users without an active role are
  denied and can sign out through a POST-based server action.
- Staff routes are dynamic, non-indexed, and served with private/no-store
  behavior. Redirect destinations are fixed application paths.
- Signup, password reset, role management, content mutations, and uploads
  remain disabled. Recovery ownership, multi-factor requirements, and
  production login-rate-limit settings still require operational approval.

## Secrets and environments

- Keep local secrets in ignored environment files and hosted secrets in managed platform settings.
- Expose only intentionally public values to the browser.
- Rotate a secret immediately if it is committed, logged, or otherwise disclosed; removing it from the latest commit is not sufficient.
- Use separate credentials and data for development, preview, and production.
- Never use real confidential data as test fixtures.

## AI safety gate

Before enabling any AI feature:

1. Define and approve its public-content sources.
2. Prevent retrieval from private tables, storage, drafts, and staff conversations.
3. Add server-side access controls, rate limits, and appropriate logging.
4. Label output as generated and save it as a draft.
5. Require an identified human reviewer to approve publication.
6. Test prompt-injection, data-leakage, and unsafe-output scenarios.

## Release checklist

- Lint and production build pass.
- No secrets, environment files, generated output, or sensitive fixtures are in the diff.
- New routes and actions have server-side authorization tests.
- Database tables have reviewed Row Level Security policies.
- Public content and files have explicit approval.
- Accessibility and security reviews cover the affected workflow.
- Rollback and incident ownership are known for production changes.
