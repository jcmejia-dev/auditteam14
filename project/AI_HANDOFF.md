# AI handoff

## Read first

1. `AGENTS.md`
2. `docs/PRODUCT.md`
3. `docs/SECURITY.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DESIGN_SYSTEM.md`
6. `docs/DATABASE.md`
7. `project/CURRENT_STATE.md`

Also inspect the active branch, worktree, recent commits, and relevant source files before editing.

## Project in one paragraph

Audit Team 14 is building a responsive official website/web system for Commission on Audit – BARMM, Audit Group C, Maguindanao. It will provide a public institutional website and later a private staff dashboard designed for older and nontechnical administrators. The intended stack is Next.js, TypeScript, Tailwind CSS, Supabase, and Vercel, but external services are not connected yet.

## Non-negotiable boundaries

- Work on a feature branch, never directly on `main` or `develop`.
- Do not expose passwords, service-role keys, AI keys, or other secrets.
- Keep confidential audit evidence, findings, working papers, personal data, and unreleased reports out of this website and all AI systems.
- Limit any future AI feature to approved public content.
- Require human review before publishing AI-generated material.
- Treat all authorization as a server-side responsibility.
- Do not infer that proposed routes, tables, roles, colors, or workflows are approved.

## Current implementation

The repository remains the default Next.js starter. The foundation documents describe direction and proposals; they do not mean that pages, integrations, schemas, or deployments exist. See `project/CURRENT_STATE.md` for the authoritative implementation snapshot.

## Working method

1. Confirm the requested scope and classify requirements versus proposals.
2. Read the relevant bundled Next.js documentation before writing Next.js code.
3. Inspect existing work and preserve unrelated changes.
4. Make the smallest coherent change without adding unrequested services or dependencies.
5. Validate with `npm run lint` and `npm run build`.
6. Review the diff for generated files, secrets, sensitive data, and accidental scope changes.
7. Update durable documentation only when a decision or implementation state changes.

## Handoff format

At the end of a task, record:

- Branch and commit.
- Files and behavior changed.
- Validation results.
- Security or data-handling implications.
- Confirmed decisions and unresolved proposals.
- The safest next action.
