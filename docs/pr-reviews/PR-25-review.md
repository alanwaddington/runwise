# PR #25 Review — Add Parkrun Predictor tool (#9)

**Date:** 2026-07-02
**Author:** alanwaddington
**Branch:** feature/9-parkrun-predictor -> main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 14/14 Met |
| Lint | 0 errors / 0 warnings |

---

## Issues Reviewed

### Issue Hierarchy
- #9 — Tool: Parkrun Predictor (/parkrun) (root — contains both `## Analysis` and `## Design` sections)

---

## Changed Files Audit

### `src/lib/utils/parkrun.ts` (+160 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | New utility module: effort-to-distance mapping, Riegel-based 5K prediction, even-pacing split generation, PB comparison, and WMA age grading (calculateAgeGrade + getAgeGradeLabel) using real per-age WMA/Alan Jones 2025 factor data |
| Issues | #9 |
| Criteria covered | AC3 (effort mapping), AC4 (prediction logic), AC7 (split generation), AC8 (PB comparison), AC9 (age grade calculation), AC10 (age grade labels), AC11 (WMA data), AC14 (unit-testable functions) |
| Quality | ✅ No issues — clean separation of domain logic from presentation, proper null handling for edge cases, well-typed exports |
| Test coverage | `src/lib/utils/parkrun.test.ts` — 37 tests covering all exported functions |

### `src/lib/utils/parkrun.test.ts` (+212 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Unit tests for all parkrun utility functions: effort mapping, prediction, splits, PB comparison, age grading, label bands |
| Issues | #9 |
| Criteria covered | AC14 (unit tests for all domain functions) |
| Quality | ✅ Good test naming convention (`MethodName_Scenario_ExpectedResult`), covers happy path, edge cases (zero/negative inputs, boundary ages), and relative comparisons between effort levels |
| Test coverage | N/A — this is the test file itself |

### `src/routes/parkrun/+page.svelte` (+423 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Full page implementation replacing stub: tablist input mode toggle (Recent Run / Average Pace), effort selector, optional PB/age/gender fields, reactive results display (predicted time, pace, split table, PB comparison, age grade badge), footer cross-links, SEO metadata |
| Issues | #9 |
| Criteria covered | AC1 (route + title + meta), AC2 (toggle), AC3 (effort selector), AC4/5/6 (prediction display + format + pace), AC7 (split table), AC8 (PB comparison), AC9/10 (age grade), AC12 (optional fields), AC13 (empty state) |
| Quality | ✅ Follows existing codebase conventions exactly — Svelte 5 runes ($state/$derived), Tailwind utility classes, dark: variants, ToolLayout/InputField/ResultDisplay component reuse, accessible tablist with ArrowLeft/ArrowRight keyboard nav, aria-pressed effort buttons |
| Test coverage | `src/routes/parkrun/parkrun.test.ts` — 21 component tests |

### `src/routes/parkrun/parkrun.test.ts` (+191 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Component tests for the Parkrun Predictor page using @testing-library/svelte |
| Issues | #9 |
| Criteria covered | AC1 (title test), AC2 (tab toggle), AC3 (effort buttons), AC4/5/6 (prediction display), AC7 (split table rows), AC8 (PB comparison presence/absence), AC9/10 (age grade presence/absence), AC12 (optional fields blank), AC13 (empty state) |
| Quality | ✅ Good coverage of AC-aligned scenarios, tests both positive and negative cases (e.g. PB comparison hidden when blank), verifies accessibility attributes (aria-selected, aria-pressed) |
| Test coverage | N/A — this is the test file itself |

---

## Acceptance Criteria Verification

