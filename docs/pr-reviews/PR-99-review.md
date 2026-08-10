# PR #99 Review — Export workouts as .FIT files for watch upload (#98)

**Date:** 2026-08-10
**Author:** alanwaddington
**Branch:** feature/98-fit-workout-export → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ (all findings fixed post-review — see Findings section) |
| Risk Level | Low |
| Test Coverage | Gap closed (M1 fixed) |
| Acceptance Criteria | 13/13 Met |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing — this PR also fixed all 15 pre-existing errors on `main`) |

**Update (2026-08-10, post-review):** All findings below (M1, m1, S1) were fixed at the user's request, regardless of severity. See each finding's **Outcome** line and the updated Action Items section.

---

## Issues Reviewed

Single-issue hierarchy — issue #98 contains its own `## Analysis` and `## Design` sections (produced by this repo's `/analyse` and `/design` commands) rather than separate linked sub-issues. GitHub's sub-issue GraphQL API is not enabled on this repo (`parentIssue`/`subIssues` fields do not exist on this repository's `Issue` type), and no other issue numbers appear anywhere in the PR title, body, branch name, or any of the 10 commit messages.

### Issue Hierarchy
- #98 — Export structured workouts as .FIT files for watch upload (Garmin primary target) (root, contains both Analysis and Design sections, enhancement, currently open)

---

## Changed Files Audit

### `.github/dependabot.yml` (+12/-0)

| Property | Detail |
|----------|--------|
| Purpose | Scopes automated dependency-update PRs to `@garmin/fitsdk` only, via `allow`, so a new SDK release surfaces as a review-only PR without generating noise for every other dependency. |
| Issues | #98 |
| Criteria covered | "Dependabot (or equivalent) is configured to open (not auto-merge) a PR when a new `@garmin/fitsdk` version is published" |
| Quality | ✅ No issues. Valid YAML, matches GitHub's documented `dependabot.yml` schema for `allow`/`dependency-name`. No auto-merge workflow exists anywhere in `.github/workflows/`, so this is inherently review-gated. |
| Test coverage | Not automatable (no CI run of a real Dependabot event) — verified by schema reading only. |

### `package.json` / `package-lock.json` (+1/-0 / +7/-0)

| Property | Detail |
|----------|--------|
| Purpose | Adds `@garmin/fitsdk` (`^21.212.0`) as a runtime dependency. |
| Issues | #98 |
| Criteria covered | Supports FIT encoding acceptance criteria below. |
| Quality | ✅ No issues. Lockfile diff is minimal and consistent with a single new dependency addition. |
| Test coverage | N/A (dependency manifest). |

### `src/lib/utils/fit-export.ts` (+249/-0, new file)

| Property | Detail |
|----------|--------|
| Purpose | Core FIT encoding: `buildFitFilename()`, `buildFitWorkout()`, and the internal step-building/repeat-detection logic that turns a `Workout`'s segments into FIT `workout`/`workout_step` messages via `@garmin/fitsdk`. |
| Issues | #98 |
| Criteria covered | Valid FIT binary for pace/power reps and continuous workouts; work segments use zone range, non-work use Easy range; native `repeat_step` with no trailing recovery; step durations/targets match source; entirely client-side; descriptive filename. |
| Quality | ✅ Clean separation of concerns (`computeStepTarget`, `buildSimpleStep`, `buildWorkoutSteps`, `writeFitMesg`, `buildFitWorkout` each have one job). The `writeFitMesg` cast (`as unknown as Encodable<Mesg>`) is well-justified and documented — the SDK's shipped `.d.ts` types every FIT enum field as `number` even though the runtime/README convention is human-readable strings, confirmed empirically per the code comment. Dynamic `import('@garmin/fitsdk')` correctly keeps the SDK out of the base `/workouts` bundle. |
| Test coverage | ✅ `fit-export.test.ts` — 12 tests covering filename slugification, pace/power target encoding, repeat-step compression, no-trailing-recovery, flat continuous encoding, and duration fidelity. |

### `src/lib/utils/fit-export.test.ts` (+238/-0, new file)

