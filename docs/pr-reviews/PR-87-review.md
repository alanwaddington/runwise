# PR #87 Review — Add Power Zones calculator (#86)

**Date:** 2026-08-05
**Author:** alanwaddington
**Branch:** `feature/86-power-zones-calculator` → `main`
**State:** Open

---

## Summary

**Update (2026-08-05, same day):** All findings below (M1, M2, M3, S1) have been fixed in commit `32b181d`, per explicit instruction to fix everything rather than defer any of it. See the "Update" line on each finding.

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ (was: Pass with comments ⚠️) |
| Risk Level | Low |
| Test Coverage | Adequate (was: Gaps identified) |
| Acceptance Criteria | 12 Met / 0 Partially Met / 0 Not Met (12 Total) — was 10/2/0 |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

Full test suite: **832/832 passing** (826 + 6 new focus-assertion tests). `svelte-check`: **0 errors, 0 warnings** across 474 files. No functional breakage found. All findings from the initial pass — a content-accuracy error, an SEO-convention miss, a test-coverage gap on a bundled accessibility fix, and a missing affiliate-links entry — have been fixed, not deferred.

---

## Issues Reviewed

This repository's `/analyse` → `/design` workflow embeds the full requirements/architecture hierarchy inside a single GitHub issue rather than using GitHub's native sub-issues (confirmed via GraphQL — issue #86 has no `subIssues` and the `parentIssue` field doesn't exist on this schema). All acceptance criteria live in one issue across two appended sections.

### Issue Hierarchy
- #86 — Add Power Zones calculator (Stryd Critical Power) — [issue](https://github.com/alanwaddington/runwise/issues/86)
  - `## Acceptance Criteria` (original, pre-analysis) — explicitly annotated by the issue's own author as **superseded** by the section below (scope changed: the "generic/other fallback" was dropped for a named Polar option; Garmin's percentages turned out to be unconfirmable rather than confirmable)
  - `## Analysis` → `### Acceptance Criteria` — the authoritative, current checklist (12 items, all checked `[x]` in the issue — verified independently below, not trusted as-is)
  - `## Design` → `### 3. Work Breakdown` — 6 implementation tasks, each with its own (non-checkbox) acceptance criteria, used here as supporting detail for the file-by-file audit

---

## Changed Files Audit

### `src/lib/utils/power-zones.ts` (+207)

| Property | Detail |
|----------|--------|
| Purpose | Core calculation utility: per-device zone tables (Stryd/COROS/Garmin/Polar), `calculatePowerZones()`, device metric/display-name lookup maps |
| Issues | #86 |
| Criteria covered | Analysis AC #1–7, #10; Task 1 (all) |
| Quality | ✅ Clean. `coros: STRYD_ZONE_META` is a genuine same-reference alias (not a duplicate literal), verified by reading the object literal directly. Source-confidence comments present and accurate for all three tables. |
| Test coverage | `power-zones.test.ts` — 28 tests, all zone boundaries, all four devices, boundary/negative/zero inputs, lookup maps |

### `src/lib/utils/power-zones.test.ts` (+182)

| Property | Detail |
|----------|--------|
| Purpose | Unit tests for the above |
| Issues | #86 |
| Criteria covered | Task 1 testing requirement |
| Quality | ✅ Good boundary coverage (49/50/700/701, zero, negative). Naming follows the `MethodName_Scenario_ExpectedResult` convention used elsewhere in the repo (`hr-zones.test.ts`). |
| Test coverage | N/A (is the test file) |

### `src/routes/power-zones/+page.svelte` (+203)

| Property | Detail |
|----------|--------|
| Purpose | The calculator page: device selector, dynamic input label, zone table, Garmin disclaimer, empty state, reset |
| Issues | #86 |
| Criteria covered | Analysis AC #1, #3, #5, #6, #7; Task 2 (all) |
| Quality | ✅ No unsafe HTML (`{@html}`/`innerHTML`) — all output is auto-escaped Svelte interpolation. Input is `type="number"`, range-validated both client-side (`validateRange`) and in the pure calc function (`calculatePowerZones` returns `null` outside 50–700). Keyboard focus-follows-selection fix (added in the final commit) correctly implemented using an index-based `querySelectorAll('[role="tab"]')` lookup, safe against Svelte's DOM diffing since button elements are stable across re-render. |
| Test coverage | `power-zones.test.ts` (route) — 33 tests. See Findings M3: the focus-follows-selection fix itself has no assertion in this file. |

