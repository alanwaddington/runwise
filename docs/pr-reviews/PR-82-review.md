# PR #82 Review — Optimize font loading strategy (#63)

**Date:** 2026-07-15
**Author:** alanwaddington
**Branch:** feature/63-optimize-font-loading → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 13 Met / 13 Total |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

Issue #63 has no parent or sub-issues (`gh api graphql` `trackedInIssues`/`trackedIssues` both empty) — this project's workflow keeps Analysis, Design, and acceptance criteria as sections within a single issue rather than a GitHub sub-issue tree. All criteria live in issue #63.

### Issue Hierarchy
- #63 — chore: review and optimize font loading strategy (root, contains `## Analysis` and `## Design` sections)
  - No sub-issues; implementation tasks (Task 1–3) are defined in #63's `## Design → ### 3. Work Breakdown`, not as separate GitHub issues.

---

## Changed Files Audit

### `src/routes/+layout.svelte` (+1 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Changes the Google Fonts `<link href>` from static per-weight lists (`Manrope:wght@400;500;600;700&IBM+Plex+Mono:wght@500;600`) to a variable-font range for Manrope and a corrected static weight list for IBM Plex Mono (`Manrope:wght@400..700&IBM+Plex+Mono:wght@400;500;700`) |
| Issues | #63 |
| Criteria covered | Analysis Must-1/2/3/6; Design Task 2 AC (href value, preserved `display=swap`/`preconnect`) |
| Quality | ✅ No issues. Single-line change, `preconnect` hints and `display=swap` untouched exactly as scoped. Independently re-verified against the live Google Fonts CSS2 API (not just trusted from the PR body): `Manrope:wght@400..700` returns a true variable `@font-face` (`font-weight: 400 700`); `IBM+Plex+Mono:wght@400..700` 400s with "Font family not found" — confirms IBM Plex Mono genuinely has no variable build, so the static fallback is correct, not a shortcut. |
| Test coverage | `src/routes/layout.fonts.test.ts` (see below) — direct test of the exact `href` value this file produces |

### `src/routes/layout.fonts.test.ts` (+16 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds two new tests asserting the href uses a variable-range syntax for Manrope and the corrected static weight list for IBM Plex Mono, each with both a positive match and a negative match against the old static-list pattern (regression guard) |
| Issues | #63 |
| Criteria covered | Analysis Must-5 ("Update `layout.fonts.test.ts`..."); Design Task 1 AC (all three regex assertions specified in the Work Breakdown are present verbatim) |
| Quality | ✅ No issues. Regex assertions are precise (escaped `.` in `400\.\.700`, escaped `+` in `IBM\+Plex\+Mono`) and each test includes a `.not.toMatch` guard against reverting to the pre-PR static list — a real regression test, not just a happy-path assertion. |
| Test coverage | N/A (this file is the test) |

**Files not changed but audited per the Design's explicit note (`src/app.css` / `app.css.test.ts` "no change expected"):** confirmed — `--font-sans`/`--font-mono` custom properties reference family names only; `app.css.test.ts` has zero weight-coupled assertions. No drift from the Design's stated expectation.

---

## Acceptance Criteria Verification

### #63 — Analysis section

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Researched variable font options | Design §1 documents live-API verification of both families | N/A (research task) | ✅ Met |
| 2 | Evaluated weight subsetting vs current approach | Design §1 explains Google's CSS2 API already subsets by weight; win is file-count/mono-700 fix | N/A (research task) | ✅ Met |
| 3 | Implemented optimization if feasible | `+layout.svelte:13` | `layout.fonts.test.ts:25-39` | ✅ Met |
| 4 | Measured font payload before/after | PR body: Manrope 24,836B (1 file vs 4), mono-700 14,908B — independently reproduced identical byte counts via a fresh Playwright run against the live CDN during `/verify` | `layout.fonts.test.ts` asserts URL shape as the regression proxy (byte counts aren't code-testable, per Design §2's own reasoning) | ✅ Met |
| 5 | No visual changes to typography | Analysis explicitly reinterprets this to exclude the intentional mono-700 fix (documented, not a silent exception) | Verified live via Playwright `getComputedStyle` in `/verify`: Manrope 400/500/600/700 unchanged; mono 700 changed from faux-bold→true-bold as intended; mono 400/500 unchanged | ✅ Met |