### #9 — Tool: Parkrun Predictor (/parkrun)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC1 | `/parkrun` route renders with `ToolLayout`, page title "Parkrun Predictor — Runwise", and meta description containing "parkrun predictor", "parkrun pace calculator" | `+page.svelte:128-140` — title tag, meta description with both phrases, ToolLayout component | `parkrun.test.ts:22-25` (title test) | ✅ Met |
| AC2 | Toggle switches between "Recent Run" (distance + time) and "Average Pace" (pace + distance) input modes | `+page.svelte:142-223` — tablist with two tab buttons, conditional rendering of input fields, `selectMode()` clears fields on switch | `parkrun.test.ts:29-46` (tab rendering + switch test) | ✅ Met |
| AC3 | Effort level selector offers Easy, Moderate, and Hard options | `+page.svelte:226-248` — three buttons with `aria-pressed`, default 'moderate' | `parkrun.test.ts:50-67` (button presence + default + toggle) | ✅ Met |
| AC4 | Entering 8K in 48:00 at Easy effort produces a predicted 5K time faster than training pace | `parkrun.ts:39-49` — `predictParkrunTime()` maps Easy→marathon distance, Riegel predicts to 5K. Verified: 8K/48:00/Easy → 1584s (26:24), faster than naive 1800s (30:00) | `parkrun.test.ts:39-43` (unit), `parkrun.test.ts:83-92` (component) | ✅ Met |
| AC5 | Predicted time displayed in MM:SS format | `+page.svelte:342` — `formatTime(predictedSeconds)` via ResultDisplay | `parkrun.test.ts:83-92` (checks 'Predicted Parkrun Time' visible) | ✅ Met |
| AC6 | Pace shown in both min/km and min/mile | `+page.svelte:344-348` — `formatPace(paceMinPerKm)` + `formatPace(minPerKmToMinPerMile(...))` | `parkrun.test.ts:90-91` (checks /km and /mile text) | ✅ Met |
| AC7 | Split table shows 5 rows (1K–5K) with cumulative times based on even pacing | `+page.svelte:352-384` — table with 5 rows from `generateSplits()`, columns KM/Cumulative/Split Pace | `parkrun.test.ts:104-112` (5 tbody rows), `parkrun.test.ts:76-103` (unit: even splits for 1500s) | ✅ Met |
| AC8 | When PB entered, comparison message shows difference | `+page.svelte:387-396` — conditional rendering of `pbComparison.description`, color-coded by delta sign | `parkrun.test.ts:116-131` (hidden when blank, shown when entered) | ✅ Met |
| AC9 | When age and gender provided, WMA age grade percentage displayed | `+page.svelte:399-413` — conditional on `ageGradePercent !== null`, displays `ageGradePercent.toFixed(1)%` | `parkrun.test.ts:143-152` (shows percentage when age+gender set) | ✅ Met |
| AC10 | Age grade percentage accompanied by qualitative label (World/National/Regional/Local/Recreational) | `+page.svelte:400-413` — `getAgeGradeLabel()` → colored badge with `AGE_GRADE_COLOURS` map | `parkrun.test.ts:143-152` (verifies % visible), `parkrun.test.ts:181-209` (unit: all band boundaries) | ✅ Met |
| AC11 | Age grading uses real WMA per-integer-age factor data (updated from original polynomial wording) | `parkrun.ts:90-127` — `AGE_FACTORS` contains exact per-age (5–100) factors for both genders from WMA/Alan Jones 2025 road-running data | `parkrun.test.ts:136-178` (peak-age ≈100%, older runner higher grade, boundary ages null) | ✅ Met |
| AC12 | All optional fields (PB, age, gender) can be left blank without breaking prediction | `+page.svelte:74-90` — conditional derivations: `pbComparison` null when `pbSeconds` null, `ageGradePercent` null when age/gender missing | `parkrun.test.ts:156-162` (prediction works with blank optionals) | ✅ Met |
| AC13 | Invalid or empty required inputs show placeholder state, not errors | `+page.svelte:313-340` — `predictedSeconds === null` renders empty state with icon + contextual message | `parkrun.test.ts:71-79` (empty state shown, results hidden) | ✅ Met |
| AC14 | Unit tests cover effort-to-distance mapping, Riegel prediction via effort, split generation, WMA age grading, and PB comparison logic | `parkrun.test.ts` — 37 tests across 6 describe blocks: EFFORT_DISTANCES, effortToRaceDistanceKm, predictParkrunTime, generateSplits, compareToPb, calculateAgeGrade, getAgeGradeLabel | N/A | ✅ Met |

**Summary:** 14/14 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 — "parkrun time calculator" SEO keyword not in meta description

- **Category:** SEO
- **Location:** `+page.svelte:131-133`
- **Description:** The original issue's Tasks section lists three target keywords: "parkrun predictor", "parkrun pace calculator", and "parkrun time calculator". AC1 only requires the first two (which are present), but the third keyword ("parkrun time calculator") appears in the issue's task list as a target and is absent from the meta description. This is not an AC failure but may be a missed SEO opportunity.
- **Recommendation:** Consider adding "parkrun time calculator" to the meta description, e.g. "Free parkrun predictor, parkrun pace calculator, and parkrun time calculator for runners..."

### Suggestions (optional)

None.

---

## Positive Observations

- Clean TDD workflow: 4 commits in clear progression (core utils → age grading → page + component tests → AC1 meta fix), each with passing tests and lint
- Thorough test coverage: 37 unit tests for domain logic + 21 component tests = 58 new tests, covering all ACs plus edge cases (zero/negative inputs, singular/plural wording, boundary ages, band thresholds)
- Excellent accessibility: tablist with full keyboard navigation (ArrowLeft/ArrowRight), `aria-selected` on tabs, `aria-pressed` on effort buttons, `aria-describedby` on pace unit
- Perfect reuse of existing codebase patterns: ToolLayout, InputField, ResultDisplay, $state/$derived runes, Tailwind classes, dark mode variants — indistinguishable from the existing tools
- Age grading implementation uses real, verified WMA source data rather than fabricated coefficients or rough approximations

---

## Action Items

### Immediate Fixes (block merge)

None.

### Post-merge improvements

- [ ] m1: Consider adding "parkrun time calculator" to meta description for additional SEO keyword coverage

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
