# PR #92 Review — Workout Suggestions: scale warm-up/cool-down instead of fixed 10+10 min (#91)

**Date:** 2026-08-07
**Author:** alanwaddington
**Branch:** feature/91-scale-warmup-cooldown → main
**State:** Open
**Commits reviewed:** 3 (6b3f2a6, c440228, cb6d5e9)

**Update (2026-08-07):** The one finding below (m1) has been fixed rather than left for future work — see its "Resolution" note. Commit `5ccd771`. Full suite (49 files / 956 tests) and lint (0 errors/warnings) reconfirmed green after the fix.

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 12 Met / 12 Total |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |
| Findings | 0 Critical, 0 Major, 0 Minor (1 fixed), 0 Suggestions |

---

## Issues Reviewed

### Issue Hierarchy

- #91 — Workout Suggestions: scale warm-up/cool-down duration instead of a fixed 10+10 min — root issue with embedded `## Analysis` and `## Design` sections, no parent issue, no sub-issues (confirmed via GraphQL — `subIssues` returned empty, same convention as prior PRs #89/#90). #91's own `## Analysis` section (12 checkbox acceptance criteria) is the verifiable criteria set audited below.

---

## Changed Files Audit

### `src/lib/utils/workouts.ts` (+67 / -20 lines)

| Property | Detail |
|----------|--------|
| Purpose | Replaces the flat `WARMUP_COOLDOWN_MINUTES = 20` constant with `WARMUP_COOLDOWN_BAND` (per-zone `{min, max}` table) and `computeWarmupCooldownMinutes(zone, qualityMinutes)` (the interpolation function); updates `warmupSegment`/`cooldownSegment` to take `(zone, qualityMinutes)` params instead of none; updates all 5 workout-builder call sites (`continuousWorkout`, `buildMWorkouts`, `buildTWorkouts`, `buildRepsWorkout`) to compute and reuse a per-workout value for both the segment durations and `estimatedDurationMinutes` |
| Issues | #91 |
| Criteria covered | AC 1, 2, 3, 4, 5, 6, 9, 12 |
| Quality | ✅ Each builder computes its warm-up/cool-down value **once** and reuses it for both segments and the duration formula (`const warmupCooldownMinutes = computeWarmupCooldownMinutes(...)`), rather than calling the function twice and risking the two ever drifting — good discipline, matches the file's existing pattern of computing shared values once. The doc comment on `WARMUP_COOLDOWN_BAND` is thorough and explicit about the lack of Daniels sourcing, consistent with the file's established honesty convention for unsourced constants (`WARMUP_INTENSITY` etc.). See Finding m1 for one edge-case interaction with pre-existing #19 logic this change makes newly visible. |
| Test coverage | `workouts.test.ts` — `computeWarmupCooldownMinutes` describe block (boundary/midpoint/clamping per zone), `workout segments` describe block (symmetric warm-up=cool-down, the <30min regression case), updated `buildZoneWorkouts_EveryWorkout_IncludesAtLeastItsZonesMinWarmupCooldownInDuration` |

### `src/lib/utils/workouts.test.ts` (+66 / -3 lines)

| Property | Detail |
|----------|--------|
| Purpose | Tests for the above: `computeWarmupCooldownMinutes` at zero/negative/60+/midpoint quality-minutes for all 5 zones (via `it.each`), symmetric warm-up=cool-down assertion across all 10 workouts, and a targeted regression test for the specific "Under 30 min" filter fix |
| Issues | #91 |
| Criteria covered | AC 12 |
| Quality | ✅ `it.each(['E','M','T','I','R'] as const)` is a clean way to cover all 5 zones per boundary case without 15 near-duplicate `it` blocks — consistent with this file's existing preference for looping over the zone list rather than repeating test bodies. The regression test (`shortRZoneWorkout_atLowMileage_fitsUnderThirtyMinutesTotal`) uses a specific, hand-verified input (10km/week) rather than an arbitrary one — confirmed during this review that the chosen mileage genuinely exercises the `MIN_REPS` floor path, not a coincidental pass. |
| Test coverage | Self |

