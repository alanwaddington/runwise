# PR #119 Review — fix: address GSC soft-404 on /workouts and orphan guide indexing

**Date:** 2026-10-12
**Author:** alanwaddington
**Branch:** fix/gsc-soft-404-and-indexing → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ (all findings fixed) |
| Risk Level | Low |
| Test Coverage | Adequate (gap closed — see Findings) |
| Acceptance Criteria | 6 / 6 (derived from PR description — see note below) |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

> **Process note:** This PR referenced no GitHub issue — not in its title, body, branch name, or commit messages, and no open/closed issue in the repo matched ("soft-404", "GSC", "indexing" searches all came up empty for this work). `CLAUDE.md` mandates issue-driven development (`/analyse` → `/design` → `/develop` → `/verify` → `/pr-reviewer` → `/merge`), so this PR appears to have skipped the `/analyse`/`/design` steps and gone straight to implementation. There was no issue hierarchy to traverse per Step 2 of this process. In its absence, the six numbered claims in the PR description are treated below as the acceptance criteria and verified directly against the code and tests. **Update:** issue #120 has since been filed retroactively (see Finding M1's Outcome) and the PR body now links it.

> **Update (findings fix pass):** All findings below (M1, m1, m2) have been fixed per their recommendations — see each finding's **Outcome** line. Full test suite re-run after the fixes: 1448/1448 passing across 75 files. S1 required no action (it was a positive observation, not a defect).

---

## Issues Reviewed

No issue hierarchy exists for this PR. No `#NNN` references found in title, body, branch name, or commits; no matching issue found by searching the repo's issue tracker for "soft-404", "GSC", "workouts soft", or "indexing".

### Issue Hierarchy
- *(none — see process note above)*

---

## Changed Files Audit

### `src/routes/workouts/+page.svelte` (+39 / -4)

| Property | Detail |
|----------|--------|
| Purpose | Shows a worked example (5K/25:00 @ 30km/week) on a cold visit instead of the empty "enter your inputs" state, clearing on first edit to any of the three pace-tab inputs. Introduces `isColdVisit`, `usingExampleDefaults`, `paceInputIsExample` state to track this without a separate render path. |
| Issues | None referenced |
| Criteria covered | PR claim 1 (worked example shown by default); PR claim 3 (deep-link mileage still blank) |
| Quality | ✅ No issues. The `paceInputIsExample` / `usingExampleDefaults` split is a deliberate, well-commented design to stop the Pace tab's placeholder race result from leaking into HR mode's "no real race result entered" fallback-pace check (`trainingPaceResult` is gated on `!paceInputIsExample`, not the broader `usingExampleDefaults`) — confirmed correct both by reading `hrResult`'s `trainingZones` wiring (lines 256–266) and by live browser verification (switching to HR mode on a cold visit still shows the fallback-pace notice rather than silently treating the example time as real). `raceResultQuery`/the training-paces cross-link intentionally remain un-gated (pre-existing code, untouched), so the example's VDOT/pace output is cross-linkable too — consistent with "flows through the existing results pipeline." |
| Test coverage | `workouts.test.ts` — 6 new/changed tests directly covering this: cold-visit example shown, example clears on input, deep-link query params still leave mileage blank, malformed query params fall back to the example, HR-mode fallback-pace notice still fires despite the example time being present. ✅ |

### `src/routes/workouts/workouts.test.ts` (+38 / -5)

| Property | Detail |
|----------|--------|
| Purpose | Adds coverage for the new cold-visit/example behavior and the preserved deep-link mileage behavior. |
| Issues | None referenced |
| Criteria covered | Verifies PR claims 1 and 3 |
| Quality | ✅ No issues. Tests are specific and assert both positive and negative cases (example shown / example absent once edited / cross-link absent once cleared). |
| Test coverage | N/A (this is the test file itself) — re-ran in isolation during `/verify`: 75/75 passed. |

### `src/lib/components/GuideArticle.svelte` (+17 / -0)