### `src/routes/power-zones/power-zones.test.ts` (+271)

| Property | Detail |
|----------|--------|
| Purpose | Component tests for the page |
| Issues | #86 |
| Criteria covered | Task 2 testing requirement |
| Quality | ✅ Thorough — covers device switching, all four devices' zone tables independently, validation, Garmin disclaimer visibility (both directions), reset, footer link. Follows `hr-zones.test.ts`'s `@testing-library/svelte` conventions exactly. |
| Test coverage | N/A (is the test file). Gap: no test for keyboard-focus-follows-selection (see M3). |

### `src/lib/seo.ts` (+9)

| Property | Detail |
|----------|--------|
| Purpose | Add `/power-zones` entry to the `PAGES` config driving SEO metadata, sitemap, and robots.txt |
| Issues | #86 |
| Criteria covered | Analysis AC #8 (partially — see M1) |
| Quality | ⚠️ Description is 161 characters — one over the 150–160 character convention every other tool route in this file follows (and that `seo.test.ts` enforces for those routes). See Finding M1. |
| Test coverage | `seo.test.ts` exists but doesn't actually check this route (hardcoded route list, not dynamic — see m1). `sitemap.test.ts` does check it correctly (dynamic via `Object.keys(PAGES)`) and passes. |

### `src/lib/components/SiteNav.svelte` (+2/-1), `SiteNav.test.ts` (+2/-1)

| Property | Detail |
|----------|--------|
| Purpose | Add `/power-zones` to the header/mobile nav `tools` array; update the "all six" test assertion to seven |
| Issues | #86 |
| Criteria covered | Analysis AC #8 (nav portion) |
| Quality | ✅ No issues |
| Test coverage | `SiteNav.test.ts` updated and passing |

### `src/lib/components/SiteFooter.svelte` (+2/-1)

| Property | Detail |
|----------|--------|
| Purpose | Add `/power-zones` to the footer `tools` array |
| Issues | #86 |
| Criteria covered | Analysis AC #8 (footer portion) |
| Quality | ✅ No issues |
| Test coverage | `SiteFooter.test.ts` not modified — confirmed by reading it that no existing assertion enumerates the footer tools list, so none was needed (Design's file list assumed one existed; it didn't — harmless design-doc inaccuracy, not a bug) |

### `src/lib/components/ToolIcon.svelte` (+4/-1)

| Property | Detail |
|----------|--------|
| Purpose | Add `'power-zones'` to the `ToolIconName` union and a new lightning-bolt icon path |
| Issues | #86 |
| Criteria covered | Task 2 (icon requirement) |
| Quality | ✅ Matches existing icon style exactly (viewBox 0 0 24 24, stroke-width 1.75, no fill, single path — same complexity tier as `race-predictor`) |
| Test coverage | No dedicated icon test exists for any variant in this file (pre-existing pattern); covered indirectly through the pages that render it |

### `src/routes/+page.svelte` (+7)

| Property | Detail |
|----------|--------|
| Purpose | Add 7th entry to the homepage `tools` array (renders a `ToolCard`) |
| Issues | #86 |
| Criteria covered | Analysis AC #8 (homepage portion) |
| Quality | ✅ No issues |
| Test coverage | No dedicated homepage test suite exists for the tools array in this repo (pre-existing gap, not introduced by this PR) |

### `src/lib/components/HeroSection.svelte` (+1/-1), `EducationalSection.svelte` (+9/-2)

| Property | Detail |
|----------|--------|
| Purpose | "Six" → "Seven" copy bump in both files; `EducationalSection` also gets a 7th "How Runwise Helps" bullet and a drive-by fix of a pre-existing `svelte/require-each-key` lint error unrelated to this PR's scope |
| Issues | #86 |
| Criteria covered | Analysis AC #8 (copy consistency) |
| Quality | ✅ No issues. The lint fix (`{#each concepts as concept (concept.title)}`) is a legitimate, safe drive-by since the file was already being touched — `concept.title` is unique across the fixed 4-item array. |
| Test coverage | `HeroSection.test.ts` not modified — confirmed no existing assertion covers the "Six/Seven free tools" text, so none was needed (same situation as `SiteFooter.test.ts` above). No test file exists for `EducationalSection.svelte`. |

### `src/lib/content/explainers.ts` (+27)

