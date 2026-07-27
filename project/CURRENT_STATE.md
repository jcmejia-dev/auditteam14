# Current state

Last reviewed: 2026-07-27

Working branch: `feature/project-foundation`

## Implemented

- A standard Next.js 16 App Router starter.
- TypeScript with strict checking enabled.
- Tailwind CSS 4 through PostCSS.
- ESLint with Next.js Core Web Vitals and TypeScript rules.
- The default starter page, metadata, styles, and public starter assets.
- Shared product, architecture, design, database, security, and AI handoff documentation.

## Repository state

- `main` and `develop` exist and track their matching origin branches.
- Feature work is required; direct work on `main` or `develop` is prohibited.
- `CLAUDE.md` delegates shared instructions to `AGENTS.md`.
- Environment files, dependency folders, Next.js output, and common private-key files are ignored.

## Not implemented

- Audit Team 14 branding, navigation, content, or page redesign.
- Public information architecture.
- Staff dashboard or authentication.
- Supabase database, storage, policies, migrations, or client configuration.
- Vercel project or deployment configuration.
- AI provider or AI feature.
- Analytics, search, email, monitoring, or content-management workflow.

## Confirmed next direction

Build a responsive public institutional website and later a private, simple staff dashboard using the safety and usability requirements in `docs/`.

## Proposed next steps — require task approval

1. Confirm the public sitemap, official content owners, and launch content.
2. Confirm staff roles and the draft/review/publish workflow.
3. Approve visual foundations and accessible page wireframes.
4. Implement the public shell and initial approved pages on a feature branch.
5. Design and review Supabase schema and Row Level Security before connecting services.

Update this file whenever implemented capabilities, integrations, or immediate next steps materially change.
