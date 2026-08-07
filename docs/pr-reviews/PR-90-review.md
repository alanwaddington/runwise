# PR #90 Review — Workout Suggestions: structured session recommendations by training zone (#19)

**Date:** 2026-08-07
**Author:** alanwaddington
**Branch:** feature/19-workout-suggestions → main
**State:** Open
**Commits reviewed:** 9 (0b82d61, 4cdfd17, eb0d313, a578fd4, c4ec886, 91b7b95, d6842e2, 045dd07, 699b694)

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass with comments ⚠️ |
| Risk Level | Low |
| Test Coverage | Adequate, with one gap identified |
| Acceptance Criteria | 14 Met / 14 Total |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

### Issue Hierarchy

- #19 — Workout Suggestions: structured session recommendations by training zone — root issue with embedded `## Analysis` and `## Design` sections, no parent issue, no sub-issues (confirmed via GraphQL — `parentIssue` field doesn't exist on this repo's Issue type / `subIssues` returned empty — this repo embeds the full analysis/design/work-breakdown hierarchy inside one issue rather than using native GitHub sub-issues, same convention as prior PRs #86/#89)

The issue's own "Acceptance Criteria" section (14 checkbox items) is treated as the verifiable criteria set below. The Design's per-task "Acceptance Criteria" bullet lists (Tasks 1–6) are plain bullets, not checkboxes, but were cross-checked in the file audit for extra rigor.

Note: two commits in this PR (`045dd07`, `699b694`) go beyond the original `/design` work breakdown — a fix for a bug found during manual testing, and a new visual chart feature added on user request mid-review. Both are in-scope for #19 in spirit (the tool wasn't shippable without the fix; the chart directly enhances the tool's core output) but are not covered by any checkbox in #19's Acceptance Criteria section, since they postdate `/design`. See Findings.

---

## Changed Files Audit

### `src/lib/utils/workouts.ts` (+419 / -0 lines, new file)

| Property | Detail |
|----------|--------|
| Purpose | Core calculation module: per-zone quality-session volume from weekly mileage (sourced % + cap rules), turned into 2 session-shape workout variants per zone (E/M/T continuous+variant, I/R fixed-distance reps), plus a warm-up→work→cool-down `segments` timeline per workout for the profile chart |
| Issues | #19 |
| Criteria covered | AC 1–7, 11 (volume rules, 2-workouts-per-zone, card fields, E-pace passthrough, source/confidence comments) |
| Quality | ✅ Small, named pure functions composed by one entry point (`buildWorkoutsResult`), mirroring `training-paces.ts`'s own `computeRawVdot`/`getTrainingPaces` split — consistent with the codebase's established pattern. `buildRepsWorkout` builds each of the two rep-distance variants at a **fixed** distance (never falling back to the other), which structurally guarantees the two I/R workouts can never collide on distance/label — a stronger fix than just handling the one reported case. Sourcing/confidence comments are specific and appropriately hedged (documents "corroborated secondary-source consensus," not overclaiming primary-source status). |
| Test coverage | `workouts.test.ts` — extensive: `computeZoneVolumeKm`/`computeELongRunVolumeKm` describe blocks (percentage + cap branches per zone), `buildZoneWorkouts` describe block, `workout segments` describe block, `buildWorkoutsResult` describe block |

### `src/lib/utils/workouts.test.ts` (+327 / -0 lines, new file)

| Property | Detail |
|----------|--------|
| Purpose | Unit tests for the above, including two explicit regression tests for the low-mileage duplicate-rep-distance bug (`buildZoneWorkouts_IZone_LowMileage_StillReturnsTwoDistinctLabels`, R-zone equivalent) |
| Issues | #19 |
| Criteria covered | AC 12 (test coverage) |
| Quality | ✅ Naming follows the codebase's `MethodName_Scenario_ExpectedResult` convention. Both cap branches and percentage branches tested per zone. Segment-timeline invariants tested generically across all 5 zones (starts warmup/ends cooldown, durations sum to `estimatedDurationMinutes`, intensity bounds) rather than one-off per zone — good use of a loop over `['E','M','T','I','R']` to avoid five near-duplicate test blocks. |
| Test coverage | Self |

### `src/lib/utils/race-result-params.ts` (+45 / -0 lines, new file)

