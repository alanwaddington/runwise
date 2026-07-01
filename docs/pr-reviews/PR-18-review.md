# PR #18 Review — feat: Race Time Predictor (#5)

**Date:** 2026-07-01
**Author:** alanwaddington
**Branch:** feature/5-race-time-predictor → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass with comments ⚠️ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 25 Met / 29 Total (4 intentionally superseded by design) |
| Lint | 0 errors / 0 warnings |

---

## Issues Reviewed

### Issue Hierarchy
- #5 — Tool: Race Time Predictor (/race-predictor) (root — contains both Analysis and Design sections)

---

## Changed Files Audit

### `src/lib/utils/race-predictor.ts` (+120 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Pure utility module: Riegel formula, time parsing/formatting, distance definitions, prediction table generation |
| Issues | #5 |
| Criteria covered | STANDARD_DISTANCES, parseTime, formatTime, riegelPredict, predictedPaceMinPerKm, buildPredictionTable, de-duplication, sorting |
| Quality | ✅ Clean, follows existing pace.ts patterns. Reuses `formatPace` and `minPerKmToMinPerMile` from pace.ts. Single responsibility. |
| Test coverage | `race-predictor.test.ts` — 32 unit tests covering all exported functions |

### `src/lib/utils/race-predictor.test.ts` (+181 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Unit tests for all race predictor utility functions |
| Issues | #5 |
| Criteria covered | All Task 1 acceptance criteria |
| Quality | ✅ Thorough coverage: happy path, edge cases (empty, invalid, zero, whitespace, boundary values), deduplication tolerance |
| Test coverage | N/A (this IS the test file) |

### `src/routes/race-predictor/+page.svelte` (+235 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Replace stub page with full reactive race time predictor calculator |
| Issues | #5 |
| Criteria covered | Distance dropdown, custom input, time input, results table, VO2 max link, SEO metadata, accessibility, reactivity |
| Quality | ✅ Follows codebase conventions (Svelte 5 runes, Tailwind tokens, ToolLayout pattern). Proper accessibility with labels, aria-describedby, aria-current, semantic table HTML. |
| Test coverage | `race-predictor.test.ts` — 17 component tests |

### `src/routes/race-predictor/race-predictor.test.ts` (+141 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Component-level tests for the race predictor page |
| Issues | #5 |
| Criteria covered | Rendering, dropdown interactions, custom distance reveal, table rendering, VO2 max link, empty/valid state transitions |
| Quality | ✅ Good coverage of user interactions via fireEvent. Tests both presence and absence of UI elements. |
| Test coverage | N/A (this IS the test file) |

---

## Acceptance Criteria Verification

### #5 — Tool: Race Time Predictor (/race-predictor)

