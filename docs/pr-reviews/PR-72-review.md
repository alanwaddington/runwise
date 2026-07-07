# PR #72 Review — fix: standardize custom distance field transitions across tools (#50)

**Date:** 2026-07-07
**Author:** alanwaddington
**Branch:** `feature/50-standardize-custom-distance-transitions` → `main`
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate → Strong (all gaps closed) |
| Acceptance Criteria | 13 Met / 13 Total |
| Lint | 0 errors / 0 warnings |
| Findings | All 3 findings (m1, m2, S1) fixed — none deferred |

**Update (post-review, all findings fixed):** every finding below — including the two
Minor findings and the Suggestion, which would normally be optional — was fixed rather
than left for future development, per explicit direction. See the bottom of each finding
and the Action Items section for what changed.

---

## Issues Reviewed

This repository's `/analyse` → `/design` → `/develop` workflow appends `## Analysis` and `## Design` sections (including a `6. Acceptance Criteria` block and a `3. Work Breakdown` with per-task acceptance criteria) directly onto a single tracking issue rather than creating separate linked sub-issues. GitHub's `parentIssue`/`subIssues` GraphQL fields are not populated for this repo (confirmed: `parentIssue` query returned `Field 'parentIssue' doesn't exist on type 'Issue'`; `subIssues` returned an empty node list), so the full hierarchy lives inside one issue.

### Issue Hierarchy
- **#50** — fix: standardize custom distance field transitions across tools (root — contains the original issue body with 4 root-level acceptance criteria, plus appended `## Analysis` and `## Design` sections with 9 further design-level acceptance criteria and a 4-task work breakdown)

The PR's 4 commits map directly to the design's work breakdown: Task 1 (shared component), Tasks 2+3 (migrate all three tools), plus two additional fix commits (analytics dev-mode resolution, keyboard-focus containment) discovered during this PR's own `/verify` review process and folded into the same PR rather than deferred.

---

## Changed Files Audit

### `src/lib/components/CollapsibleField.svelte` (+25 / -0, new file)

| Property | Detail |
|----------|--------|
| Purpose | New shared component encapsulating the collapse/expand transition (`max-h-0`/`opacity-0` ↔ `max-h-24`/`opacity-100`/`mb-4`, `overflow-hidden transition-all duration-200`), `aria-hidden` toggling, and (added in commit 4) `inert` toggling, driven by a single `expanded` boolean prop and a Svelte 5 `Snippet` for arbitrary child content. |
| Issues | #50 |
| Criteria covered | Design AC 1, 2, 3, 4, 5, 9 (component extraction, shared usage, duration/easing parity, `aria-hidden` semantics, DOM-persistence, dedicated unit test) |
| Quality | ✅ Markup is a verbatim, byte-for-byte lift of the pre-existing Race Predictor/Training Paces inline pattern (confirmed against `git diff` — no new class values introduced), eliminating regression risk for those two tools. Generic — no reference to "custom distance" or `InputField`, satisfying the design's genericity requirement. The `inert={!expanded}` addition (commit `c26c5b7`) closes a real accessibility gap: `aria-hidden` alone does not remove a nested focusable element from the tab order, so a keyboard user could previously Tab into the invisible field. Verified live in Chromium (not just asserted via a jsdom property check) that `inert` blocks both `.focus()` and real Tab-key navigation while collapsed, and doesn't interfere with the field once expanded. |
| Test coverage | `CollapsibleField.test.ts` — 6 tests covering collapsed/expanded classes, `aria-hidden` presence/absence, `inert` property presence/absence, DOM-persistence in both states, and snippet-content genericity. |

### `src/lib/components/CollapsibleField.test.ts` (+61 / -0, new file)

| Property | Detail |
|----------|--------|
| Purpose | Unit tests for the new shared component in isolation, using `createRawSnippet` (matching the existing `ToolLayout.test.ts` convention for testing Snippet-based components). |
| Issues | #50 |
| Criteria covered | Design AC 9 ("A dedicated unit test exists for the shared component itself") |
| Quality | ✅ Correctly tests `wrapper.inert` as a DOM **property** rather than via `toHaveAttribute('inert')`, with an inline comment explaining why: Svelte sets `inert` via the IDL property setter rather than `setAttribute`, so jsdom's `outerHTML`/attribute inspection doesn't surface it even though the property is set correctly. This is accurate — verified independently during this review (see Reliability notes below). |
| Test coverage | N/A — this file is the test. |