| Property | Detail |
|----------|--------|
| Purpose | Shared serialize/parse for the race-result URL query-param cross-link between `/training-paces` and `/workouts` |
| Issues | #19 |
| Criteria covered | AC 9 (bidirectional cross-link, malformed-param fallback) |
| Quality | ✅ Uses `URLSearchParams` throughout (safe encoding, no manual string building — no injection surface). `parseRaceResultParams` never throws, matching its documented contract; every failure path (missing distance/time, unparseable time, unrecognized distance, missing/non-numeric/negative `km`) returns `null` rather than a partial/garbage object. |
| Test coverage | `race-result-params.test.ts` — round-trip tests for both standard and custom distances, and one test per malformed-input case |

### `src/lib/utils/race-result-params.test.ts` (+74 / -0 lines, new file)

| Property | Detail |
|----------|--------|
| Purpose | Tests for the above |
| Issues | #19 |
| Criteria covered | AC 12 |
| Quality | ✅ No gaps found — covers the full malformed-input matrix listed in the Design's Task 2 AC. |
| Test coverage | Self |

### `src/routes/workouts/+page.svelte` (+420 / -0 lines, new file)

| Property | Detail |
|----------|--------|
| Purpose | The `/workouts` calculator page: race-distance/time inputs (byte-for-byte copy of `/training-paces`' markup), new weekly-mileage input, time-band filter, 5 zones × 2 workout cards with the new profile chart, query-param prefill on load, outbound cross-link |
| Issues | #19 |
| Criteria covered | AC 1, 2, 5, 6, 8, 9 |
| Quality | ⚠️ See Finding M1 — the footer cross-link's visibility condition (`raceResultQuery !== null`, checked only against `distanceKm`/`timeSeconds`) is placed **outside** the empty/out-of-range/valid-results `{#if}` chain, so it renders even in the out-of-range state. `/training-paces`' equivalent link is nested **inside** its valid-results branch only, so the same state does not show the link there. This is a real behavioral asymmetry between the two directions of what the Design explicitly calls "symmetric in both directions." Otherwise, the input markup is a faithful, consistent reuse of the established `/training-paces` pattern (same validation, same empty/out-of-range iconography, same `Clear` button behavior). |
| Test coverage | `workouts.test.ts` (page-level) — good coverage of the input gating, filter, cross-link visibility in empty state, and query-param prefill/fallback. Does not include a case for the out-of-range + cross-link interaction (Finding M1) or a page-level render check at low weekly mileage (Finding m1). |

### `src/routes/workouts/workouts.test.ts` (+130 / -0 lines, new file)

| Property | Detail |
|----------|--------|
| Purpose | Component tests for the page above |
| Issues | #19 |
| Criteria covered | AC 12 |
| Quality | ✅ Follows the `$app/state` mocking pattern already established in `SiteNav.test.ts`/`error-page.test.ts` for the query-param prefill tests. Static top-level import after `vi.mock` (no per-test dynamic `import()`) is correct given Svelte's per-instance script execution model — confirmed this matches the equivalent `training-paces.test.ts` update in this same PR. |
| Test coverage | Self |

### `src/routes/training-paces/+page.svelte` (+24 / -4 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds query-param prefill on load and an outbound `/workouts` link alongside the existing `/vo2max` link |
| Issues | #19 |
| Criteria covered | AC 9 |
| Quality | ⚠️ See Finding M1 — this file's link block is correctly scoped to the valid-results branch, which is what exposes the asymmetry with `/workouts`' placement. The existing `/vo2max` link is untouched, confirmed additive. |
| Test coverage | `training-paces.test.ts` — link visibility (present/absent), href content, prefill, malformed-param fallback |

### `src/routes/training-paces/training-paces.test.ts` (+41 / -2 lines)

| Property | Detail |
|----------|--------|
| Purpose | Tests for the above |
| Issues | #19 |
| Criteria covered | AC 12 |
| Quality | ✅ No gaps found. |
| Test coverage | Self |

### `src/lib/components/WorkoutProfileChart.svelte` (+46 / -0 lines, new file)

| Property | Detail |
|----------|--------|
| Purpose | New SVG step-chart component rendering a `WorkoutSegment[]` as width-by-duration, height-by-intensity bars (added mid-review on user request, not in the original #19 design) |
| Issues | #19 (follow-on request, same conversation) |
| Criteria covered | Not tied to a checkbox AC — additive UX enhancement |
| Quality | ✅ Handles the zero-total-duration / empty-array edge case explicitly (`totalMinutes > 0 ? ... : 0`), verified by its own test. Marked `aria-hidden="true"`, which is a reasonable call given the same information (session format, recovery, duration) is already present as accessible text elsewhere on the card — not a silent accessibility loss. |
| Test coverage | `WorkoutProfileChart.test.ts` — 7 tests covering render, decorative-aria, per-segment rect count, work-vs-other fill class, height-by-intensity, width-by-duration, empty-array handling |

### `src/lib/components/WorkoutProfileChart.test.ts` (+63 / -0 lines, new file)

| Property | Detail |
|----------|--------|
| Purpose | Tests for the above |
| Issues | #19 |
| Criteria covered | N/A |
| Quality | ✅ No gaps found. |
| Test coverage | Self |

### `src/lib/components/ToolIcon.svelte` (+10 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds a `'workouts'` icon variant |
| Issues | #19 |
| Criteria covered | AC 8 |
| Quality | ✅ No issues — same conditional-branch pattern as the other 7 icons. |
| Test coverage | No dedicated `ToolIcon.test.ts` exists for any variant (pre-existing gap, not introduced by this PR); exercised indirectly via `home-page.test.ts`'s tool-card rendering, though see Finding M2 for a gap in that coverage specifically for this new variant. |

### `src/lib/seo.ts` (+9 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds the `/workouts` entry to `PAGES` (title, description, OG image, JSON-LD type, changefreq, priority) |
| Issues | #19 |
| Criteria covered | AC 8 |
| Quality | ✅ Description is 151 characters (within the 150–160 band enforced by `seo.test.ts`), title uses the `| Runwise` pipe-separator convention, `ogImage` path is unique. |
| Test coverage | `seo.test.ts` (updated in this PR — see below) — `PAGES` is iterated generically via `Object.keys(PAGES)`, so the new entry automatically inherits every existing quality check (description length, keyword presence, JSON-LD type, OG-image uniqueness) |

### `src/lib/seo.test.ts` (+2 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds `/workouts` → `'workout generator'` to `TARGET_KEYWORDS`, required for the generic `PAGES_everyToolDescription_containsPrimaryKeyword` test to not fail with an `undefined` lookup |
| Issues | #19 |
| Criteria covered | AC 12 |
| Quality | ✅ No issues. |
| Test coverage | Self |

### `src/lib/components/SiteNav.svelte` / `SiteNav.test.ts` (+2/-1, +1/-0)

| Property | Detail |
|----------|--------|
| Purpose | Adds `/workouts` to the desktop+mobile nav list and its href assertion |
| Issues | #19 |
| Criteria covered | AC 8 |
| Quality | ✅ No issues. |
| Test coverage | `SiteNav.test.ts:43` |

### `src/lib/components/SiteFooter.svelte` (+2 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds `/workouts` to the footer tools list |
| Issues | #19 |
| Criteria covered | AC 8 |
| Quality | ✅ No issues. |
| Test coverage | No dedicated `SiteFooter.test.ts` link-by-link assertion exists for any tool (pre-existing gap, not introduced here); footer link is exercised indirectly by the fact `training-paces.test.ts`/`workouts.test.ts` share DOM with the global layout in some render paths — not a targeted regression guard either way. |

### `src/routes/+page.svelte` (+7 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds the 8th homepage tool card |
| Issues | #19 |
| Criteria covered | AC 8 |
| Quality | ✅ Consistent with the existing 7-entry array shape. |
| Test coverage | ❌ **Not covered** — see Finding M2. `home-page.test.ts` was not updated in this PR (confirmed via `git diff main..HEAD --stat -- src/routes/home-page.test.ts` → empty) and still hardcodes an "all 6 tool card links" assertion list that predates both `/power-zones` (prior PR) and `/workouts` (this PR). The test currently passes (5/5) purely because it only asserts the 6 links it lists exist — it does not assert the *total* count, so it cannot fail even though 2 real cards are now unverified. |

### `src/lib/components/HeroSection.svelte` / `EducationalSection.svelte` (+1/-1, +40/-1)

| Property | Detail |
|----------|--------|
| Purpose | "Seven" → "Eight" tools/calculators copy; `EducationalSection.svelte` additionally gets 2 new "Fundamentals" concept cards (Power Zones, Scaling Training Load), 2 new "Common Mistakes" entries, and the previously-missing "Generate workout suggestions" bullet in the "How Runwise Helps" list |
| Issues | #19 (copy bump), plus a follow-on same-session request covering both `/workouts` and `/power-zones` content |
| Criteria covered | AC 8 (copy bump only) |
| Quality | ✅ The added content is accurate to the actual computed behavior (e.g., "scales each zone's session volume as a percentage of weekly mileage" correctly describes `workouts.ts`). Fixing the missing "Eighth" bullet in "How Runwise Helps" (which had been stuck at 7 items despite the heading already saying "Eight") was a genuine bug caught and fixed within this same PR — good catch. Scope note: the `/power-zones` content additions are unrelated to #19's own acceptance criteria (that tool shipped in a prior PR) — reasonable to include here since it was an explicit, deliberate ask in the same PR, but worth flagging that it's additional scope beyond #19 itself. |
| Test coverage | No dedicated test asserts on `EducationalSection.svelte`'s card content (pre-existing gap for this component, not introduced here). |

### `scripts/generate-og-images.js` (+2 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds the `og-workouts.png` OG-image generation entry |
| Issues | #19 |
| Criteria covered | AC 8 |
| Quality | ✅ No issues. |
| Test coverage | N/A — build-time script, no test harness exists for any entry in this array |

### `static/og/og-workouts.png` (binary, new file, 394095 bytes)

| Property | Detail |
|----------|--------|
| Purpose | Generated OG image for `/workouts` |
| Issues | #19 |
| Criteria covered | AC 8 |
| Quality | ✅ Only this one new image is present in the diff — the other 8 pre-existing OG images were correctly **not** regenerated/committed (confirmed via the PR's file list: no other `static/og/*.png` entries), consistent with the project's "only regenerate what changed" convention even though that convention is documented for docs, not images specifically. |
| Test coverage | N/A |

### `src/lib/content/explainers.ts` (+27 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds the `/workouts` `PageExplainerContent` entry |
| Issues | #19 |
| Criteria covered | AC 10 |
| Quality | ✅ Matches the shape and tone of the other 7 entries; explicitly covers the weekly-mileage-to-volume relationship and the E-zone regular/long-run distinction, as the AC requires. |
| Test coverage | No dedicated content-assertion test exists for any `EXPLAINERS` entry (pre-existing gap); rendering is exercised generically since `PageExplainer.svelte` is included on every tool page and those pages' component tests render successfully. |

### `docs/Guides/User Guide/user-guide.md` / `.html` / `.pdf` (+35/-0, +67/-0, binary)

| Property | Detail |
|----------|--------|
| Purpose | New `### Workout Suggestions — /workouts` subsection; regenerated derived formats |
| Issues | #19 |
| Criteria covered | AC 10 |
| Quality | ⚠️ Minor — the subsection doesn't mention the new visual intensity-profile chart (added in a later commit in this same PR, after the docs were written) — see Finding m2. Otherwise matches the existing 7 subsections' format precisely (inputs table, output description, zone-shape table). Correctly restored the Deployment/Developer Guide binaries unmodified per `CLAUDE.md`'s instruction — confirmed via `git diff main..HEAD --stat` showing only `User Guide/*` touched, not the other two guides. |
| Test coverage | N/A — documentation |

### `README.md` (+1 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds `/workouts` to the tool list |
| Issues | #19 |
| Criteria covered | AC 8 |
| Quality | ✅ No issues. |
| Test coverage | N/A |

### `src/routes/tool-pages.test.ts` (+7 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds `Workouts` to the shared `describe.each` heading/description assertion table |
| Issues | #19 |
| Criteria covered | AC 1, 12 |
| Quality | ✅ No issues — reuses the existing generic pattern rather than a bespoke test file. |
| Test coverage | Self |

---

## Acceptance Criteria Verification

### #19 — Workout Suggestions: structured session recommendations by training zone

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `/workouts` route exists, reusing `/training-paces`'s race-distance + race-time input exactly (same component/validation patterns) | `src/routes/workouts/+page.svelte:140-211` (identical markup/logic to `training-paces/+page.svelte:86-157`) | `workouts.test.ts` (renders distance select/time input); `tool-pages.test.ts` | ✅ Met |
| 2 | A required weekly-mileage input (km) is present; no result renders until both race result and weekly mileage are valid | `+page.svelte:214-227` (input), `:47-58` (`result` gated on `timeSeconds !== null && distanceKm > 0 && weeklyMileageKm > 0`) | `workouts.test.ts:34-56` | ✅ Met |
| 3 | For each of the 5 zones, workout volume is computed from the sourced percentage-of-weekly-mileage rule with its absolute cap applied (E/E-long/M/T/I/R rules as documented above) | `workouts.ts:119-158` (`computeZoneVolumeKm`, `computeELongRunVolumeKm`) | `workouts.test.ts:13-110` (percentage + cap branch per zone) | ✅ Met |
| 4 | Each zone displays exactly 2 example workouts; E's two are specifically a regular easy run and a long run using their distinct rules | `workouts.ts:186-202` (`buildEWorkouts`), `WorkoutZone.workouts: [Workout, Workout]` tuple type | `workouts.test.ts:113-124` | ✅ Met |
| 5 | Each workout card shows: session format, target pace (from the same zone pace ranges as `/training-paces`), recovery, total volume, and warm-up/cool-down guidance | `+page.svelte:352-386` | `workouts.test.ts:66-73` | ✅ Met — see Quality note under `workouts.ts`/`+page.svelte` audit: pace is shown once per zone header rather than repeated on each of the 2 cards. Functionally present and unambiguous, but a literal reading of "each workout card shows... target pace" isn't met card-by-card. Not blocking. |
| 6 | A time-band filter (select, whole-page scope) narrows displayed workouts; a zone with nothing fitting the selected band shows a "none fit this time" message rather than hiding or showing a mismatched workout | `+page.svelte:60-82` (`fitsBand`), `:346-349` | `workouts.test.ts:80-85` | ✅ Met |
| 7 | E zone's displayed target pace is the full E range, unmodified from `/training-paces`' existing range | `workouts.ts:408-416` (copies `tz.paceMinKmLow/High` verbatim from `buildTrainingPaceResult`'s output) | `workouts.test.ts:307-317` | ✅ Met |
| 8 | Page wired into nav (header + footer), SEO metadata, sitemap (automatic via existing `PAGES`-driven generation), OG image, homepage tool grid, and tool-count copy bumped to "Eight" | `SiteNav.svelte`, `SiteFooter.svelte`, `seo.ts`, `generate-og-images.js`+`static/og/og-workouts.png`, `src/routes/+page.svelte`, `HeroSection.svelte`, `EducationalSection.svelte` | `SiteNav.test.ts:43`, `seo.test.ts` (generic), `tool-pages.test.ts` | ✅ Met — see Finding M2: the homepage tool-grid card specifically has no automated test coverage (`home-page.test.ts` untouched by this PR). Verified working manually via live browser testing during `/verify`. |
| 9 | Cross-links added between `/training-paces` and `/workouts` in both directions, carrying the race result (not weekly mileage) via URL query params; malformed/missing params fall back to each page's normal empty state without error | `race-result-params.ts`, `+page.svelte:84-88, 395-405` (workouts), `training-paces/+page.svelte:39-43, 285-294` | `race-result-params.test.ts`, `workouts.test.ts:87-120`, `training-paces.test.ts:182-211` | ✅ Met — see Finding M1: the two directions' link-visibility condition is not actually symmetric (see below). Round-tripping, weekly-mileage exclusion, and malformed-param fallback are all correctly implemented and tested. |
| 10 | Explainer content added covering what each zone's workouts represent and how volume is derived from weekly mileage | `explainers.ts:201-227`, `user-guide.md` new subsection | N/A (content) | ✅ Met |
| 11 | Source/confidence of both the mileage-scaling rules and the session-shape/rep-distance conventions documented as code comments | `workouts.ts:55-64, 80-82, 271-279` | N/A (comments) | ✅ Met |
| 12 | Tests added and passing (`npm run test`), covering volume calculation per zone (including both absolute-cap and percentage-cap branches), the 2-workouts-per-zone rendering, the time filter (including the no-fit case), and required-input gating | See per-file audit above | Full suite: 49 files / 928 tests passing (confirmed via `/verify` run this session) | ✅ Met |
| 13 | No regressions to existing calculators, especially `/training-paces` (untouched calculation logic) | `training-paces.ts` has zero diff in this PR (only its `+page.svelte` changed, additively) | Full suite passing, including all pre-existing `training-paces.test.ts` cases plus new ones | ✅ Met |
| 14 | E's two workouts specifically a regular easy run and a long run using their two distinct Daniels rules (duplicate of #4 in the issue body's Must-Have list, restated in Acceptance Criteria) | Same as #4 | Same as #4 | ✅ Met |

**Summary:** 14/14 criteria met. Two (5, 9) carry a non-blocking caveat noted above and expanded in Findings.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

#### M1 — Cross-link visibility is not actually symmetric between `/workouts` and `/training-paces`
- **Category:** Code Quality / Reliability
- **Location:** `src/routes/workouts/+page.svelte:395-405` vs. `src/routes/training-paces/+page.svelte:285-294`
- **Description:** On `/workouts`, the outbound "View training paces →" link block sits **outside** the empty/out-of-range/valid-results `{#if}` chain, gated only on `raceResultQuery !== null` (which only checks `distanceKm > 0` and `timeSeconds !== null` — it does not check whether the VDOT is in the supported 20–85 range). On `/training-paces`, the equivalent "See workout suggestions →" link is nested **inside** the valid-results branch only. Verified live: entering an out-of-range time (e.g. 5K in 1:20:00) on `/workouts` still shows the "View training paces →" link alongside the "outside the supported range" message, while the same input on `/training-paces` shows no such link at all. The Design explicitly describes this cross-link as "symmetric in both directions" — this is a real asymmetry, not a documentation nit. It's not a *dead* link (the target page loads and shows a consistent out-of-range message too), but it is user-facing inconsistency between two directions of the same feature, and worth deciding deliberately rather than leaving as an accident of where each `{#if}` block happens to sit.
- **Recommendation:** Pick one behavior and match it on both pages — either gate both links on `result !== null` (valid results only, matching `/training-paces`' current behavior) or gate both on `raceResultQuery !== null` (parseable input regardless of VDOT range, matching `/workouts`' current behavior). The former is more conservative and matches the AC's "no dead/placeholder link" framing most literally.

#### M2 — No automated test coverage for the new homepage tool-grid card
- **Category:** Reliability / Test Coverage
- **Location:** `src/routes/home-page.test.ts` (not modified by this PR)
- **Description:** `src/routes/+page.svelte` gained an 8th tool card (`/workouts`) in this PR, satisfying part of AC 8. `home-page.test.ts`, however, was not touched — it still hardcodes `'renders all 6 tool card links'` and a 6-entry `expectedLinks`/`routes` array that predates even the prior `/power-zones` PR. The test currently reports 5/5 passing because it never asserts the *total* card count, only that its 6 named links exist — so it cannot fail even though 2 of the site's 8 real tool cards (including this PR's own `/workouts` card) are completely unverified by CI. I confirmed this file has an empty diff against `main` and still passes as-is. Functionally the card does render correctly (verified manually via Playwright during `/verify` this session), so this is a coverage gap, not a live bug — but it means a future regression to the homepage grid (e.g. an accidental removal of the `/workouts` entry) would ship undetected.
- **Recommendation:** Extend `home-page.test.ts`'s `expectedLinks`/`routes` arrays to include `/power-zones` and `/workouts` (both currently missing), and consider asserting the total link count matches `Object.keys(PAGES).length` minus non-tool routes, mirroring the self-updating pattern already used in `seo.test.ts`'s `TOOL_ROUTES` derivation, so this can't go stale again.

### Minor (nice to fix)

#### m1 — No page-level regression test for the specific duplicate-key crash scenario
- **Category:** Test Coverage
- **Location:** `src/routes/workouts/workouts.test.ts`
- **Description:** The bug fixed in commit `045dd07` (`each_key_duplicate` runtime error crashing the entire results section at low weekly mileage) is now well-covered at the data layer (`workouts.test.ts`'s two `LowMileage_StillReturnsTwoDistinctLabels` tests, plus the structural fix itself — `buildRepsWorkout` now builds each variant at a fixed, non-overlapping distance, which provably prevents the collision class entirely, not just the one reported case). There is, however, no test that actually renders the `/workouts` **page** at the exact reported reproduction input (5K/30:22/10km) and asserts it renders without throwing — the failure mode was a Svelte runtime error specifically triggered by the keyed `{#each}` in the component, and the current tests don't exercise that render path under the original failure conditions.
- **Recommendation:** Add one `workouts.test.ts` (page) case rendering with weekly mileage in the low range (e.g. 10km) and asserting all 10 cards render / no error is thrown, as a direct regression guard at the layer where the bug actually manifested.

#### m2 — User Guide doesn't mention the new workout profile chart
- **Category:** Documentation
- **Location:** `docs/Guides/User Guide/user-guide.md`
- **Description:** The `/workouts` subsection was written before the visual intensity-profile chart was added (commit `699b694`, later in the same PR) and doesn't describe it. Minor since the chart is self-explanatory and decorative, but the doc's "Reading a workout card" language ("Each card shows...") is now incomplete.
- **Recommendation:** Add one sentence noting the visual profile chart under each card, if/when this PR is revisited before merge; otherwise fine as a fast-follow doc tweak.

### Suggestions (optional)

#### S1 — `/power-zones` homepage content additions are outside #19's own scope
- **Category:** Code Quality (scope)
- **Location:** `src/lib/components/EducationalSection.svelte`
- **Description:** Two of the four new homepage content blocks in this PR (the "Running Power Zones" fundamentals card and the "Trusting pace on hills and in the wind" mistake entry) describe `/power-zones`, a tool that shipped in a prior PR, not #19. This was an explicit, deliberate request made in the same working session as this PR, so it's not scope creep in the sense of unrequested work — just noting it doesn't map to any #19 acceptance criterion, for anyone auditing this PR against #19 specifically in the future.
- **Recommendation:** None required — purely informational for traceability.

---

## Positive Observations

- The volume-calculation and session-shape logic in `workouts.ts` is genuinely well-factored: `computeZoneVolumeKm`/`computeELongRunVolumeKm` (the "how much") are cleanly separated from `buildEWorkouts`/`buildMWorkouts`/`buildTWorkouts`/`buildRepsWorkout` (the "what shape"), matching the Design's stated intent and making each layer independently testable — which the test suite actually exercises.
- `buildWorkoutsResult` reuses `buildTrainingPaceResult` wholesale rather than re-deriving VDOT/zone paces, exactly matching the Design's "reuse, don't duplicate" decision and the Analysis's explicit concern about drift risk — confirmed `training-paces.ts` has zero diff in this PR.
- The fix for the duplicate-rep-distance crash (`045dd07`) is a structural fix, not a patch — building each of the two rep-distance variants at a fixed, non-overlapping distance makes the entire class of bug (any two-variant collision) impossible by construction, rather than just handling the specific input that was reported.
- Source/confidence comments throughout `workouts.ts` consistently distinguish "corroborated secondary-source consensus" from stronger/weaker confidence tiers, following the `power-zones.ts` precedent this codebase has established — no approximation is silently presented as verified fact.
- `race-result-params.ts`'s `parseRaceResultParams` has a genuinely complete "never throw, always fall back" contract, verified against every malformed-input branch (missing distance, missing time, unparseable time, unrecognized distance, missing/non-numeric/negative km) with one test each.
- Test naming and structure consistently follow this codebase's existing conventions (`MethodName_Scenario_ExpectedResult`, `describe.each`-style reuse in `tool-pages.test.ts`, the `$app/state` mock pattern from `SiteNav.test.ts`) rather than introducing new patterns.
- Full test suite (49 files / 928 tests) and lint (0 errors/warnings across the whole repo) both pass cleanly as of this PR's tip.

---

## Action Items

### Immediate Fixes (block merge)
- None — no Critical findings.

### Post-merge improvements
- [ ] M1: Decide and align the cross-link visibility condition between `/workouts` and `/training-paces` (both should show/hide under the same rule)
- [ ] M2: Extend `home-page.test.ts` to cover `/power-zones` and `/workouts` tool cards, ideally via a self-updating assertion
- [ ] m1: Add a page-level `/workouts` render test at low weekly mileage as a direct regression guard for the duplicate-key crash
- [ ] m2: Add a line to the User Guide's `/workouts` subsection mentioning the profile chart

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues (N/A — static site, no server-side logging surface)
- [x] Code follows existing codebase conventions
- [ ] No unnecessary changes outside scope of the issue — see S1 (informational, not blocking)