| Property | Detail |
|----------|--------|
| Purpose | Renders a section's `links` field (previously silently ignored) as a list of styled anchors, treating any URL not starting with `/` as external (`target="_blank" rel="noopener noreferrer"`) and internal URLs as plain same-tab links. |
| Issues | None referenced |
| Criteria covered | PR claim 5 (guide → `/power-zones` cross-link renders, internal links not opening in a new tab) |
| Quality | ✅ No issues. Mirrors the existing pattern already used in `PageExplainer.svelte` (see below), so the two components now share identical link-rendering logic — reasonable duplication given they're different top-level components rendering a shared `ExplainerSection[]` type, rather than over-engineering a shared snippet for two call sites. |
| Test coverage | ⚠️ No dedicated unit test for `GuideArticle.svelte`'s new link rendering (no `GuideArticle.test.ts` exists in the diff or repo). Verified live via Playwright during `/verify` instead (link present, correct `target`/`rel`, click navigates). Low risk given the straightforward conditional, but a component test would have caught a regression here without needing a browser. |

### `src/lib/components/PageExplainer.svelte` (+3 / -2)

| Property | Detail |
|----------|--------|
| Purpose | Changes internal-link handling: previously **every** link in `section.links` was forced to `target="_blank" rel="noopener noreferrer"` regardless of destination; now only links not starting with `/` get that treatment. |
| Issues | None referenced |
| Criteria covered | PR claim 5 (power-zones → guide cross-link opens in the same tab) |
| Quality | ✅ No issues, but this is a **behavior change to existing, already-shipped explainer links**, not purely additive — see Finding m1 below for the blast-radius check performed. |
| Test coverage | ⚠️ No `PageExplainer.test.ts` exists for either the old or new behavior. Verified live: the two pre-existing external links on `/power-zones` (Stryd store, Amazon affiliate) still correctly render `target="_blank" rel="noopener noreferrer"` after this change — regression-checked by hand during `/verify`, not by an automated test. |

### `src/lib/content/explainers.ts` (+7 / -1)

| Property | Detail |
|----------|--------|
| Purpose | Adds a `links` entry to the `/power-zones` explainer's "Critical Power, Threshold Power, and MAP" section, pointing to `/guides/running-power-zones-explained`. |
| Issues | None referenced |
| Criteria covered | PR claim 5 (power-zones → guide link) |
| Quality | ✅ No issues. Reuses the pre-existing `ExplainerLink`/`links?` field on `ExplainerSection` (confirmed in `explainers.ts:1-10`) exactly as the PR description claims — no type changes needed. |
| Test coverage | ⚠️ No test asserts this specific link exists in content data; covered only by the live Playwright check during `/verify` (found the `/guides/running-power-zones-explained` link present, correct label and `target`). |

### `src/lib/content/guides/running-power-zones-explained.ts` (+7 / -1)

| Property | Detail |
|----------|--------|
| Purpose | Adds a `links` entry to the guide's final section, pointing to `/power-zones`. |
| Issues | None referenced |
| Criteria covered | PR claim 5 (guide → power-zones link) |
| Quality | ✅ No issues. `GuideContent.sections` is typed as `ExplainerSection[]` (`guides/types.ts:1,9`), so this correctly reuses the same shared `links` field rather than introducing a parallel structure. Confirmed this is the *only* guide in `src/lib/content/guides/*.ts` that defines `links` — so the previously-missing render logic in `GuideArticle.svelte` wasn't silently breaking any other guide. |
| Test coverage | ⚠️ Same as above — no automated test, verified live only. |

---

## Acceptance Criteria Verification

No linked issue exists (see process note). Criteria below are the PR description's own numbered claims, verified independently against code and tests, not trusted at face value.