### `src/routes/race-predictor/+page.svelte` (+3 / -10)

| Property | Detail |
|----------|--------|
| Purpose | Replaces the inline collapse-wrapper `<div>` (lines 104–119 previously) with `<CollapsibleField expanded={isCustom}>` wrapping the existing `InputField`. |
| Issues | #50 |
| Criteria covered | Design AC 1, 6 (migration to shared component, no visual/behavioral regression) |
| Quality | ✅ Pure structural replacement — no change to `isCustom` derivation, validation, or any other logic. Diff confirms the exact same five conditional classes and `aria-hidden` logic now live in the shared component instead of inline. |
| Test coverage | `race-predictor.test.ts` — `custom km input is not visible initially`, `selecting Custom reveals the custom km label`, plus the pre-existing `shows 7 rows when custom distance is entered alongside valid time` (exercises the field end-to-end, not just visibility). |

### `src/routes/race-predictor/race-predictor.test.ts` (+1 / -3)

| Property | Detail |
|----------|--------|
| Purpose | Updates a comment and simplifies one assertion (`custom km input is not visible initially`) to reflect that hiding is now delegated to `CollapsibleField`, rather than testing an inline implementation detail. |
| Issues | #50 |
| Criteria covered | Design AC 8 ("Existing automated tests updated to reflect the shared component, with no loss of coverage") |
| Quality | ✅ No behavioral assertions were weakened — the test still asserts the field is present in the DOM; only the now-outdated inline-implementation comment was removed. |
| Test coverage | N/A — this file is the test. |

### `src/routes/training-paces/+page.svelte` (+3 / -10)

| Property | Detail |
|----------|--------|
| Purpose | Identical migration to Race Predictor: inline wrapper `<div>` replaced with `<CollapsibleField expanded={isCustom}>`. |
| Issues | #50 |
| Criteria covered | Design AC 1, 6 |
| Quality | ✅ Same verbatim-lift guarantee as Race Predictor. |
| Test coverage | `training-paces.test.ts` was **not modified** by this PR, but already contains equivalent coverage pre-existing this branch (`custom km input is present in the DOM initially`, `selecting Custom reveals the custom km label`, `custom distance with valid time shows results` — confirmed present at lines 129–147). No coverage gap results from this file's change. |

### `src/routes/vo2max/+page.svelte` (+3 / -2)

| Property | Detail |
|----------|--------|
| Purpose | Replaces the old `<div hidden={!isCustom}>` (instant, non-animated, no `aria-hidden`) with `<CollapsibleField expanded={isCustom}>`, giving VO2 Max the same smooth transition and accessibility semantics as the other two tools. This is the actual behavioral fix the issue was filed for — the other two files above are refactors with explicitly no intended behavior change. |
| Issues | #50 |
| Criteria covered | Root AC 1, 2, 3, 4; Design AC 2, 6 (partial — VO2 Max side) |
| Quality | ✅ This is the one file in the migration set where user-visible behavior actually changes (instant → animated), and it's implemented identically to the already-shipped pattern rather than inventing a new one. |
| Test coverage | `vo2max.test.ts` — updated tests below. |

### `src/routes/vo2max/vo2max.test.ts` (+5 / -3)