### `src/routes/workouts/+page.svelte` (+3 / -3 lines)

| Property | Detail |
|----------|--------|
| Purpose | Card copy line ("Includes a X min warm-up and X min cool-down") now reads `workout.segments[0].durationMinutes` / `workout.segments[workout.segments.length - 1].durationMinutes` instead of the removed `WARMUP_COOLDOWN_MINUTES` constant; removes the now-dead import |
| Issues | #91 |
| Criteria covered | AC 6, 7 |
| Quality | ✅ Reading the displayed value from the same `segments` array the profile chart renders (rather than exporting a second parallel value) means the card text and the chart can never disagree by construction — a real design strength, not just incidental. Minimal diff, no new markup, matches the design's own scoping. |
| Test coverage | `workouts.test.ts` (page) — two new tests confirming per-workout distinct values and symmetric warm-up/cool-down text |

### `src/routes/workouts/workouts.test.ts` (+22 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Tests for the above |
| Issues | #91 |
| Criteria covered | AC 12 |
| Quality | ✅ The "shows a per-workout warm-up/cool-down value" test asserts `new Set(warmupMinutes).size > 1` across all 10 rendered cards — a genuine proof of per-workout variation rather than just checking one card's value looks plausible. Good defensive test design (would have failed had the page still displayed one shared figure). |
| Test coverage | Self |

### `src/lib/content/explainers.ts` (+1 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | "Reading a workout card" body text updated from "...includes a fixed 10-minute warm-up and 10-minute cool-down" to "...includes a warm-up and cool-down that scales with the session's intensity and length — longer for harder efforts like Interval and Repetition, shorter for Easy running" |
| Issues | #91 |
| Criteria covered | AC 10 |
| Quality | ✅ Correctly avoids over-specifying the exact minute bands in user-facing copy (an implementation detail), as the Design explicitly called for. Wording is accurate to the actual behavior (I/R longer, E shorter). |
| Test coverage | N/A — content, no dedicated test exists for any `EXPLAINERS` entry (pre-existing convention) |

### `docs/Guides/User Guide/user-guide.md` / `.html` / `.pdf` (+1/-1, +1/-1, binary)

| Property | Detail |
|----------|--------|
| Purpose | User Guide's `/workouts` subsection updated with the same "scales with intensity and length" wording as `explainers.ts` |
| Issues | #91 |
| Criteria covered | AC 10 |
| Quality | ✅ Correctly regenerated only the User Guide's derived HTML/PDF — confirmed via `git diff main..feature/91-scale-warmup-cooldown --stat` that neither the Deployment Guide nor Developer Guide binaries are touched, per `CLAUDE.md`'s convention. |
| Test coverage | N/A — documentation |

---

## Acceptance Criteria Verification

