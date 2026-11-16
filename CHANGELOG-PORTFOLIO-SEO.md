# Portfolio & SEO changelog

## Implemented locally (not deployed)

- Rebuilt the homepage presentation from the owner-approved `portfolio_design_preview.html`: exact dark/yellow palette, Inter typography, 1280px two-column hero, compact header, standalone 4:3 project image, 3×2 project grid and dark before/during/after panels. Removed the oversized “Why work with us” hero card.
- Preserved 33 owner-supplied projects, 23 project detail pages, and all 96 optimized WebP assets.
- Verified every `cover` and `photo.src` reference resolves to exactly one file; no missing or orphaned project images.
- Scanned all public WebP files for EXIF/XMP/GPS metadata markers; none were present.
- Kept the confirmed descriptions for the bedroom ceiling patch, exterior repaint, gable-end siding, kitchen diffuser panels, and white cabinet painting. The excluded AC/eave image was not added.
- Added unique project metadata, canonical URLs, Open Graph images, sitemap image entries, project breadcrumbs, service schema, visible-content FAQ schema, and service breadcrumbs.
- Replaced remaining content `<img>` elements with `next/image`; ESLint now reports no image warnings.
- Added a useful custom 404 and correct `notFound()` handling for unknown city/service routes.
- Kept thin city/service combinations out of the sitemap without applying blanket `noindex`; sitemap removal is not treated as deindexing.
- Removed anonymous/fabricated review text. The review section links to the original Thumbtack profile and makes no merged rating claim.
- Preserved the desktop hero alignment fix (`lg:items-start`) and real project hero image.

## SEO page audit decision table

| Page group | Current evidence | Decision now | Revisit with GSC |
|---|---|---|---|
| Home | Primary business page with services, projects and lead form | Keep and improve | Queries, landing-page conversions, CWV |
| 11 primary service pages | Unique process, estimate tips, FAQs and linked real projects | Keep and improve | Consolidate only where impressions/cannibalization justify it |
| 17 city pages | Correct named service area but partially templated | Keep; improve incrementally | Compare clicks/impressions and indexed status by city |
| 187 city + service pages | Highly templated and intentionally excluded from sitemap | Do not bulk-delete/noindex without evidence | Export page/query performance; choose keep/improve/consolidate/noindex per URL cluster |
| 23 project detail pages | Unique real photos and descriptions | Keep | Image search impressions and engagement |
| Guides | Useful informational intent | Keep | Expand topics supported by query data |

No price ranges, licenses, awards, warranties, review counts, dates, addresses, or project locations were invented.

## Security and conversion changes

- Cloudflare Turnstile Siteverify runs server-side. Missing Turnstile configuration fails closed only on Vercel Production; local and Preview can use official test keys.
- Added distributed Upstash Redis REST rate limiting scaffold (5 attempts / 10 minutes), hashed IP keys, strict `RATE_LIMIT_MODE=enforce` rollout gate, request/file limits, parsing timeout, MIME allowlist plus file-signature checks, and safe forwarded filenames.
- Form errors reset Turnstile for retry. `form_started`, successful `generate_lead`, phone, SMS and external-review interactions are tracked without sending contact details or message text to GA4.
- Preview defaults to `LEAD_DELIVERY_MODE=test`: no Telegram call and no `generate_lead`. GA4 is no longer hardcoded and loads only from an explicitly scoped Vercel environment variable.
- Upstash counter/expiry now run through an atomic `/multi-exec` transaction rather than a non-atomic pipeline.

## Verification performed

- `npm run lint` — pass, 0 errors and 0 warnings.
- `npx next build --webpack` — pass, TypeScript clean, 252 pages generated after statically enumerating all valid city routes.
- Local production HTTP smoke test — key routes 200, custom missing route 404, estimate GET 405, and missing Production Turnstile token 403 before Telegram delivery.
- Turbopack build is blocked in the managed sandbox because its CSS worker cannot bind a local helper port; webpack verifies the application code and prerender output.
