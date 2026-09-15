# PR #113 Review — HR zone → Daniels E/M/T/I/R mapping correction + Max HR support (#101)

**Date:** 2026-09-15
**Author:** alanwaddington
**Branch:** `feature/101-hr-zone-training-zone-mapping` → `main`
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass with comments ⚠️ |
| Risk Level | Low |
| Test Coverage | Gaps identified (2 minor) |
| Acceptance Criteria | 36 Met / 36 Total |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

One Major finding (cross-tab state wipe, verified in a real browser) should be
resolved before merge. It does not block any acceptance criterion — it is an
unintended side effect of correctly implementing Task 4's AC4.

---

## Issues Reviewed

### Issue Hierarchy

This PR maps to a single issue with no parent and no sub-issues. Issue #101 is a
combined research + design + implementation issue — the `/analyse`, `/design`, and
work-breakdown sections were all appended to the same issue body rather than split
across a tree.

- **#101** — Research: HR zone to training zone mapping for workout generation (OPEN)
  — https://github.com/alanwaddington/runwise/issues/101
  - Analysis section: AC1–AC8 (research deliverables)
  - Design section → Work breakdown:
    - Task 1 — Correct LTHR zone percentages, widen confidence type (8 ACs)
    - Task 2 — Add Max HR Daniels zone calculator (6 ACs)
    - Task 3 — Update `buildHrWorkoutsResult` to accept both HR methods (6 ACs)
    - Task 4 — Update workouts page HR mode UI for dual HR methods (8 ACs)

**Related context:** #100 (Enhancement: Expand workout generation with HR mode, new
patterns, and advanced formats) is CLOSED and was the original consumer of this
research. No criteria from #100 are in scope for this PR.

---

## Changed Files Audit

### `src/lib/utils/hr-zones.ts` (+54 / -11)

| Property | Detail |
|----------|--------|
| Purpose | Corrects `DANIELS_LTHR_ZONE_META` to research-validated %LTHR bands; adds `DANIELS_MAXHR_ZONE_META` + `calculateDanielsMaxHrZones()`; widens `HrTrainingZone.confidence` to include `'none'` |
| Issues | #101 (Tasks 1, 2, 5) |
| Criteria covered | Task 1 AC1–AC6, Task 2 AC1–AC4 |
| Quality | ✅ No issues. The new function mirrors `calculateDanielsLthrZones` exactly (same guard shape, same `.map` projection, reuses existing `MIN_MAX_HR`/`MAX_MAX_HR`) — no duplication beyond what symmetry warrants. Both meta tables are `as const`, so the confidence literals stay narrowed. The doc comment is unusually thorough and now carries the sourcing rationale for both the M/T overlap and the T/I gap. |
| Test coverage | `hr-zones.test.ts` — `calculateDanielsLthrZones` suite (lines 266–341, 12 tests) and `calculateDanielsMaxHrZones` suite (lines 344–416, 11 tests), including both range boundaries and all confidence tiers |

### `src/lib/utils/hr-workouts.ts` (+22 / -9)

| Property | Detail |
|----------|--------|
| Purpose | Replaces the `lthr: number` parameter with an `HrInput` discriminated union, dispatches to the correct zone calculator, returns `hrMethod`/`hrValue` on the result |
| Issues | #101 (Task 3) |
| Criteria covered | Task 3 AC1–AC4 |
| Quality | ✅ No issues. The discriminated union is the right shape here — it makes an invalid `{ method: 'lthr' }` paired with a Max HR value unrepresentable, rather than relying on a separate boolean flag. `HrWorkoutZone.confidence` is widened to match `HrTrainingZone.confidence`; note these two types are declared independently rather than one referencing the other (see finding m2). |
| Test coverage | `hr-workouts.test.ts` — `Max HR method` describe block (lines 156–208, 7 tests) covering out-of-range, both dispatch paths, zone ordering + confidence tiers, and the R-zone no-bpm-in-description contract |

### `src/routes/workouts/+page.svelte` (+165 / -11)