| Property | Detail |
|----------|--------|
| Purpose | Round-trip encode/decode tests for `fit-export.ts`, decoding the actual encoded bytes back via `@garmin/fitsdk`'s own `Decoder` rather than asserting on the encoder's input. |
| Issues | #98 |
| Criteria covered | "Automated round-trip test exists covering encoding of a sample rep-based and a sample continuous workout." |
| Quality | ✅ Genuinely verifies the binary output (via `Decoder.isFIT`/`checkIntegrity`), not just that the encoder was called with the right arguments — a materially stronger test than mocking the SDK. The `unrollSteps` helper (replaying a `repeatUntilStepsCmplt` step's referenced block) correctly proves compressed encoding is behaviourally equivalent to the flat source segments. |
| Test coverage | N/A (this is the test file). |

### `src/lib/utils/segment-targets.ts` (+103/-0, new file)

| Property | Detail |
|----------|--------|
| Purpose | Extracts `getSegmentPaceRange`/`getSegmentPowerRange` (previously defined inline in `+page.svelte`) plus new numeric-output variants (`getSegmentPaceRangeSeconds`/`getSegmentPowerRangeWatts`) so `fit-export.ts` reuses the exact same target-narrowing math the UI displays. |
| Issues | #98 |
| Criteria covered | "Work segments use the workout's own zone range; warmup/cooldown/recovery segments use the Easy-zone range, matching current UI behavior for both pace and power." |
| Quality | ✅ No issues. This is the single most important correctness decision in the PR — a downloaded workout's targets can never silently drift from what's shown on screen, since both paths call the same function. |
| Test coverage | ✅ `segment-targets.test.ts` — 14 tests covering work/non-work segments, intensity boundaries (0, 1, mid), malformed input, and the string/numeric variant pair for both pace and power. |

### `src/lib/components/Toast.svelte` + `toast.ts` store (+93/-0 / +29/-0, new files)

| Property | Detail |
|----------|--------|
| Purpose | The app's first toast/notification pattern — success (green, `role="status"`, 5s auto-dismiss) and failure (red, `role="alert"`, 7s auto-dismiss) cues, driven by a small writable store (`showToast`/`dismissToast`). |
| Issues | #98 |
| Criteria covered | "User sees a success cue after a completed download, and a distinct failure cue if encoding throws/fails." |
| Quality | ✅ Reuses existing `accent`/`error` color tokens rather than introducing new ones. Uses a plain CSS `@keyframes -global-toast-in` animation instead of `svelte/transition`'s `fly`/`fade`, specifically to avoid a dependency on the Web Animations API that jsdom (this repo's Vitest environment) doesn't implement — a deliberate, documented choice that avoided flaky/broken component tests. Accessible: dismiss button has `aria-label`, live-region roles are variant-appropriate. |
| Test coverage | ✅ `Toast.test.ts` — 8 tests covering both variants, both auto-dismiss timers, manual dismiss, and toast replacement. |

### `src/lib/content/explainers.ts` + `PageExplainer.svelte` + `PageExplainer.test.ts` (+35/-14 / +16/-0 / +59/-0 new)

| Property | Detail |
|----------|--------|
| Purpose | Adds a "Getting a workout onto your watch" help section to `/workouts` with real Garmin/COROS upload instructions and links, and an explicit Suunto/Polar unsupported note. Extends the shared `ExplainerSection` type with an optional `links` field and renders them in `PageExplainer.svelte` — previously links could only appear as unclickable text. |
| Issues | #98 |
| Criteria covered | Not a formal AC from the issue, but directly supports the issue's core goal (a runner can actually get the file onto a device) with accurate, verified guidance rather than the issue's original untested "should plausibly work on COROS/Suunto/Polar too" assumption. |
| Quality | ✅ Both links (`help.trainingpeaks.com/...`, `support.coros.com/...`) were independently verified as real, current URLs before being committed, per the session's own research. `target="_blank"` is correctly paired with `rel="noopener noreferrer"` (verified by test, not just by eye). The Suunto/Polar note is honest about a real platform limitation rather than silently omitting it. |
| Test coverage | ✅ `PageExplainer.test.ts` — 4 new tests (this component had **no prior test file at all**); covers unknown-route rendering, sections without links, and links' href/target/rel. |

### `src/lib/utils/workouts.ts` (+26/-3) / `src/lib/utils/power-workouts.ts` (+16/-10)

