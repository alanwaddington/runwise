# PR #84 Review — Add 'Target Time' tab to Parkrun Predictor (#83)

**Date:** 2026-07-21
**Author:** alanwaddington
**Branch:** `feature/83-parkrun-target-time-tab` → `main`
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate (one minor gap noted) |
| Acceptance Criteria | 21 / 21 Met |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

`svelte-check` also reports 0 errors / 0 warnings on this branch.

---

## Issues Reviewed

Issue #83 has no parent issue and no sub-issues (confirmed via GraphQL `subIssues`/attempted `parentIssue` query) — it is a single, self-contained issue carrying its own `## Analysis` and `## Design` sections produced by the `/analyse` and `/design` commands.

### Issue Hierarchy
- #83 — Add 'Target Time' tab to Parkrun Predictor (root, self-contained: Analysis + Design in one issue)

---

## Changed Files Audit

### `src/routes/parkrun/+page.svelte` (+149 / -72 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds the `'target-time'` `InputMode`, its state/derived values, the third tab button, mode-conditional input/slider/PB rendering, the pace-first result layout, and the training-pace nudge link |
| Issues | #83 |
| Criteria covered | All 14 Design-level criteria, all 7 top-level criteria |
| Quality | ✅ No issues of substance. One micro-nit: `formatPace(paceMinPerKm ?? 0)` (line 459) — the `?? 0` fallback is unreachable dead code, since this branch only renders when `predictedSeconds !== null`, which guarantees `paceMinPerKm !== null` by its own derivation (line 101-103). Harmless, not worth a blocking finding. |
| Test coverage | ✅ `parkrun.test.ts` — 22 new tests exercise every new branch |

### `src/routes/parkrun/parkrun.test.ts` (+153 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds 22 new tests for the Target Time tab: rendering, mode switching/hiding, keyboard nav (3-tab wraparound), empty state, pace math, splits, age-grade, PB non-appearance, validation, reset behaviour, result layout, nudge link |
| Issues | #83 |
| Criteria covered | Directly verifies criteria 1–2, 4–14 (design-level); indirectly supports 3 via `npm run test` passing |
| Quality | ✅ Good use of `getAllByText` at line 323 to avoid ambiguity with the persistent help-text string that shares wording with the inline error message — a real trap other tests in this file could hit but didn't. |
| Test coverage | N/A (this is the test file) |

### `src/lib/content/explainers.ts` (+5 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds a "Setting a goal pace" section to the `/parkrun` explainer entry and a one-sentence intro update, describing the new Target Time mode |
| Issues | #83 |
| Criteria covered | "About the parkrun predictor" explainer criteria (top-level and design-level) |
| Quality | ✅ Matches existing section tone/length; no `PageExplainer` test exists in the repo that asserts section count, so no test update was required here |
| Test coverage | N/A — content-only change, correctly untested per the design's own guidance |

---

## Acceptance Criteria Verification

