<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Minds Eye Collective landing page

## The README rule

`README.md` is the source of truth for what works right now. Every change to app
code ships with its README update in the same commit. If you changed behavior and
did not touch the README, you are not done.

## This site is built from a finished design

The handoff lives in `../design-package/` (README.md, BRAND.md, CLAUDE.md,
`design/Minds Eye Landing Page - FINAL.dc.html`). Copy, colors, spacing, and type
are final. Do not redesign. When a literal instruction conflicts with `BRAND.md`,
follow the brand guide and say so.

## Non-negotiables

- `#8B7CF0`, `#C05CD6`, `#3EC8D8` are decorative only and must **never** be a text
  color. Text is `#F6F5FB` on dark, `#1C1936` on light. Accent text is `#A99CFF`
  on dark, `#5646C0` on light.
- One prism-gradient element per surface. Currently the hero mark and the About
  divider bar. Never a gradient on type.
- No webfonts, no UI libraries, no lift/scale/shadow hover effects.
- Honor `prefers-reduced-motion`.
- Keep the `<title>` element inside every brand SVG.
- The contact form must never fake a submission.
- The domain is **mindseyecollective.ai**. `mindseyecollective.com` belongs to
  someone else. No reference to the `.com` may appear anywhere in this repo.

## Styling

Tokens live once in `app/theme.css` as `--mec-*` custom properties. Component
styles are CSS Modules that read those names. Never hardcode a hex value in a
component stylesheet.

## Copy

Copy from the handoff is verbatim. For anything new: no em dashes, no exclamation
points.