| Property | Detail |
|----------|--------|
| Purpose | Adds the LTHR / Max HR method selector, Max HR input + validation, method-aware copy for empty/out-of-range/headline states, `'none'` confidence badge treatment, R-zone caveat note, and (Task 5) the T/I gap explanation note |
| Issues | #101 (Tasks 4, 5) |
| Criteria covered | Task 4 AC1–AC8 |
| Quality | ⚠️ See M1 — `switchHrMethod` clears `lthrRaw`, which is shared with the Race-Prep HR sub-panel, silently wiping a value the user entered there. Otherwise clean: the method selector mirrors the existing race-prep modality tab pattern (same classes, same `role="tab"`/`aria-selected` wiring), and `hrZoneGap` is derived from the actual zone bounds rather than hardcoding the percentages, so it self-disables on the contiguous LTHR table. |
| Test coverage | `workouts.test.ts` — method switching (line 384), Max HR validation error (line 391), Max HR headline + zones + N/A caveat (line 400). ⚠️ No test for the Task 5 gap note (see m1). |

### `src/lib/utils/hr-zones.test.ts` (+93 / -15)

| Property | Detail |
|----------|--------|
| Purpose | Updates `calculateDanielsLthrZones` assertions to the corrected percentages; adds the `calculateDanielsMaxHrZones` suite |
| Issues | #101 (Tasks 1, 2) |
| Criteria covered | Task 1 AC7, Task 2 AC5 |
| Quality | ✅ No issues. Naming follows the established `function_Scenario_ExpectedResult` convention used throughout this file. Boundary values (100/220, 100/200) are tested on both sides. |
| Test coverage | N/A (is the test file) |

### `src/lib/utils/hr-workouts.test.ts` (+72 / -18)

| Property | Detail |
|----------|--------|
| Purpose | Migrates existing call sites to the `HrInput` signature; adds the Max HR method suite |
| Issues | #101 (Task 3) |
| Criteria covered | Task 3 AC5 |
| Quality | ✅ No issues. The `if (result === null \|\| result === 'out-of-range') throw` narrowing guard is repeated in each test rather than extracted to a helper — acceptable, as it keeps each test independently readable and is the existing convention in this file. |
| Test coverage | N/A (is the test file) |

### `src/routes/workouts/workouts.test.ts` (+38 / -5)

| Property | Detail |
|----------|--------|
| Purpose | Fixes 3 stale assertions that referenced `hrResult.lthr` and an LTHR-only label selector that became ambiguous once method tabs were added; adds Max HR method tests |
| Issues | #101 (Task 4) |
| Criteria covered | Task 4 AC7 |
| Quality | ✅ No issues. The selector fix (moving to `getByRole('tab', { name: 'Max HR' })`) is more robust than the label-text query it replaces. |
| Test coverage | N/A (is the test file) |

---

## Acceptance Criteria Verification

### #101 — Analysis section (research deliverables)

These are documentation criteria satisfied by the issue body itself, not by code.
Verified by reading the published issue body.

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC1 | Documented %LTHR mapping with confidence tier + cited source per zone | Issue #101 "Research Findings" → %LTHR table (5 zones, Confidence + Source basis columns) | N/A (docs) | ✅ Met |
| AC2 | Documented %MaxHR mapping with same structure | Issue #101 → %MaxHR table (5 zones, Confidence + Notes) | N/A (docs) | ✅ Met |
| AC3 | Answers "is strict 1:1 mapping physiologically sound?" | Issue #101 → "Why 1:1 HR prescription breaks down for I and R" — answered **No**, with VO2 kinetics rationale | N/A (docs) | ✅ Met |
| AC4 | Answers "% of runners with misaligned HR vs pace/power zones" | Issue #101 AC4 → **~15–20%**, with the three cited variation sources | N/A (docs) | ✅ Met |
| AC5 | ≥3 platforms compared on anchor + zone count, plus Daniels-mapping finding | Issue #101 → "Commercial platform comparison" table (TrainingPeaks/Strava/Garmin), finding: none do direct Daniels mapping | N/A (docs) | ✅ Met |
| AC6 | Edge cases documented (drift, training status, heat/altitude, medication, short sessions) | Issue #101 → "Edge cases" — all five present | N/A (docs) | ✅ Met |
| AC7 | Concrete corrected mapping table ready for `/design` | Issue #101 → both tables, consumed verbatim by Tasks 1 & 2 | N/A (docs) | ✅ Met |
| AC8 | Findings published in a `/design`-consumable form (tables, not narrative) | Issue #101 → all findings are tabular + rationale | N/A (docs) | ✅ Met |