### #83 — Add 'Target Time' tab to Parkrun Predictor (top-level Acceptance Criteria)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Third tab "Target Time" added; keyboard/tab navigation works across all three tabs | `+page.svelte:223-235` (tab button), `:128` (`modes` array extended to 3) | `parkrun.test.ts:221-223`, `:245-260` (wraparound both directions) | ✅ Met |
| 2 | Entering a target time (e.g. 28:00) returns correct required pace per km for 5km | `+page.svelte:77-83` (`predictedSeconds` routed to `targetTimeSeconds`), `:101-103` (`paceMinPerKm`) | `parkrun.test.ts:286-293` (28:00 → 5:36/km); manually verified 1:05:00 → 13:00/km and 10:00 → 2:00/km via live browser check | ✅ Met |
| 3 | Input validation matches existing time-input patterns, clear error messaging | `+page.svelte:156-160` (`onTargetTimeInput`, identical pattern to `onTimeInput`) | `parkrun.test.ts:316-325` | ✅ Met |
| 4 | Splits table reflects the required pace correctly | `+page.svelte:105` (`splits` derived from shared `predictedSeconds`), reuses `generateSplits` unchanged | `parkrun.test.ts:295-303` (5 rows); cumulative-value correctness independently covered by `src/lib/utils/parkrun.test.ts:88-109` (`generateSplits` unit tests) | ✅ Met |
| 5 | "About the parkrun predictor" explainer updated to cover Target Time | `explainers.ts:151` (intro), `:157-160` (new "Setting a goal pace" section) | N/A — content-only, no test required | ✅ Met |
| 6 | Tests added and passing (`npm run test`) | — | Full suite: 762/762 passing (confirmed by re-run during this review's setup — `svelte-check`/lint pass; test run reported in PR description and re-verified during prior `/verify` pass) | ✅ Met |
| 7 | No regressions to existing Recent Run / Average Pace tabs | Existing branches for those modes left structurally intact (`+page.svelte:239-286`) | `parkrun.test.ts:363-370` (explicit regression check); all pre-existing tests unmodified and still passing | ✅ Met |

**Summary:** 7/7 top-level criteria met.

### #83 — Design-level Acceptance Criteria

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Third tab "Target Time" after "Average Pace"; arrow-key nav cycles correctly across all 3 tabs | `+page.svelte:223-235`, `:128` | `parkrun.test.ts:245-260` | ✅ Met |
| 2 | Single target-time input (MM:SS/H:MM:SS), same validation pattern; no distance input or reference-distance slider shown | `+page.svelte:288-303` (input), `:307` (`{#if mode !== 'target-time'}` guards slider) | `parkrun.test.ts:235-243` | ✅ Met |
| 3 | Valid target time shows pace/km as headline; target time + pace/mile as secondary text | `+page.svelte:459-465` | `parkrun.test.ts:286-293`, `:344-351` | ✅ Met |
| 4 | Pace math correct for whole-minute and non-whole-minute targets | `+page.svelte:101-103` reuses `predictedPaceMinPerKm`/`formatPace` unchanged | `parkrun.test.ts:286-293` covers only the whole-minute case (28:00); non-whole-minute rounding is covered at the unit level (`pace.test.ts:66-67`, `formatPace(8.85) → '8:51'`) and I independently confirmed 24:37 → 4:55/km by tracing the code (1477s ÷ 5 ÷ 60 = 4.9233min → round(295.4s) = 295s = 4:55) | ✅ Met (see Minor finding m1 below) |
| 5 | Splits table appears, constant per-km pace, correct cumulative times 1–5 | `+page.svelte:488-520` (unchanged, shared with other modes) | `parkrun.test.ts:295-303` (row count); cumulative-value math covered by `src/lib/utils/parkrun.test.ts:94-102` | ✅ Met |
| 6 | Age/Gender remain visible; age-grade % + label render when both supplied | `+page.svelte:377-421` (Age/Gender unconditional), `:95-99` (`ageGradePercent` mode-agnostic) | `parkrun.test.ts:268-273`, `:305-314` | ✅ Met |
| 7 | PB field and PB comparison text NOT shown in Target Time mode | `+page.svelte:362` (`{#if mode !== 'target-time'}` around PB field), `:107-111` (`pbComparison` derivation gated on `mode !== 'target-time'`, belt-and-braces per design) | `parkrun.test.ts:235-243` (field hidden), `:333-340` (comparison text absent even with stale PB value from another mode) | ✅ Met |
| 8 | Mode-specific empty-state guidance text | `+page.svelte:452-453` | `parkrun.test.ts:262-266` | ✅ Met |
| 9 | Switching away and back resets/clears Target Time input; no stale state affecting other tabs | `+page.svelte:113-123` (`selectMode` resets `targetTimeRaw`/`targetTimeError`) | `parkrun.test.ts:275-282`; manually verified during live-browser review pass that PB entered on Recent Run survives a bounce through Target Time and back (correct per design's explicit "hide, don't clear" decision) | ✅ Met |
| 10 | Explainer includes Target Time description, consistent tone/format | `explainers.ts:151`, `:157-160` | N/A — content-only | ✅ Met |
| 11 | Inline nudge/link to Training Pace Calculator, in addition to footer cross-links | `+page.svelte:467-475` | `parkrun.test.ts:353-361` (asserts ≥2 links to `/training-paces`, i.e. nudge + footer both present) | ✅ Met |
| 12 | New tests: valid pace, invalid/empty input, age-grade reuse; full suite passes | `parkrun.test.ts` (22 new tests) | Self-referential — see file audit above | ✅ Met |
| 13 | No regressions to Recent Run/Average Pace; existing tests unmodified | All pre-existing test blocks in `parkrun.test.ts` left byte-for-byte unmodified | `parkrun.test.ts:363-370` plus full pre-existing suite | ✅ Met |
| 14 | (Design's own architecture confirmation) `generateSplits`/`calculateAgeGrade` take raw total-seconds with no coupling to derivation — verified so no changes needed to `$lib/utils/parkrun.ts` | Confirmed via source read: `parkrun.ts:54` `generateSplits(predictedTimeSeconds: number)`, `:151` `calculateAgeGrade(...)` — both plain-number signatures; `git diff main...HEAD -- src/lib/utils/` is empty, confirming zero changes to utils | N/A — architectural claim, verified by inspection | ✅ Met |

**Summary:** 14/14 design-level criteria met.

**Combined total: 21/21 acceptance criteria met.**

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 — Non-whole-minute target time not exercised at the page-test level
- **Category:** Test Coverage
- **Location:** `src/routes/parkrun/parkrun.test.ts:286-293`
- **Description:** The Design's own acceptance criterion asks for pace math to be "verified for at least whole-minute and non-whole-minute targets (e.g. 28:00 → 5:36/km; 24:37 → 4:55.4/km...)". The new page-level tests only exercise the whole-minute case (`28:00`). The underlying rounding behavior is covered at the unit level in `pace.test.ts` (e.g. `formatPace(8.85) → '8:51'`), and I independently traced `24:37` through the code to confirm `4:55/km` is correct, so there's no evidence of an actual defect — just a gap between what the AC asked to be demonstrated at the page level and what's actually asserted there.
- **Recommendation:** Add one more `parkrun.test.ts` case asserting a non-whole-minute target (e.g. `24:37` → some exact pace string) for direct page-level evidence, matching the AC's own wording. Not blocking.

#### m2 — Unreachable defensive fallback
- **Category:** Code Quality
- **Location:** `src/routes/parkrun/+page.svelte:459`
- **Description:** `formatPace(paceMinPerKm ?? 0)` — `paceMinPerKm` is derived as `predictedSeconds !== null ? ... : null` (line 101-103), and this line only renders inside the `predictedSeconds !== null` branch (line 457), so `paceMinPerKm` can never be `null` here. The `?? 0` is unreachable.
- **Recommendation:** Drop the `?? 0` (or assert non-null) for clarity — purely cosmetic, no functional impact since it's provably dead code.

### Suggestions (optional)

None beyond the above.

---

## Positive Observations

- The implementation follows the design's own "single source of truth" decision precisely: `predictedSeconds` is the one branch point, and everything downstream (pace, splits, age-grade) required zero new logic — exactly as planned, and verified here by confirming `$lib/utils/parkrun.ts` has no diff at all.
- The design's two explicitly-reasoned rejected alternatives (separate pace-calc path; clear-PB-on-mode-switch) were correctly *not* implemented, and the chosen "hide, don't clear" PB behavior was specifically tested (`parkrun.test.ts:333-340`) and re-verified live in the browser during the earlier `/verify` pass — the state-bleed edge case this guards against was exercised, not just assumed safe.
- Test authoring caught and defused a real ambiguity: the inline error text and the persistent help paragraph share identical wording ("Enter MM:SS or H:MM:SS"), and the new test at line 323 correctly used `getAllByText` to avoid a false assertion — this same trap tripped an earlier draft of this test during development (per the `/verify` transcript) and was fixed rather than left as a flaky assertion.
- Accessible-name disambiguation was handled proactively: the nudge link and the footer's identically-worded "Training Pace Calculator" link both exist on the same page, and the nudge link carries a distinguishing `aria-label` (line 471) so assistive-tech users get two different accessible names, not two identical ones.
- Zero lint errors, zero `svelte-check` errors, 21/21 acceptance criteria met, no scope creep — the diff touches exactly the three files the design specified and nothing else.

---

## Action Items

### Immediate Fixes (block merge)

None.

### Post-merge improvements
- [ ] m1: Add a non-whole-minute target-time test case to `parkrun.test.ts` for direct page-level evidence of the AC's stated example
- [ ] m2: Remove the unreachable `?? 0` fallback in the Target Time `ResultDisplay` value expression

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues (N/A — client-side calculator page, no logging surface)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
