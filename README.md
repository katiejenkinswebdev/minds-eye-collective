# Minds Eye Collective — landing page

Single-page marketing site for Minds Eye Collective, built from the finished
design handoff in `../design-package/`. Next.js App Router, TypeScript strict,
CSS Modules, deployed on Vercel at **mindseyecollective.ai**.

This README is the source of truth for what works right now.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

The site runs with no environment variables at all. With none set, the contact
form still returns success and logs the submission to the server console instead
of persisting it, so the whole page is testable keyless.

```bash
npm run qa       # lint, typecheck, build, brand check
npm run build    # production build
npm run typecheck
npm run lint
npm run shots    # screenshots at 375 / 768 / 1440 into test-output/
```

`npm run qa` ends with `scripts/check-brand.sh`, which reads the CSS that
actually shipped and fails if Iris, Bloom or Ether is used as a text color. It
also fails when it finds no built CSS or no color declarations, so pointing it at
the wrong path cannot read as a pass.

`npm run shots` needs the dev or production server already running, and drives
the installed Chrome. Override with `CHROME_PATH` if yours lives elsewhere.

## What works right now

- All six sections built to spec: header, hero, What you get, How it works,
  About, Contact. Copy is verbatim from the handoff.
- Responsive stacking per spec: hero collapses to one column under 768px and the
  mark hides under 480px; How it works stacks under 768px; Contact stacks under
  1024px.
- `POST /api/contact` with zod validation, a honeypot, in-memory IP rate
  limiting, a Supabase insert, and a Resend notification.
- `robots.txt` and `sitemap.xml` via Next's metadata routes. The site is
  indexable; there is deliberately no `noindex` header.
- A generated 1200x630 OG image at `/opengraph-image`.

## What is NOT done yet

- **The brand SVGs are missing.** `public/logos/` is empty, so the header lockup
  and footer pupil-dot currently 404 and the favicon does not resolve. They come
  from `../design-package/public/logos/` once that package is on disk.
- **The hero eye contour is a placeholder.** `EYE_CONTOUR` in
  `app/prism-mark.tsx` is an approximation, not the real brand geometry. Replace
  it from `mark-prism-dark.svg`. The same placeholder is duplicated in
  `app/opengraph-image.tsx` and must be updated in both places.
- **Tokens are transcribed, not imported.** `app/theme.css` holds values copied
  out of the handoff's README and BRAND docs. When `design-package/tokens/
  tokens.css` lands, re-point the `--mec-*` values at the real token names. No
  component stylesheet needs to change.
- **The page title's dash is unverified.** The handoff arrived with mojibake in
  place of the dash in the `<title>`. `lib/site.ts` currently uses an em dash;
  confirm against the `.dc.html` and correct if it is an en dash.
- Not yet verified against the design at 375 / 768 / 1440, and Lighthouse has not
  been run.

## Environment

See `.env.example`. Every variable is optional in development.

| Variable | Purpose |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Durable `leads` record. Service role key is server-side only. |
| `RESEND_API_KEY` | Lead notification email. |
| `CONTACT_TO_EMAIL` | Where leads are delivered. Hover forwarding address. |
| `CONTACT_FROM_EMAIL` | Sender. Must be on the Resend-verified domain. |

Apply `supabase/migration.sql` to create the `leads` table. It enables RLS with
no policies, so only the service role can read or write it.

## How the contact form behaves

`POST /api/contact` returns `200 {ok:true}` or `4xx/5xx {ok:false,error}` and
never leaks internals to the client.

1. Rate limit: 5 requests per IP per 10 minutes, then `429`.
2. Invalid JSON or a schema failure returns `400`.
3. A filled honeypot returns `200` without doing anything, so the bot learns
   nothing.
4. Supabase and Resend run in parallel. The Supabase row is the durable record,
   so a Resend outage alone still counts as success.
5. If the lead reached neither Supabase nor Resend, the route returns `500`
   rather than reporting a success that lost a real lead. The one exception is
   development with nothing configured, where it logs and returns success.

The in-memory rate limiter is per-instance and resets on cold start. It deters
casual spam, not a determined attacker. Upstash or Vercel KV is the upgrade.

## Deviations from the handoff, and why

- **CSS Modules instead of Tailwind.** The design is specified entirely in raw
  CSS values. Tailwind arbitrary-value syntax would add noise without benefit on
  a one-page site. `../design-package/CLAUDE.md` lists Tailwind as optional.
- **CSS scroll behavior instead of JS.** The handoff asks for `preventDefault`
  plus scripted scrolling that falls back to `auto` under reduced motion. Plain
  anchors with `scroll-behavior: smooth` and a `prefers-reduced-motion` override
  produce identical behavior, work without JS, and keep the form as the only
  client component.
- **Next 16.3.3, not 16.2.10.** The version used across the other repos here has
  nine high-severity advisories including SSRF and unauthenticated Server
  Function disclosure. 16.3.3 audits clean.
- **`mindseyecollective.ai` throughout.** The handoff was written against
  `mindseyecollective.com`, which is registered to a third party and serves an
  expired-site 404.
- **No Upstash.** Deliberate scope call for launch. See above.

## Structure

```
app/
  layout.tsx            metadata, fonts, token + global CSS imports
  page.tsx              the whole page, a server component
  page.module.css       all six sections
  contact-form.tsx      the one client component
  prism-mark.tsx        hero mark SVG
  opengraph-image.tsx   generated 1200x630 OG image
  robots.ts, sitemap.ts
  api/contact/route.ts
lib/
  site.ts               name, domain, title, description, contact email
  validation.ts         zod schema
  rate-limit.ts         in-memory IP limiter
  leads.ts              Supabase insert
  notify.ts             Resend notification
supabase/migration.sql
```