| Property | Detail |
|----------|--------|
| Purpose | Adds `roundWorkoutSegments()`, applied centrally at the public `buildZoneWorkouts()`/`buildPowerZoneWorkouts()` boundary so every segment's duration is guaranteed rounded to the nearest 5 seconds, regardless of which internal builder produced it. Fixes a real bug found during the PR's own manual testing (Garmin showing 5:33 for a segment the website displayed as "6m" — the underlying value was never actually rounded, only display-rounded). `power-workouts.ts` also drops `computePowerRepDurationMinutes`'s unused `weeklyMileageKm` parameter and fixes a `ZoneKey` import that was sourced from `workouts.ts` (which never re-exported it) instead of `training-paces.ts` directly. |
| Issues | #98 |
| Criteria covered | "Step durations and target ranges match the source workout" — this fix is what makes that criterion actually true in practice, not just in the narrow sense that the FIT file matches whatever (potentially unrounded) data existed. |
| Quality | ✅ The wrapper pattern (`buildZoneWorkouts` calls the renamed-internal `buildZoneWorkoutsUnrounded`, mapping `roundWorkoutSegments` over the result) is a clean, minimal-surface-area fix — it doesn't require touching the ~10 individual segment-construction call sites inside the builders, several of which were already inconsistent about calling `roundToNearest5Seconds()` locally. |
| Test coverage | ✅ New regression tests in both files: `everyWorkout_everySegment_durationRoundedToNearest5Seconds`, sweeping all zones × multiple mileages × (for power) all four devices. |

### `src/lib/utils/power-zones.ts` (+1/-1)

| Property | Detail |
|----------|--------|
| Purpose | Removes an em dash from the COROS device disclaimer string (part of the sitewide em-dash sweep). |
| Issues | #98 (sitewide cleanup requested during PR review) |
| Criteria covered | N/A — copy-only change. |
| Quality | ✅ No issues with the change itself. ⚠️ See Minor finding m1 — COROS is currently feature-flagged out of the live `/power-zones` device tabs (pre-existing, unrelated to this PR), so this specific line is not reachable/observable through the running app right now. |
| Test coverage | N/A (string literal, no dedicated test asserts its exact content). |

### `src/routes/pace/+page.svelte` (+3/-3) + `pace.test.ts` (+8/-8)

