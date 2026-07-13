# PR #76 Review — Fix: standardize slider focus-visible ring offset (#58)

**Date:** 2026-07-13
**Author:** alanwaddington
**Branch:** feature/58-standardize-ring-offset → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate — both minor gaps fixed post-review (see Findings) |
| Acceptance Criteria | 9/9 Met |
| Lint | 1 error / 0 warnings (0 in diff, 1 pre-existing in `SiteFooter.svelte`) |

---

## Issues Reviewed

No parent issue or sub-issues exist for #58 (`gh api graphql` sub-issue query returned an empty list). The full `/analyse` → `/design` hierarchy lives inside the single issue body as `## Analysis` and `## Design` sections.

### Issue Hierarchy
- #58 — fix: standardize slider focus-visible ring offset (root — contains both `## Analysis` and `## Design` sections, no separate implementation sub-issues)

---

## Changed Files Audit

### `src/routes/hr-zones/+page.svelte` (+3 / -3 lines)

| Property | Detail |
|----------|--------|
| Purpose | Change `focus-visible:ring-offset-1` → `ring-offset-2` on the Max HR tab (L128), LTHR tab (L141), and info-tooltip button (L161) |
| Issues | #58 |
| Criteria covered | AC1, AC2, AC3 (see table below) |
| Quality | ✅ No issues — minimal, scoped, no markup/logic touched |
| Test coverage | `hr-zones.test.ts:52` asserts the info button's class matches `/focus-visible:ring-offset-\d/` — passes, but the regex accepts any digit, so it would not catch a regression back to `ring-offset-1`. No test asserts on the Max HR/LTHR tabs' ring-offset value at all. |

### `src/routes/parkrun/+page.svelte` (+3 / -3 lines)

| Property | Detail |
|----------|--------|
| Purpose | Change `focus-visible:ring-offset-1` → `ring-offset-2` on the Recent Run tab (L184), Average Pace tab (L197), and reference-distance range slider (L285) |
| Issues | #58 |
| Criteria covered | AC4, AC5, AC6, AC7 |
| Quality | ✅ No issues — same minimal pattern as above |
| Test coverage | `parkrun.test.ts` has no assertions on `focus-visible` or `ring-offset` classes for any of the three changed elements. |

---

## Acceptance Criteria Verification

### #58 — fix: standardize slider focus-visible ring offset

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `hr-zones/+page.svelte` L128 (Max HR tab): `ring-offset-1` → `ring-offset-2` | `src/routes/hr-zones/+page.svelte:128` | None (regex-only, non-specific) | ✅ Met |
| 2 | `hr-zones/+page.svelte` L141 (LTHR tab): `ring-offset-1` → `ring-offset-2` | `src/routes/hr-zones/+page.svelte:141` | None | ✅ Met |
| 3 | `hr-zones/+page.svelte` L161 (info tooltip button): `ring-offset-1` → `ring-offset-2` | `src/routes/hr-zones/+page.svelte:161` | `hr-zones.test.ts:52` (non-specific regex) | ✅ Met |
| 4 | `parkrun/+page.svelte` L184 (mode tab 1): `ring-offset-1` → `ring-offset-2` | `src/routes/parkrun/+page.svelte:184` | None | ✅ Met |
| 5 | `parkrun/+page.svelte` L197 (mode tab 2): `ring-offset-1` → `ring-offset-2` | `src/routes/parkrun/+page.svelte:197` | None | ✅ Met |
| 6 | `parkrun/+page.svelte` L285 (reference-distance range slider): `ring-offset-1` → `ring-offset-2` | `src/routes/parkrun/+page.svelte:285` | None | ✅ Met |
| 7 | Focus ring on Parkrun slider renders cleanly, no clipping, min/mid/max, light+dark | Verified via Playwright browser capture (screenshots + computed `box-shadow`), documented in issue #58's `## Verification` section and this review's independent re-check | No automated test — explicitly acknowledged as non-testable via Vitest/jsdom in `## Design` | ✅ Met (manual/browser verification, consistent with documented design decision) |
| 8 | Visual spot-check: all 6 elements match app-wide `ring-offset-2` standard, light+dark | Same Playwright verification; `box-shadow` computed style confirmed identical `0 0 0 2px` / `0 0 0 4px` signature across all 6 elements and cross-checked against an untouched page (`/pace`) | Same as above | ✅ Met |
| 9 | No functional/visual regression (tab switching mouse+keyboard, tooltip toggle, slider drag/keyboard) | Verified via Playwright: `aria-selected`/`aria-expanded` state changes on click, `ArrowRight`/`End` keyboard adjustment on the slider, all confirmed working post-change | None (functional, not unit-tested; existing `hr-zones.test.ts`/`parkrun.test.ts` suites — 68 tests — still pass) | ✅ Met |

