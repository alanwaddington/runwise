# PR #104 Review — Add Fartlek, Progression, Decay, Rep-Expansion, and Recovery patterns to Workout Suggestions (#100 Phase 2)

**Date:** 2026-08-20
**Author:** alanwaddington
**Branch:** feature/100-phase2-fartlek-progression-decay-recovery → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Fail ❌ |
| Risk Level | Medium |
| Test Coverage | Adequate overall, with one confirmed gap |
| Acceptance Criteria | 26 / 27 Met, 1 Not Met (AC-7.6), 1 Partially Met (AC-8.1) |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

**Note on scope of this review:** at the time of this review, an **uncommitted, unpushed local fix** exists in the working tree for `src/routes/workouts/+page.svelte` that addresses part of Finding M1 below (the recovery card's `paceRange`/`easyPaceRange` were already fixed in the PR as pushed; the local fix additionally corrects `zone`/`zoneName`). This review evaluates **PR #104 as actually pushed to GitHub** (confirmed via `git stash` + `gh pr diff 104`), not the local working tree. The fix should be committed and pushed before merge — see Action Items.

---

## Issues Reviewed

GitHub's "Projects (classic)"/sub-issues GraphQL fields are unavailable on this repo, so there is no structured parent/child issue hierarchy to traverse via API. Issue references were extracted from the PR title, body, and all 6 commit messages: `#100`, `#102`, `#103` (plus false-positive matches on "Open Question #1/#4/#8" within issue #100's own body text, which are not issue links).

### Issue Hierarchy

- **#100** — Enhancement: Expand workout generation with HR mode, new patterns, and advanced formats (root — contains the full Business Analysis, Requirements, and Acceptance Criteria AC-1 through AC-8 for all three phases in one issue body; no separate design/task sub-issues exist)
  - **#102** — Add HR mode, Race-Prep mode, and Mixed-Zone workouts to Workout Suggestions (#100 Phase 1) — merged PR, prerequisite context only, not modified by #104
  - **#103** — Race-Prep: extend below 4 weeks with Race Week and Post-Race phases — open, unrelated scope (Race-Prep periodization extension), confirmed no files touched by #104 overlap with this

PR #104 implements Phase 2 of #100 (Tasks 7–12: Fartlek, Progression, Decay, Rep-Expansion, Recovery-Focused prescriptions, UI wiring, QA/docs). The relevant acceptance criteria are **AC-3 (Fartlek), AC-4 (Progression & Decay), AC-5 (Rep Distance Expansion), AC-7 (Recovery-Focused Prescriptions), and the Phase-2-relevant subset of AC-8 (Overarching)** — all defined in #100's own body.

---

## Changed Files Audit

### `src/lib/utils/workout-patterns.ts` (+467 / -0)