| Property | Detail |
|----------|--------|
| Purpose | Changes the "no value yet" placeholder for the mph/per-400m/per-800m outputs from an em dash (`—`) to a plain hyphen (`-`), as part of the sitewide sweep. Test file updated to match, including renaming a test that was previously literally named "shows em-dash for all outputs..." |
| Issues | #98 |
| Criteria covered | N/A — copy/UI-convention change, not an issue AC. |
| Quality | ✅ No issues. Verified in the browser during this session that the large bold monospace hyphen renders correctly (initially looked like a rendering glitch in a screenshot, confirmed via DOM text content and a zoomed capture that it's exactly `"-"`). |
| Test coverage | ✅ All affected assertions and test descriptions updated in the same commit. |

### `src/routes/workouts/+page.svelte` (+123/-97)

| Property | Detail |
|----------|--------|
| Purpose | The largest and most consequential file in the diff: adds the "Download as .FIT" button + `downloadFitWorkout()` handler + `<Toast />` wiring to the workout detail modal; fixes a real pre-existing bug in `switchMode()`/`reset()` (referenced `powerWeeklyMileageError`/`deviceTouched`/`powerWeeklyMileageTouched`, none of which were ever declared — dead references from before weekly mileage was unified into one shared field); changes the segment-breakdown duration display from rounded-to-nearest-minute to exact `formatDurationMinutes()`; simplifies now-redundant `'out-of-range'` narrowing in two `onclick` handlers; drops `zoneName`/`paceRange`/`powerRange` props being passed to `WorkoutProfileChart` that the component never declared or used; fixes the `maxWorkoutsPerZone` derived value's type-unsafe `result?.zones`/`powerResult?.zones` access. |
| Issues | #98 |
| Criteria covered | "'Download as .FIT' action available from the workout detail view, for both pace and power workout modes"; all display-consistency-related criteria. |
| Quality | ✅ The `switchMode`/`reset` fix is a genuine, previously-shipped bug (would have thrown `ReferenceError` at runtime if a code path ever executed those lines — Svelte's compiler apparently didn't catch it statically). The `Blob([bytes as unknown as ArrayBuffer], ...)` cast is well-commented and correct (a known TS strictness mismatch between `Uint8Array`'s generic backing-buffer type and `lib.dom`'s `BlobPart`, not a real runtime concern). ⚠️ See Major finding M1 — the new button/handler/toast wiring itself has no dedicated automated test in this file. |
| Test coverage | ⚠️ Gap — see M1. The pre-existing `workouts.test.ts` (route test) was not extended to cover the modal, the download button, or the toast integration; `Toast.svelte` and `fit-export.ts` are each unit-tested in isolation, but the actual wiring between them inside this component is untested by the automated suite. |

### `src/lib/affiliates.ts` / `EducationalSection.svelte` / `SiteFooter.svelte` (+1/-1 each, minor)

| Property | Detail |
|----------|--------|
| Purpose | Em-dash removal from a Stryd affiliate description, two homepage educational card descriptions, and the footer tagline. |
| Issues | #98 (sitewide cleanup) |
| Criteria covered | N/A — copy-only. |
| Quality | ✅ No issues. Straightforward punctuation substitutions (period, colon, comma chosen per clause), no behavioural change. |
| Test coverage | N/A (plain string literals, not under test). |

---

## Acceptance Criteria Verification

Issue #98's `## Design` section contains the canonical, most granular acceptance criteria list (13 items); its `## Analysis` section's earlier 5-item "Suggested acceptance criteria" list is a coarser-grained subset of the same requirements and is folded into the table below rather than duplicated.

### #98 — Export structured workouts as .FIT files for watch upload

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Generates a valid FIT binary for a representative pace-based workout (warmup → N x work/recovery reps → cooldown) with correct `speed` targets | `fit-export.ts:214` `buildFitWorkout()`, `computeStepTarget()` (kind='pace' branch, `fit-export.ts:59-67`) | `fit-export.test.ts:140` `buildFitWorkout_PaceRepWorkout_ProducesValidFitBinaryWithSpeedTargets` | ✅ Met |
| 2 | Generates a valid FIT binary for a representative power-based workout with correct `power` targets | `fit-export.ts:214`, `computeStepTarget()` (kind='power' branch, `fit-export.ts:69-73`) | `fit-export.test.ts:169` `buildFitWorkout_PowerRepWorkout_ProducesValidFitBinaryWithPowerTargets` | ✅ Met |
| 3 | Work segments use the workout's own zone range; warmup/cooldown/recovery segments use the Easy-zone range, matching current UI behavior for both pace and power | `segment-targets.ts` (shared by UI and export), `fit-export.ts:57` `computeStepTarget()` | `segment-targets.test.ts` (14 tests) | ✅ Met |
| 4 | Repeated intervals use FIT `repeat_step`, with no recovery step encoded after the final rep | `fit-export.ts:128-182` `buildWorkoutSteps()` | `fit-export.test.ts:193,206` (`EncodesRepeatedIntervalUsingNativeRepeatStep`, `NoRecoveryStepAfterFinalWorkStep`) | ✅ Met |
| 5 | Continuous (non-rep) workouts (tempo/long run/progression) export correctly as a flat step list | `fit-export.ts:143-146` (non-repeat-eligible branch) | `fit-export.test.ts:216` `buildFitWorkout_ContinuousWorkout_EncodesFlatStepListWithNoRepeatStep` | ✅ Met |
| 6 | Step durations and target ranges match the source workout in all cases above | `fit-export.ts` (duration/target computation) + `workouts.ts`/`power-workouts.ts` `roundWorkoutSegments()` (ensures the "source" itself is consistently rounded) | `fit-export.test.ts:232`, `workouts.test.ts:347`, `power-workouts.test.ts:246` | ✅ Met |
| 7 | File is generated entirely client-side; no workout data is sent to a server | `fit-export.ts` (no `fetch`/`XHR` anywhere), dynamic `import('@garmin/fitsdk')` is a same-origin module load, not a data submission | Verified by code inspection (no network I/O present) + manual browser network-tab observation during this session | ✅ Met |
| 8 | Imports cleanly into Garmin Connect with no errors, and syncs to a Garmin watch, for at least one pace-based and one power-based workout | N/A — hardware-dependent | User-confirmed manually in this session for both pace and power workouts, via real file transfer to a physical Garmin device | ✅ Met (manual verification, non-automatable by design) |
| 9 | "Download as .FIT" action available from the workout detail view, for both pace and power workout modes | `+page.svelte:963-1006` (single shared modal serves both modes) | ⚠️ No dedicated automated test — see Major finding M1. Manually verified in-browser this session (light/dark, both modes). | ✅ Met (manually verified; automated coverage gap noted) |
| 10 | Downloaded filename is descriptive (`runwise-<slugified label>-<zone>-<pace|power>.fit`), not a fixed generic name, for both pace and power workouts | `fit-export.ts:7-17` `slugify()`/`buildFitFilename()` | `fit-export.test.ts:72-91` (5 tests) | ✅ Met |
| 11 | User sees a success cue after a completed download, and a distinct failure cue if encoding throws/fails | `+page.svelte:251-289` `downloadFitWorkout()` (try/catch → `showToast`), `Toast.svelte` | `Toast.test.ts` (8 tests) for the component; ⚠️ the actual `+page.svelte` wiring is only manually verified — see M1 | ✅ Met (manually verified; automated coverage gap noted) |
| 12 | Automated round-trip test exists covering encoding of a sample rep-based and a sample continuous workout | — | `fit-export.test.ts` (round-trip encode→decode via the real `Decoder`, for both a rep-based and a continuous sample) | ✅ Met |
| 13 | Dependabot (or equivalent) is configured to open (not auto-merge) a PR when a new `@garmin/fitsdk` version is published | `.github/dependabot.yml` | Not automatable (no real Dependabot event in CI); verified by schema reading, and by confirming no auto-merge workflow exists in `.github/workflows/` | ✅ Met |

**Summary:** 13/13 criteria met. Two criteria (9, 11) are met based on manual/browser verification during this session rather than an automated regression test exercising the actual page component — flagged as Major finding M1, not as a criterion failure, since the underlying behaviour genuinely works and was directly observed, just not pinned down by CI.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

#### M1 — No automated test coverage for the Download button / Toast wiring inside the actual page component
- **Category:** Test Coverage
- **Location:** `src/routes/workouts/+page.svelte:251-289` (`downloadFitWorkout()`), `:963-1006` (button markup), `:1022` (`<Toast />`)
- **Description:** `fit-export.ts` and `Toast.svelte` are both thoroughly unit-tested in isolation, but nothing in the automated suite exercises them wired together inside `+page.svelte` itself — i.e., rendering the page, opening a workout modal, clicking "Download as .FIT", and asserting a toast appears (mocking `buildFitWorkout` and/or the Blob/URL APIs, which jsdom doesn't fully implement). `workouts.test.ts` (the route's existing test file) has zero references to the modal, the download button, `downloadFitWorkout`, or `Toast`/`showToast`. A future refactor that breaks the prop mapping into `buildFitWorkout()`, or silently removes the `try`/`catch`, would not be caught by CI — only by a human clicking through the app again.
- **Recommendation:** Add a test to `workouts.test.ts` (or a new co-located test file) that renders the page, drives it to an open workout modal, mocks `$lib/utils/fit-export`'s `buildFitWorkout` (success and rejection cases), and asserts the success/failure toast appears via the real component tree — following the same mocking pattern already used successfully for `$lib/content/explainers` in the new `PageExplainer.test.ts`.
- **Outcome:** ✅ **Fixed.** Added a `vi.mock('$lib/utils/fit-export', ...)` and 6 new tests to `workouts.test.ts` under a new `describe('Download as .FIT workflow')` block, covering: success toast + correct message (pace), the exact `buildFitWorkout` call arguments (`label`/`kind`/`zone`) for a pace workout, failure toast + button re-enabled, and both success and failure paths for a power-mode workout. `window.URL.createObjectURL/revokeObjectURL` and `HTMLAnchorElement.prototype.click` are stubbed locally in this describe block's `beforeEach` (jsdom doesn't implement the former at all, and log-noise-only-navigates for the latter). All 6 new tests pass; full suite remains green.

