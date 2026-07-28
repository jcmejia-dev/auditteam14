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

Storage buckets and upload policies remain prohibited until the Sharp risk is
resolved or explicit mitigations are approved. The database migration must not
create Storage buckets.

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
