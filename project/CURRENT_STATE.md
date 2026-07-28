# Current state

Last reviewed: 2026-07-28

Working branch: `feature/public-homepage`

## Implemented

- A standard Next.js 16 App Router starter.
- TypeScript with strict checking enabled.
- Tailwind CSS 4 through PostCSS.
- ESLint with Next.js Core Web Vitals and TypeScript rules.
- A completed first-version public homepage with responsive institutional navigation, hero, about, vision and mission, core values, leadership, media categories, contact, and fully linked footer sections.
- Official COA and BARMM seals, the Audit Team Leader portrait, and confirmed Cotabato City office location.
- A completed searchable and filterable Leaflet/OpenStreetMap jurisdiction map with synchronized location cards, markers, popups, directions, reset controls, and OpenStreetMap attribution.
- A non-indexed `/staff` holding page only, with no authentication, sign-in, dashboard, or administrative functions.
- Central typed static content and reusable public-page components.
- Site-specific metadata, accessible focus states, and reduced-motion support.
- Shared product, architecture, design, database, security, and AI handoff documentation.

## Repository state

- `main` and `develop` exist and track their matching origin branches.
- Feature work is required; direct work on `main` or `develop` is prohibited.
- `CLAUDE.md` delegates shared instructions to `AGENTS.md`.
- Environment files, dependency folders, Next.js output, and common private-key files are ignored.

## Not implemented

- Confirmed public phone, email, exact street address, and published media content.
- Staff dashboard and authentication.
- Supabase database, storage, policies, migrations, or client configuration.
- Vercel project or deployment configuration.
- AI provider or AI feature.
- Public uploads or other user-supplied media.
- Analytics, search, email, monitoring, or content-management workflow.

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

Build a responsive public institutional website and later a private, simple staff dashboard using the safety and usability requirements in `docs/`.

## Proposed next steps — require task approval

1. Confirm the public sitemap, official content owners, and launch content.
2. Confirm staff roles and the draft/review/publish workflow.
3. Approve visual foundations and accessible page wireframes.
4. Implement the public shell and initial approved pages on a feature branch.
5. Design and review Supabase schema and Row Level Security before connecting services.

Update this file whenever implemented capabilities, integrations, or immediate next steps materially change.