| Property | Detail |
|----------|--------|
| Purpose | Add the `/power-zones` explainer entry (heading, intro, 5 sections) |
| Issues | #86 |
| Criteria covered | Analysis AC #9 (partially — see M2) |
| Quality | ⚠️ **Factual contradiction in the "Worked example" section** — see Finding M2. The other four sections are accurate and well-written; this is isolated to one sentence. |
| Test coverage | No dedicated test file exists for any explainer entry (pre-existing pattern — none of the other five tool pages have one either) |

### `scripts/generate-og-images.js` (+2/-1), `static/og/og-power-zones.png` (new binary)

| Property | Detail |
|----------|--------|
| Purpose | Register and generate the new OG image |
| Issues | #86 |
| Criteria covered | Task 4 (all) |
| Quality | ✅ Verified the other 6 existing OG images are byte-identical (matched hashes recorded before/after regeneration during `/develop`) — no unintended side effects from the regeneration run |
| Test coverage | `og-assets.test.ts` (pre-existing, dynamic via `Object.values(PAGES)`) confirms the file exists and is under the 420KB size budget — file is 394,842 bytes, comfortably under budget |

### `README.md` (+1)

| Property | Detail |
|----------|--------|
| Purpose | Add the tool link, matching the existing per-tool format |
| Issues | #86 |
| Quality | ✅ No issues |

### `docs/Guides/User Guide/user-guide.md` (+24/-1), `.html` (+43/-1), `.pdf` (binary)

| Property | Detail |
|----------|--------|
| Purpose | New `### Power Zones Calculator` subsection; "all six" → "all seven" in Getting Started |
| Issues | #86 |
| Quality | ✅ Correctly states COROS zones are "identical to Stryd's" — this file does NOT repeat the error found in `explainers.ts` (M2), so the contradiction is isolated to one file. `Deployment Guide`/`Developer Guide` PDFs confirmed untouched by the regeneration (diff is empty for both), correctly following `CLAUDE.md`'s instruction to only keep regenerated binaries when their source `.md` changed. |
| Test coverage | N/A — no test suite covers `docs/Guides/` (pre-existing, documented as intentional in the Design) |

### `src/routes/hr-zones/+page.svelte` (+7/-5), `src/routes/parkrun/+page.svelte` (+7/-5)

| Property | Detail |
|----------|--------|
| Purpose | **Out-of-issue-scope fix**, bundled into this PR: keyboard focus now follows tab selection on ArrowLeft/ArrowRight, fixing a bug that pre-dates this PR but was only discovered because `power-zones/+page.svelte` copied the same `handleTabKeydown` pattern during `/verify` |
| Issues | Not part of #86's stated scope — added per explicit user instruction during review ("fix in all places it occurs now rather than create a follow up") |
| Quality | ✅ Correct, minimal fix (3-line diff per file). Verified live via Playwright across all three affected pages (2-tab, 3-tab, 4-tab) including wrap-around in both directions. |
| Test coverage | ❌ **None.** See Finding M3 — verified manually only, not committed as an automated regression test in any of the three affected test files. |

---

## Acceptance Criteria Verification

