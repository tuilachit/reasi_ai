# Reasi website

The public clinic marketing website at https://www.reasiai.com.
This is separate from the Reasi PWA and native iOS app.

## Development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3017. The site uses Next.js, TypeScript, Tailwind and Framer Motion.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run start
SITE_URL=http://localhost:3017 npm test
```

Rendered tests cover navigation, booking links, the shared founder image, footer and the existing privacy, terms and support pages. The legacy waitlist utility tests are retained; the clinic homepage does not collect waitlist submissions or connect to Supabase.

## Production

- Repository: `tuilachit/reasi_ai`, production branch `main`.
- Vercel project: `fitment/reasi-ai`.
- Vercel root directory remains `waitlist`; framework is Next.js.
- Domains remain `reasiai.com` and `www.reasiai.com` on this existing project.
- `/privacy`, `/terms` and `/support` preserve the existing app information and support contact.
- The visible personal email is removed from the footer. Booking buttons retain the temporary `mailto:` target until a booking URL is supplied.
- Lifestyle photo sources and licensing are recorded in `docs/photo-sources.md`. The shared founder photo is supplied by the founders.

Run Vercel CLI commands from the repository root and confirm the linked project before deployment. Do not deploy from the PWA or move the domains to the old standalone preview project.
