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

## Temporary dependency risk

- Next.js `16.2.12` currently carries nested `postcss@8.4.31` and `sharp@0.34.5` versions with published security advisories.
- The current site accepts only trusted, committed CSS and trusted local images. User-supplied CSS, arbitrary remote-image optimization, and public uploads are prohibited while these affected versions remain installed.
- Before implementing media uploads, upgrade to patched dependencies or document and validate explicit mitigations. GIF, TIFF, and VIPS uploads must remain blocked while an affected Sharp version is present.
- Never use `npm audit fix --force` or downgrade Next.js as an advisory workaround.
- Recheck production advisories during every dependency upgrade and before production deployment.

## Authentication proposal — requires approval

Use Supabase Auth with organization-approved sign-in and recovery methods. Require stronger verification for privileged roles if supported by policy. Sessions should use secure, HTTP-only cookie handling through current Next.js and Supabase guidance. Exact roles, recovery ownership, and multi-factor requirements remain decisions.

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
