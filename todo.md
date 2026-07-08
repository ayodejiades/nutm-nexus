# Nexus — design fix TODO

Working list from the `rethink.md` audit. Ordered by impact-to-effort. Check off as shipped.
Nothing here is committed/pushed yet unless noted.

## Done
- [x] **#1 OG / social tags** — `openGraph` + `twitter` meta in `layout.tsx`, dynamic `opengraph-image.tsx` (1200×630).
- [x] **#2 NUTM-only auth** — `auth.ts` `signIn` restricts to `nutm.edu.ng` (+ subdomains), env-overridable via `ALLOWED_EMAIL_DOMAINS`. Login copy updated.
- [x] **#3 Deleted decoration** — hero orbs, shimmer scanline, search glow, login orb.
- [x] **#4 Hero rewrite** — real headline, dropped animated counters + "Showing" stat + ⌘K pill.
- [x] **#8 Focus states** — global `:focus-visible` ring, filter-select rings, aria-labels (search/clear/hamburger), `alt=""` on decorative hero logo.
- [x] **#5 Weight taming** — most `font-black` → `font-semibold`; 900 reserved for wordmark.
- [x] **#6 Contrast pass** — bumped `text-foreground/20|30|40` to legible levels.
- [x] **#7 Hover controls** — user menu is click/keyboard-accessible; Quick-Peek visible on touch.

## Done (cont.)
- [x] **#9 Server-render the catalog** — data moved to `src/lib/courses.ts` (server-only, React `cache`); home is a Server Component (ISR), all 30 course pages prerender as static HTML (`generateStaticParams`). Course content + per-course OG now baked into HTML (verified).
- [x] **#11 Dedupe course "Quick Links"** — Forum/Assignments buttons render only when their URL differs from the others.
- [x] **#13 Per-course OG metadata** — `generateMetadata` emits per-course `og:title`/`description` (verified in built HTML). *Optional follow-up:* a bespoke per-course OG **image** (code+title on the card) via `courses/[slug]/opengraph-image.tsx`.

## Next up
- [ ] **#10 Consolidate design tokens** (~1h) — one green (kill hardcoded `rgba(34,197,94)`), two radii, drop `bg-[#1B222B]` & `scale-120`, define a 6-step type scale, remove the 9px tier.
- [ ] Remove now-unused API routes `src/app/api/courses/*` (home + detail read the lib directly now) — or keep if you still want a JSON endpoint.
- [ ] **#13 (optional)** bespoke per-course OG image.

## Setup / verify (not code — don't forget)
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel to the real domain (OG URLs are absolute).
- [ ] Confirm the **real NUTM student email domain**; if not `nutm.edu.ng`/subdomain, add it to `ALLOWED_EMAIL_DOMAINS`.
- [ ] For local testing, add your own domain: `ALLOWED_EMAIL_DOMAINS=nutm.edu.ng,gmail.com` in `.env.local`.
- [ ] Commit + push (content, code, playlist IDs are all still local).

## Related, from earlier
- [ ] Restructure: separate content repo (see `RESTRUCTURE_PLAN.md`) — decisions still open.
- [ ] Quizzes in `metadata.json` are still not rendered on the course page (quick win).
