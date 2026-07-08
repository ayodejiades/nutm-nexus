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

## Done (cont.)
- [x] **#10 (part 1) — killed the one-offs**: no more hardcoded green, `#1B222B`, `#0F1721`, `scale-120`, `text-[9px]`, or arbitrary `rounded-[2rem]/[2.5rem]`. All verified absent.

## Next up
- [ ] **#10 (part 2) — collapse the scales** (do with app running, needs eyeballing): radii still span `lg/xl/2xl/3xl` (~57 uses) → pick two tiers (controls vs cards) + keep `full`. Micro-label type still uses `text-[10px]` (37×) / `[11px]` (8×) → migrate onto the Tailwind scale (`text-xs`+). Both change nearly every component's look, so verify visually rather than blind-sweep.
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