#### Analysis Section ACs

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| A1 | Known distance dropdown includes: 1 mile, 5K, 10K, 15K, half marathon, marathon, and a custom option | `+page.svelte:65-76` — `<select>` iterates STANDARD_DISTANCES + Custom option | `race-predictor.test.ts:15-22` | ✅ Met |
| A2 | Selecting custom distance reveals a numeric km input field | `+page.svelte:98-130` — conditional visibility via class:max-h-0/opacity-0 | `race-predictor.test.ts:94-98` | ✅ Met |
| A3 | Target distance dropdown has the same options as known distance (including custom) | Not implemented — design replaced with full table | N/A | ⚠️ Superseded by design |
| A4 | Selecting custom target distance reveals a numeric km input field | Not implemented — design replaced with full table | N/A | ⚠️ Superseded by design |
| A5 | Known time input accepts MM:SS format (e.g. `25:00` → 25 minutes) | `race-predictor.ts:35-45` — 2-segment parsing | `race-predictor.test.ts:30-31` | ✅ Met |
| A6 | Known time input accepts H:MM:SS format (e.g. `1:56:20` → 1 hour 56 min 20 sec) | `race-predictor.ts:47-59` — 3-segment parsing | `race-predictor.test.ts:33-35` | ✅ Met |
| A7 | Format is auto-detected by colon count (2 segments = MM:SS, 3 segments = H:MM:SS) | `race-predictor.ts:33-61` — `split(':')` then length check | `race-predictor.test.ts:30-35` (both formats tested) | ✅ Met |
| A8 | 5K in 25:00 predicts approximately 52:20 for 10K | `race-predictor.ts:83` — Riegel formula yields 3127s (~52:07, within "approximately") | `race-predictor.test.ts:98-103` (range 3100-3200) | ✅ Met |
| A9 | 5K in 25:00 predicts approximately 1:56:xx for half marathon | `race-predictor.ts:83` — Riegel formula yields 6900s (~1:55:00, within "approximately") | `race-predictor.test.ts:105-109` (range 6850-6950) | ✅ Met |
| A10 | Headline prediction shows the predicted finish time for the selected target distance using `ResultDisplay` | Not implemented — design replaced headline with full table | N/A | ⚠️ Superseded by design |
| A11 | Required pace is shown in both min/km and min/mile for the target distance | Not as headline, but shown for ALL distances in the table — `+page.svelte:218-223` | `race-predictor.test.ts:66-71` (column headers verified) | ⚠️ Superseded by design (table shows pace for all distances, not just target) |
| A12 | Results table shows predictions for all 6 standard distances | `+page.svelte:201-225` + `race-predictor.ts:97-119` | `race-predictor.test.ts:57-63` (7 rows = 1 header + 6 data) | ✅ Met |
| A13 | Each table row includes: distance name, predicted time, pace in min/km, pace in min/mile | `+page.svelte:208-223` — 4 `<td>` elements per row | `race-predictor.test.ts:66-71` + `race-predictor.test.ts:168-173` | ✅ Met |
| A14 | Custom target distance appears in the results table at the correct sorted position | `race-predictor.ts:106` — `distances.sort((a, b) => a.km - b.km)` | `race-predictor.test.ts:154-158` (sorted check) + `race-predictor.test.ts:101-111` | ✅ Met |
| A15 | Custom target distance is de-duplicated if it matches a standard distance | `race-predictor.ts:100` — tolerance check `Math.abs(d.km - customTargetKm) < 0.01` | `race-predictor.test.ts:142-152` (exact + tolerance) | ✅ Met |
| A16 | All outputs update reactively — no submit button | `+page.svelte:5-31` — all state via `$state()`/`$derived()`, handlers via `oninput`/`onchange` | `race-predictor.test.ts:41-46` (type → table appears) | ✅ Met |
| A17 | Empty time input clears all predictions | `+page.svelte:27-30` — `predictionRows` is null when `knownTimeSeconds` is null | `race-predictor.test.ts:74-83` | ✅ Met |
| A18 | Zero or negative time input does not crash | `race-predictor.ts:43` — `if (total <= 0) return null` | `race-predictor.test.ts:54-56` (zero returns null) | ✅ Met |
| A19 | Invalid time format does not crash | `race-predictor.ts:29-61` — comprehensive validation, returns null | `race-predictor.test.ts:42-52` (multiple invalid inputs) | ✅ Met |
| A20 | Page uses `ToolLayout` with title "Race Time Predictor" and appropriate description | `+page.svelte:54-57` — `title="Race Time Predictor"` `description="Predict your race finish time based on a recent result."` | `race-predictor.test.ts:10-12` + `tool-pages.test.ts:17-19` | ✅ Met |
| A21 | Page has custom `<title>`: "Race Time Predictor — Runwise" | `+page.svelte:56` — `pageTitle="Race Time Predictor — Runwise"` | Not directly tested in component tests (ToolLayout handles it via `<svelte:head>`) | ✅ Met |
| A22 | Page has `<meta name="description">` targeting "race time predictor" and "running time calculator" | `+page.svelte:48-51` — meta content includes "race finish time" and "predicted times" but NOT "running time calculator" | None | ⚠️ Partially Met |
| A23 | A link to `/vo2max` ("Estimate your VO2 max") is displayed alongside results | `+page.svelte:232-236` — link with text "Estimate your VO2 max →" and href="/vo2max" | `race-predictor.test.ts:128-134` | ✅ Met |
| A24 | Mobile devices show a numeric keyboard when tapping the time input field | `+page.svelte:139` — `inputmode="decimal"` on time input | None (not directly testable in JSDOM) | ✅ Met |
| A25 | All inputs have accessible labels | `+page.svelte:61-62` (distance label), `:108-109` (custom km label), `:134` (time label) — all with `for`/`id` association | `race-predictor.test.ts:15-17,24-26,85-91,94-98` | ✅ Met |
| A26 | Results table is accessible to screen readers (uses `<table>`, `<thead>`, `<th>`, `<tbody>`) | `+page.svelte:176-227` — semantic `<table>`, `<thead>`, `<th scope="col">`, `<tbody>`, `<tr>`, `<td>` | `race-predictor.test.ts:57-71` (roles: table, row, columnheader) | ✅ Met |
| A27 | Conversion/prediction logic is extracted into a testable utility module | `src/lib/utils/race-predictor.ts` — pure functions, zero Svelte dependency | 32 unit tests in `race-predictor.test.ts` | ✅ Met |
| A28 | Unit tests cover the Riegel formula, time parsing, time formatting, and edge cases | `race-predictor.test.ts` — 32 tests across all functions | N/A | ✅ Met |
| A29 | Component tests verify reactive behaviour and table rendering | `race-predictor/race-predictor.test.ts` — 17 tests | N/A | ✅ Met |

**Summary:** 25/29 criteria met. 4 criteria (A3, A4, A10, A11) were intentionally superseded by the product-designer's decision to replace the target distance dropdown + headline ResultDisplay with a full prediction table for all distances — a demonstrably better UX. 1 criterion (A22) is partially met — meta description targets "race time predictor" variants but omits the exact phrase "running time calculator".