**Summary:** 9/9 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 — Existing focus-ring test doesn't pin the specific offset value — **FIXED**
- **Category:** Test Coverage
- **Location:** `src/routes/hr-zones/hr-zones.test.ts:52`
- **Description:** `expect(infoButton.className).toMatch(/focus-visible:ring-offset-\d/)` matches any single digit, so it would have passed before this PR (at `ring-offset-1`) and will pass after (at `ring-offset-2`). It doesn't actually verify the standardization this PR claims — a future accidental revert to `ring-offset-1` would not be caught.
- **Recommendation:** Tighten to `expect(infoButton.className).toContain('focus-visible:ring-offset-2')` (or a regex anchored to `-2`) so the test actually pins the value.
- **Outcome:** Fixed in `e53e9e6` — assertion now pins `ring-offset-2` literally.

#### m2 — No unit test coverage for the Parkrun tabs/slider ring-offset value — **FIXED**
- **Category:** Test Coverage
- **Location:** `src/routes/parkrun/parkrun.test.ts`
- **Description:** None of the three changed elements in this file have any class-string assertion. This mirrors the pre-existing pattern in the codebase (Tailwind utility classes generally aren't unit-tested here) and was explicitly called out as acceptable in the issue's `## Design` section, but it does mean a future regression on any of the 6 elements this PR touches would only be caught by manual/browser verification, not CI.
- **Recommendation:** Optional — add a lightweight `className` assertion for the slider and tabs if the team wants this locked in by CI rather than relying on manual verification going forward.
- **Outcome:** Fixed in `628aaea` — added `modeTabs_haveCompleteFocusVisibleClasses` and `referenceDistanceSlider_hasCompleteFocusVisibleClasses` tests, both asserting the full focus-visible class set including `ring-offset-2`.

### Suggestions (optional)

None beyond the above.

---

## Positive Observations

- Scope discipline: the diff is exactly the 6 lines described in the PR body — no unrelated formatting, no drive-by refactors.
- The PR body's own scope-widening note (extending from the issue's literally-named file to include `parkrun/+page.svelte`, which contains the only real range slider) is accurate and was independently confirmed by reading both files — the issue's original text ("slider thumb") genuinely didn't apply to `hr-zones/+page.svelte` alone.
- Verification went beyond a visual glance: the PR author captured computed `box-shadow` values via a real browser (not jsdom) to confirm the exact ring-offset signature, and cross-checked an untouched page (`/pace`) to rule out an unintended change to the shared standard.
- No scope creep: the "Won't" item from Analysis (extracting a shared focus-ring utility class) was correctly left out of this PR.

---

## Action Items

### Immediate Fixes (block merge)

None.

### Post-merge improvements
- [x] m1: Tighten `hr-zones.test.ts:52`'s regex to pin `ring-offset-2` specifically — fixed in `e53e9e6`
- [x] m2: Add `className` assertions for Parkrun's tabs/slider so CI (not just manual verification) catches a future ring-offset regression — fixed in `628aaea`

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases — *n/a for this change: no new logic, only Tailwind class values, which the existing test suite doesn't assert on precisely (see m1/m2)*
- [x] Lint run — zero errors introduced by this PR (1 pre-existing error in `SiteFooter.svelte`, outside this diff)
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent — *n/a, no error-handling code touched*
- [x] Logging adequate for debugging production issues — *n/a, no logging code touched*
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