### Minor (nice to fix)

#### m1 — COROS power-zones disclaimer text is currently unreachable in the live UI
- **Category:** Reliability / Verification confidence
- **Location:** `src/lib/utils/power-zones.ts:254` (edited in this PR), `src/routes/power-zones/+page.svelte:17` (pre-existing, unrelated to this PR: `// COROS hidden pending further research ... keep out of DEVICES, don't delete backing code`)
- **Description:** This PR correctly removes an em dash from the COROS disclaimer string, but COROS is feature-flagged out of the `/power-zones` page's device tabs entirely (a pre-existing, deliberate decision unrelated to this PR). The edited line is therefore correct in source and covered by nothing except a manual `grep`/read — it cannot currently be observed rendering in the running app by anyone, including this review.
- **Recommendation:** No action needed for this PR specifically (the text is objectively correct either way). Worth a mental note for whoever eventually re-enables COROS on that page to double-check the disclaimer renders as expected then.
- **Outcome:** ✅ **No change required** — the recommended approach for this finding was explicitly "no action needed," so it's resolved as-is. The text itself was already correct (em dash already removed in the original commit); the only open question was reachability, which is a pre-existing `/power-zones` feature flag entirely outside this PR's scope and not something to alter here.

### Suggestions (optional)

#### S1 — Repeated `powerRangeStr` computation in `power-workouts.ts` (pre-existing, not introduced by this PR)
- **Category:** Code Quality
- **Location:** `src/lib/utils/power-workouts.ts` — the pattern `const powerRangeStr = powerZone.wattsLow && powerZone.wattsHigh ? ... : ...` appears verbatim 7 times across `buildPowerContinuousWorkout`, `buildPowerRepsWorkout`, and the E/M/T/I/R branches of `buildPowerZoneWorkoutsUnrounded`.
- **Description:** This duplication pre-dates this PR (this PR's diff to the file is limited to the `roundWorkoutSegments` wrapper and the `computePowerRepDurationMinutes` signature/import fix) and is out of this PR's scope, but since the file was read in full for this review, it's worth surfacing.
- **Recommendation:** A small `formatPowerRangeStr(powerZone: PowerZone): string` helper would remove the duplication. Not blocking; candidate for a follow-up cleanup issue.
- **Outcome:** ✅ **Fixed.** Added exported `formatPowerRangeStr()` to `power-workouts.ts` and replaced all 6 duplicated declaration sites (`buildPowerContinuousWorkout`, `buildPowerRepsWorkout`, and the E/M/T/I/R branches of `buildPowerZoneWorkoutsUnrounded`) with calls to it. Added 3 new unit tests (`formatPowerRangeStr.test.ts` block in `power-workouts.test.ts`) covering both-bounds-present and each open-ended-bound case.

---

## Positive Observations

- **Root-caused two real bugs during the PR's own lifecycle, not just at design time.** The segment-rounding bug (Garmin showing 5:33 for a UI-displayed "6m") and the double-rounding display bug were both found via the author's own manual Garmin testing mid-PR, correctly diagnosed to their actual root cause (data not rounded at the source vs. display re-rounding an already-correct value), fixed with proper regression tests, and re-verified live rather than just patched and hoped for.
- **`segment-targets.ts` extraction is the single best correctness decision in this PR.** By making the FIT exporter call the exact same target-narrowing functions the UI already uses to display ranges on screen, it's structurally impossible for a downloaded workout to drift from what the website shows — this isn't just DRY, it closes off an entire category of future bugs.
- **Empirically verified rather than assumed the third-party SDK's actual behaviour.** The discovery that `@garmin/fitsdk`'s Encoder silently drops subfield keys (documented in a code comment in `fit-export.ts`) came from hands-on testing against the real library, not from trusting its own README examples — and the fix is clearly explained for future maintainers.
- **Honest scope-narrowing based on real research, not assumption.** The original issue claimed FIT export "should plausibly work on COROS/Suunto/newer Polar too." This PR's help-section work actually verified that claim and found it false for Suunto/Polar (neither supports structured FIT import at all, confirmed via their own docs/forums), and updated the shipped guidance to say so explicitly rather than leaving users on those platforms confused about why "Download as .FIT" doesn't do anything for them.
- **Left the codebase cleaner than it found it.** Beyond the feature itself, this PR fixed all 15 pre-existing lint/type errors on `main` (including a real, previously-shipped runtime bug in `switchMode()`/`reset()`), taking the repo from 15 errors to 0.
- **New component (`PageExplainer.svelte`) got its first-ever test file** as a side effect of extending it, rather than being left untested.

---

## Action Items

### Immediate Fixes (block merge)
None.

### Post-merge improvements
None — all findings (M1, m1, S1) were fixed immediately at the user's request rather than deferred. See each finding's Outcome above.

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases (with one noted integration-level gap, M1)
- [x] Lint run — zero errors introduced by this PR (and zero pre-existing errors remain, all fixed)
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues (`console.error` on encoding failure, paired with a user-facing toast)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue (the em-dash sweep and lint cleanup were explicitly requested by the user mid-PR, not unrequested scope creep)
