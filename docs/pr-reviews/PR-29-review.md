# PR #29 Review — Parkrun Predictor: reference distance slider

**Date:** 2026-07-02
**Author:** alanwaddington
**Branch:** feature/parkrun-distance-slider → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass with comments ⚠️ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 13/14 Met (AC3 intentionally evolved) |
| Lint | 0 errors / 0 warnings |

---

## Issues Reviewed

### Issue Hierarchy
- No tracking issue — confirmed by the author to be an ad-hoc UX refinement made while iterating on the UI, not driven by a filed issue.
- #9 — Tool: Parkrun Predictor (/parkrun) (root, CLOSED) — referenced here only as the original issue whose acceptance criteria this PR partially evolves (AC3). It is not the issue this PR closes.

> **Note:** The PR originally referenced `#6` (Training Pace Calculator) in its title, commit message, and `Closes #6` — unrelated to this change and confirmed erroneous. These references have been removed from the PR title/body, and the commit message has been amended. There is no issue for this PR to close.

---

## Changed Files Audit

### `src/lib/utils/parkrun.ts` (+22 / -20 lines)

| Property | Detail |
|----------|--------|
| Purpose | Replace `EffortLevel` type, `EFFORT_DISTANCES` record, and `effortToRaceDistanceKm()` function with `ReferenceDistance` interface and `REFERENCE_DISTANCES` array (6 entries). Change `predictParkrunTime` third parameter from `EffortLevel` string to `referenceDistanceKm: number`. |
| Issues | #9 (AC3 evolution) |
| Criteria covered | AC3 (reference distance replaces effort selector), AC4 (prediction logic preserved) |
| Quality | ✅ No issues — clean API simplification, removes indirection through effort enum |
| Test coverage | `parkrun.test.ts`: REFERENCE_DISTANCES (3 tests), predictParkrunTime (8 tests) |

### `src/lib/utils/parkrun.test.ts` (+49 / -36 lines)

| Property | Detail |
|----------|--------|
| Purpose | Replace EFFORT_DISTANCES/effortToRaceDistanceKm tests with REFERENCE_DISTANCES tests; update predictParkrunTime tests to use numeric km args; add Riegel-direction tests for references shorter/equal/longer than 5K |
| Issues | #9 (AC14) |
| Criteria covered | AC14 (unit tests cover prediction logic) |
| Quality | ✅ Well-structured — correctly splits the Riegel directionality into three separate tests for >5K, =5K, and <5K reference distances |
| Test coverage | This IS the test file |

### `src/routes/parkrun/+page.svelte` (+44 / -40 lines)

| Property | Detail |
|----------|--------|
| Purpose | Replace 3-button effort selector (Easy/Moderate/Hard) with native `<input type="range">` slider over 6 reference distances. Add explanatory copy. Change state from `effort: EffortLevel` to `referenceDistanceIndex: number`. |
| Issues | #9 (AC3 evolution) |
| Criteria covered | AC2 (toggle preserved), AC3 (selector replaced), AC5/AC6 (prediction display preserved), AC12 (optional fields), AC13 (empty state) |
| Quality | ✅ Good accessibility: proper `<label for>`, `aria-valuetext`, focus ring, keyboard navigation via native range input |
| Test coverage | `parkrun.test.ts`: slider render (AC3), default value, slider interaction, prediction display |

### `src/routes/parkrun/parkrun.test.ts` (+21 / -23 lines)

| Property | Detail |
|----------|--------|
| Purpose | Replace effort button tests with slider tests; fix `getByLabelText(/distance/i)` ambiguity by using exact string `'Distance'` |
| Issues | #9 (AC3, AC14) |
| Criteria covered | AC3 (slider tests), AC14 (component tests) |
| Quality | ✅ Good fix — exact string match avoids ambiguity with "Reference distance" label |
| Test coverage | This IS the test file |

---

## Acceptance Criteria Verification