**Summary:** 8/8 met.

### #101 — Task 1: Correct LTHR zone percentages, widen confidence type

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | E zone upper bound is 89% LTHR (was 60%) | `hr-zones.ts:204` (`highPct: 0.89`) | `hr-zones.test.ts:272` | ✅ Met |
| 2 | M spans 89–95% LTHR | `hr-zones.ts:205` | `hr-zones.test.ts:280` | ✅ Met |
| 3 | T spans 95–102% LTHR | `hr-zones.ts:206` | `hr-zones.test.ts:288` | ✅ Met |
| 4 | I spans 102–106% LTHR | `hr-zones.ts:207` | `hr-zones.test.ts:296` | ✅ Met |
| 5 | R lower bound 106% LTHR, confidence `'none'` | `hr-zones.ts:208` | `hr-zones.test.ts:304` | ✅ Met |
| 6 | `HrTrainingZone.confidence` includes `'none'` | `hr-zones.ts:192` | Type-level; exercised by `hr-zones.test.ts:304` | ✅ Met |
| 7 | All `calculateDanielsLthrZones` tests pass with corrected assertions | `hr-zones.test.ts:266–341` | Suite of 12 | ✅ Met |
| 8 | `npm run test` passes | PR reports 1409/1409 across 72 files | Suite | ✅ Met |

**Summary:** 8/8 met.

### #101 — Task 2: Add Max HR Daniels zone calculator

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `calculateDanielsMaxHrZones(185)` returns 5 zones in E/M/T/I/R order | `hr-zones.ts:258–268` | `hr-zones.test.ts:345` | ✅ Met |
| 2 | E: `bpmLow`=120, `bpmHigh`=146 at maxHr 185 | `hr-zones.ts:246` (0.65/0.79 → 120/146) | `hr-zones.test.ts:350` | ✅ Met |
| 3 | R: `bpmLow`=null, `bpmHigh`=null, confidence `'none'` | `hr-zones.ts:250` | `hr-zones.test.ts:382` | ✅ Met |
| 4 | Returns null for out-of-range (<100, >220) | `hr-zones.ts:259` | `hr-zones.test.ts:406`, `:410`, `:414` | ✅ Met |
| 5 | All new tests pass; existing unaffected | `hr-zones.test.ts:344–416` | Suite of 11 | ✅ Met |
| 6 | `npm run test` passes | PR reports 1409/1409 | Suite | ✅ Met |

**Summary:** 6/6 met.

### #101 — Task 3: Update `buildHrWorkoutsResult` to accept both HR methods

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `{ method: 'lthr', value: 170 }` produces same zones/workouts as old signature | `hr-workouts.ts:473–476` | `hr-workouts.test.ts:174` + existing LTHR suite | ✅ Met |
| 2 | `{ method: 'maxhr', value: 185 }` produces valid zones and workouts | `hr-workouts.ts:473–476` | `hr-workouts.test.ts:162`, `:201` | ✅ Met |
| 3 | R zone via MaxHR: descriptions reference zone name but not "bpm" | `hr-workouts.ts:70–77` (`formatBpmRangeStr` returns `'N/A'` for null/null) | `hr-workouts.test.ts:190` (asserts `not.toMatch(/bpm/)`) | ✅ Met |
| 4 | Result includes `hrMethod` field | `hr-workouts.ts:35`, `:502` | `hr-workouts.test.ts:168`, `:174` | ✅ Met |
| 5 | All existing tests pass after call-site migration | `hr-workouts.test.ts` (+72/-18) | Suite | ✅ Met |
| 6 | `npm run test` passes | PR reports 1409/1409 | Suite | ✅ Met |

