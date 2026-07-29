# Architecture

## Confirmed baseline

- Next.js 16 App Router with React and TypeScript.
- Tailwind CSS 4 for styling.
- A public homepage and non-indexed staff login, access-denied, and protected
  dashboard routes exist under `app/`.
- Supabase SSR browser/server clients and session refresh are configured with
  the public project URL and publishable key.
- Supabase Auth and PostgreSQL provide the deployed authentication and
  authorization foundation. Storage remains deferred.
- Vercel is the planned hosting platform.
- Staff routes validate signed identity with `auth.getClaims()` and active
  application role through a caller-only database function. The follow-up
  function migration remains review-only until separately applied.
- Role-aware content management exists for announcements, activities, team
  members, jurisdictions, albums, and media metadata. A review-only private
  Storage migration and guarded image-upload workflow exist for the media
  gallery, but uploads remain disabled until that migration is applied and
  verified.

The system must support a public institutional website and a private staff dashboard while keeping confidential audit material outside the product.

## Proposed target architecture — requires approval

```text
Browser
  ├─ Public website ────────> Next.js public routes
  └─ Staff dashboard ───────> Next.js protected routes
                                  │
                                  ├─ Server-side authorization
                                  ├─ Supabase Auth
                                  ├─ Supabase PostgreSQL
                                  └─ Supabase Storage

Approved public content only ──> optional future AI service
```

### Application boundaries

- `app/(public)`: public pages and approved published content.
- `app/staff`: authenticated and database-authorized staff pages.
- Server-side modules: authorization, validation, publishing, and external-service access.
- Shared UI: accessible primitives and design tokens used by both areas.

The public route group remains a proposed organization; current public pages
remain at the application root.

### Content lifecycle

A proposed lifecycle is `draft → in_review → approved → published → archived`. Publishing should be a server-side action that records the actor and time. AI-assisted text must enter as a draft and follow the same human review path.

### Rendering and data access

- Public pages should favor server rendering and caching appropriate to content freshness.
- Dashboard data must be fetched only after server-side identity and role checks.
- Privileged database or storage operations must remain server-side.
- Client components should be limited to interactions that need browser state.
- Public gallery pages fetch only published album/image metadata through
  anonymous RLS. Image bytes are delivered through a same-origin route that
  resolves approved records server-side, verifies a supported file signature,
  and does not reveal database UUIDs or Storage object keys.

### Service access

- Use the least-privileged Supabase client appropriate to each context.
- Never expose a Supabase service-role key in browser bundles.
- Validate all writes on the server even when the form validates in the browser.
- Keep AI-provider calls server-side and restrict retrieval to approved public material.

## Deployment proposal — requires approval

- Use separate development, preview, and production environments.
- Deploy feature branches as previews and promote reviewed changes through `develop` and `main`.
- Store environment-specific secrets in managed platform settings, never in Git.
- Apply database migrations through a reviewed, repeatable process.

## Architecture decisions still needed

- Public sitemap and content ownership.
- Staff roles and exact approval permissions.
- Data retention and records-management requirements.
- Search, analytics, email, and AI scope.
- Backup, recovery, monitoring, and incident-response ownership.
