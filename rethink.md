# rethink.md — brutal design audit of NUTM Nexus

No compliment sandwich. Findings are tagged **[S1]** (critical) → **[S4]** (polish). File:line references are real. A prioritized, impact-to-effort action list is at the bottom.

The one-line verdict: this is a competent dark-mode template with the volume knob broken off. Every element shouts — 900-weight, uppercase, wide-tracked, glowing — so nothing leads. It reads as "AI landing page," not "the place I get my past papers." The good bones (search, filters, quick-peek, recents) are buried under decoration.

---

## 1. AI-slop detection

**[S1] The whole site renders client-side with no server content.** `page.tsx:1` is `"use client"` and fetches courses in `useEffect` (`page.tsx:152`) with `cache: "no-store"` (`page.tsx:29`). The raw HTML ships zero courses — every visit is blank → 6 skeletons → pop-in. This is the deepest "generated app" tell: it *works* but feels weightless and is invisible to Google.

**[S2] Font-weight abuse, industrial scale.** `font-black` (900) appears **69 times**. Nav links, 10px labels, stat numbers, buttons, headings — all 900. Globals force *every* heading to 700 (`globals.css:70`). When everything is boldest, weight stops encoding hierarchy and the UI just looks loud. This is the single biggest slop signal here.

**[S2] Uppercase + wide-tracking on everything.** **71** `uppercase` usages, most paired with `tracking-widest` / `tracking-[0.2em]` / `[0.3em]` (e.g. `page.tsx:332`, `Footer.tsx:16`, `Navbar.tsx:44`). Micro-labels at `text-[9px]`/`[10px]` in all-caps green are a template reflex, not information design. All-caps also tanks readability of the very labels meant to orient users.

**[S3] The glowing-orb starter pack.** Two floating blurred gradient blobs on the hero (`page.tsx:259-260`, `bg-primary/10 blur-[120px] ... animate-float`), a third on login (`login/page.tsx:103`), a fourth on the course hero (`courses/[slug]/page.tsx:238`). Plus a shimmer "scanline" (`page.tsx:263`) and a technical grid background (`globals.css:155`). **7** blur-orb instances total. This exact stack — dark bg + green glow blobs + grid + shimmer — is the visual signature of a hundred AI-generated SaaS pages.

**[S3] Gradient text.** `.text-gradient-primary` green→teal clip (`globals.css:162`). It's the purple-to-blue cliché wearing NUTM colors.

**[S3] Theatrical fake metrics.** `useAnimatedCounter` count-up eases three "stats" (`page.tsx:238-240`). Two are trivial (30 courses, N departments); the third, **"Showing,"** is just the filtered result count cosplaying as a KPI (`page.tsx:328`). Animating a count to "30" is motion for motion's sake.

**[S3] Empty copy.** Footer: *"Empowering students through collective intelligence"* (`Footer.tsx:39`). That's a slop sentence — delete or replace with something true ("Notes, past papers and quizzes, shared by students"). The hero headline is literally the single word **"Nexus."** at 112px (`page.tsx:287`) — maximum real estate, zero value proposition.

**[S3] Bouncy default card.** `.coursera-card` lifts on hover with an overshoot bezier (`cubic-bezier(0.34,1.56,0.64,1)`) and a heavy default shadow `0 20px 40px -12px rgba(0,0,0,0.5)` (`globals.css:92-101`). The springy bounce + big soft shadow is the Tailwind-tutorial default look.

---

## 2. UX flaws

