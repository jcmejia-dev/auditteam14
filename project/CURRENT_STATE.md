# Current state

Last reviewed: 2026-07-30

Working branch: `feature/hero-background`

## Implemented

- A standard Next.js 16 App Router starter.
- TypeScript with strict checking enabled.
- Tailwind CSS 4 through PostCSS.
- ESLint with Next.js Core Web Vitals and TypeScript rules.
- A completed first-version public homepage with responsive institutional navigation, hero, about, vision and mission, core values, leadership, media categories, contact, and fully linked footer sections.
- Official COA and BARMM seals, the Audit Team Leader portrait, and confirmed Cotabato City office location.
- A completed searchable and filterable Leaflet/OpenStreetMap jurisdiction map
  with synchronized expandable location cards, reduced-motion-aware pulsing
  markers, smooth selection movement, popups, directions, reset controls, and
  OpenStreetMap attribution.
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
- Role-aware activity management is implemented locally with staff list,
  create, edit, publish, archive, and delete interfaces enforced through the
  publishable-key SSR client and existing activity RLS policies.
- The public homepage reads published activities through the anonymous RLS
  policy and displays approved title, summary, activity date, and general
  location fields only.
- No production activity rows were created or modified during automated
  validation.
- Role-aware team management is implemented locally with staff list, create,
  edit, publish, archive, delete, and administrator-only ordering controls
  enforced through the publishable-key SSR client and existing team-member RLS
  policies.
- When the team table has no visible records, Manage Team presents the
  approved Audit Team Leader website fallback and lets an administrator or
  editor open a prefilled editable draft without automatically seeding data.
  The leadership fallback uses the approved local `Bernard.png` portrait.
- The public leadership section reads published team-member records in display
  order, renders approved local portraits or initials, and retains the
  established Audit Team Leader presentation when no published records exist.
- No production team-member rows were created or modified during automated
  validation.
- Role-aware jurisdiction management is implemented locally with staff list,
  create, edit, publish, archive, delete, and administrator-only ordering
  controls enforced through the publishable-key SSR client and existing
  jurisdiction RLS policies.
- A review-only forward migration adds two optional approved public role/name
  pairs to each jurisdiction. The staff form detects whether those columns and
  grants are ready, keeps the contact fields disabled until then, and otherwise
  permits their draft-first management without changing existing RLS.
- The public jurisdiction section reads published database records in display
  order and passes only safe public fields into the Leaflet map. Database UUIDs,
  actor fields, timestamps, drafts, and archives are not sent to the map.
- The six static legacy jurisdiction entries remain the public fallback when
  the anonymous database read fails or returns no published rows. They are not
  seeded automatically and still require stakeholder confirmation.
- No production jurisdiction rows were created or modified during automated
  validation.
- Administrator-only, read-only audit history is implemented locally with
  bounded server pagination and validated action, content-type, and date
  filters. It displays safe labels when current RLS permits resolution and
  never renders raw UUIDs or unrestricted row data.
- Audit history remains protected by signed-claim validation, the caller-only
  active-role lookup, the admin-only page check, and the existing
  `audit_logs` RLS policy. No audit records are mutated by the interface.
- First-preview Vercel readiness is implemented locally with validated
  metadata URL resolution, a documented public site-origin variable, and a
  manual deployment checklist. No Vercel project has been connected or
  deployed.
- The public institutional overview presents stakeholder-confirmed
  organizational leadership, regional coverage, six published Core Values,
  and the approved Vision and Mission wording. The leadership section includes
  the stakeholder-approved public biography for the Audit Team Leader, and the
  footer includes the confirmed regional office information.
- Role-aware Institutional Information management is implemented locally on
  top of the existing `site_settings` table. Administrators can save or
  publish the fixed public structure, editors can save drafts only, and viewers
  receive a read-only view. Public pages retain the approved static content
  until a published setting exists.
- Staff forms no longer ask nontechnical users to create URL slugs.
  Announcements, activities, team members, and albums receive server-generated
  unique paths on creation, while edits preserve existing paths.
- The Audit Team Leader and Rotary Club of Cotabato City – South references
  link to their stakeholder-confirmed public Facebook pages.
- A public media-gallery experience is implemented locally with published
  photo-album previews on the homepage, dedicated `/photos` and `/videos`
  routes, published photo-album pages, and a keyboard-operable fullscreen
  lightbox. Public photo data excludes UUIDs, actor fields, and Storage paths.
- Role-aware staff media management is implemented locally for album drafts,
  publication, archiving, ordering, deletion, photo metadata, and guarded
  image uploads. Administrators manage all states, editors manage drafts only,
  and viewers have read-only access through the existing authorization and RLS
  boundaries.
- A review-only migration defines a private 4 MB media bucket restricted to
  JPEG, PNG, and WebP with server-generated object paths and strict
  `storage.objects` policies. It has not been executed remotely. The upload
  form remains disabled unless a read-only readiness check confirms that the
  bucket and staff policies are available.
- Image uploads are validated by declared MIME type, extension, size, and file
  signature and are never processed with Sharp. Arbitrary media URLs, HTML,
  iframe code, and external video publishing remain disabled.