### #9 — Tool: Parkrun Predictor (/parkrun)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC1 | `/parkrun` renders with ToolLayout, page title, meta description | `+page.svelte:128-130`, `SeoHead` component | `parkrun.test.ts:12-25` | ✅ Met |
| AC2 | Toggle switches between Recent Run and Average Pace modes | `+page.svelte:131-164` (unchanged) | `parkrun.test.ts:29-46` | ✅ Met |
| AC3 | Effort level selector offers Easy, Moderate, Hard | `+page.svelte:215-257` — **intentionally replaced** with 6-stop reference distance slider | `parkrun.test.ts:50-65` (slider tests) | ⚠️ Intentionally evolved |
| AC4 | 8K/48:00 at Easy produces predicted 5K faster than training pace | `parkrun.ts:42-51` — Marathon (42.195km) reference is equivalent to old "Easy" | `parkrun.test.ts:35-40` | ✅ Met |
| AC5 | Predicted time displayed in MM:SS | `+page.svelte:351` via `formatTime()` | `parkrun.test.ts:81-90` | ✅ Met |
| AC6 | Pace in min/km and min/mile | `+page.svelte:353-357` | `parkrun.test.ts:88-89` | ✅ Met |
| AC7 | Split table: 5 rows, even pacing | `+page.svelte:362-393`, `parkrun.ts:54-65` | `parkrun.test.ts:102-110` | ✅ Met |
| AC8 | PB comparison when PB entered | `+page.svelte:396-405`, `parkrun.ts:68-80` | `parkrun.test.ts:114-129` | ✅ Met |
| AC9 | WMA age grade when age+gender provided | `+page.svelte:408-423`, `parkrun.ts:146-156` | `parkrun.test.ts:141-150` | ✅ Met |
| AC10 | Age grade bands (World/National/Regional/Local/Recreational) | `parkrun.ts:131-137,159-162` | `parkrun.test.ts:193-225` | ✅ Met |
| AC11 | WMA per-integer-age factor data for 5K, ages 5–100 | `parkrun.ts:92-129` (unchanged) | `parkrun.test.ts:149-190` | ✅ Met |
| AC12 | Optional fields can be left blank | `+page.svelte:259-317` (unchanged) | `parkrun.test.ts:154-160` | ✅ Met |
| AC13 | Empty/invalid inputs show placeholder state | `+page.svelte:322-349` (unchanged) | `parkrun.test.ts:69-77` | ✅ Met |
| AC14 | Unit tests cover effort-to-distance mapping, prediction, splits, age grading, PB comparison | `parkrun.test.ts:1-226` | N/A (this IS the tests) | ✅ Met |

**Summary:** 13/14 criteria met. AC3 was intentionally evolved from "Easy/Moderate/Hard buttons" to a "6-stop reference distance slider" — this is a deliberate feature improvement, not a regression. The old three effort levels (Easy→Marathon, Moderate→Half Marathon, Hard→10K) are all still available as slider positions, plus three additional distances (1 Mile, 5K, 15K).

---

## Findings

### Major (should fix)

_None — the previously-flagged M1 (erroneous `#6` reference) has been resolved: the PR title/body were corrected via the GitHub API and the commit message was amended to drop the `#6` reference and `Closes #6` text. This was an ad-hoc UX change with no tracking issue, so no issue reference is expected._

### Minor (nice to fix)

#### m1 — No `aria-label` or visible label for the `<div role="tablist">`
- **Category:** Accessibility
- **Location:** `+page.svelte:132-136`
- **Description:** The tablist container has `role="tablist"` but no `aria-label`. Screen readers benefit from a label like `aria-label="Input mode"` to distinguish this from other tab groups on the page. This is pre-existing (not introduced by this PR) but worth noting.
- **Recommendation:** Add `aria-label="Input mode"` to the tablist `<div>`.

### Suggestions (optional)

#### S1 — Consider `aria-label` on the slider readout
- **Location:** `+page.svelte:250-252`
- **Description:** The "Marathon · 42.2 km" readout below the slider is visual-only. The `aria-valuetext` on the slider itself already announces the distance name, so this is cosmetic, but an `aria-live="polite"` on the readout paragraph would announce changes to screen-reader users who are not focused on the slider itself.

---

## Positive Observations

- Clean API evolution: removing the `EffortLevel` enum indirection in favour of a direct `referenceDistanceKm: number` parameter simplifies the code and makes the Riegel prediction logic more transparent.
- Thorough Riegel directionality tests: the three new tests (`ReferenceLongerThan5k`, `5kReference`, `ReferenceShorterThan5k`) correctly capture the non-obvious mathematical behaviour of the Riegel exponent when extrapolating up vs. down.
- Good fix for the `getByLabelText(/distance/i)` ambiguity — exact string matching prevents false test passes when new labels containing "distance" are added.
- Accessible slider implementation: native `<input type="range">` with `aria-valuetext`, proper `<label for>`, focus ring, and keyboard navigation (Home/End/ArrowKeys) all work correctly.
- Explanatory copy is mode-aware (`{mode === 'recent-run' ? 'entered time' : 'pace'}`) — thoughtful detail.

---

## Action Items

### Immediate Fixes (block merge)
_None — no critical or blocking findings._

### Should fix before merge
_None — M1 resolved (PR title/body corrected, commit message amended)._

### Post-merge improvements
- [ ] m1: Add `aria-label="Input mode"` to the tablist div (pre-existing, not introduced by this PR)
- [ ] S1: Consider `aria-live="polite"` on the slider readout paragraph

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