### #86 — Add Power Zones calculator (`## Analysis` → `### Acceptance Criteria`, the authoritative list)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `/power-zones` route with a 4-way device selector: Stryd, COROS, Garmin, Polar (no generic/other, no Apple) | `power-zones/+page.svelte:16,84-98` | `power-zones.test.ts:26-32` | ✅ Met |
| 2 | Stryd and COROS share the verified 5-zone %CP table (65–80/80–90/90–100/100–115/115–130%) via one data source | `power-zones.ts:25-61,166-174` (`coros: STRYD_ZONE_META`, same reference) | `power-zones.test.ts:44-51` (`toEqual`) | ✅ Met |
| 3 | Garmin's 7-zone table with a visible, prominent disclaimer | `power-zones.ts:70-120`; `+page.svelte:101-107` | `power-zones.test.ts:56-84,109-120` | ✅ Met |
| 4 | Polar's own verified 5-zone %MAP table, labeled "Maximal Aerobic Power (MAP)" | `power-zones.ts:128-164,180` | `power-zones.test.ts:88-123` | ✅ Met |
| 5 | Each device renders its own native zone count/names (not normalized to 5) | `+page.svelte:159-178` (`{#each zones}`, no forced length) | `power-zones.test.ts:163-232` (11 vs 15 rows) | ✅ Met |
| 6 | Stryd/COROS Zone 5 is closed (115–130%), not open-ended | `power-zones.ts:54-60` (`highPct: 1.3`) | `power-zones.test.ts:36-39` | ✅ Met |
| 7 | Shared ~50–700W plausibility range, clear error messaging | `power-zones.ts:190-198`; `+page.svelte:39` (`validateRange`) | `power-zones.test.ts:127-151`; `power-zones.test.ts` (route) validation tests | ✅ Met |
| 8 | Nav (header+footer) and SEO metadata consistent with the other 6 calculators | `SiteNav.svelte`, `SiteFooter.svelte`, `+page.svelte` (homepage), `seo.ts:78-86` | `SiteNav.test.ts:27-43`; `seo.test.ts` now covers this route (`TOOL_ROUTES` derived from `Object.keys(PAGES)`) | ✅ **Met** (fixed — see M1) — description trimmed to 158 chars, `seo.test.ts` route list now dynamic |
| 9 | Explainer covers CP vs. Threshold Power vs. MAP and links each device's zones to their source | `explainers.ts:179-205` | None (pre-existing pattern, no explainer test suite exists) | ✅ **Met** (fixed — see M2) — worked example corrected, no longer contradicts the COROS section |
| 10 | Source/confidence level documented as a code comment in `power-zones.ts` | `power-zones.ts:21-23,63-68,122-126` | N/A (comment, not runtime-testable) | ✅ Met |
| 11 | Tests added and passing, covering zone correctness per device + switching | `power-zones.test.ts` ×2 (61 new tests) | `npm run test` — 826/826 passing at initial review, 832/832 after the M3 fix added 6 more | ✅ Met |
| 12 | No regressions to existing calculators | N/A | Full suite 832/832 passing; lint 0 errors; `svelte-check` 0 errors | ✅ Met |

**Summary:** 12/12 fully met, 0/12 partially met, 0/12 not met.

### #86 — Original pre-analysis checklist (superseded)

Per the issue's own annotation, this list was superseded during `/analyse` (scope changed: no generic/other fallback shipped; Garmin's percentages are unconfirmable, not confirmed). Verifying it independently for completeness rather than trusting the issue's checkbox state: 7 of 8 items are unchecked in the issue and, read literally against what shipped, correctly remain unmet under their original wording (e.g. "Garmin's actual published zone percentages are researched and confirmed" — they were researched but explicitly found to be **unconfirmable**, which is why the superseding list exists). The 1 checked item ("No regressions to existing calculators") is independently verified true above. No action needed — this list is documentation, not a live gate, and the issue already says so.

---

## Findings

### Critical (must fix before merge)

None found.

### Major (should fix)