**[S1] The entire site is walled, and the wall is pointless.** `src/proxy.ts` (Next 16's renamed middleware) matches everything except `/api` and static, and `auth.ts:authorized` returns `false` for anyone not logged in. So a prospective student who Googles "NUTM MTH102 past paper" hits a **login wall** — can't see a single course. Then `auth.ts:signIn` returns `true` for *any* Google account (`auth.ts:19-23`), so the wall keeps out casual/anonymous discovery while letting in literally anyone with a Gmail. Worst of both: kills SEO and top-of-funnel, provides no real access control. Pick one: **ungate browsing** (gate only downloads, if anything) *or* **restrict to the NUTM `hd` domain** — not the current combination.

**[S2] Core controls are hover-only → dead on touch, dead for keyboard.**
- Quick-Peek button appears only on `group-hover` (`CourseCard.tsx:58`). On a phone there is no hover — the feature you built is **undiscoverable** for most of your users.
- The user/sign-out menu is a pure CSS hover dropdown (`Navbar.tsx:80`, `group-hover/user:visible`). No click, no focus, no `aria-expanded`. Keyboard users can't reach sign-out; it also can't be opened by tap reliably.

**[S2] No page content without JS, and no caching.** Combined with `cache:"no-store"`, every navigation refetches and re-skeletons. Perceived performance is poor and there's no offline/first-paint story.

**[S3] Mobile filters are a horizontal-scroll strip.** On small screens the filter selects become an `overflow-x-auto` row (`page.tsx:372`). Native `<select>`s in a sideways scroll strip is an awkward, easy-to-miss pattern. Collapse them into a single "Filters" sheet/disclosure on mobile.

**[S3] No active-route state in the nav.** `Navbar.tsx:42-59` — Browse/About/Team all render identically regardless of location. Users can't tell where they are.

**[S3] Duplicate "Quick Links" on the course page.** The sidebar renders up to three near-identical Moodle buttons (`courses/[slug]/page.tsx:416-442`), but the metadata usually has `moodleCourseUrl === moodleForumUrl === moodleAssignmentsUrl` (see any `metadata.json`). Three buttons, one destination = confusing. Dedupe, or label them only when the URLs actually differ.

**[S3] ⌘K overpromises.** The hint pill (`page.tsx:316`) implies a command palette; pressing it just focuses the search box (`page.tsx:167`). Either build the palette or drop the pill.

**[S4] "Need Help?" card links to About** (`page.tsx:403-418`) — a decorated dead-end that adds nothing.

---

## 3. Accessibility

**[S2] Contrast fails across the board.** Body/label text is routinely `text-foreground/40`, `/30`, even `/20` on a 12%-lightness background (`globals.css:5`). Examples: stat labels `/20` (`page.tsx:332`), footer copyright `/20` (`Footer.tsx:101`), card description `/40` (`CourseCard.tsx:90`), search placeholder `/20` (`page.tsx:303`). Off-white at 20–40% opacity on near-black is well under the WCAG AA 4.5:1 floor. Much of your actual information is sub-legible.

**[S2] Focus states removed.** `focus:outline-none` on the search input (`page.tsx:303`) and every `<select>` (`page.tsx:127`). The search gets a ring back; the selects only shift border color (~fails visibility). Keyboard navigation is nearly invisible.

**[S3] Icon-only buttons lack labels.** Hamburger has none (`Navbar.tsx:98`), Quick-Peek uses `title` but no `aria-label` (`CourseCard.tsx:59`). Screen readers announce nothing useful.

**[S3] Uninformative, duplicated alt text.** Every logo is `alt="Nexus"` (nav, footer, hero, login). The hero logo is decorative — should be `alt=""`; the wordmark instances should say "NUTM Nexus home."

**[S4] Tap targets under 44px.** The ⌘K pill, filter-clear chips (`px-3 py-1.5 text-xs`), and hover reveal buttons are below the 44×44 recommendation — compounded by being hover-gated.

---

## 4. UI flaws

**[S2] No type scale.** You jump from `text-[9px]` labels (`page.tsx:317`) to a `text-[7rem]`/112px hero (`page.tsx:287`) with no coherent steps between. 9px is below any legibility floor. Pick a modular scale (e.g. 12 / 14 / 16 / 20 / 30 / 48) and delete the 9–10px all-caps tier.

**[S3] Two greens, unused palette.** The system defines `--accent` (teal) and `--accent-secondary` (gold) (`globals.css:12-13`) — gold is essentially never used, teal barely (credits icon). Meanwhile the logo glow hardcodes `rgba(34,197,94,...)` (`page.tsx:282`) — Tailwind's green-500, a *different* green from your 158°-hue primary. So the palette is both under-used and internally inconsistent.

**[S3] Radius chaos.** `rounded-lg`, `-xl`, `-2xl`, `-3xl`, plus one-off `rounded-[2rem]` / `[2.5rem]` on login (`login/page.tsx:28`). No radius scale. Pick two (e.g. 8px controls, 16px cards) and enforce.

**[S3] One-off hardcoded values.** `bg-[#1B222B]` on the filter selects (`page.tsx:127`) instead of a surface token; `group-hover:scale-120` (`page.tsx:404`) isn't a default Tailwind step and likely no-ops. Small, but it's the kind of drift that says "no system."

**[S3] Decoration competes with content.** Grid bg + orbs + shimmer + card glow + multiple `backdrop-blur-2xl` layers all run at once. Each is fine alone; stacked, they're visual noise that dilutes the catalog — the actual product.

---

## 5. OpenGraph / social sharing

**Current state: effectively nothing.** `layout.tsx:13-16` sets only `title` and `description`. No `metadataBase`, no `openGraph`, no `twitter`, no canonical, no per-page OG. Pasting a Nexus link into WhatsApp / X / Slack / iMessage yields a bare, image-less unfurl — which for a student-shared resource hub is a real, daily-visible quality tax.

**Add to `layout.tsx` metadata:**

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://<your-domain>"),   // required for absolute OG URLs
  title: {
    default: "NUTM Nexus — course materials, past papers & quizzes",
    template: "%s · NUTM Nexus",
  },
  description: "Notes, past exams, assignments and quizzes for NUTM courses — organised by department, level and cohort.",
  openGraph: {
    type: "website",
    siteName: "NUTM Nexus",
    url: "https://<your-domain>",
    title: "NUTM Nexus",
    description: "Every NUTM course's notes, past papers and quizzes in one place.",
    locale: "en_NG",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NUTM Nexus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUTM Nexus",
    description: "Every NUTM course's notes, past papers and quizzes in one place.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.ico" },
};
```

**Per-course OG (high value, medium effort):** give each course page a dynamic card via a Next `opengraph-image.tsx` route using `ImageResponse` — renders the course **code + title + department** at 1200×630 on the brand background. Free, no design tool, and a shared `/courses/mth102` link then unfurls as that specific course. (Requires the course page/metadata to be reachable server-side — see the SSR action item.)

**What the OG image should actually be — 1200×630 (the size both OG and `summary_large_image` crop cleanly):**
- Dark slate background `#1B1F24` (matches the app; not white).
- **Left-aligned**, not centered: Nexus logo + "NUTM Nexus" wordmark top-left; a large headline mid-left — "Course materials, past papers & quizzes" — at **≥48px** so it survives thumbnail scaling.
- A single green accent element (a rule or the logo mark) — one accent, not the full glow stack.
- Bottom strip: "Peer-2-Peer Tutorial · nutm.edu.ng".
- Keep it to ~6 words of display copy. OG images are read at postage-stamp size in a feed; anything smaller than ~40px or longer than a phrase is wasted.

