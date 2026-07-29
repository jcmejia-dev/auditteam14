# Current state

Last reviewed: 2026-07-29

Working branch: `feature/announcements-management`

## Implemented

- A standard Next.js 16 App Router starter.
- TypeScript with strict checking enabled.
- Tailwind CSS 4 through PostCSS.
- ESLint with Next.js Core Web Vitals and TypeScript rules.
- A completed first-version public homepage with responsive institutional navigation, hero, about, vision and mission, core values, leadership, media categories, contact, and fully linked footer sections.
- Official COA and BARMM seals, the Audit Team Leader portrait, and confirmed Cotabato City office location.
- A completed searchable and filterable Leaflet/OpenStreetMap jurisdiction map with synchronized location cards, markers, popups, directions, reset controls, and OpenStreetMap attribution.
- A non-indexed staff authentication experience with email/password sign-in,
  caller-only role verification, an access-denied state, secure sign-out, and a
  protected server-rendered dashboard.
- Supabase SSR connection utilities for browser and server contexts, with
  Next.js 16 Proxy-based session refresh and `auth.getClaims()` validation.
- Validated configuration for the public Supabase project URL and publishable
  key, with ignored local values and a placeholder-only `.env.example`.
- Read-only connectivity to the Supabase Auth endpoint is confirmed; an
  unauthenticated request completes without creating users or data.
- Central typed static content and reusable public-page components.
- Site-specific metadata, accessible focus states, and reduced-motion support.
- Shared product, architecture, design, database, security, and AI handoff documentation.
- A Supabase schema/RLS migration, non-destructive verification queries, and
  rollback-by-default first-admin bootstrap template.
- The deployed database design uses protected actor resolution for
  authenticated and explicitly attributed transaction-local maintenance
  changes, enforces one active role per user, constrains future object keys,
  and excludes expired announcements from public reads.
- The secure database migration was applied successfully on July 29, 2026, and
  read-only structural verification completed successfully.
- The `private` schema exists and is not exposed through the Data API.
- The first explicitly authorized administrator was created and verified
  active.
- No jurisdiction records, media, Storage buckets, or public content were
  seeded.
- A review-only follow-up migration defines `public.get_my_role()` so an
  authenticated caller can retrieve only their own active role. This migration
  has not been applied remotely.
- Role-aware announcement management is implemented locally with staff list,
  create, edit, publish, archive, and delete interfaces enforced through the
  publishable-key SSR client and existing RLS policies.
- The public homepage reads only published, unexpired announcements through the
  anonymous RLS policy and presents a professional empty state when none are
  available.
- No production announcement rows were created or modified during automated
  validation.

## Repository state

- `main` and `develop` exist and track their matching origin branches.
- Feature work is required; direct work on `main` or `develop` is prohibited.
- `CLAUDE.md` delegates shared instructions to `AGENTS.md`.
- Environment files, dependency folders, Next.js output, and common private-key files are ignored.

## Not implemented

- Confirmed public phone, email, exact street address, and published media content.
- Staff management for activities, team members, jurisdictions, media, roles,
  password reset, and account-registration workflows.
- Supabase Storage buckets, upload policies, jurisdiction records, media,
  public content, or application data access.
- Vercel project or deployment configuration.
- AI provider or AI feature.
- Public uploads or other user-supplied media.
- Analytics, search, email, monitoring, or content-management workflow.

The Supabase foundation refreshes cookie-backed sessions in Proxy, while every
staff route independently validates identity with `auth.getClaims()` and checks
the active database role through the caller-only RPC. Proxy is not treated as
the authorization boundary.
The installed Supabase JavaScript packages require Node.js 22 or newer; local
validation currently uses Node.js 24.

The database migration is deployed. Read-only structural checks passed, the
private authorization schema is not exposed through the Data API, and the
explicitly authorized first administrator is active. No public content or
Storage data was created during deployment.

## Known dependency risk

- Next.js `16.2.12` currently carries transitive advisories through nested `postcss@8.4.31` and `sharp@0.34.5`.
- The documented advisory paths are not currently reachable through public input because the site accepts only trusted, committed CSS and trusted local images; public uploads and arbitrary remote-image optimization are not implemented.
- Temporary restrictions and the required pre-upload review are recorded in `docs/SECURITY.md`.

## Legacy draft jurisdiction data

All six jurisdiction records currently shown on the map come from the legacy website and require stakeholder confirmation before production. Confirm each institution name, abbreviation, category, general location, coordinates, and inclusion in Audit Team 14's jurisdiction:

- Buluan District Hospital (BDH): `6.7167, 124.8000`
- Datu Blah T. Sinsuat District Hospital (DBTSDH): `7.0333, 124.1667`
- Datu Odin Sinsuat District Hospital (DOSDH): `7.0500, 124.3000`
- South Upi Municipal Hospital (SUMH): `6.8333, 124.1333`
- IPHO – Maguindanao: `7.2167, 124.2472`
- Bangsamoro Regional Hospital and Medical Center (BRHMC): `7.2000, 124.2500`

No chief officers, accountants, or other personal information is included.

## Confirmed next direction

Review and apply the caller-only role helper migration through the approved
database process if it is not yet deployed, then manually validate staff
authentication and announcement permissions with disposable admin, editor, and
viewer test accounts.

## Proposed next steps — require task approval

1. Apply and verify `public.get_my_role()` without exposing the private role
   ledger or other users' assignments.
2. Manually test authorized and unassigned-user access without recording
   credentials.
3. Privately test the announcement draft, publish, archive, and delete workflow
   against the deployed RLS policies without using production content.
4. Keep Storage and uploads deferred until the documented dependency and
   security gates are resolved.

Update this file whenever implemented capabilities, integrations, or immediate next steps materially change.
