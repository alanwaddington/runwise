# PR #102 Review — Add HR mode, Race-Prep mode, and Mixed-Zone workouts to Workout Suggestions (#100 Phase 1)

**Date:** 2026-08-14
**Author:** alanwaddington
**Branch:** feature/100-phase1-hr-raceprep-mixedzone-workouts → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Original Assessment | Fail ❌ |
| Post-fix Status | ✅ All findings fixed — see Outcomes below |
| Risk Level | Medium (at time of review) |
| Test Coverage | Gap closed — see M1 Outcome |
| Acceptance Criteria (Phase 1 scope) | 31 Met / 33 Total (2 disclosed gaps: AC-1.2, AC-1.8 — unchanged, out of scope for this fix pass) |
| Lint | 4 errors → 0 errors, 0 warnings (fixed) |

The two Not-Met ACs (AC-1.2, AC-1.8) are honestly disclosed in the PR's own "Known gaps" section — not silent omissions, and out of scope for this findings-fix pass. What originally tipped this to Fail was a genuine, verified, **undisclosed** functional bug (M1) and 4 lint errors that contradicted the PR's own "`npm run lint` clean" test-plan checkbox (M2), both introduced by the two follow-up commits (`47d71a6`, `3d6bb0b`) added after Task 6 closed out. All findings (M1, M2, m1, S1) have since been fixed — see each finding's Outcome below. Full suite re-verified green (1187/1187) after fixes.

---

## Issues Reviewed

Issue #100 has no GitHub sub-issues — it is a single, self-contained issue whose body embeds the full Analysis, Design, and Task/AC breakdown for all three planned phases. No parent issue exists either (`gh api graphql` confirms `parentIssue` — checked and issue #100 has none).

### Issue Hierarchy
- #100 — Enhancement: Expand workout generation with HR mode, new patterns, and advanced formats (root; self-contained analysis + design + Tasks 1-13 across Phases 1-3)
  - PR #102 implements Phase 1 only: Tasks 1-6 (AC-1.x, AC-2.x, AC-6.x, plus AC-8.2/8.3/8.4/8.5 as assigned to Task 5/6)
  - Phase 2 (Tasks 7-12: AC-3.x fartlek, AC-4.x progression/decay, AC-5.x rep expansion, AC-7.x recovery, AC-8.1/8.6/8.7/8.8) and Phase 3 (Task 13) are **not in scope for this PR** and are excluded from the AC count above, per the PR's own stated scope ("Phase 1 (MVP, Tasks 1-6)").
  - #103 — Race-Prep: extend below 4 weeks with Race Week and Post-Race phases (follow-up issue, opened during this session's design discussion; explicitly out of scope for #102, not counted against it).

---

## Changed Files Audit

### `src/lib/utils/hr-zones.ts` (+50/-0)
| Property | Detail |
|----------|--------|
| Purpose | New module: `calculateDanielsLthrZones` — Daniels E/M/T/I/R HR zone mapping from LTHR with per-zone confidence tier |
| Issues | #100 Task 1 |
| Criteria covered | AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.5, AC-2.6 |
| Quality | ✅ No issues. The AC-2.6 deviation (R zone `>120% LTHR` open-ended, not literal `<60% LTHR`) is documented in a code comment (lines 195-201) and matches the PR body's disclosure — a defensible, disclosed judgment call, not a silent defect. |
| Test coverage | `hr-zones.test.ts`, 58 tests — zone boundaries, confidence tiers, physiological range clamping |

### `src/lib/utils/hr-workouts.ts` (+490/-0)
| Property | Detail |
|----------|--------|
| Purpose | New module: `buildHrWorkoutsResult` — duration-based HR workout generation (17 workouts: E×3, M×3, T×3, I×4, R×4), fallback pace when no race result |
| Issues | #100 Task 2 |
| Criteria covered | AC-2.7, AC-2.8, AC-2.9, AC-2.12 |
| Quality | ✅ No issues. I/R zone descriptions correctly omit pace (HR-prescribed only); informational pace is surfaced one level up in `HrWorkoutZone`, matching AC-2.9's "pace as informational" intent. |
| Test coverage | `hr-workouts.test.ts`, 16 tests |

