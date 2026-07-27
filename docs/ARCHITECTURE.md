# Architecture

## Confirmed baseline

- Next.js 16 App Router with React and TypeScript.
- Tailwind CSS 4 for styling.
- A single starter route currently exists under `app/`.
- Supabase is the planned provider for authentication, PostgreSQL, and file storage.
- Vercel is the planned hosting platform.
- No external service is connected yet.

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
- `app/(staff)`: authenticated dashboard pages.
- Server-side modules: authorization, validation, publishing, and external-service access.
- Shared UI: accessible primitives and design tokens used by both areas.

These route groups are proposed conventions, not current repository structure.

### Content lifecycle

A proposed lifecycle is `draft → in_review → approved → published → archived`. Publishing should be a server-side action that records the actor and time. AI-assisted text must enter as a draft and follow the same human review path.

### Rendering and data access

- Public pages should favor server rendering and caching appropriate to content freshness.
- Dashboard data must be fetched only after server-side identity and role checks.
- Privileged database or storage operations must remain server-side.
- Client components should be limited to interactions that need browser state.

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
