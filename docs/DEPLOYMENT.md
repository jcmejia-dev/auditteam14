# Deployment checklist

## First Vercel preview

- Import the private GitHub repository into the authorized Vercel account or
  team. Do not make the repository public.
- Keep `main` configured as the Vercel Production Branch.
- Deploy `develop` as a Preview Git reference. Review feature work through
  Preview deployments before promoting it to `main`.
- Use Node.js 22 or 24. The repository requires Node.js 22 or newer through
  `package.json`.
- In Vercel Project Settings, configure these variables for the Preview
  environment:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- After the intended preview URL is known, configure
  `NEXT_PUBLIC_SITE_URL` to that exact HTTPS origin and redeploy the preview.
  Do not guess or hardcode a production domain.
- Never add a Supabase secret key, service-role key, password, or other
  privileged credential to Vercel or to variables prefixed with
  `NEXT_PUBLIC_`.
- Keep Git integration and the default Next.js build settings. No
  `vercel.json` is currently required.

## Manual preview checks

- Confirm the homepage and all public navigation sections load normally.
- Check the interactive jurisdiction map, OpenStreetMap attribution, and
  directions links.
- Test staff login and POST-based logout without recording credentials.
- Confirm logged-out staff routes redirect to login.
- Confirm unassigned, viewer, editor, and administrator access follows the
  documented role matrix.
- Confirm staff pages remain non-indexed and return private/no-store headers.
- Review desktop, tablet, and mobile layouts, including keyboard navigation
  and visible focus states.

Do not promote the preview to production until the documented dependency
advisories, stakeholder-confirmation items, and manual access checks have been
reviewed.
