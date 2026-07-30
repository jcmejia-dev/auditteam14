<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Audit Team 14 project rules

## Product direction

- Build a responsive website/web system for Commission on Audit – BARMM, Audit Group C, Maguindanao, Audit Team 14. This is not a mobile app.
- The product has a public institutional website and, later, a private simple staff dashboard.
- Design for older and nontechnical administrators: use plain language, predictable navigation, readable type, large controls, and clear feedback.
- The visual direction is a contemporary government style using navy, muted teal, warm gold, and off-white.

## Confirmed platform

- Next.js App Router, TypeScript, and Tailwind CSS.
- Supabase is the planned provider for authentication, PostgreSQL, and storage.
- Vercel is the planned deployment platform.
- Supabase and Vercel are directions, not proof that an integration already exists. Check the repository and `project/CURRENT_STATE.md` before assuming a service is connected.

## Security and content rules

- Never put passwords, service-role keys, AI keys, or other secrets in frontend code or committed files.
- Never expose confidential audit evidence, findings, working papers, personal data, or unreleased reports to public pages or AI systems.
- Public AI features may use only approved public content.
- AI-generated content must remain draft content until a human reviewer explicitly approves it for publication.
- Treat authorization as server-enforced. Hiding controls in the interface is not access control.
- Follow `docs/SECURITY.md` and keep its restrictions intact when proposing features.

## Engineering workflow

- Work on feature branches. Never commit directly to `main` or `develop`.
- Preserve user work and inspect the current diff before editing.
- Do not add dependencies, services, environment variables, database objects, or deployment configuration unless the task explicitly requires them.
- Before writing Next.js code, read the relevant documentation in `node_modules/next/dist/docs/` as required above.
- Run `npm run lint` and `npm run build` before handing off code or configuration changes.
- Do not commit generated output, environment files, credentials, or secrets.

## Project memory

- Read `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/DATABASE.md`, `docs/SECURITY.md`, `project/CURRENT_STATE.md`, and `project/AI_HANDOFF.md` before substantial implementation work.
- Keep confirmed requirements distinct from future proposals.
- Update `project/CURRENT_STATE.md` when a task materially changes the implemented system, integrations, or immediate next steps.
- Update durable documents when a decision is confirmed; do not record speculation as an accepted decision.