| Property | Detail |
|----------|--------|
| Purpose | New builders: `buildFartlekWorkout` (M/T/I), `buildProgressionWorkout` (T/I), `buildDecayWorkout` (I/R), `buildRepExpansionWorkouts` (I/R) |
| Issues | #100 (AC-3, AC-4, AC-5) |
| Criteria covered | AC-3.1–3.7, AC-4.1–4.8, AC-5.1–5.8 |
| Quality | ✅ No issues. Reuses `buildRepsWorkout` from `workouts.ts` directly for the new distance reps rather than reimplementing (correctly avoids AC-5.8's redundancy risk). Every builder computes `qualityMinutes = volumeKm * pace` consistently with the rest of the codebase. Constants are named and commented with their AC source. |
| Test coverage | `workout-patterns.test.ts` — thorough; every AC boundary condition (AC-3.3's "not exceeding zone", AC-4.6's exact recovery-intensity floor, AC-4.7's monotonicity, AC-5.6's exact count, AC-5.8's non-redundancy) has an explicitly named test |

### `src/lib/utils/recovery-workouts.ts` (+124 / -0, new file)

| Property | Detail |
|----------|--------|
| Purpose | New module: `buildRecoveryWorkouts()` — Easy float, Recovery striders, Shakeout run |
| Issues | #100 (AC-7) |
| Criteria covered | AC-7.1–7.5 fully; AC-7.6 only partially (see Acceptance Criteria Verification) |
| Quality | ✅ No issues in the file itself. Deliberately takes no arguments, correctly documented as mode/mileage-independent. |
| Test coverage | `recovery-workouts.test.ts` — thorough, including a determinism check ("calling it twice produces identical output") |

### `src/lib/utils/workouts.ts` (+63 / -22)

| Property | Detail |
|----------|--------|
| Purpose | Wires the four new pattern builders into `buildZoneWorkoutsUnrounded` for M/T/I/R zones; exports `buildRepsWorkout` (previously internal) so `workout-patterns.ts` can reuse it |
| Issues | #100 (AC-3.1, AC-4.1/4.4, AC-5.1/5.2, AC-7.6) |
| Criteria covered | Wiring for all of the above |
| Quality | ✅ No issues. `pattern: 'standard'` backfilled onto every pre-existing hardcoded variant, and `pattern: 'fartlek'`/`'progression'` correctly retagged onto E's pre-existing "Easy fartlek" and M's pre-existing "Progression run" — good consistency work, confirmed by reading the diff against `git show`. |
| Test coverage | `workouts.test.ts` — updated per-zone count assertions (E:3, M:4, T:5, I:10, R:11), confirmed live during `/verify` |

### `src/routes/workouts/+page.svelte` (+84 / -31)

| Property | Detail |
|----------|--------|
| Purpose | Splits each zone's rail into "structured" vs. "recovery" cards; adds the "Recovery Options" subsection under R zone; omits the Total Volume stat in the modal for `pattern: 'recovery'` cards |
| Issues | #100 (AC-3.7, AC-7.7, AC-8.3) |
| Criteria covered | AC-3.7 (pattern badges — pre-existing `PatternBadge.svelte` from Phase 1 needed no changes), AC-7.7 |
| Quality | ⚠️ **See Finding M1.** The Task 12 commit's own message claims to fix "Recovery cards' FIT-export/segment-target pace was pulling Repetition zone's pace band... instead of Easy zone's" — and it does, for `paceRange`/`easyPaceRange`. But the same object literal at line ~1085 (as pushed) still sets `zoneName: zone.name` and `zone: zone.zone` — both still `'Repetition'`/`'R'` — so the FIT-export filename (`runwise-easy-float-R-pace.fit`) and the detail-modal header ("Zone Repetition") still read as Repetition zone, contradicting the fix's own stated intent. Verified live via Playwright against the PR's actual pushed commit (confirmed the bug reproduces after `git stash`ing the local fix). |
| Test coverage | ⚠️ **See Finding M1.** `workouts.test.ts:649`'s regression test ("a recovery card's segment pace targets use Easy pace, not Repetition pace") checks only the pace *values* rendered in the modal body — it never asserts on the modal's header text or the FIT filename, so it does not catch the zone/zoneName half of the same bug it was written to guard. |

### Documentation (`user-guide.md`/`.html`/`.pdf`, `developer-guide.md`/`.html`/`.pdf`)

| Property | Detail |
|----------|--------|
| Purpose | User Guide rewritten for Phase 2's expanded per-zone catalogue and Recovery Options; Developer Guide's file-structure table updated for `workout-patterns.ts`/`recovery-workouts.ts` |
| Issues | #100 (AC-8.4) |
| Criteria covered | AC-8.4 |
| Quality | ✅ No issues. Follows CLAUDE.md's `docs:generate` workflow (PDF/HTML regenerated only for changed `.md` sources; Deployment Guide's untouched binaries correctly left alone). |
| Test coverage | N/A — documentation, non-testable |

### Test files (`workout-patterns.test.ts`, `recovery-workouts.test.ts`, `workouts.test.ts`, `routes/workouts/workouts.test.ts`)

Read in full. See per-source-file rows above for coverage assessment. One structural observation: `routes/workouts/workouts.test.ts`'s new `describe('Pattern badges for Phase 2 workout types (AC-3.7)')` and `describe('Recovery Options subsection...')` blocks are clearly AC-labeled in their own titles — strong traceability, worth continuing as a house convention.

---

## Acceptance Criteria Verification

### #100 — Fartlek Patterns (AC-3)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC-3.1 | Fartlek available for M, T, I | `workout-patterns.ts:253` (`buildFartlekWorkout` dispatcher); wired at `workouts.ts:755,762,770` | `workout-patterns.test.ts:97-244` | ✅ Met |
| AC-3.2 | M-zone: 2-3km pickups, steady recovery | `workout-patterns.ts:124-161` (`M_FARTLEK_PICKUP_KM = 2.5`, 2min steady jog) | `workout-patterns.test.ts:121-137` | ✅ Met |
| AC-3.3 | T-zone: 1-2min pickups, not exceeding zone | `workout-patterns.ts:163-202` (`T_FARTLEK_PICKUP_MINUTES = 1.5`, capped at `ZONE_INTENSITY.T`) | `workout-patterns.test.ts:171-179` | ✅ Met |
| AC-3.4 | I-zone: 3-5min hard, 1min recovery, ≥3 reps | `workout-patterns.ts:204-244` | `workout-patterns.test.ts:192-216` | ✅ Met |
| AC-3.5 | ≥1 variant per applicable zone | Same as AC-3.1 | Same | ✅ Met |
| AC-3.6 | Tested for structure/intensity validity | — | `workout-patterns.test.ts:97-244` | ✅ Met |
| AC-3.7 | Pattern selectable in UI (badge) | `PatternBadge.svelte` (pre-existing, Phase 1) auto-renders once `workout.pattern` is set | `routes/workouts/workouts.test.ts:670-699`; confirmed live via Playwright during `/verify` | ✅ Met |

**Summary:** 7/7 met.

### #100 — Progression & Decay Patterns (AC-4)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC-4.1 | Progression for T and I | `workout-patterns.ts:347` dispatcher | `workout-patterns.test.ts:245-323` | ✅ Met |
| AC-4.2 | T progression: increasing durations | `workout-patterns.ts:270-304` (ratios `[0.8,1,1.2]`) | `workout-patterns.test.ts:315-323` | ✅ Met |
| AC-4.3 | I progression: increasing intervals | `workout-patterns.ts:306-340` (ratios `[1,1.5,2]`) | `workout-patterns.test.ts:307-314` | ✅ Met |
| AC-4.4 | Decay for I and R | `workout-patterns.ts:448` dispatcher | `workout-patterns.test.ts:325-441` | ✅ Met |
| AC-4.5 | I decay: hard→easy reps | `workout-patterns.ts:364-409` (2 hard + 2 easy, 0.5 duration/intensity fractions) | `workout-patterns.test.ts:336-358` | ✅ Met |
| AC-4.6 | R decay: not exceeding recovery zone | `workout-patterns.ts:411-445` (linear decay to exactly `RECOVERY_INTENSITY`) | `workout-patterns.test.ts:393-403` | ✅ Met |
| AC-4.7 | Intensity curves mathematically sound, boundary-tested | — | `workout-patterns.test.ts:270,379,405` (explicit boundary tests) | ✅ Met |
| AC-4.8 | ≥1 progression + ≥1 decay per applicable zone | `workouts.ts:762-773,780` | `workouts.test.ts` count assertions | ✅ Met |

**Summary:** 8/8 met.

### #100 — Rep Distance Expansion (AC-5)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC-5.1 | I: add 1500m/2000m | `workout-patterns.ts:565-571` (reuses `buildRepsWorkout`) | `workout-patterns.test.ts:455-461` | ✅ Met (AC text itself says "in addition to existing 400m, 600m, 800m" — actual existing set is 400/800/1200m, no 600m variant; correctly flagged as an AC-authoring inaccuracy in the commit message, not a PR defect — the two new distances extend the real set either way) |
| AC-5.2 | R: add 150m/300m | `workout-patterns.ts:573-576` | `workout-patterns.test.ts:511-517` | ✅ Met |
| AC-5.3 | Time-based offered as alternative | `workout-patterns.ts:482-513,520-558` | `workout-patterns.test.ts:468-475,517-524` | ✅ Met |
| AC-5.4 | I time-based: 3/5/7min, 1min off | `workout-patterns.ts:478-513` | `workout-patterns.test.ts:475-482` | ✅ Met |
| AC-5.5 | R time-based: 1/2min, 30sec off | `workout-patterns.ts:515-558` | `workout-patterns.test.ts:524-531` | ✅ Met |
| AC-5.6 | 5-6 new options total | `workout-patterns.ts:565-578` — 3 per zone × 2 zones = 6, within the 5-6 range | `workout-patterns.test.ts:554` ("AC-5.6: exactly 6 new options total") | ✅ Met |
| AC-5.7 | Instructions explain no-track-needed | `workout-patterns.ts:506,549` ("run by time, no track needed") | `workout-patterns.test.ts:490-496,539-545` | ✅ Met |
| AC-5.8 | Distinct/non-redundant | Distance variants reuse `buildRepsWorkout`; time-based variants are structurally separate | `workout-patterns.test.ts:496-504,560-573` | ✅ Met |

**Summary:** 8/8 met.

### #100 — Recovery-Focused Prescriptions (AC-7)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC-7.1 | Easy float: ≤60% LTHR/Easy pace, 20-45min | `recovery-workouts.ts:41-56` | `recovery-workouts.test.ts:33-51` | ✅ Met |
| AC-7.2 | Recovery striders: 20-30min + 4-6 accelerations, 90sec recovery | `recovery-workouts.ts:66-94` (5 strides, 25sec, 1.5min recovery) | `recovery-workouts.test.ts:54-90` | ✅ Met |
| AC-7.3 | Shakeout: 10-20min, continuous | `recovery-workouts.ts:103-116` | `recovery-workouts.test.ts:99-114` | ✅ Met |
| AC-7.4 | ≥3 distinct types | `recovery-workouts.ts:122-124` | `recovery-workouts.test.ts:6-27` | ✅ Met |
| AC-7.5 | Clear purpose statement per workout | Descriptions on all 3 builders | `recovery-workouts.test.ts:22-27` | ✅ Met |
| AC-7.6 | Available regardless of race-prep or normal mode | `workouts.ts:785` calls `buildRecoveryWorkouts()` only from Pace mode's R-zone branch. `race-prep.ts` contains **zero** references to `buildRecoveryWorkouts` or recovery-pattern workouts — confirmed via `grep`. Power mode and HR mode also don't call it (confirmed live: Power-mode results render zero "Recovery Options" text). | No test exercises Race-Prep, Power, or HR mode for Recovery Options presence — because there's nothing to test | ❌ **Not Met** — the AC explicitly names "race-prep... mode"; that mode has no implementing code at all for this feature |
| AC-7.7 | Doesn't overwhelm UI | `+page.svelte:1050-1100` — separate "Recovery Options" heading + its own `WorkoutRail`, same pattern as Mixed-Zone Sessions | `routes/workouts/workouts.test.ts:604-639`; confirmed live | ✅ Met |

**Summary:** 6/7 met, 1 Not Met.

### #100 — Overarching Criteria, Phase-2-relevant subset (AC-8)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC-8.1 | All 50+ new workouts tested, ~400-500 test cases | 10 new builders / 16 new workout variants, 93 new tests (61 + 21 unit + 11 integration, confirmed by direct count) | — | ⚠️ **Partially Met** — thorough boundary-condition coverage per function, but the raw count is materially short of the AC's own numeric target; disclosed honestly in the Task 12 commit with rationale (heavier shared-helper reuse than the pre-design estimate anticipated) rather than padded |
| AC-8.2 | No regression | — | Full suite: **1289/1289 passing** (independently re-run during this review, not just trusting the PR body's claim) | ✅ Met |
| AC-8.3 | UI handles increased count, no layout breaks | `WorkoutRail`'s horizontal scroll (Phase 1) | Confirmed live: I zone renders 10 cards, R zone 11, no layout breaks at 1280px or 390px | ✅ Met |
| AC-8.4 | Docs updated | User Guide + Developer Guide diffs present | N/A (docs) | ✅ Met |
| AC-8.6 | Page load < 2s | Author's own live Playwright + Performance API measurement (636ms cold nav, per Task 12 commit) | Not captured as a repeatable automated check in the test suite | ✅ Met, with a caveat — see Finding m2 |
| AC-8.7 | Bundle size < 10KB gzipped for new generators | Author's own measurement (+2.30kB across all of Phase 1's post-review fixes and Phase 2 combined) | Not independently re-verified by this review (would require a full production build + bundle diff); plausible given the diff is pure tree-shakeable functions plus a modest UI change | ✅ Met, with a caveat — see Finding m2 |
| AC-8.8 | Lint/patterns | — | `npm run lint`: **0 errors, 0 warnings** (independently re-run) | ✅ Met |

**Summary:** 5/7 fully met, 1 Partially Met, AC-8.5 (mobile-responsive, pre-existing Phase 1 baseline, re-confirmed live at 390px) also ✅ Met — 6/7.

**Overall: 26/27 individually-listed criteria Met, 1 Partially Met (AC-8.1), 1 Not Met (AC-7.6).**

---

## Findings

### Major (should fix)

#### M1 — Recovery card zone/label bugfix is incomplete as pushed
- **Category:** Code Quality / Correctness
- **Location:** `src/routes/workouts/+page.svelte:1085-1095` (as pushed to PR #104; confirmed via `git stash` isolating the PR's actual committed state)
- **Description:** The Task 12 commit's own message states it fixed the recovery cards' pace band pulling from Repetition zone instead of Easy zone, because "would have prescribed R-pace (Daniels' fastest zone) for what's meant to be an easy recovery session." The fix correctly overrides `paceRange`/`easyPaceRange` to the Easy zone. But the same object literal still sets `zoneName: zone.name` and `zone: zone.zone` — both evaluate to `'Repetition'`/`'R'`, unchanged. This means: (1) the FIT-export filename for every recovery workout reads `runwise-<label>-R-pace.fit` instead of `...-E-pace.fit`, and (2) the workout-detail modal's header reads "Zone Repetition" instead of "Zone Easy / Recovery" — both still visually implying Repetition-zone effort on a workout the same commit explicitly says should read as Easy. Verified live: reproduced against the actual PR-pushed code (modal header "Zone Repetition", filename `runwise-easy-float-R-pace.fit`), and separately confirmed fixed after applying a local patch (modal header "Zone Easy / Recovery", filename `runwise-easy-float-E-pace.fit`).
- **Recommendation:** Commit and push the equivalent of: `zoneName: easyZone ? easyZone.name : zone.name, zone: easyZone ? easyZone.zone : zone.zone` in the recovery-card click handler (mirroring the existing `paceRange`/`easyPaceRange` override immediately above it). Add a regression test asserting on the modal header text or FIT filename specifically — the existing `workouts.test.ts:649` test only asserts on pace *values* and would not have caught this.

#### M2 — AC-7.6 not implemented: Recovery-Focused prescriptions absent from Race-Prep mode
- **Category:** Code Quality / Requirements Completeness
- **Location:** `src/lib/utils/race-prep.ts` (entire file — zero references to `buildRecoveryWorkouts` or `pattern: 'recovery'`)
- **Description:** AC-7.6 reads "Recovery workouts available regardless of race-prep or normal mode." `buildRecoveryWorkouts()` is called exactly once in the whole codebase, from `workouts.ts`'s Pace-mode R-zone branch. Race-Prep mode (a fully separate result builder, untouched by this PR) has no path to Recovery Options at all — not conditionally hidden, simply never wired in. Power mode and HR mode are in the same position (confirmed live for Power: zero "Recovery Options" text with valid inputs), which may be a legitimate, disclosed scope decision for those two (the PR body's "Scope note" explicitly limits Tasks 7-10 to Pace mode) — but Race-Prep mode is not mentioned in that scope note, and AC-7.6 names it explicitly by name.
- **Recommendation:** Either (a) wire Recovery Options into Race-Prep mode's UI/result builder before merge, or (b) if this is an intentional, accepted scope reduction, update AC-7.6's text (or add a scope note to it, same as Tasks 7-10 got for Power/HR) so the acceptance criterion reflects what's actually being shipped rather than leaving a criterion that reads as unmet.

### Minor (nice to fix)

#### m1 — AC-8.1's test-count target substantially unmet, though disclosed
- **Category:** Test Coverage
- **Location:** N/A (aggregate across all Phase 2 test files)
- **Description:** AC-8.1 asks for "~400-500 total test cases" for "50+ new workouts." Actual: 93 new tests for 10 new builders / 16 new workout variants. The Task 12 commit discloses this honestly with a clear rationale (heavier reuse of shared helpers than the pre-implementation estimate assumed). Coverage quality per function is genuinely strong (see AC-3/4/5 verification above) — this is a raw-count shortfall against a stale estimate, not evidence of thin testing.
- **Recommendation:** No action required before merge given the disclosure; consider updating AC-8.1's own text in #100 to reflect a realistic post-implementation target, so future phases aren't measured against a number that predates the final design (same pattern already applied by the Task 12 author to AC-5.1's distance-list mismatch).

#### m2 — Performance/bundle-size acceptance criteria rely on a one-off manual measurement, not an automated check
- **Category:** Reliability
- **Location:** N/A (no test file — that's the finding)
- **Description:** AC-8.6 and AC-8.7 were verified by the author via a live Playwright + Performance API run and a manual bundle-size diff, per the Task 12 commit message. Neither is captured as a repeatable, CI-enforced check. A future PR could silently regress either without any test failure.
- **Recommendation:** Consider a `size-limit`-style bundle budget check and/or a lightweight Lighthouse/Playwright performance assertion in CI, scoped to `/workouts`, so these AC categories become self-verifying rather than needing a manual re-measurement every phase.

#### m3 — Adjacent pre-existing issue discovered during this review, out of scope for #104
- **Category:** Code Quality (Power mode, not touched by this PR)
- **Location:** `src/lib/utils/power-workouts.ts:179-196,564,598,632` (unused `computePowerRepDurationMinutes`; I-zone and R-zone reps share one hardcoded 2/4/6min duration set)
- **Description:** Not a defect introduced by PR #104 — `power-workouts.ts` is untouched by this PR. Noted here only because it surfaced during this review's broader codebase reading and has already been filed and analysed as **issue #106** (Power-mode parity follow-up), so it doesn't need re-discovering later. Not a blocker for #104.
- **Recommendation:** No action needed on PR #104 itself; tracked separately.

### Suggestions (optional)

#### S1 — Consider an automated bundle-size budget
See m2 — same underlying suggestion, listed here per the report template's category split.

---

## Positive Observations

- Exceptional AC-to-test traceability: test names directly cite AC numbers (`workout-patterns.test.ts:270` "AC-4.7 boundary check", `:554` "AC-5.6: exactly 6 new options total", `routes/workouts/workouts.test.ts:604` `describe('Recovery Options subsection (Task 11, Open Question #4)')`) — makes independent verification (this review) substantially faster and more reliable than typical.
- Honest, specific disclosure of estimate misses and AC-text inaccuracies (AC-8.1's test count, AC-5.1's "600m" mismatch) rather than silently reconciling or ignoring them — exactly the right instinct for a reviewer to be able to trust the rest of the PR's self-reporting.
- Strong architectural reuse: `buildRepExpansionWorkouts` calls `buildRepsWorkout` directly rather than reimplementing rep-distance logic a second time, eliminating the exact "two implementations drift apart" risk AC-5.8 warns about.
- Live browser verification (Playwright, dev + production build, desktop + 390px mobile) actually performed and referenced with specific numbers, not just claimed — this review was able to independently reproduce the one bug that slipped through (Finding M1), which speaks well of the verification method even though this specific case wasn't caught.
- Zero lint errors/warnings, zero `tsc` errors, full 1289/1289 test suite passing — all independently re-run during this review, not merely trusted from the PR description.

---

## Action Items

### Immediate Fixes (block merge)
- [ ] M1: Commit and push the `zone`/`zoneName` override fix for recovery cards (already exists as an uncommitted local patch — verified working) plus a regression test on the modal header/FIT filename, not just pace values
- [ ] M2: Decide and implement one of: (a) wire Recovery Options into Race-Prep mode, or (b) formally narrow AC-7.6's scope in issue #100 to match what's shipping

### Post-merge improvements
- [ ] m1: Update AC-8.1's test-count target in #100 to reflect realistic post-implementation numbers
- [ ] m2: Add an automated bundle-size/performance budget check for `/workouts`
- [ ] m3: Already tracked as issue #106 — no further action needed here

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases (with the one gap noted in M1)
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions (self-reported, not independently re-measured — see m2)
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues (N/A — client-side calculation tool, no server logging surface)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