### `src/lib/utils/race-prep.ts` (+302/-0)
| Property | Detail |
|----------|--------|
| Purpose | New module: `buildRacePrepResult` — periodized 4-8 week plan (Build/Strength/Peak/Taper) via curation of existing zone-workout builders, across Pace/Power/HR modality |
| Issues | #100 Task 3, plus post-Task-6 UX follow-up (commit `47d71a6`) extending modality and variable plan length |
| Criteria covered | AC-1.1, AC-1.3, AC-1.4, AC-1.5, AC-1.6, AC-1.9, AC-1.10, AC-2.10 |
| Quality | ⚠️ **Lint error**: line 7 imports `PowerZone` but never uses it (`@typescript-eslint/no-unused-vars`) — introduced in `47d71a6`. AC-1.2 (distance-specific phase periodization) and AC-1.8 (time-band filter) are genuinely not implemented — both honestly listed in the PR's "Known gaps." |
| Test coverage | `race-prep.test.ts`, 20 tests — eligibility boundaries (3/4/8/9 weeks, past races), all 3 modalities, 5K/10K/HM/Marathon |

### `src/lib/utils/mixed-zone-workouts.ts` (+178/-0)
| Property | Detail |
|----------|--------|
| Purpose | New module: `buildMixedZoneWorkouts` — 3 two-zone-blend workouts (E+M, M+T, T+I) |
| Issues | #100 Task 4 |
| Criteria covered | AC-6.1, AC-6.2, AC-6.3, AC-6.4, AC-6.5 |
| Quality | ✅ No issues. Intensity strictly increases base→surge for every pair (`ZONE_INTENSITY`: E<M<T<I<R), satisfying AC-6.4's "no inversions" requirement by construction. |
| Test coverage | `mixed-zone-workouts.test.ts`, 11 tests |

### `src/lib/utils/workout-patterns.ts` (+111/-0)
| Property | Detail |
|----------|--------|
| Purpose | New module: `buildRacePaceTempoWorkout`, `buildRacePaceRepsWorkout` — race-pace-specific Race-Prep variants |
| Issues | #100 Task 3 |
| Criteria covered | Supports AC-1.3/AC-1.4 (race-pace-derived workouts) |
| Quality | ✅ No issues |
| Test coverage | `workout-patterns.test.ts`, 12 tests |

### `src/lib/utils/segment-targets.ts` (+41/-0)
| Property | Detail |
|----------|--------|
| Purpose | Adds `getSegmentBpmRangeNumeric`/`getSegmentBpmRange` — narrows an HR zone band to a per-segment target, mirroring the existing pace/power narrowing functions |
| Issues | #100 Task 2 (HR modal display), Task 5 (FIT export prerequisite) |
| Criteria covered | Supports AC-2.9, AC-2.11 |
| Quality | ⚠️ By design, returns `null` for open-ended zone strings (`< N bpm`, `> N bpm`) — correctly tested at this layer (`getSegmentBpmRangeNumeric_OpenEndedZone_ReturnsNull`), but this `null` is not handled gracefully one layer up in `fit-export.ts`. See **C1**. |
| Test coverage | `segment-targets.test.ts` — new HR-specific tests added, including the open-ended-zone case |