---

## Prioritized action list (impact ÷ effort, work top-down)

Ship these in order. The first four are hours, not days, and each visibly raises quality.

1. **[S1 · ~1h] Add OG/Twitter tags + a static `/og.png`.** Biggest perceived-quality-per-minute win; every shared link improves instantly. Copy the block above.
2. **[S1 · minutes] Fix the auth model.** Either ungate browsing (edit `auth.ts:authorized` / narrow the `proxy.ts` matcher so course pages are public) **or** restrict `signIn` to the NUTM `hd` domain. Right now it does the harm of a wall with none of the protection. Recommend: public browse, no wall.
3. **[S3 · minutes] Delete decoration.** Remove the two hero orbs (`page.tsx:259-260`), the shimmer scanline (`page.tsx:263`), and the login orb. Keep at most one subtle background element. Instant de-slop.
4. **[S3 · minutes] Rewrite the hero.** Replace the one-word "Nexus." with a real headline ("Every NUTM course, in one place") and kill the animated counters + the "Showing" stat. Copy + deletion.
5. **[S2 · ~1h] Tame the weights.** Global-replace most `font-black` → `font-semibold`; reserve 900 for the wordmark only. Add a 400/500 body tier. Re-introduces hierarchy.
6. **[S2 · ~1h] Contrast pass.** Bump text tokens: `/20`→`/55`, `/30`→`/60`, `/40`→`/70` (min). Verify the smallest labels hit 4.5:1.
7. **[S2 · ~1–2h] Make hover controls tap/keyboard accessible.** User menu → click toggle with `aria-expanded` + focus management; Quick-Peek → always visible (or a persistent card action) on touch.
8. **[S2 · minutes] Restore `focus-visible` outlines** on inputs, selects, links, buttons.
9. **[S1→S2 · half day] Server-render the catalog.** Move the course fetch to a Server Component (or `generateStaticParams` + ISR) so HTML ships with content. Fixes first paint *and* SEO *and* unlocks per-course OG.
10. **[S3 · ~1h] Consolidate the design tokens.** One green, two radii, kill `bg-[#1B222B]` and `scale-120`, define a 6-step type scale, drop the 9px tier.
11. **[S3 · minutes] Dedupe the course "Quick Links"** — render a Moodle button only when its URL is distinct.
12. **[S4 · minutes] a11y cleanup.** `aria-label` on hamburger + Quick-Peek; hero logo `alt=""`; add an active-route style in the nav.
13. **[S3 · medium] Per-course dynamic OG** via `opengraph-image.tsx` (after #9).