- The album schema has no event-date field, so photo album dates remain labeled
  as publication dates. The new review-only video migration adds an optional
  event date to individual media items. External providers, arbitrary URLs,
  iframe code, and embed HTML remain unsupported.
- Secure direct video uploads are implemented locally with
  `tus-js-client@4.3.1`. Authenticated administrators and editors can choose an
  MP4/WebM file, enter approved metadata, optionally associate a permitted
  album, and transfer the bytes directly from the browser to the Supabase TUS
  endpoint with progress, retry, cancellation, and completion verification.
- Video bytes never pass through Next.js or Vercel. The browser session token
  is forwarded only to Supabase Storage; claims and the caller-only role RPC
  are revalidated for every metadata mutation, and RLS remains the final
  boundary.
- A new review-only forward migration adds optional media event dates, a
  protected video-completion timestamp, and the private
  `audit-team-14-videos` bucket limited to MP4/WebM and exactly 50 MB. It also
  defines server-reservation-bound Storage policies and no UPDATE/upsert
  policy. The migration and its read-only verification SQL have not been
  executed remotely.
- Published videos render on the dynamic `/videos` route through the native
  HTML video player and short-lived signed private-bucket URLs. Draft and
  archived records remain excluded by database and Storage RLS.

## Repository state

- `main` and `develop` exist and track their matching origin branches.
- Feature work is required; direct work on `main` or `develop` is prohibited.
- `CLAUDE.md` delegates shared instructions to `AGENTS.md`.
- Environment files, dependency folders, Next.js output, and common private-key files are ignored.

## Not implemented

- Confirmed public phone, email, and published media content.
- Staff management for roles, password reset, and account-registration
  workflows.
- Deployed Supabase Storage buckets or media object policies. The photo and
  video migrations remain review-only, and no jurisdiction or media records
  were seeded automatically.
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

All six jurisdiction records currently shown on the map come from the legacy
website and require stakeholder confirmation before production database
publication. Confirm each institution name, abbreviation, category, general
location, coordinates, and inclusion in Audit Team 14's jurisdiction:

- Buluan District Hospital (BDH): `6.7167, 124.8000`
- Datu Blah T. Sinsuat District Hospital (DBTSDH): `7.0333, 124.1667`
- Datu Odin Sinsuat District Hospital (DOSDH): `7.0500, 124.3000`
- South Upi Municipal Hospital (SUMH): `6.8333, 124.1333`
- IPHO – Maguindanao: `7.2167, 124.2472`
- Bangsamoro Regional Hospital and Medical Center (BRHMC): `7.2000, 124.2500`

The website owner approved the following personnel roles and names for public
display on July 30, 2026. They remain fallback content until the review-only
jurisdiction-contact migration is approved and equivalent published database
records are entered through the staff workflow:

- BDH: Medical Center Chief Dr. Rizaldy L. Piang; Accountant Michael
  Edzraphil, CPA.
- DBTSDH: Medical Center Chief Dr. Edwin John C. Limjuco; Accountant Kamille
  Bacas, CPA.
- DOSDH: Chief of Hospital Dra. Raj Deevah Eileen A. Samama-Sinsuat;
  Bookkeeper Noreen Tanghal.
- SUMH: Chief of Hospital Dra. Lourem D. Siocon; Bookkeeper Lyn Eresee.
- IPHO – Maguindanao: Medical Center Chief Dr. Mohammad Ariff A. Baguindali;
  Accountant Atty. Abuhalil Alibasa, CPA.
- BRHMC: Medical Center Chief Dr. Mohammad Ariff A. Baguindali; Accountant
  Atty. Abuhalil Alibasa, CPA.

## Confirmed next direction

Review and apply the caller-only role helper migration through the approved
database process if it is not yet deployed, then manually validate staff
authentication, announcement, activity, and team-management permissions with
disposable admin, editor, and viewer test accounts.

## Proposed next steps — require task approval

1. Apply and verify `public.get_my_role()` without exposing the private role
   ledger or other users' assignments.
2. Manually test authorized and unassigned-user access without recording
   credentials.
3. Privately test the announcement draft, publish, archive, and delete workflow
   against the deployed RLS policies without using production content.
4. Privately test the activity draft, publish, archive, and delete workflow
   against the deployed RLS policies without using production content.
5. Privately test team publication, ordering, fallback, and deletion with
   disposable records only.
6. Privately test jurisdiction publication, ordering, fallback, map
   interactions, and deletion with disposable records only.
7. Privately verify audit-history visibility, filters, pagination, and safe
   fallback labels with an administrator account.
8. Review the media Storage migration in a disposable project, confirm
   operation-aware anonymous download policies and all role cases, then obtain
   explicit approval before remote execution.
9. Review the direct-video migration in a disposable project; verify the exact
   50 MB MP4/WebM bucket limits, TUS retry/cancel behavior, reservation-bound
   INSERT policy, no-overwrite behavior, signed playback expiry, Range
   requests, seeking, and admin/editor/viewer cases before remote execution.

Update this file whenever implemented capabilities, integrations, or immediate next steps materially change.