### `src/lib/utils/fit-export.ts` (+36/-13)
| Property | Detail |
|----------|--------|
| Purpose | Extends FIT export to `kind: 'hr'` — genuine heart-rate-target encoding via FIT's `workoutHr` bpm+100 convention |
| Issues | #100 Task 5 (post-Task-6 follow-up, commit `47d71a6`) |
| Criteria covered | Supports AC-2.7 (HR workouts fully usable, including export) |
| Quality | ❌ **Major bug (C1)**: `computeStepTarget`'s HR branch throws when `getSegmentBpmRangeNumeric` returns `null` — which it always does for E-zone and R-zone bpm ranges (both are inherently open-ended: `< N bpm` / `> N bpm`). FIT download is broken for 2 of 5 HR zones. See Findings. |
| Test coverage | `fit-export.test.ts` — new HR test uses only zone `I` (closed range `160–172 bpm`); no E or R zone case exists, so the bug isn't caught by the unit suite |

### `src/lib/utils/workouts.ts` (+21/-1)
| Property | Detail |
|----------|--------|
| Purpose | Adds `pattern?: WorkoutPattern` and `zone?: ZoneKey` optional fields to `Workout`; exports previously-private `midpointPaceMinKm` for reuse |
| Issues | #100 Tasks 2-5 (shared plumbing) |
| Criteria covered | Supports AC-1.10/AC-8.2 (additive-only, no regression) |
| Quality | ✅ No issues — both new fields are optional, verified non-breaking by the full regression pass |
| Test coverage | Covered indirectly via every consuming module's tests; no dedicated new test needed for two optional fields |

### `src/lib/components/PatternBadge.svelte` (+46/-0, new file)
| Property | Detail |
|----------|--------|
| Purpose | Single consolidated pattern-badge component, replacing two inconsistent inline badge styles |
| Issues | #100 Task 5 (post-Task-6 follow-up, commit `47d71a6`) |
| Criteria covered | AC-6.6 (mixed-zone labeling), forward-compatible with Phase 2's fartlek/progression/decay patterns |
| Quality | ✅ No issues — colorblind-safe (glyph + neutral pill, no per-type hue) |
| Test coverage | No dedicated component test; exercised indirectly via `workouts.test.ts` integration tests that assert badge text/visibility |