### PR description — claim set

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `/workouts` shows a worked example (5K, 25:00, 30km/week) by default on a cold, no-param visit, clearly labeled | `+page.svelte:55-61,74,81,1168-1175` (`isColdVisit`, `EXAMPLE_TIME_RAW`/`EXAMPLE_WEEKLY_MILEAGE_RAW`, banner text) | `workouts.test.ts:51-55` | ✅ Met |
| 2 | Example clears as soon as the user edits any of the three pace-tab inputs, reusing the existing results pipeline (no separate code path) | `+page.svelte:372-401` (`usingExampleDefaults = false` set in `onDistanceChange`/`onCustomKmInput`/`onTimeInput`/`onWeeklyMileageInput`); example flows through the same `result`/`buildWorkoutsResult` pipeline as real input, no parallel render branch | `workouts.test.ts:57-65` | ✅ Met |
| 3 | A deep link with a race result but no `mileage` param still leaves weekly mileage blank (preserves existing behavior) | `+page.svelte:60,74` (`isColdVisit = !prefill && !mileageParam`; mileage only seeded with the example when `isColdVisit`, i.e. never when `prefill` is set) | `workouts.test.ts:184-188` | ✅ Met |
| 4 | Example shown is "clearly labeled" as an example, not presented as real/personalized output | `+page.svelte:1168-1175` — explicit banner: "Showing an example for a 25:00 5K at 30 km/week. Enter your own race result and weekly mileage above to personalize these workouts." | `workouts.test.ts:53` (asserts the exact banner text) | ✅ Met |
| 5 | `running-power-zones-explained` guide and `/power-zones` tool cross-link both ways, reusing the existing explainer `links` field | `explainers.ts:194-199` (power-zones → guide), `running-power-zones-explained.ts:40-45` (guide → power-zones), rendered by `GuideArticle.svelte:33-49` and `PageExplainer.svelte:25-41` | No automated test (content-data + rendering change); verified live via Playwright during `/verify` — both links present, correct label, click navigates | ✅ Met (verified at runtime, not by an automated test — see Finding m2) |
| 6 | Internal links (including the new guide↔tool links) render without `target="_blank"`; external links are unaffected | `GuideArticle.svelte:36,40-41`, `PageExplainer.svelte:28,32-33` (`external = !link.url.startsWith('/')`) | No automated test; verified live — internal links have no `target`/`rel`, pre-existing external links (Stryd, Amazon) still get `target="_blank" rel="noopener noreferrer"` | ✅ Met (verified at runtime, not by an automated test — see Finding m2) |

**Summary:** 6/6 criteria met.

---

## Findings

### Critical (must fix before merge)

*None.*

### Major (should fix)

#### M1 — PR bypassed issue-driven development with no tracked requirements
- **Category:** Process
- **Location:** N/A (repo-wide process, per `CLAUDE.md`)
- **Description:** `CLAUDE.md` specifies a mandatory workflow (`/analyse` → `/design` → `/develop` → `/verify` → `/pr-reviewer` → `/merge`). This PR has no associated issue at any level — nothing in the title, body, branch name, or commits, and no matching issue exists in the tracker. There is no recorded acceptance criteria, no design rationale beyond the PR body's prose, and nothing for `/merge`'s "close issues" step to close.
- **Recommendation:** Retroactively file an issue (even post-hoc) capturing the GSC soft-404 symptom and the orphan-guide finding, so there's a durable record outside this PR description, and so the GSC re-validation (re-submit URL for indexing, confirm "Crawled — currently not indexed" clears) has somewhere to be tracked to closure. Going forward, run `/analyse` before `/develop` for GSC/SEO fixes like this one, even when the fix itself is small.
- **Outcome:** ✅ Fixed. Filed #120 retroactively, with AC1-5 marked delivered by this PR and AC6 (GSC re-validation, a manual post-deploy step) left open. PR #119's body now links it ("Relates to #120").

### Minor (nice to fix)

#### m1 — `PageExplainer.svelte`'s link behavior change isn't purely additive
- **Category:** Code Quality / Test Coverage
- **Location:** `src/lib/components/PageExplainer.svelte:28,32-33`
- **Description:** Before this PR, every link in every `PageExplainerContent` section unconditionally got `target="_blank" rel="noopener noreferrer"`. This PR changes that to be conditional on the URL not starting with `/`. That's correct and desired for the new internal link, but it silently changes behavior for every *existing* explainer link across the whole site (anything already using `links` on other pages), not just the one this PR is adding. I manually checked the two external links currently live on `/power-zones` (Stryd store, Amazon affiliate) and both still open in a new tab as expected, but no automated test pins this down, and I didn't exhaustively check every other page's explainer content for an accidental internal-looking `href` (e.g. a protocol-relative URL or an `href` that happens to start with `/` but points off-site) that could now silently lose its `target="_blank"`.
- **Recommendation:** Add a small `PageExplainer.test.ts` (and ideally a matching `GuideArticle.test.ts`) asserting both branches of the `external` check, so this logic isn't verified only by hand-checking two links in a browser.
- **Outcome:** ✅ Fixed. Correction: `PageExplainer.test.ts` already existed pre-PR but only covered the external-link branch; it did not cover internal links at all, so the finding's substance held even though "no test file exists" was imprecise. Added `PageExplainer_SectionWithInternalLink_RendersWithoutTargetBlank`, asserting an internal link gets neither `target` nor `rel`. Full suite re-run: 1448/1448 passing.

