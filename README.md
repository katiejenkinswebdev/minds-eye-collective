# Minds Eye Collective — landing page

Single-page marketing site for Minds Eye Collective, built from the design
handoff in `../landing-handoff/`. Next.js App Router, TypeScript strict, CSS
Modules, deployed on Vercel at **mindseyecollective.ai**.

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
npm run shots    # screenshots at 375 / 768 / 1440 into test-output/
npm run compare  # pixel-diff built output against the design file
```

`npm run qa` ends with `scripts/check-brand.sh`, which reads the CSS that
actually shipped and fails if Iris, Bloom or Ether is used as a text color,
directly or through a token. It also fails when it finds no built CSS or no
color declarations at all, so pointing it at the wrong path cannot read as a
pass.

`npm run shots` needs a server already running and drives the installed Chrome.
Override with `CHROME_PATH` if yours lives elsewhere.

## Status: complete and verified, not yet deployed

Everything in the handoff is built. What remains is account setup and the
deploy, none of which can happen from this repo alone. See "Going live" below.

**Verified:**

- Lighthouse **99 performance / 100 accessibility / 100 best practices / 100 SEO**
  against the production build. Lighthouse runs mobile emulation by default, so
  these are mobile scores.
- **No horizontal overflow at 320, 360, 375, 390, 414, 480, 560 or 768px**, and
  no form field under 16px at any touch width.
- 21 end-to-end API checks pass, covering validation, honeypot, rate limiting,
  malformed JSON, method rejection, and the static routes.
- Pixel diff against `Minds Eye Landing Page - FINAL.dc.html` at 1440 is
  **0.43% differing pixels**, confined to antialiasing on the header button
  border.
- All eight brand SVGs ship with their `<title>` elements intact.
- No decorative accent is used as a text color anywhere in the built CSS.

**The 375 and 768 diffs are large (30% and 3%) and that is expected.** The
design file contains zero media queries: it is a desktop mockup. The responsive
behavior exists only as prose in the handoff README, and this build implements
it — hero collapses to one column under 768px with the mark hidden under 480px,
How it works stacks under 768px, Contact stacks under 1024px, name and email
stack under 560px.

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

1. Rate limit: 5 requests per IP per 10 minutes, then `429` with `Retry-After`.
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

- **`mindseyecollective.ai` throughout.** The handoff was written against
  `mindseyecollective.com`, which is registered to a third party through
  Squarespace and serves an expired-site 404. Not ours.
- **Light-surface eyebrow opacity is 0.65, not 0.55.** Ink at 55% over Paper is
  3.75:1, and 13px/600 is not WCAG large text so it needs 4.5:1. The handoff
  requires WCAG AA, so the accessibility rule wins over the literal value. 0.65
  gives 5.13:1. The dark-surface eyebrow keeps 0.55, already 5.68:1.
- **Form fields are 16px under 768px, 15px above.** iOS Safari auto-zooms the
  page when a focused field is under 16px, which throws the layout sideways the
  moment someone taps Name on an iPhone. The design's 15px is kept on desktop.
- **Header shrinks below 400px.** At 320px the 184px lockup plus the ghost CTA
  overflowed the viewport by 35px and put the page into horizontal scroll. The
  lockup drops to 34px and the CTA tightens. Nothing upstream covers this: the
  design file has no media queries and the handoff only claims verification at
  375 and up.
- **Hero mark stroke widths follow the design file, not the SVG asset.**
  `mark-prism-dark.svg` uses a 6px contour and 1.5px inner ring; the hero in the
  design file uses 5 and 1.2. The design file wins for this page.
- **Hero glow follows the design file, not `--mec-glow`.** `tokens.css` defines
  the glow at `50% 45% / 62%`; the design file and handoff README both use
  `50% 40% / 65%`.
- **CSS Modules instead of Tailwind.** The design is specified entirely in raw
  CSS values. `../landing-handoff/CLAUDE.md` lists Tailwind as optional.
- **CSS scroll behavior instead of JS.** The handoff asks for `preventDefault`
  plus scripted scrolling that falls back to `auto` under reduced motion. Plain
  anchors with `scroll-behavior: smooth` and a `prefers-reduced-motion` override
  produce identical behavior, work without JS, and keep the form as the only
  client component.
- **Next 16.3.3, not 16.2.10.** The version used across the other repos here has
  nine high-severity advisories including SSRF and unauthenticated Server
  Function disclosure. 16.3.3 audits clean.
- **No Upstash.** Deliberate scope call for launch.

## Going live

1. **Hover:** forward `hello@mindseyecollective.ai` to your inbox. Leave the
   root MX records alone.
2. **Resend:** verify `mindseyecollective.ai`. Resend puts its MX and SPF on the
   `send.` subdomain, so it will not collide with the Hover forwarding above.
   Create an API key.
3. **Supabase:** create a project, run `supabase/migration.sql`, copy the URL and
   service role key.
4. **Vercel:** `vercel login`, import the repo, set the four environment
   variables, deploy, and confirm the form works on the `*.vercel.app` URL.
5. **DNS:** add `mindseyecollective.ai` and `www.` in Vercel, then put the exact
   A and CNAME records Vercel shows into Hover, replacing the parking-page A
   record. Copy those values fresh from the dashboard rather than from memory.
6. Confirm SSL, then submit the sitemap in Google Search Console.

## Tokens

`app/tokens.css` is the brand token file, copied verbatim from
`../landing-handoff/tokens/tokens.css`. Do not edit it; re-copy it if the brand
system changes.

`app/theme.css` holds only `--page-*` values the design uses that the brand
tokens do not define: the card white, the error pink, the hairline alphas, and
the hero glow. The prefix keeps it obvious which names are brand and which are
page-local. No component stylesheet contains a raw hex value.

## Structure

```
app/
  layout.tsx            metadata, token + theme + global CSS imports
  page.tsx              the whole page, a server component
  page.module.css       all six sections
  contact-form.tsx      the one client component
  prism-mark.tsx        hero mark SVG
  opengraph-image.tsx   generated 1200x630 OG image
  tokens.css            brand tokens, copied verbatim
  theme.css             page-local values only
  robots.ts, sitemap.ts
  api/contact/route.ts
lib/
  site.ts               name, domain, title, description, contact email
  validation.ts         zod schema
  rate-limit.ts         in-memory IP limiter
  leads.ts              Supabase insert
  notify.ts             Resend notification
scripts/
  check-brand.sh        fails the build on a banned text color
  shots.ts              breakpoint screenshots
  compare.ts            pixel diff against the design file
supabase/migration.sql
public/logos/           eight brand SVGs, copied as-is
```
