# NUTM Nexus — Restructure Plan

**Status:** proposal for review. No code or content changes yet.
**Chosen direction:** split course content into its own GitHub repo (keep the all-free stack: Vercel + GitHub + Google login).

---

## 1. What this fixes (and what it deliberately doesn't)

Today, three things are tangled together. A separate content repo untangles the first two:

| Pain today | Fixed by separate repo? |
|---|---|
| Content edits = commits to the **app** repo (scary, couples syllabus changes to code deploys) | ✅ Yes — content lives in its own repo |
| "Nothing is live until push" **and** a 5-min cache lag stacked on top | ⚠️ Only if we add a deploy/revalidate hook (Phase 3) |
| No structured data layer → no student progress, no per-student cohort default, no upload dashboard | ❌ No — that still needs a database (Supabase later, §7) |

So this plan makes content **manageable and decoupled**. It does **not** add student progress or a fancy upload UI — those are a later, separate step layered on top.

---

## 2. Target architecture

Two repos, same free services:

```
ayodejiades/nutm-nexus            ← APP (code only). Deployed on Vercel.
ayodejiades/nutm-nexus-content    ← CONTENT only. No code.
        courses/
          mth102/
            metadata.json
            notes/2024-2025/week03.pdf
            exams/2023-2024/final.pdf
          ...
```

- The app reads the content repo through the **same GitHub API code we already have** — we only change which repo it points at (`GITHUB_REPO_OWNER` / `GITHUB_REPO_NAME` env vars).
- Faculty/contributors edit the **content** repo (via GitHub's web UI or PRs), never the app.
- Auth, hosting, the cohort/category folder convention, and playlists all stay exactly as they are.

---

## 3. Content repo layout

Lift the current `courses/` folder over as-is. The folder convention we already built stays the contract:

```
courses/<code>/
  metadata.json                     # title, code, instructor, credits, playlist id, moodle urls, quizzes
  <category>/<cohort>/<file>        # category = notes|assignments|tests|exams ; cohort = 2024-2025
  <category>/<file>                 # cohort optional (shared resources)
  <file>                            # bare files default to the "notes" tab
```

Add a top-level `README.md` in the content repo documenting this convention so contributors don't have to reverse-engineer it.

---

## 4. How the app reads content — pick one

**Option 1 — Repoint only (smallest change).**
Keep the current runtime API + `revalidate = 300`. Just change the two env vars to the content repo. Content edits go live within ~5 min of a push.
- Effort: ~20 minutes. Risk: none.
- Downside: the 5-min staleness remains; per-request GitHub API calls remain (fine at current scale — well under GitHub's 5,000/hr authenticated limit, since the route caches for 5 min).

**Option 2 — Repoint + instant updates (recommended).**
Do Option 1, then add a content→app trigger so pushes publish immediately instead of waiting on the cache:
- Add a GitHub Action in the **content** repo that, on push to `main`, calls a **Vercel Deploy Hook** (or a small `/api/revalidate` route in the app guarded by a shared secret).
- Result: edit content → push (or merge PR) → site updates in seconds, no 5-min wait, no manual app deploy.
- Effort: ~1–2 hours. Risk: low (it's additive).

---

## 5. Migration steps (ordered, each independently safe)

**Phase 0 — Prep (no moves yet)**
- Decide the content repo name (`nutm-nexus-content`?) and visibility. *Private* works (our API uses a token); *public* makes `download_url`s simpler and never expire. Recommend **public** unless papers are sensitive.
- Confirm the `GITHUB_TOKEN` in use can read the new repo.

**Phase 1 — Create the content repo & move `courses/`**
- Create the repo. Move `courses/` into it (optionally with `git filter-repo` to preserve history; or a clean copy — history isn't critical for content).
- Commit the current local restructure (the mth102 `notes/2024-2025/` move) **into the content repo**, not the app repo.
- Add the convention `README.md`.

**Phase 2 — Point the app at the content repo**
- Update `GITHUB_REPO_OWNER` / `GITHUB_REPO_NAME` in `.env.local` and in Vercel's env settings.
- No code change needed — `src/app/api/courses/route.ts` and `src/app/api/courses/[slug]/route.ts` already read these vars.
- Verify locally: `curl localhost:3000/api/courses/mth102` should now return the cohort-tagged files.

**Phase 3 — Instant updates (if Option 2 chosen)**
- Create a Vercel Deploy Hook (or `/api/revalidate`).
- Add the GitHub Action in the content repo to call it on push.

**Phase 4 — Contributor workflow**
- Document "how to add an exam": GitHub web UI → navigate to `courses/<code>/exams/<cohort>/` → **Add file → Upload files** → commit (or open a PR). No local setup, no code knowledge.

**Phase 5 — Clean up the app repo**
- Remove `courses/` from the app repo.
- Drop the now-irrelevant local PDFs and any content-specific `.gitignore` lines.
- The app repo becomes pure code.

---

## 6. Code touch points (small)

- `.env.local` + Vercel env — the only required change for Phase 2.
- `src/app/api/courses/route.ts`, `src/app/api/courses/[slug]/route.ts` — unchanged unless we lower `revalidate` or add on-demand revalidation.
- New (Option 2 only): `/api/revalidate/route.ts` + a workflow file in the content repo.

---

## 7. When to add Supabase (the upgrade path, not now)

A separate repo is a clean stopping point. Add Supabase later **only when** you want one of:
- per-student **progress** ("mark complete", resume where you left off),
- a student's **cohort remembered** so their view defaults to it,
- a **web upload dashboard** for faculty instead of GitHub.

At that point: keep files in the content repo (or move to Supabase Storage), and add Postgres tables for `students` + `progress`. It layers on top — this plan doesn't paint us into a corner.

---

## 8. Two things worth doing regardless

- **Restrict login to NUTM.** Right now `auth.ts` returns `true` for any Google account — anyone can sign in. If Nexus is NUTM-only, gate on the Google `hd` (hosted-domain) claim or an email allowlist. (1-line change, independent of this plan.)
- **Content repo `README`** documenting the folder convention, so the structure is self-explaining instead of living only in our parsing code.

---

## 9. Open decisions for you

1. Content repo **name** and **public vs private**?
2. Read strategy: **Option 1 (repoint only)** or **Option 2 (instant updates)**?
3. Preserve content git **history** during the move, or start clean?
4. Should I also do the **NUTM login restriction** (§8) as part of this?
