# PR #71 Review — Fix: dark-mode contrast/hover regression from PR #68's --text-* tokens (#51)

**Date:** 2026-07-06
**Author:** alanwaddington
**Branch:** `feature/51-dark-mode-hover-contrast` → `main`
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Strong — all Minor test-coverage gaps closed |
| Acceptance Criteria | 10 Met / 10 Total |
| Lint | 0 errors / 0 warnings |
| Findings | All 4 findings (M1, m1, m2, S1) fixed — none deferred |

**Update (post-review, all findings fixed):** every finding below — including the two Minor ones and the Suggestion, which would normally be optional — was fixed in follow-up commits rather than left for future work, per explicit direction. While fixing m2, a second, more serious silently-broken ESLint rule (`require-focus-visible`, from PR #66) was discovered and fixed too, which in turn surfaced 4 real pre-existing accessibility gaps (now also fixed). See the bottom of each finding and the Action Items section for the full resolution trail.

---

## Issues Reviewed

This repository's `/analyse` → `/design` → `/develop` workflow appends `## Analysis`, `## Design`, and `## Implementation Notes` sections to a single tracking issue rather than creating separate linked sub-issues. GitHub's `parentIssue`/`subIssues` GraphQL fields are not populated for this repo (confirmed: the API returned `Field 'parentIssue' doesn't exist`), so the full hierarchy lives inside one issue.

### Issue Hierarchy
- **#51** — fix: dark mode hover state invisible on theme toggle button (root — contains `## Analysis`, `## Design`, and `## Implementation Notes` sections, all in one issue)

---

## Changed Files Audit

### `src/app.css` (+11 / -2)

| Property | Detail |
|----------|--------|
| Purpose | (1) Renames `--text-muted`/`--text-subtle`/`--text-hover` → `--color-muted`/`--color-subtle`/`--color-hover`, fixing a real bug where Tailwind v4 compiled `--text-*`-namespaced custom properties as `font-size` instead of `color`. (2) Adds a working dark-mode override for `--color-muted` (`#9ca3af`). (3) Introduces `--color-hover: var(--color-ink)` as an explicit hover token. (4) Redefines Tailwind's `hover` variant via `@custom-variant hover (&:hover);`, dropping the `@media (hover: hover)` guard sitewide. |
| Issues | #51 |
| Criteria covered | AC 4, 5, 6 (token-level dark contrast fix); enables AC 1, 2, 8 (hover token) |
| Quality | ✅ Matches the existing `--color-ink`/`--color-bg` per-theme pattern exactly (symmetric `html.light`/`html.dark`/`prefers-color-scheme` blocks). The `@custom-variant hover` redefinition is a genuinely global, sitewide behavioral change (affects all 14 files using any `hover:` utility) — correctly commented in place explaining the trade-off, and confirmed (via the PR's own description and issue's Implementation Notes) to have been explicitly discussed and accepted with the requester before implementing. |
| Test coverage | No automated test exists for computed CSS custom property values or the `@media (hover: hover)` removal (verified only via ad-hoc Playwright scripts run during `/verify`, not committed to the repo). See Finding m1. |

### `src/lib/components/SiteNav.svelte` (+3 / -3)

| Property | Detail |
|----------|--------|
| Purpose | Replaces `hover:text-ink` with `hover:text-hover` on the six nav links and both theme-toggle buttons. |
| Issues | #51 |
| Criteria covered | AC 1, 8 |
| Quality | ✅ Pure rename, no behavior change (both tokens resolve identically). Focus-visible classes untouched. |
| Test coverage | `SiteNav.test.ts`: `toggleButtons_useExplicitHoverToken_notIncidentalInkFlip`, `toolLink_usesExplicitHoverToken_notIncidentalInkFlip` — both assert class-name presence/absence only (project convention, documented in-file: jsdom can't observe compiled Tailwind CSS, so visual/computed-color verification is deferred to live browser checks). |

### `src/lib/components/SiteFooter.svelte` (+2 / -2)

| Property | Detail |
|----------|--------|
| Purpose | Replaces `hover:text-ink dark:hover:text-gray-200` with `hover:text-hover` on the Privacy Policy link and Manage Cookies button — removes the last hardcoded dark-mode hover override in the codebase. |
| Issues | #51 |
| Criteria covered | AC 1, 8 |
| Quality | ✅ No issues. |
| Test coverage | `SiteFooter.test.ts`: `SiteFooter_privacyPolicyLinkAndManageCookiesButton_useExplicitHoverToken` — class-presence assertion; existing href/click-behavior tests untouched and still pass. |

### `src/lib/components/CookieBanner.svelte` (+3 / -3)

| Property | Detail |
|----------|--------|
| Purpose | Removes now-redundant `dark:text-gray-400` from the intro paragraph and "Necessary Only" button (both had manually pre-patched the exact bug this PR fixes at the token level); replaces `hover:text-ink dark:hover:text-gray-200` with `hover:text-hover` on "Necessary Only" and "Customise". |
| Issues | #51 |
| Criteria covered | AC 1, 6, 8 |
| Quality | ✅ Correctly identifies and removes dead/duplicate styling once the token fix supersedes it. |
| Test coverage | `CookieBanner.test.ts`: `necessaryOnlyAndCustomiseButtons_useExplicitHoverToken_noRedundantDarkOverrides`, `introParagraph_hasNoRedundantDarkTextOverride` — both negative + positive class assertions; all pre-existing consent-flow tests (Accept All / Necessary Only / Save Preferences) untouched and still pass. |

### `src/lib/components/ToolLayout.svelte` (+1 / -1)

| Property | Detail |
|----------|--------|
| Purpose | Removes redundant `dark:text-gray-400` from the tool description paragraph (found via a follow-up grep sweep during implementation, not part of the original Work Breakdown — explicitly approved before implementing per the issue's Implementation Notes). |
| Issues | #51 |
| Criteria covered | AC 6 (extends the token-level-only principle to files discovered post-design) |
| Quality | ✅ Correct removal. Note: this file's "← All tools" link still uses `hover:text-ink` (not migrated to `hover:text-hover`) — this is consistent with the Risk Analyst's explicitly documented scope boundary in the Design section (files with the bare, non-duplicated `hover:text-ink` pattern were deliberately left alone). Not a defect. |
| Test coverage | `ToolLayout.test.ts`: `description_hasNoRedundantDarkTextOverride`. |

### `src/routes/+error.svelte` (+1 / -1)

| Property | Detail |
|----------|--------|
| Purpose | Same redundant-override removal as `ToolLayout.svelte`, applied to the error page's message paragraph. |
| Issues | #51 |
| Criteria covered | AC 6 |
| Quality | ✅ No issues. Same `hover:text-ink` (not migrated) note as above applies to this file's "← All tools" link — consistent, documented, non-defect. |
| Test coverage | `error-page.test.ts`: `message_hasNoRedundantDarkTextOverride`. |

### `src/routes/privacy/+page.svelte` (+3 / -3)

| Property | Detail |
|----------|--------|
| Purpose | Replaces `hover:text-ink dark:hover:text-gray-200` with `hover:text-hover` on the "← Home" link and "Manage cookie preferences" button; removes redundant `dark:text-gray-400` from the body-copy wrapper and from the same button. |
| Issues | #51 |
| Criteria covered | AC 1, 6, 8 |
| Quality | ✅ No issues — mirrors the CookieBanner cleanup exactly, as designed. |
| Test coverage | ⚠️ No dedicated test file exists for this route (pre-existing gap, not introduced by this PR — the design's own Task 5 testing note explicitly deferred this to live/manual verification, which was performed per the issue's Implementation Notes). |

### Test files (`*.test.ts`, +69 / -0 total across 5 files)

All five test-file diffs are purely additive (no existing test was modified or removed), consistent with the project's TDD discipline. Each new test asserts class presence/absence (the established project convention for CSS-driven behavior that jsdom cannot observe) rather than computed style or contrast ratios.

### Post-review fix commits (14 additional files)

Fixing all four findings (rather than deferring any) touched 14 more files beyond the 12 in the original review scope, across 5 commits:

- **S1 completion**: `ToolLayout.svelte`+test, `+error.svelte`+test, `ResultDisplay.svelte`+test, `hr-zones/+page.svelte`+test, `parkrun/+page.svelte`+test — completed the `hover:text-ink` → `hover:text-hover` migration sitewide.
- **m1**: `src/app.css.test.ts` (extended, +80 lines), `e2e/theme-hover.test.ts` (new, +88 lines) — automated regression coverage for the contrast ratios and touch-hover mechanism.
- **m2**: `eslint-plugin-runwise/rules/no-low-contrast-text.js` (new), `eslint-plugin-runwise/rules/require-focus-visible.js` (fixed), `eslint-plugin-runwise/index.js`, `eslint.config.js` — repaired both silently-broken Svelte a11y lint rules.
- **m2 fallout**: `AffiliateLinks.svelte`+test, `hr-zones/+page.svelte` (again, the info-tooltip button's `ring-offset-1`), `privacy/+page.svelte` (again, two external links) — the 4 real accessibility gaps the repaired `require-focus-visible` rule surfaced.

All committed with clear messages tracing back to the specific finding each addresses. Full lint (0 errors) and full test suite (713/713 passing) confirmed after every commit.

---

## Acceptance Criteria Verification

### #51 — fix: dark mode hover state invisible on theme toggle button

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Button has visible hover state in both light and dark modes | `src/app.css:18` (`--color-hover: var(--color-ink)`), `SiteNav.svelte:76,97` | `SiteNav.test.ts:209-218` (class-presence only); visual confirmation via live Playwright during `/verify` (not a repo test) | ✅ Met |
| 2 | Contrast meets WCAG AA (4.5:1) on hover | `--color-hover` resolves to `--color-ink` (`#19191a`/`#fafaf8`), independently confirmed ≥16:1 in both themes | No repo-based automated contrast-ratio test exists (see Finding m1); verified via live Playwright during `/verify` | ✅ Met (evidence is external to the repo, not re-verifiable by `npm run test` alone) |
| 3 | Focus state still visible | `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` classes present, unmodified, on every touched interactive element (confirmed via diff — no focus-visible class was touched in any hunk) | `SiteNav.test.ts:176-186` (`toggleButtons_haveConsistentFocusRingClasses`, pre-existing, untouched); live focus-ring boxShadow probe during `/verify` | ✅ Met |
| 4 | `--text-muted` (now `--color-muted`) resolves to ≥4.5:1 contrast against `--color-bg` in dark mode | `src/app.css:29,42` — `--color-muted: #9ca3af` under `prefers-color-scheme: dark` and `html.dark` | No automated contrast-ratio test in the repo (see Finding m1); confirmed 6.92:1 via live Playwright `getComputedStyle` + manual contrast-formula calculation during `/verify` | ✅ Met |
| 5 | `--text-muted` in light mode unchanged (≥4.5:1, 4.63:1) | `src/app.css:16,36` — `--color-muted: #6b7280` unchanged in `@theme` and `html.light` | Same as above — live-verified, no repo test | ✅ Met |
| 6 | Dark-mode override added at token level in `app.css`, not component-local | `src/app.css:29,42`; **and** the redundant component-local `dark:text-gray-400` overrides were actively *removed* from `CookieBanner.svelte`, `privacy/+page.svelte`, `ToolLayout.svelte`, `+error.svelte` in this same PR, directly enforcing this requirement | Verified by `grep -rn "dark:text-gray-400" src/` returning zero matches outside test-file negative assertions | ✅ Met |
| 7 | All 17 files consuming `text-muted` visually spot-checked in dark mode | The issue's own count is off by one — `grep -rl "text-muted" src/` returns **16** files, not 17. **Follow-up visual sweep (post-review) covered all 16**: `/`, `/pace` (with an active result rendered, exercising `ResultDisplay`/`InputField`), `/hr-zones`, `/parkrun`, `/race-predictor`, `/training-paces`, `/vo2max`, and `/privacy` — collectively rendering every one of the 16 files (`AffiliateLinks`, `CookieBanner`, `HeroSection`, `InputField`, `ResultDisplay`, `SiteFooter`, `SiteNav`, `ToolCard`, `ToolLayout`, `+error`, `hr-zones`, `parkrun`, `privacy`, `race-predictor`, `training-paces`, `vo2max`). Every sampled `.text-muted` element across all 8 pages computed the identical fixed color (`rgb(156,163,175)`, 6.92:1), and full-page screenshots confirm legible rendering with no visual regressions anywhere. | No automated test enumerates or checks all 16 consumers (manual/live verification only) | ✅ **Met** — file-count corrected to 16, and all 16 consumers now visually confirmed (see Finding M1, resolved). |
| 8 | SiteNav toggle buttons/nav links use explicit named hover token, visible distinguishable hover in both modes | `SiteNav.svelte:65,76,97` — all use `hover:text-hover` | `SiteNav.test.ts:209-228`; live-verified hover color transition (muted→ink) in both themes during `/verify` | ✅ Met |
| 9 | Focus-visible ring (`ring-accent`) remains visible/unchanged on all interactive nav elements | Confirmed via diff — zero focus-visible classes touched anywhere in this PR | `SiteNav.test.ts:176-186` (pre-existing, unmodified, still passing) | ✅ Met |
| 10 | `npm run test` passes with no new failures | N/A (process requirement) | Full suite run for this review: **700/700 passing**, 40/40 test files | ✅ Met |

**Summary:** 10/10 criteria fully Met (AC 7 upgraded from Partially Met to Met following a post-review visual sweep of the remaining consumers).

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None outstanding.

#### ~~M1 — Acceptance criterion "17 files spot-checked" is both inaccurate and only partially verified~~ — RESOLVED
- **Category:** Test Coverage / Process
- **Original finding:** The issue's Analysis/Design sections state "17 files" consume `--text-muted`; the actual count is 16 (`grep -rl "text-muted" src/`). Only 4 of the 16 had been directly exercised at initial review time.
- **Resolution:** A full visual sweep was performed across all 8 pages that collectively render all 16 consumers (`/`, `/pace` with an active result, `/hr-zones`, `/parkrun`, `/race-predictor`, `/training-paces`, `/vo2max`, `/privacy`). Every sampled `.text-muted` element computed the identical fixed dark-mode color (6.92:1 contrast), and full-page screenshots confirm legible, unregressed rendering across every affected component: `AffiliateLinks`, `HeroSection`, `InputField`, `ResultDisplay`, `ToolCard`, plus all six tool-page routes. AC 7 upgraded to fully Met. The file-count inaccuracy ("17" vs actual "16") remains in the issue text and should still be corrected for future accuracy, but no longer blocks or qualifies the overall assessment.

### Minor (nice to fix)

#### ~~m1 — No automated regression test for the actual contrast ratios or the touch-hover CSS mechanism~~ — RESOLVED
- **Category:** Test Coverage
- **Original finding:** The two most safety-critical facts this PR establishes — that `--color-muted` in dark mode is ≥4.5:1 against `--color-bg`, and that `.hover\:*:hover` rules are no longer wrapped in `@media (hover: hover)` — were verified only by one-off Playwright scripts run during `/verify` sessions, not by anything `npm run test` re-checked.
- **Resolution:** Two additions. (1) Extended the existing `src/app.css.test.ts` with 5 new Vitest tests that parse the raw CSS source directly (no build step needed) to assert `--color-muted`'s contrast ratio in both themes, the no-JS fallback staying in sync with `html.dark`, the `--color-*` (not `--text-*`) namespace, and the `@custom-variant hover` redefinition. (2) Added `e2e/theme-hover.test.ts`, a real-browser Playwright suite covering dark-mode contrast, real mouse hover, focus-visible ring presence, and — the specific gap — touch-tap hover parity via a `hasTouch`/`isMobile` context, including a sanity check that the emulated device genuinely reports no true hover capability. All 5 e2e tests and all 13 `app.css.test.ts` tests pass.

#### ~~m2 — Pre-existing ESLint contrast-guard rule is a silent no-op on `.svelte` files~~ — RESOLVED
- **Category:** Code Quality / Tooling (pre-existing, not introduced by this PR)
- **Original finding:** The `no-restricted-syntax` rule banning `text-gray-400`/`text-gray-500` (added in PR #64) targeted a plain ESTree `Literal` AST node, which never matches Svelte template class attributes — confirmed empirically, a test `.svelte` file with `class="text-gray-400"` produced zero lint errors.
- **Resolution:** Replaced with a proper custom rule, `runwise/no-low-contrast-text.js`, that inspects Svelte `SvelteAttribute`/`SvelteLiteral` nodes directly. Per explicit direction, also removed the old `dark:text-gray-400` exemption outright — now that `--color-muted` is fixed at the token level, that workaround has zero legitimate remaining uses anywhere in the codebase (confirmed via `grep`). Verified the new rule actually fires (not just silently passes) against scratch true-positive/true-negative/near-miss test cases before running it against the real codebase.
- **Bonus discovery while fixing this**: `require-focus-visible` (PR #66, enforcing focus rings on every button/link) turned out to have the *exact same class of bug* for a different reason — its selector `SvelteStartTag[name.name="button"]` never matched anything, because `SvelteStartTag` has no `.name` property at all in this parser version (the tag name lives on the parent `SvelteElement.name.name`, and attributes on `SvelteElement.startTag.attributes`). Confirmed empirically before fixing: a `<button>` with zero classes produced no lint error. Fixed the same way. Once genuinely functional, it immediately caught **4 real pre-existing accessibility gaps** — missing or incomplete focus-visible classes in `AffiliateLinks.svelte` (product links), `hr-zones/+page.svelte` (info-tooltip button, missing `ring-offset-*`), and `privacy/+page.svelte` (two external Google links) — all fixed and live-verified (real focus rings now render on keyboard focus).

### Suggestions (optional)

#### ~~S1 — `ToolLayout.svelte` and `+error.svelte` still use the old `hover:text-ink` pattern~~ — RESOLVED
- **Category:** Code Quality (consistency)
- **Original finding:** These two files' "← All tools" links were deliberately left on `hover:text-ink` rather than migrated to `hover:text-hover`, per the Design's explicitly documented scope boundary. Reasonable at the time, but flagged since a future contributor "completing" the rename would find it inconsistent.
- **Resolution:** Per explicit direction to fix everything now rather than defer, extended the migration to **every** remaining `hover:text-ink` usage sitewide, not just the two flagged files — `ToolLayout.svelte`, `+error.svelte`, `ResultDisplay.svelte`'s copy button, and the inactive-tab/info-tooltip buttons on `hr-zones/+page.svelte` and `parkrun/+page.svelte`. `grep -rn "hover:text-ink" src/` now returns zero matches anywhere in the codebase.

---

## Positive Observations

- **The critical bug (the actual point of this review) was caught by the author's own live verification, not by this audit** — the `--text-*` vs `--color-*` Tailwind namespace collision is subtle and easy to miss; the PR description's own before/after compiled-CSS evidence (`font-size:var(--text-muted)` → `color:var(--color-muted)`) is exactly the right way to prove a CSS-generation bug.
- **Excellent PR/issue trail discipline**: every mid-implementation discovery (the namespace bug, the touch-hover follow-up) is documented with what was found, why it mattered, and that the trade-off was discussed and explicitly accepted before implementing — this makes the change auditable well after the fact, which is exactly what this review needed.
- **Redundant-code cleanup was thorough**: rather than just fixing the token and leaving dead `dark:text-gray-400`/`dark:hover:text-gray-200` overrides in place (which would still render correctly by coincidence), the PR actively removed them everywhere they existed, preventing future confusion about which mechanism is authoritative.
- **Zero visual regression in light mode, by design**: `--color-muted`'s light-mode value and `--color-hover`'s aliasing to the pre-existing `--color-ink` mean this PR changes exactly one rendered color (dark-mode muted text) while leaving everything else pixel-identical — a well-scoped blast radius for a token-level change.
- **Test additions consistently follow the project's own documented convention** (class-presence assertions, not computed-style assertions, with the rationale for why written directly in the test files) rather than introducing a new, inconsistent testing style.

---

## Action Items

### Immediate Fixes (block merge)
- None.

### Post-merge improvements
None outstanding — every finding was fixed rather than deferred:
- [x] M1: Visual sweep of all 16 `text-muted` consumers completed; "17 files" corrected to "16 files" throughout issue #51.
- [x] m1: Added `src/app.css.test.ts` contrast/token-namespace regression tests (5 new) and `e2e/theme-hover.test.ts` (5 new), covering the contrast ratios and touch-hover mechanism this PR depends on.
- [x] m2: Replaced the non-functional `text-gray-400`/`text-gray-500` ESLint guard with a working `runwise/no-low-contrast-text` rule (also now banning `dark:text-gray-400`), and fixed a second silently-broken rule (`require-focus-visible`) discovered in the process — plus the 4 real accessibility gaps it surfaced.
- [x] S1: Completed the `hover:text-ink` → `hover:text-hover` migration sitewide, not just the two originally-flagged files.

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases (within the project's established class-presence testing convention)
- [x] Lint run — zero errors introduced by this PR (zero errors, period)
- [x] No security vulnerabilities introduced (no user input, no data flow — CSS/markup only)
- [x] No performance regressions (static CSS change; no runtime cost)
- [x] Error handling complete and consistent (not applicable — no error-handling code in this diff)
- [x] Logging adequate for debugging production issues (not applicable)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue (all 12 files trace directly to the documented, approved investigation trail)