### #63 — Design section (Work Breakdown Task acceptance criteria)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 6 | Researched variable font availability for both families, documented findings | Design §1: Manrope has a variable build (200–800 axis, confirmed 400-700 usable), IBM Plex Mono does not (400 error, reproduced independently in this review) | N/A | ✅ Met |
| 7 | Evaluated variable vs static; decision + rationale in PR description | PR body §1 states the Manrope-variable / mono-static-corrected decision and why | N/A | ✅ Met |
| 8 | `+layout.svelte` updated, `display=swap` + `preconnect` preserved | `+layout.svelte:10-15` | `layout.fonts.test.ts` | ✅ Met |
| 9 | IBM Plex Mono weight 700 loaded, no longer faux-bolds | `+layout.svelte:13` includes `700` in the mono list | `layout.fonts.test.ts:37` asserts `700` present; live-verified `getComputedStyle` reports `fontWeight: "700"` on `ResultDisplay` and zone badges during `/verify` | ✅ Met |
| 10 | `layout.fonts.test.ts` extended with request-shape + payload-regression assertion | `layout.fonts.test.ts:25-39`, two new tests each with a negative-match regression guard | Self (test file) | ✅ Met |
| 11 | Before/after payload numbers captured in PR description | PR body §"Verification": exact byte figures for Manrope and mono-700 | N/A | ✅ Met |
| 12 | Visual spot-check across all weights, light+dark, confirms no unintended regressions | `/verify` session: Playwright screenshots + `getComputedStyle` checks on `/pace` and `/hr-zones` in both color schemes, covering all four mono weight-usage sites (default/400, `font-medium`/500, `font-bold`/700) plus Manrope 400/700 | Screenshots + computed-style assertions captured in `/verify` transcript | ✅ Met |
| 13 | `npm run test` passes including updated font tests | This review: `npx vitest run` → 42 files, 745 tests, 0 failures | Full suite | ✅ Met |

**Summary:** 13/13 criteria met.

I did not simply trust the ticked checkboxes in the issue — each row above was independently verified by reading `+layout.svelte`/`layout.fonts.test.ts` directly, re-querying the live Google Fonts API myself (not reusing the PR author's claimed output), and re-running the full test suite and lint from a clean checkout of this branch.

---

## Findings

No Critical, Major, or Minor findings.

### Suggestions (optional)

#### S1 — IBM Plex Mono's static weight list is unenforced against future `font-mono` usage drift — **Fixed**
- **Category:** Reliability (maintainability)
- **Location:** `src/routes/+layout.svelte:13`, `src/routes/layout.fonts.test.ts`
- **Description:** The weight list `400;500;700` is correct today because it was derived from an exhaustive `grep` of every `font-mono` usage at design time (documented in issue #63's Design §1). If a future PR adds `font-mono font-semibold` (600) somewhere, nothing will fail — it'll just silently faux-bold again, the same class of bug this PR fixes. This isn't a defect in this PR (its own scope is fully covered and tested), just an unenforced invariant going forward.
- **Recommendation:** Optional follow-up: a lint rule, code comment near the `<link>`, or a broader test that greps `src/**/*.svelte` for `font-mono` + weight-class combinations and asserts each resolved weight is present in the `<link href>`. Not worth blocking this PR on — flag as a possible future `/analyse` candidate only if this class of regression actually recurs.
- **Outcome:** Fixed in commit `4fa9427`. Added `src/font-mono-weight-usage.test.ts`, which walks every `.svelte` file, resolves the rendered weight of each `font-mono` usage (explicit Tailwind weight utility, or 400 by default), and fails with a file-and-weight-specific message if any resolved weight isn't present in `+layout.svelte`'s IBM Plex Mono list. Verified the guard actually fires: temporarily added `font-mono font-semibold` to `ToolCard.svelte`, confirmed the test failed with the expected message, then reverted before committing.

---

## Positive Observations

- The PR explicitly re-verified a load-bearing assumption from its own Analysis (does IBM Plex Mono have a variable build?) against the live API rather than assuming the Design doc's earlier finding still held — this review independently reproduced the same result, which is a good sign the original research wasn't stale or copy-pasted.
- The `grep -rn "font-mono" src` audit that discovered weight 600 was dead weight is real, reproducible engineering — this review re-ran the exact same grep and got the identical five usage sites, so the "only 400/500/700 are ever used" claim isn't just asserted, it's checkable.
- Test additions include explicit negative-match regressions (`.not.toMatch` against the old static list) rather than only positive assertions — this is what actually makes the test a regression guard instead of a tautology that would pass against almost any href containing the family names.
- Scope discipline: diff touches exactly the 2 files named in the Design's Work Breakdown, nothing more — no drive-by refactors, no unrelated formatting changes.

---

## Action Items

### Immediate Fixes (block merge)
None.

### Post-merge improvements
- [x] S1: Consider a test/lint guard against `font-mono` weight-usage drift outside the currently-loaded set — fixed in commit `4fa9427` (`src/font-mono-weight-usage.test.ts`).

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases (edge case here = "does the regex reject a reversion to the old static list", which both new tests do)
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions (this PR is a performance improvement: fewer/correctly-sized font files)
- [x] Error handling complete and consistent (N/A — static markup change, no error paths introduced)
- [x] Logging adequate for debugging production issues (N/A — no runtime logic)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
