# PR #115 Review — AdSense content-depth prep: 6 new guides + medical disclaimers

**Date:** 2026-09-15
**Author:** alanwaddington
**Branch:** `content/adsense-approval-prep` → `main`
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ (all findings fixed) |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 8 Met / 8 Total (derived — no linked issue existed; retrospectively opened as #117) |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

Originally one Major, three Minor, and two Suggestion findings. **All six fixed** — see the Action Items section for what changed and how each was re-verified. The Major finding (~40KB of guide prose leaking into the every-page client bundle via `seo.ts`) was confirmed fixed by rebuilding and inspecting the actual output, and by capturing live network traffic against a production preview server: `/pace` now fetches zero bytes of guide content.

---

## Issues Reviewed

### Issue Hierarchy

**None.** This PR references no issue in its title, body, branch name, or either commit message — verified by grepping all four for `#NNN` patterns (zero matches).

This is a deviation from the repo's documented workflow (CLAUDE.md: `/analyse` → `/design` → `/develop` → `/verify` → `/pr-reviewer` → `/merge`) and from every other non-dependabot PR in the repo, all of which cite an issue:

| PR | Cites issue |
|----|-------------|
| #115 (this) | **none** |
| #113 | #101 |
| #111 | #110 |
| #109, #104, #102 | #100 |

The work originated from an ad-hoc research conversation about AdSense rejections rather than an `/analyse` cycle, and the user explicitly asked for "a new branch so we can track" rather than an issue. That makes it defensible, but it means **there are no formally-agreed acceptance criteria to audit against** — see the Acceptance Criteria section for how this was handled. Logged as **m1**.

**Related issue (correctly NOT closed by this PR):** #116 — "Add Google Analytics 4 (GA4) integration" (OPEN). Created as a follow-up from this PR's point-4 audit and explicitly deferred in the PR body. Confirmed still open; this PR must not close it.

---

## Changed Files Audit

### `src/lib/content/guides.ts` (+228 / -0)

| Property | Detail |
|----------|--------|
| Purpose | Adds 6 `GuideContent` objects to the `GUIDES` array, taking it from 4 to 10 articles |
| Issues | None linked |
| Criteria covered | AC1, AC2, AC3, AC4 (derived) |
| Quality | ⚠️ See **M1** — this file is imported by `seo.ts`, so its full contents ship to every page. Now 67.4 KB / 396 lines in a single file; see **S1** on splitting. Content itself follows the existing structure exactly (slug, route, title, excerpt, sourcesCredited, intro, sections[]). |
| Test coverage | `guides.test.ts` — 7 data-driven tests covering count, unique slugs, route/slug match, word-count floor, required fields, credited sources. Two assertion-design gaps: **m2**, **m3**. |

### `src/lib/content/guides.test.ts` (+2 / -2)

| Property | Detail |
|----------|--------|
| Purpose | Updates the hardcoded guide-count assertion from 4 to 10 (and renames the test accordingly) |
| Issues | None linked |
| Criteria covered | AC1 |
| Quality | ✅ No issues. Renaming `containsExactlyFourGuides` → `containsExactlyTenGuides` keeps the test name honest rather than leaving a stale name over a changed number. |
| Test coverage | N/A (is the test file) |

### `src/lib/components/MedicalDisclaimer.svelte` (+20 / -0)

| Property | Detail |
|----------|--------|
| Purpose | New presentational component rendering the "Not medical advice" notice with an icon and a link to `/about` |
| Issues | None linked |
| Criteria covered | AC5, AC6, AC7 |
| Quality | ✅ No issues. Reuses the existing `IconWarning` component rather than inlining another SVG. Uses the project's semantic colour tokens (`text-ink`, `text-muted`, `text-subtle`, `text-accent-text`) with explicit `dark:` variants, so it themes correctly. Focus-visible ring on the link matches the site-wide pattern. No props — appropriate for fixed legal copy. |
| Test coverage | `MedicalDisclaimer.test.ts` — 3 tests (heading text, link target, doctor advice) |

### `src/lib/components/MedicalDisclaimer.test.ts` (+27 / -0)

| Property | Detail |
|----------|--------|
| Purpose | Unit tests for the new component |
| Issues | None linked |
| Criteria covered | AC5, AC7 |
| Quality | ✅ No issues. The third test normalises whitespace (`replace(/\s+/g, ' ')`) before matching — a deliberate fix for text split across inline elements by source-line wrapping, which is the correct approach rather than loosening the assertion. |
| Test coverage | N/A (is the test file) |

### `src/routes/hr-zones/+page.svelte`, `src/routes/vo2max/+page.svelte`, `src/routes/workouts/+page.svelte` (+3 each / -0)

| Property | Detail |
|----------|--------|
| Purpose | Import and render `<MedicalDisclaimer />` as the first child inside `<ToolLayout>` |
| Issues | None linked |
| Criteria covered | AC5, AC6 |
| Quality | ✅ No issues. All three diffs are identical in shape (one import line, one component line, one blank line) and place the disclaimer above the fold inside the tool card. Verified live that it renders before the inputs on all three. |
| Test coverage | One test added per page file (see below) |

### `src/routes/hr-zones/hr-zones.test.ts`, `src/routes/vo2max/vo2max.test.ts`, `src/routes/workouts/workouts.test.ts` (+5 each / -0)

| Property | Detail |
|----------|--------|
| Purpose | Assert the disclaimer renders on each page |
| Issues | None linked |
| Criteria covered | AC5 |
| Quality | ✅ No issues. Each is a single focused assertion placed next to the existing "renders the heading" smoke tests, matching each file's local conventions. |
| Test coverage | N/A (are the test files) |

### `src/routes/guides/{6 new slugs}/+page.svelte` (+13 each / -0)

| Property | Detail |
|----------|--------|
| Purpose | Route boilerplate: look up the guide by slug, render `<SeoHead>` + `<GuideArticle>` |
| Issues | None linked |
| Criteria covered | AC2, AC8 |
| Quality | ✅ No issues. Verified all 6 are **byte-identical modulo the slug** (md5 of each file with the slug substituted out: identical across all six), matching the 4 pre-existing guide routes exactly. Uses the same `GUIDES.find(...)!` non-null assertion as existing routes — see **S2**. |
| Test coverage | `guides-routes.test.ts` iterates `GUIDES` and dynamically imports `./${slug}/+page.svelte`, so all 6 are covered automatically with no test changes needed |

### `scripts/generate-og-images.js` (+36 / -0)

| Property | Detail |
|----------|--------|
| Purpose | Adds 6 `OG_IMAGES` entries (file, tool, eyebrow, tagline) so the generator produces an OG card per new guide |
| Issues | None linked |
| Criteria covered | AC8 |
| Quality | ✅ No issues. This list is manually maintained and duplicates slugs already in `guides.ts`, but a forgotten entry is caught automatically by `og-assets.test.ts` (which asserts a file exists for every `PAGES` entry, and `PAGES` auto-derives from `GUIDES`) — a genuinely well-designed safety net. |
| Test coverage | `og-assets.test.ts` — existence + size budget per image |

### `static/og/og-guide-*.png` × 6 (binary, ~385 KB each)

| Property | Detail |
|----------|--------|
| Purpose | Generated 1200×630 OG cards for the 6 new guides |
| Issues | None linked |
| Criteria covered | AC8 |
| Quality | ✅ No issues. All six are 382–389 KB, inside the 420 KB budget `og-assets.test.ts` enforces and squarely in the expected 385–393 KB post-oxipng band. Adds ~2.3 MB of binaries to the repo, but that is the established pattern for every existing OG image. The commit message documents that 8 unrelated existing images were restored after regeneration to avoid non-deterministic-rendering diffs — a correct and deliberate call, matching the same convention CLAUDE.md prescribes for regenerated doc PDFs. |
| Test coverage | `og-assets.test.ts` |

---

## Acceptance Criteria Verification

**No linked issue exists**, so there is no formally-agreed criteria list. The criteria below are **derived from the PR's own explicit claims**, which are specific and independently checkable. Each was verified against code and against a live running app — ticked claims in the PR body were not trusted.

### Derived from PR #115's stated claims

| # | Criterion (from PR body/commits) | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC1 | `/guides` goes from 4 to 10 articles | `guides.ts` — `GUIDES` array now 10 entries | `guides.test.ts:12` (`containsExactlyTenGuides`); verified live: index renders exactly 10 links | ✅ Met |
| AC2 | The 4 tools with no dedicated guide each get one (Pace, Parkrun, Power Zones, Workouts) | `understanding-running-pace`, `parkrun-age-grading-explained`, `running-power-zones-explained`, `how-runwise-builds-workouts` | `guides-routes.test.ts` (auto-iterates); verified live: all 4 deep-link HTTP 200 with correct `<h1>` | ✅ Met |
| AC3 | Plus 2 cross-cutting pillar articles | `interval-training-explained`, `choosing-your-training-metric` | Same | ✅ Met |
| AC4 | Each new guide is 900+ words | All 6 range 918–1027 words | `guides.test.ts:27` enforces the 900 floor | ✅ Met — margins +18 to +127; for context the tightest margin in the file is a *pre-existing* guide (`reading-your-vo2max`, +2) |
| AC5 | Disclaimer added to HR Zones, VO2 Max, Workouts | `MedicalDisclaimer.svelte` rendered in all three `+page.svelte` | One test per page file + `MedicalDisclaimer.test.ts`; verified live on all 3 | ✅ Met |
| AC6 | Disclaimer **not** added to the 5 pure conversion/comparison tools | Absent from Pace, Race Predictor, Training Paces, Parkrun, Power Zones | Verified live: DOM count 0 on all 5 | ✅ Met — confirmed at DOM level, not just by absence from the diff |
| AC7 | Disclaimer links to `/about` for sourcing and advises consulting a doctor | `MedicalDisclaimer.svelte:12-18` | `MedicalDisclaimer.test.ts:15,21`; verified live: `href="/about"` | ✅ Met |
| AC8 | Route folders, SEO metadata, and sitemap entries auto-derive from the `GUIDES` array | `seo.ts:125-137` derives `PAGES`; sitemap built from `PAGES` | `seo.test.ts`, `og-assets.test.ts`, `sitemap.test.ts`; verified live: all 6 new URLs in `/sitemap.xml`, correct `og:image` + `<title>` on a new guide | ✅ Met |

**Summary:** 8/8 derived criteria met.

**Claims in the PR body that this review could NOT substantiate as stated:** the PR says each new guide has "a worked example." Attempting to verify this objectively, 3 of the 4 **pre-existing** guides also contain no numeric worked example by the same measure — so "worked example" is not actually an established convention of the guides (it *is* one of the per-tool explainers, which have literal "Worked example" headings). The new guides are consistent with the existing guides' style. This is imprecise wording in the PR description, not a content defect, and no finding is raised.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

#### M1 — 40 KB of guide prose is added to the client bundle loaded on *every* page

- **Category:** Performance
- **Location:** `src/lib/seo.ts:125-137` (imports `GUIDES`), consumed via `src/lib/components/SeoHead.svelte` (on every page); payload originates in `src/lib/content/guides.ts`
- **Description:** `seo.ts` imports the entire guides module to auto-derive `PAGES`, but only uses `slug`, `route`, `title`, and `excerpt`. Because `SeoHead` is rendered on every page, the full article bodies ship site-wide. Confirmed by building and inspecting the output, not by reading code:

  ```
  $ grep -rl "phosphocreatine" .svelte-kit/output/client/    # a word only in one guide's BODY
  .svelte-kit/output/client/_app/immutable/chunks/CYn_p-Hp.js   (72 KB)

  $ grep -l CYn_p-Hp .svelte-kit/output/client/_app/immutable/entry/*.js
  .svelte-kit/output/client/_app/immutable/entry/app.BrGahYMj.js   ← the app entry
  ```

  Measured cost:

  | | |
  |---|---|
  | Bytes `seo.ts` actually needs (slug/route/title/excerpt) | 3.5 KB |
  | Bytes dragged along unused (intro/sections/sources) | 59.7 KB |
  | Share of the module unused outside guide pages | **94%** |
  | Chunk as shipped | 72 KB raw / **24.7 KB gzipped** |
  | `guides.ts` source: `main` → this PR | 26.9 KB → 67.4 KB (**+40.5 KB**) |

  The mechanism is **pre-existing** (main already shipped 26.9 KB this way), so this PR did not introduce the flaw — but it 2.5x'd the payload, and the AdSense plan that motivated this PR calls for reaching 10–20 articles, which would push it past ~135 KB raw on every page. Worth noting that page speed is itself one of the factors the underlying AdSense research flagged, so this mildly works against the PR's own objective.
- **Recommendation:** Split the SEO-facing index from the article bodies — e.g. keep a light `GUIDE_INDEX` (slug/route/title/excerpt) that `seo.ts` imports, and have each guide route import its own body module. That keeps the auto-derivation convention (which is genuinely good) while dropping ~94% of the every-page payload, and it stops the cost growing with each new article.

### Minor (nice to fix)

#### m1 — No linked issue and therefore no agreed acceptance criteria

- **Category:** Code Quality (process)
- **Location:** PR #115 metadata
- **Description:** Title, body, branch name, and both commit messages contain zero `#NNN` references. Every other non-dependabot PR in this repo cites an issue (#113→#101, #111→#110, #109/#104/#102→#100), and CLAUDE.md documents an issue-driven workflow. The consequence is concrete: this review had to derive criteria from the PR's own description, which means the PR is effectively grading its own homework — there is no independently-agreed definition of done, and the "worked example" claim above is exactly the kind of thing an `/analyse` cycle would have pinned down precisely.
- **Recommendation:** Retrospectively open an issue capturing the AdSense-approval plan (the 4 research points) and reference it from this PR, so the remaining points (the ~6-month wait, reapplying) stay tracked after this branch merges. Low effort, and it keeps the next AdSense attempt from losing its paper trail.

#### m2 — `atLeastOneGuide_explicitlyNamesItsSourceMethodologyInBody` is effectively vacuous

- **Category:** Test Coverage
- **Location:** `src/lib/content/guides.test.ts:47-54`
- **Description:** The assertion uses `GUIDES.some(...)`, so it passes as long as *one* guide in the whole array names a methodology from a hardcoded list (`Riegel`, `Daniels' VDOT`, `VDOT`, `ACSM`, `WMA`). The 4 pre-existing guides already satisfy it permanently, so it provides **zero** coverage for the 6 added here and can never fail again regardless of what future guides contain. Measured against the current data, 6 of 10 guides name none of the tracked terms in their body prose — including 3 that name no source at all in prose (`understanding-running-pace`, `interval-training-explained`, `choosing-your-training-metric`), though all 10 do carry `sourcesCredited` metadata that renders as a visible "Sourced from:" badge. The list also wasn't extended for the sources this PR introduces (Stryd, Critical Power, MAP, Friel), so guides that *do* cite sources in prose still read as misses.
- **Recommendation:** Either change `.some()` to a per-guide `for` loop (making it a real per-article standard) and extend `METHODOLOGY_NAMES` to cover the newer sources, or delete the test as decorative. As written it costs a test run and asserts nothing.

#### m3 — Word-count test reports only the first failing guide per run

- **Category:** Test Coverage
- **Location:** `src/lib/content/guides.test.ts:27-31`
- **Description:** `everyGuide_meetsTheMinimumWordCount` loops with `expect()` inside, so the first failure throws and the remaining guides are never checked. With 4 guides this was a mild annoyance; at 10 (and heading for 20) it means finding N short articles takes N full test runs, and this suite takes ~70s. This is a pre-existing pattern, but the PR's own content roadmap is what makes it bite.
- **Recommendation:** Collect failures and assert once — e.g. build an array of `{slug, wordCount}` below the floor and assert it's empty, so a single run names every offending guide. Same applies to the other looped assertions in this file.

### Suggestions (optional)

#### S1 — `guides.ts` is now a 67 KB single file and will keep growing

- **Category:** Code Quality (maintainability)
- **Location:** `src/lib/content/guides.ts` (396 lines, 67.4 KB)
- **Description:** All article prose lives in one TypeScript module. At the 10–20 articles the AdSense plan targets, this becomes a ~135 KB file where every edit touches the same blob — awkward to diff, review, and navigate. Splitting it is also the natural vehicle for fixing **M1**.
- **Recommendation:** One module per guide (`content/guides/<slug>.ts`) re-exported from an index, or move bodies to markdown. Worth doing alongside M1 rather than separately.

#### S2 — Non-null assertion in the 6 new route files

- **Category:** Reliability
- **Location:** e.g. `src/routes/guides/choosing-your-training-metric/+page.svelte:6` — `GUIDES.find((g) => g.slug === '...')!`
- **Description:** If a slug were renamed in `guides.ts` without renaming the folder, `guide` would be `undefined` and `GuideArticle` would throw at render. `guides-routes.test.ts` catches the opposite direction (array entry with no folder) but not this one. Pre-existing convention across all 10 routes, and low-likelihood, so noting rather than pressing.
- **Recommendation:** If the split in S1 happens, having each route import its own guide module directly removes the lookup (and the assertion) entirely.

---

## Positive Observations

- **The auto-derivation chain genuinely works end-to-end.** Adding an entry to `GUIDES` automatically produces the SEO metadata, sitemap entry, OG image path, and `<title>` — verified live, not just assumed: all 6 new URLs appear in `/sitemap.xml`, and a new guide's `og:image` correctly resolves to its generated PNG. Content-only additions needed no plumbing changes, which is exactly what that design is for.
- **The OG safety net is well designed.** The manually-maintained `OG_IMAGES` list in the generator script could easily drift from `GUIDES`, but `og-assets.test.ts` asserts a file exists for every `PAGES` entry — so a forgotten entry fails the suite rather than shipping a broken social card.
- **No `{@html}` anywhere in the content-rendering path.** `GuideArticle` interpolates `{guide.title}`, `{guide.intro}`, and `{section.body}` as escaped text. Content-heavy PRs are a common place for `{@html}` to creep in for "just a bit of formatting"; this one didn't.
- **The disclaimer's scoping decision was actually implemented, not just asserted.** Present on exactly the 3 health-adjacent tools and absent from all 5 others, confirmed at DOM level on a running app. Easy thing to half-wire; it wasn't.
- **Theming was handled properly.** The disclaimer uses semantic tokens with explicit `dark:` variants and renders with correct contrast in dark mode — verified with an actual dark-scheme browser context, not by reading class names.
- **Honest commit messages.** The guides commit documents the OG-image restoration decision and its reasoning rather than silently including or excluding the churn, which is what made that call reviewable at all.

---

## Action Items

### Immediate Fixes (block merge)

None. M1 is a real regression but is pre-existing in mechanism and modest in absolute terms (~24.7 KB gzipped); it is reasonable to merge and address it as the content set grows — provided it is actually tracked.

### Post-merge improvements

- [x] M1: Split the SEO-facing guide index from article bodies — added `src/lib/content/guide-index.ts` (a hand-generated, dependency-free `GUIDE_INDEX` of slug/route/title/excerpt) and pointed `seo.ts` at it instead of the full `GUIDES`. Re-verified by rebuilding and inspecting the client output: a guide-body-only word (`phosphocreatine`) no longer appears in the app entry chunk, only in the guide's own lazily-loaded route chunk (`nodes/9.*.js`) — confirmed both statically (grep on `.svelte-kit/output`) and live (Playwright network capture against `vite preview`: 0 guide-content bytes fetched for `/pace`, the chunk fetched only when visiting the guide itself).
- [x] m1: Opened retrospective issue #117 ("AdSense approval prep: content depth, disclaimers, verification audit") capturing all 4 original research points and their status, and linked it from PR #115's body (`Relates to #117`).
- [x] m2: Converted `atLeastOneGuide_...` to `everyGuide_explicitlyNamesItsSourceMethodologyInBody` (per-guide, not `.some()`), extended `METHODOLOGY_NAMES` with the newer sources (Friel, Stryd, Garmin, Polar, Critical Power, MAP, Tanaka, Alan Jones, bare `Daniels`), and added one natural in-prose source mention to the 3 guides that only cited a source via the `sourcesCredited` badge (`understanding-running-pace`, `interval-training-explained`, `choosing-your-training-metric`). All 10 guides still clear the 900-word floor after the edits (lowest margin: 918 words, `how-runwise-builds-workouts`, +18).
- [x] m3: Rewrote every looped assertion in `guides.test.ts` (route-matches-slug, word count, title/excerpt/section-count, credited-source count, methodology citation) to collect all failing slugs and assert once, so a single run now names every offending guide instead of stopping at the first.
- [x] S1: Split `guides.ts` into `src/lib/content/guides/<slug>.ts` (one file per guide, ~13-45 lines each) re-exported from `guides/index.ts`; the old 396-line/67.4 KB single file no longer exists.
- [x] S2: Removed the `GUIDES.find(...)!` non-null assertion from all 10 route `+page.svelte` files — each now imports its own guide module directly (`import { guide } from '$lib/content/guides/<slug>'`), so a missing/renamed guide is a compile-time error, not a runtime throw.

New test added to guard the fix: `src/lib/content/guide-index.test.ts` asserts `GUIDE_INDEX` and `GUIDES` stay in sync (same slugs in the same order; matching route/title/excerpt per slug) — since the split intentionally duplicates those 4 fields between the light index and the full content, this is what catches one being edited without the other.

Full suite re-run after all fixes: 1439/1439 passing (74 files, up from 1435/73). `npm run lint`: 0 errors. `npx svelte-check`: 0 errors, 0 warnings.

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code — note: no issue hierarchy exists; criteria derived from the PR's own claims and verified independently
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions — **M1** fixed, re-verified against a production build (see Action Items)
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue

---

## Review Method Notes

- **Lint:** `npm run lint` (eslint) — exit 0, no output, 0 errors / 0 warnings.
- **Test suite:** not re-run as part of this review (the review process specifies lint only, and this environment has known flakiness when vitest runs concurrently with a build). Test *content* was verified by reading each test file and matching assertions to criteria; the PR reports 1435/1435 passing across 73 files.
- **Build:** `npm run build` was run specifically to substantiate M1 by inspecting the actual client chunks — this is the only way that finding is provable rather than speculative.
- **Browser verification:** carried out under `/verify 115` immediately prior to this review (dev server + Playwright Chromium, light and dark schemes): 10 guides listed, all 6 new guides deep-linking at HTTP 200, hydrated click-through and back-navigation, disclaimer present on 3 pages and absent on 5, sitemap and OG meta confirmed, zero console errors.
