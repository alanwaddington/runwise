# PR #94 Review — Workout Suggestions: independent warm-up and cool-down duration (#93)

**Date:** 2026-08-07
**Author:** alanwaddington
**Branch:** feature/93-asymmetric-warmup-cooldown → main
**State:** Open
**Commits reviewed:** 4 (5ec11fe, 101ccf3, caff134, 742381a)

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 11 Met / 11 Total |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

### Issue Hierarchy

- #93 — Workout Suggestions: consider asymmetric warm-up/cool-down duration — root issue with embedded `## Analysis` and `## Design` sections, no parent issue, no sub-issues (confirmed via GraphQL — `subIssues` returned empty, same convention as prior PRs #90/#92). #93's own `## Analysis` section (11 checkbox acceptance criteria) is the verifiable criteria set audited below.

---

## Changed Files Audit

### `src/lib/utils/workouts.ts` (+71 / -48 lines)

| Property | Detail |
|----------|--------|
| Purpose | Splits the shared `WARMUP_COOLDOWN_BAND`/`computeWarmupCooldownMinutes` (from #91) into independent `WARMUP_BAND`/`computeWarmupMinutes` (values unchanged) and new `COOLDOWN_BAND`/`computeCooldownMinutes`, both sharing a private `interpolateBandMinutes` helper; simplifies `warmupSegment`/`cooldownSegment` to take an already-computed minutes value; updates all 5 workout-builder functions to compute both values once and use each independently |
| Issues | #93 |
| Criteria covered | AC 1, 2, 3, 4, 5, 7, 9, 10 |
| Quality | ✅ The shared `interpolateBandMinutes` helper means the interpolation formula itself can never drift between warm-up and cool-down — only the band tables differ. Mathematically, since `COOLDOWN_BAND[zone].min ≤ WARMUP_BAND[zone].min` and `.max ≤ .max` for every zone (enforced by its own test), and the interpolation is a convex combination of min/max, `computeCooldownMinutes(zone, t) ≤ computeWarmupMinutes(zone, t)` holds as a genuine invariant, not just an empirically-tested coincidence — verified this by hand-deriving the interpolation as `min·(1-t) + max·t` and confirming component-wise domination is preserved. Every builder computes both values once and reuses them for both the segment and the duration formula (`quality + warmupMinutes + cooldownMinutes`), preserving #91's "compute once, reuse" discipline for two independent values now instead of one shared one. `WARMUP_INTENSITY`/`COOLDOWN_INTENSITY` (chart height) are untouched, confirmed via diff — only duration changed. |
| Test coverage | `workouts.test.ts` — `computeWarmupMinutes`/`computeCooldownMinutes` describe blocks (boundary/midpoint per zone via `it.each`), band-ordering invariant test, `everyWorkout_warmupDuration_isAtLeastCooldownDuration`, `everyZone_atLeastOneWorkout_hasWarmupStrictlyLongerThanCooldown` |

### `src/lib/utils/workouts.test.ts` (+72 / -16 lines)

| Property | Detail |
|----------|--------|
| Purpose | Tests for the above: `computeCooldownMinutes` mirrors `computeWarmupMinutes`'s existing test shape exactly (retargeted at the new band), a new `%sZone_BandIsNeverHigherThanWarmupBand` invariant test, and replaces the old symmetric-equality test with two new tests — one confirming `warmup ≥ cooldown` holds for every workout, one confirming strict inequality is achieved in practice for at least one workout per zone |
| Issues | #93 |
| Criteria covered | AC 11 |
| Quality | ✅ Splitting "always holds (≥)" and "genuinely differs in practice (>)" into two separate tests is a meaningful distinction — a test that only checked `≥` could pass even if cool-down accidentally stayed equal to warm-up everywhere; the second test specifically guards against that regression. Hand-verified the two new `computeELongRunVolumeKm`-adjacent tests already present from #92 (`_LowMileage_ClampsDurationTo30MinMinimum`, `_AtLowMileage_IsNeverShorterThanRegularEasyRun`) remain untouched and still pass — confirms this PR didn't need to touch #92's fix, and the two features compose correctly (verified live during `/verify`: E "Regular easy run" and "Long run" still show identical warm-up/cool-down at floor mileage, as expected since both share the same floored quality duration). |
| Test coverage | Self |

### `src/routes/workouts/workouts.test.ts` (+8 / -2 lines)

| Property | Detail |
|----------|--------|
| Purpose | Replaces `'shows a symmetric warm-up and cool-down value on each card'` with `'shows warm-up greater than or equal to cool-down on every card, with at least one card strictly greater'` |
| Issues | #93 |
| Criteria covered | AC 6, 11 |
| Quality | ✅ No production code change accompanies this test update — confirmed via `git diff` that `src/routes/workouts/+page.svelte` has zero diff in this PR. This is a genuine payoff from #91's own design choice to read `segments[0]`/`segments[last]` independently rather than from a shared constant; re-verified live via `/verify` this session (all 5 zones show correctly differing values, e.g. Easy 10/6, Interval 15/10, zero console errors). |
| Test coverage | Self |

### `src/lib/content/explainers.ts` (+2 / -2 lines)

| Property | Detail |
|----------|--------|
| Purpose | Two body-text updates: "Reading a workout card" now states warm-up/cool-down are "each scaled independently... with cool-down typically the shorter of the two" (previously described as one undifferentiated phrase); "Source and confidence" drops the "which is not available to fetch" clause entirely (a same-session drive-by fix, not part of #93's own design, but touching the exact paragraph #93's Task 3 already modified) |
| Issues | #93 (independence wording), plus a same-session drive-by fix (AI-sounding phrasing) |
| Criteria covered | AC 8 |
| Quality | ✅ The independence wording accurately reflects the shipped behaviour. The "fetch" wording removal is a good catch — "which is not available to fetch" did read like an agent describing a tool-access limitation rather than natural human writing — and correctly resolved by dropping the claim entirely rather than rewording it, since a human genuinely could buy or borrow the book; the original claim was arguably inaccurate, not just awkwardly phrased. Scope note: this second change isn't part of #93's own acceptance criteria — see Suggestion S1. |
| Test coverage | N/A — content, no dedicated test exists for any `EXPLAINERS` entry (pre-existing convention) |

### `docs/Guides/User Guide/user-guide.md` / `.html` / `.pdf` (+1/-1, +1/-1, binary)

| Property | Detail |
|----------|--------|
| Purpose | User Guide's `/workouts` subsection updated with matching "each scaled independently... cool-down typically the shorter of the two" wording |
| Issues | #93 |
| Criteria covered | AC 8 |
| Quality | ✅ Correctly regenerated only the User Guide's derived HTML/PDF — confirmed via `git diff main..feature/93-asymmetric-warmup-cooldown --stat` that neither the Deployment Guide nor Developer Guide binaries are touched, per `CLAUDE.md`'s convention. |
| Test coverage | N/A — documentation |

---

## Acceptance Criteria Verification

### #93 — Workout Suggestions: consider asymmetric warm-up/cool-down duration

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | A new cool-down band table exists, distinct from the unchanged warm-up band table: E 4–6, M 5–8, T 6–9, I 8–11, R 8–11 minutes (each zone's cool-down band strictly lower than its warm-up band) | `workouts.ts:65-89` (`WARMUP_BAND` values byte-identical to #91's `WARMUP_COOLDOWN_BAND`; `COOLDOWN_BAND` matches the Analysis exactly) | `workouts.test.ts:291-297` (`%sZone_BandIsNeverHigherThanWarmupBand`, all 5 zones) | ✅ Met |
| 2 | Cool-down duration computed via the same interpolation mechanism as warm-up (shared 0–60 min reference curve, linear within its own band, rounded to nearest whole minute) — no new calculation logic invented | `workouts.ts:93-102` (`interpolateBandMinutes` shared by both wrappers, `REFERENCE_MAX_MINUTES = 60` unchanged from #91) | `workouts.test.ts:258-289` (boundary/midpoint tests mirror `computeWarmupMinutes`'s exactly) | ✅ Met |
| 3 | For every zone, warm-up and cool-down computed independently; at least one workout per zone demonstrates warm-up ≠ cool-down at a realistic input | Every builder computes `warmupMinutes`/`cooldownMinutes` via separate function calls (`workouts.ts:232-233, 283-284, 319-320, 369-370`) | `workouts.test.ts:374-386` (`everyZone_atLeastOneWorkout_hasWarmupStrictlyLongerThanCooldown`, all 5 zones, weeklyMileage=80) | ✅ Met |
| 4 | `estimatedDurationMinutes` equals quality time + own warm-up value + own cool-down value | All 5 builders: `Math.round(quality + warmupMinutes + cooldownMinutes)` pattern, verified in `continuousWorkout:239`, `buildMWorkouts:290-292`, `buildTWorkouts:338`, `buildRepsWorkout:386` | `workouts.test.ts:310-317` (`everyWorkout_segmentDurations_sumToEstimatedDuration`, pre-existing from #91, still generalizes correctly) | ✅ Met |
| 5 | Every `'cooldown'` segment carries the new independently-computed value; `WARMUP_INTENSITY`/`COOLDOWN_INTENSITY` unchanged | `workouts.ts:149-160`; intensities untouched at 0.25/0.25 | `workouts.test.ts:319-328` (`everyWorkout_segments_haveIntensityBetween0And1`, pre-existing, still passes) | ✅ Met |
| 6 | `/workouts` card copy shows the two independent values correctly; no wording implies/requires equality | `+page.svelte` — **zero diff in this PR**, confirmed via `git diff`; already reads `segments[0]`/`segments[last]` independently since #91 | `workouts.test.ts` (page) — new test at line 167 | ✅ Met — genuinely zero code change needed, re-verified live |
| 7 | The two existing symmetric-equality tests are updated to assert correct independent values instead of equality | `workouts.ts`'s test replaced at `workouts.test.ts:364-386`; page test replaced at `workouts.test.ts:167-178` | Both new test sets pass | ✅ Met |
| 8 | Source/confidence documented on the cool-down band table, citing the research basis (Garmin Coach, Runna, general coaching guidance), explicitly not a Daniels citation | `workouts.ts:73-82` — cites all three sources by name plus the "no fraction relationship found" conclusion | N/A (comment) | ✅ Met |
| 9 | `explainers.ts` and User Guide reviewed/updated if wording implied equality | `explainers.ts:217`, `user-guide.md:244` — both now state independence explicitly | N/A (content) | ✅ Met |
| 10 | Tests added and passing, covering cool-down interpolation boundaries/midpoints, workout-builder independence, page-level independence, no regression to `/workouts`/`/training-paces` | See per-file audit above | Full suite: 49 files / 979 tests passing (confirmed via `/verify` this session at this exact HEAD); `training-paces.ts` has zero diff in this PR | ✅ Met |
| 11 | No regressions to volume-scaling, session-shape (rep-distance), or warm-up band/calculation rules | `computeZoneVolumeKm`, `computeELongRunVolumeKm`, `I_REP_DISTANCES_M`/`R_REP_DISTANCES_M`, `MIN_REPS`, and `WARMUP_BAND`'s own values — all byte-identical to pre-PR `main`, confirmed via diff (only cool-down-related lines and the two builder-function call sites touched) | Pre-existing volume/session-shape tests all still pass unmodified; `computeELongRunVolumeKm`'s #92-era floor tests (`_LowMileage_ClampsDurationTo30MinMinimum`, `_AtLowMileage_IsNeverShorterThanRegularEasyRun`) untouched and still pass | ✅ Met |

**Summary:** 11/11 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

None.

### Suggestions (optional)

#### S1 — The "fetch" wording fix touches content outside #93's own acceptance criteria
- **Category:** Code Quality (scope)
- **Location:** `src/lib/content/explainers.ts:225` (in the diff, though the line number in the file after the change is 225 in the pre-fix version referenced by the commit)
- **Description:** Commit `742381a` removes "which is not available to fetch" from the `/workouts` explainer's "Source and confidence" section. This is a good fix (see Quality note above), and it touches the same paragraph #93's own Task 3 already modified — but it was a same-session, user-requested drive-by fix, not something #93's Analysis or Design called for. Noted here purely for traceability, for anyone auditing this PR against #93 specifically in the future.
- **Recommendation:** None required — purely informational. This is exactly the same pattern as PR #90's S1 finding (unrelated but adjacent content fix bundled into the same PR by explicit request).

---

## Positive Observations

- **The band-domination invariant is mathematically guaranteed, not just empirically tested.** Because `COOLDOWN_BAND[zone].min ≤ WARMUP_BAND[zone].min` and `.max ≤ .max` for every zone, and the shared interpolation is a convex combination of min/max, `cooldownMinutes ≤ warmupMinutes` holds for *any* quality-session duration, not just the specific inputs the test suite happens to exercise. Verified this by hand-deriving the interpolation formula — a genuinely robust design, not a coincidence of the chosen test cases.
- **Zero production code changes needed in `/workouts`' UI layer** — a direct, measurable payoff from #91's own design decision (reading warm-up/cool-down independently from `segments[0]`/`segments[last]` rather than a shared constant) paying off exactly as that PR's design predicted it would.
- **The research citation in the new `COOLDOWN_BAND` comment names its actual sources** (Garmin Coach, Runna, general coaching guidance) rather than a generic "informed by research" hand-wave — a future maintainer can trace exactly where the numbers came from.
- **Splitting "always ≥" from "genuinely > for at least one case" into two separate tests** is a meaningful distinction that guards against a subtly different regression than a single combined test would catch.
- **Composition with #92's E-long-run duration floor was verified, not assumed** — live-tested during `/verify` that the two independently-shipped fixes (this PR's asymmetric cool-down, #92's duration floor) interact correctly rather than just trusting they wouldn't conflict.
- Full test suite (49 files / 979 tests, +23 from this PR) and lint (0 errors/warnings repo-wide) both pass cleanly as of this PR's tip.

---

## Action Items

### Immediate Fixes (block merge)
- None — no Critical, Major, or Minor findings.

### Post-merge improvements
- None.

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
- [x] No unnecessary changes outside scope of the issue — S1 reviewed and left as informational per its own recommendation; no blocking scope issues
