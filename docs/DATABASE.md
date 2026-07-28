# Database

## Confirmed direction

Supabase PostgreSQL is the planned database, Supabase Auth the planned identity
provider, and Supabase Storage the planned file service. The repository now has
the public client and SSR session foundation, but no tables, policies,
migrations, buckets, users, or application data access have been created.

The website must not become a repository for confidential audit evidence, findings, working papers, personal data, or unreleased reports.

## Proposed data model — requires approval

| Entity | Purpose | Important constraints |
| --- | --- | --- |
| `profiles` | Minimal staff profile linked to an authenticated user | Avoid unnecessary personal data |
| `roles` / `profile_roles` | Role assignment | Server-enforced authorization |
| `content_items` | Pages, announcements, and approved publication metadata | Status and visibility required |
| `content_revisions` | Reviewable version history | Immutable author and timestamp |
| `media_assets` | Metadata for approved website media | Classification and accessibility metadata |
| `review_actions` | Submission, approval, rejection, and publication decisions | Append-only history |
| `activity_log` | Security-relevant administrative events | Restricted access and retention policy |

This is a planning model, not an instruction to create tables. Separate specialized tables may be preferable after the sitemap and editorial workflow are approved.

## Proposed content rules

- Every content item has an owner, status, intended audience, and timestamps.
- Public queries return only explicitly published public content.
- Draft, review, and archived records are unavailable to anonymous users.
- AI-assisted content records its draft origin and still requires human approval.
- Deletes should normally be recoverable or archival; retention requirements must be confirmed.

## Authorization requirements

- Enable Row Level Security on every application table exposed through Supabase APIs.
- Deny access by default, then grant the minimum required operation.
- Do not treat a role stored only in browser state as authoritative.
- Service-role access is server-only and reserved for operations that truly require it.
- Test policies for anonymous, ordinary staff, reviewers, publishers, and administrators before launch.

## Storage proposal — requires approval

Use separate public and private buckets or equivalent controls. A public bucket may contain only approved public website assets. Private storage must use authenticated access and short-lived signed URLs where appropriate.

Do not upload audit evidence, working papers, findings, personal data, or unreleased reports. Validate file type, size, ownership, and publication state on the server.

## Migration and operations proposal

- Keep schema and policy changes in reviewed migrations.
- Test migrations in a non-production environment first.
- Define backup, restore, retention, and audit-log ownership before production.
- Seed only synthetic or explicitly approved public sample data.
- Never copy production personal or confidential data into development or AI tools.