**Summary:** 6/6 met.

### #101 — Task 4: Update workouts page HR mode UI for dual HR methods

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | HR mode shows a Max HR / LTHR method selector | `+page.svelte:772–812` (`hrMethodSelector` snippet), rendered at `:1041` | `workouts.test.ts:384` | ✅ Met |
| 2 | Max HR input: placeholder "e.g. 185", unit "bpm", range 100–220 | `+page.svelte:753–771` (`maxHrModalityInput`), validation at `:230`, `:407` | `workouts.test.ts:391` | ✅ Met |
| 3 | Selecting LTHR shows the existing LTHR input unchanged | `+page.svelte:1042–1046` | `workouts.test.ts:384` | ✅ Met |
| 4 | Switching method clears the other method's input state | `+page.svelte:411–422` (`switchHrMethod`) | `workouts.test.ts:384`; independently confirmed in browser | ✅ Met — but see **M1** |
| 5 | R zone with `confidence: 'none'` shows a distinct badge | `+page.svelte:1572–1579` (dashed slate treatment, distinct from green/amber/gray) | `workouts.test.ts:400` | ✅ Met |
| 6 | R zone workout cards include a note about HR not being applicable | `+page.svelte:1610–1614` | `workouts.test.ts:400` | ✅ Met |
| 7 | `npm run test` passes | PR reports 1409/1409 | Suite | ✅ Met |
| 8 | Visual verification in browser (dev server) — *unticked on the issue* | N/A | Performed during this review: dev server on :5173, Chromium via Playwright | ✅ Met — see note below |

**Note on AC8:** this criterion is unticked on issue #101 and the PR description
explicitly flags it as "Not verified — no browser automation tool was available in
that session". It has now been verified in a real browser during this review:

- Method selector renders with correct `role="tab"` / `aria-selected` wiring; LTHR default.
- LTHR 165 → E `<147`, M `147–157`, T `157–168`, I `168–175`, R `>175` (contiguous, matches the corrected table).
- Max HR 185 → E `120–146`, M `148–165`, T `163–170`, I `179–185`, R `N/A` with the dashed badge and the caveat note rendered.
- Headline label/value swap correctly between methods; out-of-range copy swaps range text (100–200 vs 100–220).
- Max HR `300` + blur → "Must be between 100 and 220" with red border/icon.
- Max HR `100` (the `MIN_MAX_HR` boundary) → valid, zones render.
- "Clear" resets `hrMethod` to `'lthr'` and unmounts the Max HR field.
- No console or page errors at any point.

**Summary:** 8/8 met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

#### M1 — Selecting the Max HR method silently wipes an LTHR value entered in the Race-Prep tab

- **Category:** Code Quality / Reliability (data loss)
- **Location:** `src/routes/workouts/+page.svelte:411–422` (`switchHrMethod`), interacting with `:273` (`racePrepModalityInput`) and `:1031–1035` (race-prep renders the same `hrModalityInput()` snippet)
- **Description:** `switchHrMethod('maxhr')` sets `lthrRaw = ''`. That satisfies Task 4's AC4 for the main HR tab, but `lthrRaw` is *shared state* — the Race-Prep HR sub-panel binds the same `#lthr` input and `racePrepModalityInput` derives from the same `lthr` value. A user who enters their LTHR in Race-Prep, then visits the HR tab and toggles to Max HR out of curiosity, loses the Race-Prep value with no warning. Because `racePrepModalityInput` returns `null` when `lthr` is null, the Race-Prep plan then renders its empty state with no explanation of why the results vanished.

  Verified in a real browser (Chromium via Playwright, dev server on :5173):

  ```
  [race-prep + HR modality]      #lthr=""      → user types 165
  [LTHR=165 entered in race-prep] #lthr="165"
  [switched to main HR tab]       #lthr="165"   (shared state, as expected)
  [selected Max HR method]        #lthr=null    (field unmounted; lthrRaw cleared)
  [BACK in race-prep]             #lthr=""      ← user's Race-Prep LTHR is gone
  ```

  This is a regression introduced by this PR: before Task 4 there was no code path that cleared `lthrRaw`.
