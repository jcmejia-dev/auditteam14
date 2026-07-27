# Product

## Status

This document separates approved project requirements from ideas that still need stakeholder confirmation.

## Confirmed requirements

### Purpose

Audit Team 14 needs a modern official web presence for Commission on Audit – BARMM, Audit Group C, Maguindanao. The product is a responsive website/web system, not a mobile application.

### Audiences

- Members of the public seeking approved institutional information.
- Audit Team 14 staff maintaining approved website content.
- Older or nontechnical administrators who need a simple, forgiving workflow.

### Product scope

- A public institutional website.
- A private, simple staff dashboard in a later phase.
- Responsive behavior across phones, tablets, laptops, and desktop displays.
- A professional contemporary government presentation.

### Experience principles

- Use plain language and familiar labels.
- Keep navigation shallow, consistent, and visible.
- Favor readable text, large targets, clear status messages, and safe defaults.
- Make publishing deliberate and reviewable.
- Show only content approved for its intended audience.

### Technology direction

The selected stack is Next.js, TypeScript, Tailwind CSS, Supabase, and Vercel. Supabase is intended to provide authentication, PostgreSQL, and storage. Connections to Supabase and Vercel are not yet implemented.

### Content and AI boundaries

- Confidential audit evidence, findings, working papers, personal data, and unreleased reports must never be placed on public pages or exposed to AI.
- A future public AI feature may use approved public content only.
- AI output must be reviewed and explicitly approved by a human before publication.

## Future proposals — not yet approved

Potential public sections include About, Mandate, Officials, Announcements, Citizen Resources, Approved Publications, Contact, and Accessibility. Potential dashboard capabilities include content drafts, media management, review queues, publishing, and a basic activity history.

Each section and workflow requires content-owner confirmation before implementation. The first delivery milestone should define the public information architecture, dashboard roles, approval workflow, and launch content inventory.

## Out of scope unless explicitly approved

- Storing or managing audit casework, evidence, findings, or working papers.
- Publishing personal or unreleased information.
- Autonomous AI publishing or AI access to private staff content.
- Native mobile applications.
- Replacing official records-management or audit systems.

## Success criteria

- Public information is accurate, approved, accessible, and easy to find.
- Staff can manage content without specialist technical knowledge.
- Private functions are protected by server-side authorization.
- The site passes agreed accessibility, security, content-review, and operational checks before launch.