### #91 — Workout Suggestions: scale warm-up/cool-down duration instead of a fixed 10+10 min

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `WARMUP_COOLDOWN_MINUTES` replaced by a per-zone band table: E 5–10, M 8–12, T 10–14, I 12–16, R 12–16 min (each side, symmetric) | `workouts.ts:65-71` (`WARMUP_COOLDOWN_BAND`); constant removed (confirmed via `grep -rn "WARMUP_COOLDOWN_MINUTES\b" src/` → no matches) | `workouts.test.ts:196-235` | ✅ Met |
| 2 | Pure interpolation function using `t = clamp(qualityMinutes, 0, 60) / 60; result = round(bandMin + t × (bandMax − bandMin))` | `workouts.ts:79-85` (`computeWarmupCooldownMinutes`) — formula matches exactly | `workouts.test.ts:219-227` (hand-verified midpoint values for E and R) | ✅ Met |
| 3 | ~0 quality-minutes → band min; ≥60 quality-minutes → band max, for every zone | `computeWarmupCooldownMinutes` | `workouts.test.ts:197-210` (`it.each` over all 5 zones, both boundaries, plus 200min confirming the clamp doesn't overshoot) | ✅ Met |
| 4 | Warm-up duration always equals cool-down duration, for all 10 workouts across all 5 zones | Every builder computes one shared value and passes it to both `warmupSegment`/`cooldownSegment` | `workouts.test.ts:302-310` (`everyWorkout_warmupDuration_equalsCooldownDuration`, loops all 5×2); `workouts.test.ts` (page) `shows a symmetric warm-up and cool-down value on each card` | ✅ Met |
| 5 | `estimatedDurationMinutes` reflects the per-workout value, not a shared fixed 20 | All 5 builders: `Math.round(quality + 2 * warmupCooldownMinutes)` pattern, verified in `continuousWorkout:214`, `buildMWorkouts:264-266`, `buildTWorkouts:311`, `buildRepsWorkout:358` | `workouts.test.ts:127-135` (updated to check against each zone's own band min, not a fixed value) | ✅ Met |
| 6 | Every `warmup`/`cooldown` `WorkoutSegment` carries the new value; `WARMUP_INTENSITY`/`COOLDOWN_INTENSITY` unchanged | `workouts.ts:127-141`; intensities untouched at `workouts.ts:122-123` (still 0.25/0.25) | `workouts.test.ts:302-310`; `everyWorkout_segments_haveIntensityBetween0And1` (pre-existing, still passes) | ✅ Met |
| 7 | `/workouts` card copy shows each workout's own computed value | `+page.svelte:370-373` | `workouts.test.ts` (page) `shows a per-workout warm-up/cool-down value, not one shared fixed figure` | ✅ Met |
| 8 | Time-band filter needs no code change; a short R/I workout now fits "Under 30 min" where it previously couldn't | `+page.svelte`'s `fitsBand` function is unmodified in this PR (confirmed — not in the diff) | `workouts.test.ts:312-319` (`shortRZoneWorkout_atLowMileage_fitsUnderThirtyMinutesTotal`); independently re-verified live via `/verify` this session — 200m R-zone session at 10km/week shows 29 min and correctly appears under "Under 30 min," where the PR #90 review found every zone showed "none fit" | ✅ Met |
| 9 | Source/confidence documented as code comments, explicitly not a Daniels citation | `workouts.ts:48-64` | N/A (comments) | ✅ Met |
| 10 | `explainers.ts` and User Guide no longer describe "fixed 10-minute warm-up and 10-minute cool-down"; wording describes zone-scaled behaviour | `explainers.ts:217`; `user-guide.md:244` | N/A (content) | ✅ Met |
| 11 | Tests added and passing, covering interpolation boundaries/midpoints per zone, workout-builder output, page-level card copy, no regression to `/workouts`/`/training-paces` tests | See per-file audit above | Full suite: 49 files / 954 tests passing (confirmed via `/verify` this session); `training-paces.ts` has zero diff in this PR, so no regression risk there | ✅ Met |
| 12 | No regressions to the volume-scaling or session-shape (rep-distance) rules | `computeZoneVolumeKm`, `computeELongRunVolumeKm`, rep-distance constants (`I_REP_DISTANCES_M`, `R_REP_DISTANCES_M`), `MIN_REPS` — all byte-identical to `main`, confirmed via diff (only warm-up/cool-down-related lines touched within each builder function) | Pre-existing volume/session-shape tests all still pass unmodified | ✅ Met |

**Summary:** 12/12 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 — At very low weekly mileage, the "Long run" card can show a shorter warm-up than the "Regular easy run" card beside it
- **Category:** Reliability / UX consistency
- **Location:** `src/lib/utils/workouts.ts:184-198` (`computeELongRunVolumeKm`) interacting with the new `computeWarmupCooldownMinutes` at `workouts.ts:79-85`
- **Description:** `computeZoneVolumeKm`'s E-zone branch clamps quality duration to a **minimum** of 30 minutes (`E_DURATION_MIN_MINUTES`), but `computeELongRunVolumeKm` has no equivalent lower floor — only an upper cap that applies at ≥64km/week. At very low weekly mileage (e.g. 1km/week, within the app's allowed 1–300km input range), the "Long run" workout's own quality duration can be far smaller than the "Regular easy run"'s (which is floored at 30 min), so the Long run's interpolated warm-up lands near the E-zone band minimum (5 min) while the Regular run's lands higher (8 min) — verified live via `/verify` this session: at 1km/week, "Regular easy run" showed "8 min warm-up" while "Long run" (a 2-minute session) showed "5 min warm-up," right next to each other on the same row. This isn't a bug introduced by this PR — the tiny 2-minute "long run" itself is pre-existing #19 behaviour, unrelated to warm-up/cool-down — but #91's per-workout scaling makes an already-odd edge case newly visible and specifically jarring: a card literally named "Long run" showing a *shorter* warm-up than the "Regular easy run" beside it contradicts the card's own name. Previously both cards said "10 min" regardless, which masked this.
- **Recommendation:** Not blocking — this only manifests at an unrealistic weekly-mileage input (1km/week is far below any real runner's training volume) and doesn't break anything functionally. Worth a follow-up issue if it's worth polishing (e.g. giving the Long run its own lower quality-duration floor, matching the Regular run's), but out of scope for #91 itself, which was specifically about warm-up/cool-down, not E-zone volume-floor logic.
- **Resolution:** Fixed in `5ccd771` rather than left for future work. Applied the same `E_DURATION_MIN_MINUTES` (30 min) floor to `computeELongRunVolumeKm` that the Regular easy run's own `computeZoneVolumeKm` E branch already uses — mirrors the existing pattern exactly rather than inventing a new one. This was a deliberate choice between two options (confirmed with the user): float the actual prescribed Long run duration/volume up to the floor (chosen), vs. a narrower fix that only adjusted the warm-up calculation's input while leaving the prescribed session untouched. The chosen approach fixes the root cause directly — a Long run is now never prescribed less running than a Regular easy day, in both its own duration/volume and its scaled warm-up/cool-down — rather than papering over a symptom. Re-verified live at the exact 1km/week input that originally surfaced the finding: "Long run" now shows 30 min (up from 2 min) and an 8 min warm-up matching "Regular easy run" exactly. Two new tests added (`computeELongRunVolumeKm_LowMileage_ClampsDurationTo30MinMinimum`, `computeELongRunVolumeKm_AtLowMileage_IsNeverShorterThanRegularEasyRun`); all 3 pre-existing `computeELongRunVolumeKm` tests continue to pass unmodified (their inputs are all well above where the new floor binds).

### Suggestions (optional)

None.

---

## Positive Observations

- **The `warmupCooldownMinutes`-computed-once-and-reused pattern** in every builder function eliminates any risk of the segment duration and the `estimatedDurationMinutes` arithmetic ever disagreeing — a real design strength carried through cleanly into the implementation, not just stated intent.
- **The page reads its displayed value from the same `segments` array the chart renders**, rather than introducing a second parallel data path — this was explicitly called out as a design decision to prevent drift, and the implementation honors it exactly (confirmed via code read, not just trusting the commit message).
- **The regression test target is concrete and independently re-verified**: rather than a vague "should be shorter now" assertion, the test asserts a specific short R-zone workout drops under 30 minutes, and this session's `/verify` run confirmed the same input live in the browser produces exactly the described improvement (the "Under 30 min" filter, which the PR #90 review found unusable, now surfaces real results).
- **`it.each` used to cover all 5 zones per boundary case** in the new tests avoids 15 near-duplicate test blocks, consistent with this file's established style.
- **Doc-comment honesty is maintained**: the new `WARMUP_COOLDOWN_BAND` comment explicitly states there is no Daniels source for warm-up/cool-down, in both directions (old flat value and new scaled bands) — matching this codebase's established discipline (seen in `power-zones.ts`, `workouts.ts`'s volume-scaling comments) of never overstating confidence.
- Full test suite (49 files / 954 tests, +22 from this PR) and lint (0 errors/warnings repo-wide) both pass cleanly as of this PR's tip.

---

## Action Items

### Immediate Fixes (block merge)
- None — no Critical or Major findings.

### Post-merge improvements
- [x] m1: Floor the E-zone "Long run"'s duration at 30 min, matching the Regular run's existing floor — fixed in `5ccd771`

All findings addressed; none left open for future work.

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
- [x] No unnecessary changes outside scope of the issue