- **Recommendation:** Give the main HR tab its own LTHR state, separate from the Race-Prep panel's — or, if the shared field is deliberate, scope the reset so it only clears when the main HR tab actually owns the value. A minimal fix is to stop clearing the *other* method's raw value on switch (clearing `touched`/`error` is enough to avoid a stale validation message) since the hidden field's value has no effect on `hrInput` while the other method is selected. That also makes toggling LTHR ↔ Max HR non-destructive on the main tab, which is friendlier regardless.

### Minor (nice to fix)

#### m1 — The Task 5 T/I gap note has no test coverage

- **Category:** Test Coverage
- **Location:** `src/routes/workouts/+page.svelte:248–258` (`hrZoneGap` derived), `:1594–1602` (the rendered note)
- **Description:** The `hrZoneGap` derivation and its conditional note were added in commit `24ceff4` with no accompanying test. A grep for `has no zone` / `hrZoneGap` across `src/**/*.test.ts` returns nothing. The logic has two behaviours worth pinning: it must appear for the Max HR method and must *not* appear for the contiguous LTHR table. Both were confirmed manually in the browser during this review, but nothing protects them from regression — e.g. a future change making the LTHR table non-contiguous would silently start showing the note with wording that only makes sense for Max HR.
- **Recommendation:** Add two assertions to `workouts.test.ts` alongside the existing Max HR tests: note present with the expected bpm range under Max HR 185, note absent under LTHR 165.

#### m2 — `HrWorkoutZone.confidence` duplicates `HrTrainingZone.confidence` as a literal union

- **Category:** Code Quality
- **Location:** `src/lib/utils/hr-workouts.ts:27` vs `src/lib/utils/hr-zones.ts:192`
- **Description:** Both types spell out `'high' | 'medium' | 'low' | 'none'` independently. This PR had to widen both in lockstep, and the commit messages for Tasks 1–3 explicitly call out an intermediate broken-`tsc` state caused by exactly this coupling ("this temporarily breaks tsc on hr-workouts.ts... resolved in Task 3"). The next tier change will hit the same trap.
- **Recommendation:** Export a named type from `hr-zones.ts` (e.g. `export type HrConfidence = 'high' | 'medium' | 'low' | 'none'`) and reference it from both interfaces.

#### m3 — R-zone workout descriptions read "at Repetition HR (N/A)"

- **Category:** Code Quality (UX copy)
- **Location:** `src/lib/utils/hr-workouts.ts:101` (and the interval/other builders at `:147`, `:166`), via `formatBpmRangeStr` at `:70–77`
- **Description:** With Max HR selected, R-zone descriptions render as e.g. "7 × 2 min at Repetition HR (N/A), 2 min recovery". This satisfies Task 3's AC3 literally (no "bpm" in the description), but mentioning an HR target and then parenthesising "N/A" is awkward for the one zone the PR is at pains to explain *has* no HR target. Observed in the browser during this review.
- **Recommendation:** When both bounds are null, drop the "at {zone} HR (...)" clause entirely rather than substituting "N/A" — e.g. "7 × 2 min at Repetition effort, 2 min recovery". The per-card caveat note already added in Task 4 then carries the explanation.

### Suggestions (optional)

#### S1 — Race-Prep HR modality remains LTHR-only

- **Category:** Code Quality (scope/consistency)
- **Location:** `src/routes/workouts/+page.svelte:272–274`
- **Description:** The main HR tab now supports both methods; the Race-Prep HR sub-panel still accepts LTHR only. This is explicitly declared out of scope in both the design section and the PR description, and is defensible — `RacePrepModalityInput` would need widening too. Noting it only so the inconsistency is a tracked decision rather than an oversight. Fixing M1 is a prerequisite for doing this cleanly.
- **Recommendation:** Track as a follow-up issue via `/analyse` if Max HR support in Race-Prep is wanted.