#### M1 — `/power-zones` SEO description exceeds the site's own length convention, undetected by a stale test
- **Category:** Code Quality / Test Coverage
- **Location:** `src/lib/seo.ts:78-86` (the description itself); `src/lib/seo.test.ts:4-5` (the root cause)
- **Description:** Every other tool route's `description` in `PAGES` is 150–160 characters, enforced by `seo.test.ts`'s `PAGES_everyDescription_isBetween150And160Characters` test. `/power-zones`'s description is 161 characters — one over. This wasn't caught because `seo.test.ts`'s `TOOL_ROUTES`/`ALL_ROUTES` constants (line 4-5) are a **hardcoded array of the original 6 routes**, not derived from `Object.keys(PAGES)`. The Design document explicitly (and incorrectly) claimed "`seo.test.ts` and `sitemap.test.ts` continue to pass unmodified (both iterate `Object.keys(PAGES)` dynamically)" — that's only true for `sitemap.test.ts`. `seo.test.ts` never runs any of its quality checks (description length, primary-keyword presence, JSON-LD type, unique OG image, title format) against `/power-zones` at all.
- **Recommendation:** Two independent fixes — (1) trim the description to ≤160 characters (e.g. drop "Enter your" or tighten the second sentence), and (2) update `seo.test.ts` to derive its route list from `Object.keys(PAGES)` (matching `sitemap.test.ts`'s already-correct pattern) so this class of gap can't silently recur for the next new tool page either.
- **Update (commit `32b181d`):** ✅ Fixed. Description trimmed to 158 characters. `TOOL_ROUTES` in `seo.test.ts` now derives from `Object.keys(PAGES).filter(...)`, matching `sitemap.test.ts`. Added the missing `TARGET_KEYWORDS['/power-zones']` entry. All `seo.test.ts` checks now genuinely run against this route and pass.

#### M2 — Explainer's worked example contradicts the page's own COROS explanation and the actual code behavior
- **Category:** Code Quality (content accuracy)
- **Location:** `src/lib/content/explainers.ts:198`
- **Description:** The "Worked example" section states: *"The same 252W entered under Garmin, Polar, or COROS would return different zone boundaries, because each device's percentages and metric differ, not because the arithmetic changes."* This is incorrect for COROS — the immediately preceding section, "Why COROS shows Stryd's zones" (line 189-190), correctly states COROS "uses the exact same published 5-zone table as Stryd," and this is exactly what `power-zones.test.ts:44-51` verifies (`calculatePowerZones(252, 'coros')` `toEqual` `calculatePowerZones(252, 'stryd')`). A user reading straight down the explainer section would hit a direct contradiction within two paragraphs of each other.
- **Recommendation:** Remove "or COROS" from that sentence — it should read "The same 252W entered under Garmin or Polar would return different zone boundaries..."
- **Update (commit `32b181d`):** ✅ Fixed. Sentence now reads "...entered under Garmin or Polar would return different zone boundaries... (COROS returns the same boundaries as Stryd, since it uses Stryd's exact zone table)" — corrected and made the COROS relationship explicit at the point of the worked example, not just in the earlier section.

#### M3 — Keyboard focus-follows-selection fix has zero automated test coverage
- **Category:** Test Coverage / Reliability
- **Location:** `src/routes/hr-zones/+page.svelte`, `src/routes/parkrun/+page.svelte`, `src/routes/power-zones/+page.svelte` (all three `handleTabKeydown` implementations); corresponding `*.test.ts` files
- **Description:** The final commit on this PR fixes a real accessibility bug (keyboard focus staying on the old tab while `aria-selected` moves to the new one) across all three pages that share this tab pattern. It was verified live via Playwright during `/verify` (screenshot evidence: focus ring and selected state both landing on "Garmin" after two ArrowRight presses), but no assertion was added to any of the three component test files. `@testing-library/svelte` + jsdom can assert `document.activeElement` directly — this is testable, not a jsdom limitation. As shipped, a future refactor of any of these three `handleTabKeydown` functions could silently reintroduce the bug with nothing in CI to catch it.
- **Recommendation:** Add one test per affected page asserting `document.activeElement` (or the focused tab's accessible name) after an `ArrowRight`/`ArrowLeft` keydown, e.g. extending the existing `pressing ArrowRight cycles through all four devices` test in `power-zones.test.ts` to also check which element has focus, not just `aria-selected`.
- **Update (commit `32b181d`):** ✅ Fixed. Added two new tests to each of `hr-zones.test.ts`, `parkrun.test.ts`, and `power-zones.test.ts` (6 total) asserting `document.activeElement` after ArrowRight and after ArrowLeft (wrap-around), confirmed via `document.activeElement).toBe(screen.getByRole('tab', {...}))`. All 6 pass.

### Minor (nice to fix)

#### m1 — `seo.test.ts` route list will keep going stale for future tool pages
- **Category:** Code Quality
- **Location:** `src/lib/seo.test.ts:4-5`
- **Description:** Root cause of M1. `TOOL_ROUTES` is hand-maintained; every future new tool page will silently skip all of `seo.test.ts`'s quality gates unless someone remembers to add it here too — exactly what happened with this PR.
- **Recommendation:** `const TOOL_ROUTES = Object.keys(PAGES).filter((r) => r !== '/' && r !== '/privacy')`, or similar, mirroring `sitemap.test.ts`'s already-correct approach. (Folded into M1's recommendation above; listed separately since it's a distinct code change from trimming the description.)
- **Update (commit `32b181d`):** ✅ Fixed as part of M1 — see above.

#### m2 — Design document's file list included two test files that turned out not to need changes
- **Category:** Documentation accuracy (process, not code)
- **Location:** Issue #86, `## Design` → Task 3 file list (`SiteFooter.test.ts`, `HeroSection.test.ts`)
- **Description:** The Design phase assumed these files had assertions covering the footer tools list and the "Six free tools" text respectively. Neither actually did — confirmed by reading both files in full. No functional impact; the actual PR correctly left them unmodified.
- **Recommendation:** None needed — noted for completeness only.
- **Update:** No action required — confirmed still accurate on re-review.

### Suggestions (optional)

#### S1 — `/power-zones` has no `AffiliateLinks` entry, unlike every other tool page
- **Category:** Consistency
- **Location:** `src/lib/affiliates.ts` (not modified by this PR)
- **Description:** `ToolLayout.svelte` renders `<AffiliateLinks route={route} />` unconditionally; `AffiliateLinks.svelte` correctly guards on `products.length > 0` and renders nothing when there's no entry for a route, so this degrades gracefully rather than erroring. But it does mean `/power-zones` is the only tool page with an empty "Recommended gear" sidebar section.
- **Recommendation:** Not a blocker — explicitly out of this issue's scope. Worth a follow-up if/when relevant power-meter hardware (Stryd pods, compatible watches) gets added to the affiliate catalogue.
- **Update (commit `32b181d`):** ✅ Fixed rather than deferred, per explicit instruction to leave nothing for future work. Added a `/power-zones` entry to `affiliates.ts` with two genuinely relevant products, using the exact same curated-Amazon-search-link pattern as every other route: a **Stryd Running Power Meter** (the flagship dedicated footpod, the device behind the Stryd/COROS Critical Power model this calculator is built around) and a **Garmin HRM 600** (a chest strap that generates Garmin Running Power — directly relevant to the Garmin tab, and already used elsewhere in the codebase for the same reason on `/hr-zones`). Updated `affiliates.test.ts`'s route list to include and verify it.

---

## Positive Observations

- **Research quality carried through to code.** The `/analyse` phase's device research (Stryd verified against a worked example, Polar verified against Polar's own blog, Garmin explicitly flagged unverified with the reasoning preserved) shows up faithfully as source-confidence comments directly above each zone table in `power-zones.ts` — a future maintainer doesn't need to re-derive any of this.
- **`coros: STRYD_ZONE_META`** is a genuine same-reference alias, not a copy — verified by reading the object literal. This is exactly the kind of small architectural choice that prevents silent drift between two device options that are supposed to be identical, and it's backed by an explicit `toEqual` test.
- **Adversarial `/verify` pass caught a real, pre-existing bug** (keyboard focus not following tab selection) that predates this PR by reading `hr-zones/+page.svelte`'s identical pattern, and the fix was correctly generalized to all three affected pages rather than scoped narrowly to the new one — good instinct, even though the fix itself needs test coverage (M3).
- **Variable-length zone rendering** (5 rows vs. 7 rows) required no new UI architecture — the existing `{#each zones as zone}` loop from `hr-zones/+page.svelte` just works, confirmed correct via both unit tests and live browser verification.
- **Zero lint errors, zero type errors, 826/826 tests passing** — a large (21-file) PR landed with a completely clean baseline.
- **OG image regeneration was verified non-destructive** — the other six existing images were hash-compared before/after, not just assumed unaffected.

---

## Action Items

### Immediate Fixes (block merge)
None — no Critical findings.

### Post-merge improvements
All fixed in commit `32b181d` — none deferred:
- [x] M1: Trim `/power-zones`'s SEO description to ≤160 characters; update `seo.test.ts` to derive its route list from `Object.keys(PAGES)`
- [x] M2: Fix the "Worked example" sentence in `explainers.ts` — remove "or COROS" from the list of devices that would return *different* boundaries
- [x] M3: Add a focus-assertion test to each of the three affected pages' test files (`hr-zones.test.ts`, the parkrun test file, `power-zones.test.ts`)
- [x] S1: Added an `affiliates.ts` entry for `/power-zones` (Stryd Running Power Meter, Garmin HRM 600) rather than deferring

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited (21/21 files)
- [x] Tests cover happy path, error paths, and edge cases (with the M3 gap noted)
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced (no `{@html}`/`innerHTML`, all input bounded/validated)
- [x] No performance regressions (static route, no network calls, fixed-size arrays)
- [x] Error handling complete and consistent with existing `hr-zones.ts` conventions
- [x] Logging N/A (static SvelteKit site, no server-side logging surface touched)
- [x] Code follows existing codebase conventions
- [ ] No unnecessary changes outside scope of the issue — **the `hr-zones`/`parkrun` focus fix is intentionally out-of-scope, added per explicit user instruction during `/verify`, not accidental scope creep; flagging here for transparency, not as a defect**