### `src/lib/components/WorkoutRail.svelte` (+127/-0, new file)
| Property | Detail |
|----------|--------|
| Purpose | Horizontal scroll-snap rail with keyboard nav, uniform card-height measurement, and scroll-affordance chevrons |
| Issues | #100 Task 5 (post-Task-6 follow-up, commit `47d71a6`) |
| Criteria covered | AC-8.3 (graceful handling of increased workout count), AC-8.5 (mobile-responsive) — both currently unchecked `[ ]` in the issue body, but this component (plus this session's own Playwright mobile-viewport verification, see Positive Observations) demonstrates they are in fact met. Flagging the stale issue checkboxes as a minor process note, not a code defect. |
| Quality | ⚠️ **Lint errors** at lines 85 and 116 — the left/right scroll-affordance `<button>`s are missing the project's required `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-*` classes (`runwise/require-focus-visible`, a custom project ESLint rule). Real accessibility regression: these buttons currently have no visible keyboard-focus indicator. |
| Test coverage | No dedicated component test; keyboard scroll behavior (`ArrowLeft`/`ArrowRight`) is untested at either the unit or integration level |

### `src/routes/workouts/+page.svelte` (+936/-214)
| Property | Detail |
|----------|--------|
| Purpose | Full UI integration: HR tab, Race-Prep tab (+ Train-by sub-selector), Mixed-Zone Sessions section, card-rail redesign, un-stuck mode-toggle tabs |
| Issues | #100 Task 5, plus two post-Task-6 follow-up commits (`5b10486`, `47d71a6`, `3d6bb0b`) |
| Criteria covered | AC-1.6, AC-1.7, AC-2.10, AC-2.11, AC-6.6, AC-6.7, AC-8.3, AC-8.5 |
| Quality | ⚠️ **Lint error** at line 1470 — the Race-Prep week-stepper `<button>` is also missing the required focus-visible classes, same `runwise/require-focus-visible` rule. AC-1.8 confirmed genuinely unimplemented: no `fitsBand`/`timeBand` reference anywhere in the Race-Prep render branch. |
| Test coverage | `workouts.test.ts`, 48 integration tests — tab visibility/switching, all 3 Race-Prep modalities, mixed-zone rendering, FIT-button presence. Gap: FIT-download tests check the button is present/enabled but never actually click "Download as .FIT" for an HR-modality card, so C1 is invisible to the suite (see C1 for detail). |

### `src/routes/workouts/workouts.test.ts` (+274/-5)
| Property | Detail |
|----------|--------|
| Purpose | Integration tests for all of the above |
| Issues | #100 Task 5, Task 6 |
| Criteria covered | Broad UI-level coverage across AC-1.x, AC-2.x, AC-6.x |
| Quality | ✅ Well-structured, but see the FIT-download coverage gap noted in C1 |
| Test coverage | N/A (this is the test file) |

### `src/lib/components/InputField.svelte` (+1/-1)
| Property | Detail |
|----------|--------|
| Purpose | Adds `'date'` to the input `type` union, for the race-date field |
| Issues | #100 Task 5 |
| Quality | ✅ No issues — trivial, non-breaking type widening |
| Test coverage | Exercised indirectly via `workouts.test.ts`'s race-date tests |

### Documentation (`docs/Guides/*/*.md`/`.html`/`.pdf`)
| Property | Detail |
|----------|--------|
| Purpose | User Guide + Developer Guide updated for HR mode, Race-Prep, mixed-zone workouts, per `CLAUDE.md`'s `docs:generate` workflow |
| Issues | #100 Task 6 |
| Criteria covered | AC-8.4 |
| Quality | ✅ `.md` sources changed with corresponding `.html`/`.pdf` regenerated in lockstep, matching CLAUDE.md's documented process |
| Test coverage | N/A (documentation) |

---

## Acceptance Criteria Verification

Only Phase 1 (Tasks 1-6)-scoped ACs are verified below, per the PR's own stated scope. Phase 2/3 ACs (AC-3.x, AC-4.x, AC-5.x, AC-7.x, AC-8.1/8.6/8.7/8.8) are excluded — not implemented, not claimed, tracked separately.

### #100 — Task 1-6 scope (PR #102)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC-1.1 | 4-week progression generated for 5K/10K/HM/Marathon | `race-prep.ts:294-299` | `race-prep.test.ts:75-78` (parametrized) | ✅ Met |
| AC-1.2 | Phase varies by distance-specific periodization | Not implemented — same 4-phase sequence for every distance | — | ❌ Not Met (disclosed) |
| AC-1.3 | Each week shows 3-5 workouts | `race-prep.ts:273-284` | `race-prep.test.ts:101` | ✅ Met |
| AC-1.4 | Workouts based on race goal pace | `race-prep.ts:260` | `race-prep.test.ts` (per-distance) | ✅ Met |
| AC-1.5 | Race-Prep visible 4-8 weeks, hidden outside | `race-prep.ts:58-64` | `race-prep.test.ts:28-45`, `workouts.test.ts:390,401` | ✅ Met |
| AC-1.6 | Works in Pace/Power/HR with modality-specific optimization | `race-prep.ts:262-267` (`buildPaceModality`/`buildPowerModality`/`buildHrModality`) | `race-prep.test.ts:225-267`, `workouts.test.ts:489-530` | ✅ Met |
| AC-1.7 | Toggle race-prep/normal without losing selections | `+page.svelte:322-343` (`switchMode`) | `workouts.test.ts:455` (explicit AC-1.7 test) | ✅ Met |
| AC-1.8 | Respects time-band filter | Not wired — no `fitsBand`/`timeBand` reference in Race-Prep render | — | ❌ Not Met (disclosed) |
| AC-1.9 | Tested with 5K/10K/HM/Marathon | `race-prep.test.ts:75-78` | Same | ✅ Met |
| AC-1.10 | No regression to existing pace/power output | `workouts.ts` diff additive-only (2 optional fields) | Full suite 1165/1165 | ✅ Met |
| AC-2.1 | LTHR zone mapping with confidence badges | `hr-zones.ts:202-225` | `hr-zones.test.ts` | ✅ Met |
| AC-2.2 | E: ≤60% LTHR, High confidence | `hr-zones.ts:203` | `hr-zones.test.ts` | ✅ Met |
| AC-2.3 | M: 60-90% LTHR, High confidence | `hr-zones.ts:204` | `hr-zones.test.ts` | ✅ Met |
| AC-2.4 | T: 90-105% LTHR, Medium confidence | `hr-zones.ts:205` | `hr-zones.test.ts` | ✅ Met |
| AC-2.5 | I: 105-120% LTHR, Low confidence | `hr-zones.ts:206` | `hr-zones.test.ts` | ✅ Met |
| AC-2.6 | R: <60% LTHR, High confidence | Implemented as `>120% LTHR` open-ended (disclosed, documented deviation — R is Daniels' Repetition zone, not generic Recovery) | `hr-zones.test.ts` | ✅ Met (as reinterpreted; disclosed) |
| AC-2.7 | HR tab alongside Pace/Power | `+page.svelte` mode tablist | `workouts.test.ts:307` | ✅ Met |
| AC-2.8 | 15-17 HR-zone workouts | 17 confirmed (E×3+M×3+T×3+I×4+R×4) | `hr-workouts.test.ts:69` | ✅ Met |
| AC-2.9 | I/R shows HR primary, pace informational | `+page.svelte:1371-1373`; `hr-workouts.ts` descriptions never bake in pace for I/R | `hr-workouts.test.ts:94` | ✅ Met |
| AC-2.10 | Seamless toggle Pace/Power/HR | Top-level tabs + Race-Prep's independent "Train by" sub-selector | `workouts.test.ts:489-530` | ✅ Met |
| AC-2.11 | HR zone mapping documented in UI | `+page.svelte:1307-1345` (table + confidence tooltips) | Implicit via rendering tests | ✅ Met |
| AC-2.12 | HR workouts unit tested per zone | `hr-workouts.test.ts`, 16 tests | Same | ✅ Met |
| AC-6.1 | E+M: 25-40min base, 2-3 marathon bridges (2-3km) | `mixed-zone-workouts.ts:46-82` | `mixed-zone-workouts.test.ts` | ✅ Met |
| AC-6.2 | M+T: base + 2-3 threshold surges (5-8min) | `mixed-zone-workouts.ts:85-120` | Same | ✅ Met |
| AC-6.3 | T+I: 2-3×8min blocks + 30s-1min pickups | `mixed-zone-workouts.ts:123-159` | Same | ✅ Met |
| AC-6.4 | Valid intensity mapping, no inversions | `ZONE_INTENSITY` strictly increasing E<M<T<I<R | Same | ✅ Met |
| AC-6.5 | At least 3 combinations | E+M, M+T, T+I all implemented | Same | ✅ Met |
| AC-6.6 | Clearly labeled in UI | `workout.label` used as card title, e.g. "E+M: Easy Run with Marathon Surges" | `workouts.test.ts:560` | ✅ Met |
| AC-6.7 | Purpose/transition explained | `workoutPurpose`/`workoutExecuteGuidance` special-case `pattern === 'mixed-zone'` | Implicit via rendering | ✅ Met |
| AC-8.2 | No regression in pace/power output | Full suite 1165/1165 passing | `npm run test -- --run` | ✅ Met |
| AC-8.3 | UI handles increased workout count gracefully | `WorkoutRail.svelte` (scroll-snap rail, uniform card height) | No dedicated test; verified live via Playwright this session | ✅ Met (issue checkbox stale — not yet ticked in #100) |
| AC-8.4 | Docs updated (User + Developer Guide) | `docs/Guides/*/*.md` diff | N/A | ✅ Met |
| AC-8.5 | Mobile-responsive (tabs, modality selector, week grid) | `WorkoutRail` + responsive Tailwind classes throughout | No dedicated test; verified live via Playwright this session (390×700 viewport) | ✅ Met (issue checkbox stale — not yet ticked in #100) |

**Summary:** 31/33 Phase-1-scoped criteria met. AC-1.2 and AC-1.8 are Not Met — both explicitly disclosed in the PR's own "Known gaps" section, not silent omissions.

---

## Findings

### Critical (must fix before merge)

*(none)*

### Major (should fix)

#### M1 — FIT download is broken for HR-mode E-zone and R-zone workouts
- **Category:** Reliability / Correctness
- **Location:** `src/lib/utils/fit-export.ts:75-84` (`computeStepTarget`), root cause `src/lib/utils/segment-targets.ts:112-135` (`getSegmentBpmRangeNumeric`)
- **Description:** `getSegmentBpmRangeNumeric` returns `null` for any open-ended zone-range string (`< N bpm` or `> N bpm`) — correctly, and this is even unit-tested (`getSegmentBpmRangeNumeric_OpenEndedZone_ReturnsNull`). But E zone (`bpmLow: null`, formatted as `< N bpm`) and R zone (`bpmHigh: null`, formatted as `> N bpm`) are Daniels' *only* two open-ended HR zones by construction (`hr-zones.ts:203,207`), and `computeStepTarget`'s `heartRate` branch (`fit-export.ts:78-83`) throws an `Error` on that `null` rather than handling it — identical to how the (never-open-ended) power path already throws on its own `null` case, but power zones can't hit it, so the pattern was safe there and silently unsafe here. I verified this directly: constructing a `FitExportInput` with `zoneRange: '<152 bpm'` (E) or `'>190 bpm'` (R) and calling `buildFitWorkout` throws every time, with no code path that could ever succeed.
  Reached from the UI: `+page.svelte:1384` sets `hrRange: formatBpmRange(zone.bpmLow, zone.bpmHigh)` directly from the E/R zone's own (necessarily open-ended) bounds, and the same path applies to Race-Prep's HR sub-modality (`race-prep.ts:195-198`, `buildHrModality`'s `zoneBands`). The "Download as .FIT" button is shown regardless (gated only on `selectedWorkout.zone` being set, `+page.svelte:1684`), so a user *can* click it for these zones — and every click fails, caught by the generic `catch` at `+page.svelte:492-495` and surfaced only as "Couldn't create the file. Try again." — which will never succeed no matter how many times it's retried, since the failure is deterministic, not transient.
  **Test coverage gap that let this ship**: `fit-export.test.ts`'s only HR test case uses zone `I` (`'160–172 bpm'`, a closed range) — no E or R zone case exists. `workouts.test.ts:545`'s "enables FIT download for an HR-modality race-prep workout card" test clicks the *first* Race-Prep card — which, per `race-prep.ts:274-276`'s `'Build Aerobic Base'` phase composition (`[byZone.E[0], byZone.E[1], byZone.M[0], ...]`), is an **E-zone** workout, the exact trigger case — but the test only asserts the FIT button is present in the DOM, never actually clicks it. One additional assertion (clicking the button and awaiting the resulting toast) would have caught this.
- **Recommendation:** In `computeStepTarget`'s `heartRate` branch, fall back gracefully instead of throwing when `getSegmentBpmRangeNumeric` returns `null` for the segment's own zone (e.g., encode a one-sided FIT target using whichever bound *is* present, or omit the custom target and fall back to a named HR zone), and add E-zone/R-zone cases to `fit-export.test.ts`'s HR suite plus an actual button-click assertion to `workouts.test.ts:545`'s test.
- **Outcome:** ✅ **Fixed.** Added `getOpenEndedBpmBound()` to `segment-targets.ts` — parses Daniels' open-ended `<N bpm`/`>N bpm` zone strings and returns the single known bound, used only as a fallback so `getSegmentBpmRangeNumeric`'s existing null-for-open-ended contract (and its own passing unit test) stays untouched for the UI-display callers. `fit-export.ts`'s `computeStepTarget` now tries this fallback before throwing, encoding a one-sided target (`low === high === the known bound`) rather than fabricating a second number. Added 5 new `getOpenEndedBpmBound` unit tests, 2 new `buildFitWorkout` regression tests (E-zone and R-zone, both asserting the correct one-sided encoded value including the FIT bpm+100 offset), and replaced `workouts.test.ts:545`'s presence-only assertion with an actual end-to-end click test that downloads an HR Race-Prep card's Build-phase (E-zone) workout and asserts the success toast + correct `buildFitWorkout` call — the exact path that used to throw. All new/changed tests pass; full suite 1187/1187 green.

#### M2 — 4 lint errors introduced by this PR, contradicting its own "lint clean" test-plan claim
- **Category:** Code Quality
- **Location:** `src/lib/components/WorkoutRail.svelte:85,116`; `src/lib/utils/race-prep.ts:7`; `src/routes/workouts/+page.svelte:1470`
- **Description:** `npm run lint` (`eslint .`) reports 4 errors, all newly introduced by the two post-Task-6 follow-up commits (`47d71a6`, `3d6bb0b`):
  - `WorkoutRail.svelte:85` and `:116` — the left/right scroll-affordance buttons are missing the project's required `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-*` classes (custom rule `runwise/require-focus-visible`). This is a real, user-facing accessibility gap, not just a lint technicality — these buttons currently have no visible keyboard-focus indicator.
  - `race-prep.ts:7` — `PowerZone` imported but never used (`@typescript-eslint/no-unused-vars`), a leftover from `47d71a6`'s modality extension.
  - `+page.svelte:1470` — the Race-Prep week-stepper button, same missing-focus-ring rule as above.
  The PR body's Test Plan checklist claims `[x] npm run lint clean` — true as of Task 6 (`faa09a0`), but stale as of the current HEAD; the two follow-up commits regressed it without the checklist being re-verified.
- **Recommendation:** Add the missing `focus-visible:*` classes to the 3 buttons (matching the pattern already used elsewhere in this same PR, e.g. the existing scroll-affordance/tab buttons that do have them), and remove the unused `PowerZone` import from `race-prep.ts`. Re-run `npm run lint` to confirm zero errors before merge.
- **Outcome:** ✅ **Fixed.** Added `focus-visible:ring-offset-2` to `WorkoutRail.svelte`'s left/right scroll buttons and `+page.svelte:1470`'s week-stepper button (matching the existing `focus-visible:ring-offset-2` convention used elsewhere in this PR), and removed the unused `PowerZone` import from `race-prep.ts:7`. `npm run lint` now reports 0 errors, 0 warnings.

### Minor (nice to fix)

#### m1 — Issue #100's AC-8.3/AC-8.5 checkboxes are stale (unchecked) despite being met in code
- **Category:** Process
- **Location:** Issue #100 body, lines for AC-8.3/AC-8.5
- **Description:** Both ACs are assigned to Task 5 and are demonstrably met (`WorkoutRail.svelte`'s scroll-snap rail design directly addresses AC-8.3's "no layout breaks, responsive scrolling," and this session's own Playwright pass at a 390×700 mobile viewport confirmed no regressions), but the issue's checkboxes for both are still `[ ]`.
- **Recommendation:** Check off AC-8.3 and AC-8.5 in issue #100 once this PR merges (no code change needed).
- **Outcome:** ✅ **Fixed.** Checked off AC-8.3 and AC-8.5 on issue #100 (no code change required — done ahead of merge rather than waiting, since the evidence already exists).

### Suggestions (optional)

#### S1 — WorkoutRail's keyboard scroll (Arrow Left/Right) has no test coverage
- **Category:** Test Coverage
- **Location:** `src/lib/components/WorkoutRail.svelte:47-55`
- **Description:** The `onKeydown` handler is a genuinely useful, deliberately-built accessibility feature (WAI-ARIA APG scrollable-region pattern per its own comment), but has zero test coverage at either the unit or integration level.
- **Recommendation:** A component test simulating `ArrowRight`/`ArrowLeft` keydown and asserting `scrollBy` was called would guard this from silent regression — low priority, since it's clearly hand-verified working code, not a suspected defect.
- **Outcome:** ✅ **Fixed.** Added `WorkoutRail.test.ts` with 4 new tests: `ArrowRight`/`ArrowLeft` keydown call `scrollBy` in the correct direction, the keydown `preventDefault()`s the page-scroll default, and an unrelated key does nothing. jsdom doesn't implement `Element.prototype.scrollBy`, stubbed locally per-test.

---

## Positive Observations

- The AC-2.6 R-zone deviation (Runwise's R = Daniels' Repetition, not a generic Recovery zone) is exactly the kind of judgment call that should be flagged and explained rather than silently "corrected" or blindly implemented as literally specified — the PR does this well, in both a code comment and the PR description.
- `race-prep.ts`'s Pace/Power/HR modality split (`buildPaceModality`/`buildPowerModality`/`buildHrModality`) cleanly documents *why* Power/HR substitute an extra zone-appropriate workout instead of a race-pace-tempo/reps slot (no established pace→power/HR conversion exists in this codebase) rather than fabricating a number that might be wrong — a defensible, well-reasoned scope boundary.
- `WorkoutRail.svelte`'s card-height synchronization (clear-then-remeasure via `requestAnimationFrame`, explicit rationale for why `ResizeObserver` on the scroll container itself would create a feedback loop) shows real engineering care, not just a "good enough" implementation.
- Full regression suite (1165/1165) and `tsc --noEmit` clean, both independently re-confirmed this session against the final pushed commits — not just trusted from the PR description.
- This session's own live Playwright verification (production build, real SSR) exercised all 3 top-level modes, all 3 Race-Prep sub-modalities, week-stepper navigation, the 4/8/9-week eligibility boundaries, an invalid-power probe, and the mobile-viewport sticky-tabs fix — zero page errors, and it's this same verification pass's methodology (click through the actual flow) that led directly to catching M1's FIT-export bug when re-examined at the code level.

---

## Action Items

### Immediate Fixes (block merge)
- [x] M1: Fix HR FIT export throwing for E-zone/R-zone workouts (open-ended bpm ranges) — add graceful fallback in `fit-export.ts`, add E/R zone test cases
- [x] M2: Fix 4 lint errors (missing focus-visible classes ×3, unused import ×1)

### Post-merge improvements
- [x] m1: Check off AC-8.3/AC-8.5 in issue #100 (already met, checkboxes just stale)
- [x] S1: Add keyboard-scroll test coverage to `WorkoutRail.svelte`
- [ ] AC-1.2 and AC-1.8 remain open gaps, already tracked as disclosed Phase 1 scope boundaries in the PR body — genuinely out of scope for this findings-fix pass (not undisclosed defects), no new issue needed unless the team wants them formally tracked before Phase 2

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases (with the one gap noted in M1)
- [x] Lint run — 4 errors introduced by this PR (M2)
- [x] No security vulnerabilities introduced (FIT export is pure client-side blob generation; no injection surface)
- [x] No performance regressions (no new N+1 patterns, no unbounded collections; `WorkoutRail` measurement is `requestAnimationFrame`-gated, not synchronous)
- [ ] Error handling complete and consistent — see M1 (HR FIT export's error path is unrecoverable and unhelpfully generic for E/R zones)
- [x] Logging adequate for debugging production issues (`console.error` on FIT build failure, plus user-facing toast)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