---

## Positive Observations

- **The research is genuinely sourced, not invented.** Both zone tables trace to the
  research section of #101 with named sources, and the constants in code match those
  tables exactly. The previous constants were physiologically implausible (E `<60% LTHR`
  ≈ near-resting); this is a real correctness fix, not a cosmetic one.
- **The discriminated `HrInput` union is the right abstraction.** It makes an
  invalid method/value pairing unrepresentable rather than relying on a parallel flag,
  and the dispatch in `buildHrWorkoutsResult` is a two-line branch with no leakage of
  method-specific logic further down.
- **Commit hygiene is excellent.** Four task commits map 1:1 to the design's work
  breakdown, each commit message names the expected intermediate breakage and which
  later task resolves it. That makes the "broken `tsc` at commit 2" state auditable
  rather than alarming.
- **`hrZoneGap` is derived, not hardcoded.** The Task 5 note computes the gap from the
  actual zone bounds, so it self-disables on the contiguous LTHR table and would adapt
  automatically if the percentages were ever retuned. Easy to have hardcoded "171–178"
  or `hrMethod === 'maxhr'`; this is better.
- **Boundary testing is thorough.** Both HR calculators test both ends of their valid
  range plus just-outside values — `100`/`220` and `99`/`221` for Max HR, `100`/`200`
  for LTHR.
- **Test-selector fix was an improvement, not a patch.** Replacing the now-ambiguous
  label-text query with `getByRole('tab', { name: 'Max HR' })` is more robust than what
  it replaced.

---

## Action Items

### Immediate Fixes (block merge)

- [x] M1: Stop `switchHrMethod` from wiping `lthrRaw`, which is shared with the Race-Prep HR panel and causes silent data loss there — fixed in `24ceff4`'s follow-up commit: `switchHrMethod` now only clears `touched`/`error` state, leaving both raw values alone. Re-verified live in browser: LTHR entered in Race-Prep survives a round-trip through the main tab's Max HR toggle.

### Post-merge improvements

- [x] m1: Add tests for the T/I gap note (present under Max HR, absent under LTHR) — two tests added to `workouts.test.ts`; full suite re-run (164/164 passing across the 3 affected files).
- [x] m2: Extract a shared `HrConfidence` type instead of duplicating the literal union across two files — added `HrConfidence` to `hr-zones.ts`, referenced from both `HrTrainingZone` and `HrWorkoutZone`. `svelte-check`: 0 errors.
- [x] m3: Drop the "HR (N/A)" clause from R-zone descriptions rather than substituting "N/A" — added a `zoneHrClause` helper in `hr-workouts.ts`, applied at all 9 description sites; R-zone (Max HR) now reads e.g. "7 × 2 min at Repetition effort, 2 min recovery" instead of "... at Repetition HR (N/A) ...". Verified live in browser; E/M/T/I descriptions unaffected (still show bpm ranges).
- [x] S1: Create an issue via `/analyse` if Max HR support is wanted in the Race-Prep HR modality — user opted to create it. Filed as #114 (https://github.com/alanwaddington/runwise/issues/114), with full analysis (requirements, ACs, explicit Won't decisions on R-zone and the T/I gap note in Race-Prep) captured during the `/analyse` interview.

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

---

## Review Method Notes

- **Lint:** `npm run lint` (eslint) — clean, no output, 0 errors / 0 warnings.
- **Test suite:** not re-run as part of this review (the review process specifies lint
  only, and this environment has a known flakiness when vitest runs concurrently with
  a build). Test *existence and content* were verified by reading each test file and
  matching assertions to criteria.
- **Browser verification:** dev server (`npm run dev`, port 5173) driven with Playwright
  Chromium, per the repo's `verifier-runwise` skill. Used to close Task 4's AC8 and to
  confirm finding M1 empirically rather than by code reading alone.