| Property | Detail |
|----------|--------|
| Purpose | Replaces `.not.toBeVisible()` / `.toBeVisible()` assertions (which depended on the native `hidden` attribute, a jsdom-observable state) with `.toBeInTheDocument()` assertions matching the DOM-persistence pattern now shared with Race Predictor/Training Paces, since jsdom cannot observe Tailwind's compiled `opacity-0`/`max-h-0` CSS. |
| Issues | #50 |
| Criteria covered | Design AC 5, 8 |
| Quality | ✅ Correct adaptation — `toBeVisible()` would have silently passed for the wrong reason once the underlying hide mechanism changed from `hidden` (which jsdom *does* respect) to CSS classes (which it doesn't); updating to `toBeInTheDocument()` avoids a false-positive test. |
| Test coverage | N/A — this file is the test. |

### `vite.config.ts` (+4 / -3)

| Property | Detail |
|----------|--------|
| Purpose | Scopes the existing `resolve: { conditions: ['browser'] }` override to `process.env.VITEST` only. Previously this override applied globally (dev server, production build, **and** Vitest), which stripped Vite's automatic `development`/`production` resolve conditions from the dev/build config. This silently broke `$app/environment`'s `dev` export (sourced from `esm-env`'s condition-keyed package exports), which in turn made `injectAnalytics({ mode: dev ? 'development' : 'production' })` in `+layout.ts` always resolve `mode: 'production'` in local dev — so the Vercel Analytics script requested the production-only `/_vercel/insights/script.js` endpoint locally and 404'd on every page load. |
| Issues | Not filed against #50 — discovered and fixed during this PR's own `/verify` review process (see commit message, which explicitly says "Found during PR #72 verification"). Out of #50's literal scope; see Finding m1. |
| Criteria covered | None from #50's acceptance criteria list — this is an unrelated, independently-justified bug fix bundled into the same PR. |
| Quality | ✅ The fix is minimal and precisely scoped to the actual root cause (confirmed by reading `esm-env`'s package.json export-condition map and its `dev-fallback.js`, which falls back to reading `process.env.NODE_ENV` — undefined in a browser context, hence the bug). Verified independently in both directions: Vitest's original `['browser']`-only resolution is preserved (719/719 tests still pass), and production build mode is unaffected (still resolves `mode: 'production'` correctly, confirmed via a fresh `npm run build && npm run preview` in this review). |
| Test coverage | No automated test exists for this (nor could one easily — it's a build-tool resolve-condition interaction, not application logic). Verified only via ad-hoc Playwright scripts checking `window.vam` and network requests in both `vite dev` and `vite preview`, not committed to the repo. See Finding m2. |

---

## Acceptance Criteria Verification

### #50 — fix: standardize custom distance field transitions across tools (root-level)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | VO2 Max custom distance field uses same transition pattern as Race Predictor | `src/routes/vo2max/+page.svelte:142-157` uses `<CollapsibleField expanded={isCustom}>`, same component/props as `race-predictor/+page.svelte:104-119` | `vo2max.test.ts:37-49` | ✅ Met |
| 2 | Duration and easing consistent across all tools (currently `transition-all duration-200`) | `CollapsibleField.svelte:15` — single source of `overflow-hidden transition-all duration-200`, applied identically via the shared component on all three pages | `CollapsibleField.test.ts:36-42` | ✅ Met |
| 3 | `aria-hidden` properly set when field is hidden | `CollapsibleField.svelte:21` — `aria-hidden={!expanded ? 'true' : undefined}`, plus `inert={!expanded}` (commit 4) closing the keyboard-focus gap that `aria-hidden` alone leaves open | `CollapsibleField.test.ts:15-24, 26-34` | ✅ Met |
| 4 | Tested on all three tool pages | Automated: `vo2max.test.ts`, `race-predictor.test.ts` updated; `training-paces.test.ts` pre-existing equivalent coverage. Manual: documented Playwright verification against dev **and** production builds across all three tools in this session's `/verify` passes (transition classes, `aria-hidden`, DOM-persistence, keyboard-focus containment) | See file-level test coverage above | ✅ Met |

### #50 — Design section, `6. Acceptance Criteria`

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | A new shared component encapsulates the collapse/expand transition, replacing the duplicated inline markup in Race Predictor and Training Paces | `CollapsibleField.svelte` (new); both pages migrated | `CollapsibleField.test.ts` | ✅ Met |
| 2 | VO2 Max's custom distance field uses the same shared component as Race Predictor and Training Paces | `vo2max/+page.svelte:142` | `vo2max.test.ts:37-49` | ✅ Met |
| 3 | Duration (200ms) and easing (Tailwind default) are identical across all three tools | Single shared component — physically impossible for the three tools to diverge | `CollapsibleField.test.ts:36-42` | ✅ Met |
| 4 | `aria-hidden="true"` is set on the wrapper when collapsed, and **omitted** (not `"false"`) when expanded, on all three tools | `CollapsibleField.svelte:21` uses `undefined` (which Svelte omits) rather than `'false'` when expanded | `CollapsibleField.test.ts:26-34` explicitly asserts `.not.toHaveAttribute('aria-hidden')` | ✅ Met |
| 5 | Field content remains in the DOM at all times (not conditionally rendered with `{#if}`), on all three tools | `CollapsibleField.svelte:24` — `{@render children?.()}` is unconditional; no `{#if}` anywhere in the component or the three call sites | `CollapsibleField.test.ts:44-51` ("keeps child content in the DOM when collapsed/expanded") | ✅ Met |
| 6 | Race Predictor and Training Paces retain their exact current visual behaviour after migration (no regression) | Markup/classes verbatim-lifted from the pre-existing inline pattern (confirmed via diff — no new class values) | No automated visual-regression test exists (see Finding m2); verified via this session's Playwright transition-class comparison across dev and production builds | ✅ Met (manually/live-verified; no persisted automated visual test) |
| 7 | Manually tested on all three tool pages confirming smooth, matching expand/collapse animation | Confirmed via this session's `/verify` passes (Playwright against `vite dev` and `vite preview`, screenshots captured) | N/A — manual verification, not a repo artifact | ✅ Met (evidence lives in this review process, not in a committed file — see Finding m2) |
| 8 | Existing automated tests updated to reflect the shared component, with no loss of coverage | `race-predictor.test.ts`, `vo2max.test.ts` updated; `training-paces.test.ts` had pre-existing equivalent coverage | See individual file audits above | ✅ Met |
| 9 | A dedicated unit test exists for the shared component itself, verifying its classes and `aria-hidden` state toggle correctly | `CollapsibleField.test.ts` — 6 tests, exceeding the requirement (also covers `inert`, DOM-persistence, and snippet genericity) | Self | ✅ Met |

**Summary:** 13/13 criteria met (4 root-level + 9 design-level).

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 — Two of the four commits fix issues outside #50's stated scope, with no tracking issue
- **Category:** Code Quality / Process
- **Location:** `vite.config.ts` (commit `d733df2`), `CollapsibleField.svelte` (commit `c26c5b7`, the `inert` addition)
- **Description:** Both fixes are well-justified and correctly implemented (see file audits above), and both commit messages honestly state they were "found during PR #72 verification" rather than being silently smuggled in. But neither is traceable to an issue: the analytics/`vite.config.ts` fix has no relationship to #50 at all, and the `inert` addition, while it does strengthen root AC 3 ("aria-hidden properly set"), goes beyond what #50 or its design literally asked for. A future contributor reading #50's closed-issue history won't understand why `vite.config.ts` changed in "the CollapsibleField PR."
- **Recommendation:** Either (a) split these two commits into a separate PR with its own issue, or (b) if bundling is intentional (reasonable, given both are small and were discovered mid-review of this exact PR), add a one-line note to the PR description explicitly calling out that commits 3–4 are unrelated review-discovered fixes, not part of #50's scope — the current PR description (written before those two commits were pushed) doesn't mention them at all.
- **Fixed:** PR description updated with an "Out-of-scope fixes bundled into this PR" section naming both commits, what they fix, and why they're not tracked by a separate issue — done via `gh api repos/.../pulls/72 -X PATCH` (plain `gh pr edit` was hitting an unrelated GraphQL error from this repo's deprecated Projects-classic integration).

#### m2 — No persisted evidence of the manual/visual verification the acceptance criteria require
- **Category:** Test Coverage
- **Location:** Design AC 6 and 7 (visual-parity / manual cross-tool testing)
- **Description:** Both criteria are genuinely satisfied — this review independently re-verified the claims live (transition classes, `aria-hidden`, DOM-persistence, and the `inert` focus-containment fix, across both `vite dev` and a full `vite build && vite preview` production run, on all three tools). But that verification exists only as Playwright scripts run ad hoc during this session and this review's own transcript — nothing is committed to the repo.
- **Correction:** this finding originally stated "There's no project-level `verifier-*` skill file under `.claude/skills/` for this repo (checked; none exists)" — that was wrong. `.claude/skills/verifier-runwise/SKILL.md` does exist (it's what this and prior `/verify` passes on this PR were actually running). The real gap was narrower: that file didn't yet capture this PR's new learnings (hydration-timing gotcha, cookie-banner handling, the resolve-conditions/analytics quirk, the Playwright `webServer` cold-start timeout).
- **Fixed:** folded four new sections into the existing `.claude/skills/verifier-runwise/SKILL.md` instead of creating a duplicate: (1) a "Recipe: interacting with a page right after `page.goto`" section documenting the `waitUntil: 'networkidle'` + explicit wait requirement before dispatching `selectOption`/`fill` (this PR's own verification silently no-op'd on `selectOption('Custom')` until this was found), (2) a "Recipe: dismissing the cookie-consent banner" section with both a click-through and a `localStorage`-seeding option, (3) a gotcha entry on the `vite.config.ts` resolve-conditions bug and the `window.vam` debugging signal, (4) a gotcha entry on `playwright.config.ts`'s `webServer` 60s timeout being tight against this environment's ~50-55s build time, with the pre-build-then-reuse workaround.

### Suggestions (optional)

#### S1 — `inert`'s focus-blocking behavior is only verified live, not in the committed test suite
- **Category:** Test Coverage
- **Location:** `CollapsibleField.test.ts`
- **Description:** The unit test correctly asserts `wrapper.inert === true/false` (the property), which is the most jsdom can offer — jsdom does not implement `inert`'s actual focus-blocking enforcement, only the IDL property reflection. The real behavioral guarantee (Tab/`.focus()` genuinely can't reach the collapsed field) was only checked via one-off Playwright scripts in this session, not as part of `npm run test:e2e`.
- **Recommendation:** If the project's Playwright e2e suite (`test:e2e` in `package.json`) is actively maintained, consider adding one e2e test asserting Tab-key focus skips the collapsed custom-distance field on at least one of the three tools. Purely optional — the current unit test is honest about its limits (see its own inline comment) rather than pretending to cover more than jsdom can verify.
- **Fixed:** added `e2e/collapsible-field-focus.test.ts` — 6 tests (2 per tool × 3 tools) asserting via real keyboard `Tab` presses in Chromium that the collapsed field is unreachable (5 Tab presses from the distance select never land on `#custom-km`) and that it becomes reachable normally once expanded. All 6 pass. Verified the new file doesn't regress the existing e2e suite: pre-existing `e2e/pace.test.ts`/`theme-hover.test.ts` baseline is 9 passed / 2 failed (both pre-existing failures — a page-title-format mismatch and a flaky hover-color assertion — confirmed unrelated to this PR, present before these changes).

---

## Positive Observations

- The extraction is a genuine DRY win with zero speculative generality: `CollapsibleField`'s markup is a verbatim lift of already-shipped behavior (confirmed via diff, not just design-doc claim), which is exactly the right amount of caution for a "consolidate, don't redesign" refactor.
- The component API (`expanded` + `children` snippet) has no knowledge of "custom distance" or `InputField`, correctly satisfying the design's genericity requirement without over-engineering (no speculative `maxHeight` prop, no premature configurability — noted and justified explicitly in the design doc).
- Test updates (`race-predictor.test.ts`, `vo2max.test.ts`) correctly recognized that `toBeVisible()` assertions would silently degrade into false positives once the hide mechanism moved from the native `hidden` attribute to Tailwind classes jsdom can't observe, and proactively fixed the test semantics rather than leaving a latent false-positive.
- Commit hygiene is excellent throughout: every commit message explains *why*, not just *what*, and the two review-discovered fixes are honest about their provenance ("Found during PR #72 verification") rather than folded in silently.
- The `inert` fix wasn't satisfied with jsdom's property-only visibility — it was independently verified against real Chromium focus/tab-order behavior before being committed, which is the correct level of rigor for an accessibility claim.
- 719/719 tests pass, 0 lint errors/warnings, and the one `svelte-check` error present (`ToolLayout.test.ts:154`) is confirmed pre-existing and unrelated (no diff on this branch for that file).

---

## Action Items

### Immediate Fixes (block merge)

None.

### Post-merge improvements

None remaining — all three findings (m1, m2, S1) were fixed immediately rather than deferred:
- [x] m1: PR description updated to disclose commits 3–4 as review-discovered, out-of-scope fixes
- [x] m2: `.claude/skills/verifier-runwise/SKILL.md` updated with this PR's new verification learnings
- [x] S1: `e2e/collapsible-field-focus.test.ts` added — 6 passing tests covering `inert`'s Tab-key focus containment across all three tools

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases (collapsed/expanded, DOM-persistence, focus containment — now including a real-browser e2e test, not just jsdom property assertions)
- [x] Lint run — zero errors introduced by this PR (re-confirmed after fixes: 0 errors / 0 warnings)
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent (N/A — no new error paths introduced)
- [x] Logging adequate for debugging production issues (N/A — no logging-relevant code)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue — the two out-of-scope commits are now disclosed in the PR description (Finding m1, fixed); still technically outside #50's literal scope, but no longer *undisclosed*, which was the actual defect