#### m2 — No automated test coverage for the guide/power-zones cross-links or the internal-vs-external link split
- **Category:** Test Coverage
- **Location:** `src/lib/content/explainers.ts`, `src/lib/content/guides/running-power-zones-explained.ts`, `GuideArticle.svelte`, `PageExplainer.svelte`
- **Description:** All of claim 5 and claim 6 (the entire second half of this PR) were verified only via live browser interaction during `/verify`, not by any test in the diff. `workouts.test.ts` only covers the `/workouts` soft-404 half.
- **Recommendation:** A lightweight component test rendering `GuideArticle` with a mock `GuideContent` containing one internal and one external link (asserting `target`/`rel` on each) would catch a future regression without needing a browser.
- **Outcome:** ✅ Fixed. Correction: `GuideArticle.test.ts` already existed pre-PR but its fixture had no `links` at all, so the new rendering branch was completely untested. Added `links` (one internal, one external) to the test fixture plus three tests covering href/label rendering, the internal no-`target`/`rel` case, and the external `target="_blank" rel="noopener noreferrer"` case. Also added the requested content-level assertions — `guides.test.ts`: `runningPowerZonesExplained_crossLinksToThePowerZonesCalculator`; new `explainers.test.ts`: `powerZonesExplainer_crossLinksToTheRunningPowerZonesGuide` — so the production content data itself is pinned, not just the rendering logic. Full suite re-run: 1448/1448 passing.

### Suggestions (optional)

#### S1 — Banner's example values are duplicated as both state and display strings
- **Category:** Code Quality
- **Location:** `+page.svelte:58-59,1172`
- **Description:** `EXAMPLE_TIME_RAW`/`EXAMPLE_WEEKLY_MILEAGE_RAW` are already used as both the seeded `$state` default and the banner's interpolated text, so there's no actual duplication risk here — just flagging as read: if either constant's format ever changes (e.g. `25:00` → `24:30`), the banner text updates automatically since it's interpolated, not hardcoded. No action needed; this is a positive observation, not a defect.

---

## Positive Observations

- The `paceInputIsExample` vs. `usingExampleDefaults` distinction is a genuinely well-thought-through piece of state design — it would have been easy to gate everything off one flag and accidentally leak the Pace tab's placeholder race time into HR mode's "has the user entered a real race result" cross-check. The code comments explain exactly why the split exists, and live verification during `/verify` confirmed the HR-mode fallback-pace notice still fires correctly even with the unedited example present on the Pace tab.
- The fix deliberately reuses the existing results-rendering pipeline for the example (`buildWorkoutsResult` is called with the example inputs exactly as it would be with real ones) rather than adding a parallel "example mode" render branch — lower risk, and the PR description says so explicitly, which the code confirms.
- Preserving the deep-link-without-mileage behavior (mileage stays blank from a shared link, rather than being silently filled with the unrelated example mileage) is the right call and is both correctly implemented and tested.
- Good regression discipline: confirmed the new `GuideArticle.svelte` link-rendering change doesn't affect any other guide, since `running-power-zones-explained.ts` is the only guide content file that defines `links`.
- Zero lint errors or warnings introduced.

---

## Action Items

### Immediate Fixes (block merge)
*None — no Critical or Not-Met findings.*

### Post-merge improvements
- [x] M1: File a retroactive issue for this fix and track GSC re-indexing/re-validation to closure — #120
- [x] m1: Add `PageExplainer.test.ts` coverage for the internal/external `target`/`rel` split
- [x] m2: Add `GuideArticle.test.ts` coverage for the same internal/external link split, plus content-level assertions that the guide↔power-zones cross-links exist

---

## Checklist

- [x] All acceptance criteria verified by reading actual code (no linked issue existed — PR description's claims used instead, see process note)
- [x] Every changed file read and audited
- [x] Tests cover happy path and the main edge cases for the `/workouts` half; the guide cross-link half has no automated test coverage (runtime-verified only)
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent (N/A — no new error paths introduced)
- [x] Logging adequate for debugging production issues (N/A — no new logging surface)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the fix