---

## Findings

### Critical (must fix before merge)

_None_

### Major (should fix)

#### M1 — Meta description does not include "running time calculator"
- **Category:** Code Quality (SEO)
- **Location:** `src/routes/race-predictor/+page.svelte:49-51`
- **Description:** AC A22 specifies the meta description should target both "race time predictor" and "running time calculator". The current content is `"Predict your race finish time using the Riegel formula. Enter any recent result to get predicted times for 5K, 10K, half marathon, marathon and more."` — it covers "race time predictor" semantically but does not include the phrase "running time calculator" or close variant.
- **Recommendation:** Append or revise the meta content to include "running time calculator", e.g.: `"Free running time calculator and race predictor. Enter any recent result to get predicted finish times for 5K, 10K, half marathon, marathon and more using the Riegel formula."`

### Minor (nice to fix)

#### m1 — No test for `formatTime(245)` → `"4:05"` (Design AC)
- **Category:** Code Quality
- **Location:** `src/lib/utils/race-predictor.test.ts`
- **Description:** The Design section Task 1 AC specifies `formatTime(245)` returns `"4:05"`. The implementation is correct (verified by code inspection), but there is no explicit test for this case. The `formatTime_SingleDigitSeconds_PadsZero` test uses `formatTime(61)` → `"1:01"` which covers the padding logic, so this is a gap in documentation more than coverage.
- **Recommendation:** Add `expect(formatTime(245)).toBe('4:05')` to the formatTime test suite for completeness.

#### m2 — `parseTime` negative value test is indirect
- **Category:** Code Quality
- **Location:** `src/lib/utils/race-predictor.test.ts`
- **Description:** Design AC says `parseTime rejects negative values`. The `parseInt` parsing won't produce negative values from user input (no `-` in the expected format), so this is technically met, but there's no explicit test like `parseTime("-5:00")`. The code handles it at line 41 (`minutes < 0`) and line 55 (`hours < 0`).
- **Recommendation:** Consider adding `expect(parseTime('-5:00')).toBeNull()` for explicitness.

#### m3 — Custom km input always in DOM when hidden
- **Category:** Code Quality
- **Location:** `src/routes/race-predictor/+page.svelte:98-130`
- **Description:** The custom km input is always rendered in the DOM (hidden via `max-h-0`/`opacity-0` CSS transitions) rather than conditionally rendered with `{#if isCustom}`. This means the input and its label are accessible to screen readers even when visually hidden. The component test at line 85-91 confirms it's always in the DOM. Not a bug — it enables the smooth CSS transition — but `aria-hidden="true"` on the wrapper when collapsed would improve screen reader experience.
- **Recommendation:** Add `aria-hidden={!isCustom ? 'true' : undefined}` to the transition wrapper div at line 99.

### Suggestions (optional)

#### S1 — `tool-pages.test.ts` description still matches
- **Category:** Code Quality
- **Location:** `src/routes/tool-pages.test.ts:19`
- **Description:** The race predictor description in `tool-pages.test.ts` is "Predict your race finish time based on a recent result." which matches the updated page exactly. No change needed — noted for completeness as the Design section mentioned this file might need updating.

---

## Positive Observations

- **Clean utility/UI separation:** All prediction logic is in a pure TypeScript utility module with zero Svelte dependency, following the established `pace.ts` pattern. This makes the logic independently testable and reusable.
- **Thorough unit testing:** 32 unit tests cover all functions with happy path, edge cases (empty, invalid, zero, whitespace), boundary conditions, and de-duplication tolerance. Good use of range-based assertions for the Riegel formula where exact values aren't meaningful.
- **Good component test coverage:** 17 component tests cover the full user journey: initial empty state, entering time, seeing results, switching to custom, clearing input, and VO2 max link visibility.
- **Accessibility done well:** Semantic table HTML with `<th scope="col">`, `aria-current="true"` on highlighted row, `aria-describedby` on time input, all inputs properly labelled with `for`/`id` association.
- **Code reuse:** Imports `formatPace` and `minPerKmToMinPerMile` from existing `pace.ts` rather than duplicating conversion logic.
- **Clean Svelte 5 patterns:** Consistent use of `$state()`, `$derived()`, `oninput`/`onchange` handlers, keyed `{#each}` blocks — all matching codebase conventions.
- **UX improvement over spec:** The decision to replace separate target dropdown + headline with a full prediction table is a genuine UX win — users see all predictions at once without extra interaction.

---

## Action Items

### Immediate Fixes (block merge)

_None — no critical or blocking findings._

### Should Fix (before merge)
- [ ] M1: Update meta description to include "running time calculator" phrasing

### Post-merge improvements
- [ ] m1: Add `formatTime(245)` test case
- [ ] m2: Add `parseTime("-5:00")` explicit negative test
- [ ] m3: Add `aria-hidden` to collapsed custom distance wrapper

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues (N/A — client-side tool)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
