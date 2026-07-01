# PR #23 Review -- feat: Heart Rate Zone Calculator (#7)

**Date:** 2026-07-01
**Author:** alanwaddington
**Branch:** feature/7-hr-zone-calculator -> main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 14/14 Met |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

### Issue Hierarchy
- #7 -- Tool: Heart Rate Zone Calculator (/hr-zones) (root -- contains Analysis + Design sections)

---

## Changed Files Audit

### `src/lib/utils/hr-zones.ts` (+183 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | New utility module with pure calculation functions for Max HR zones, LTHR zones, LTHR sub-zones (5a/5b/5c), and age-based max HR estimation (Tanaka formula) |
| Issues | #7 |
| Criteria covered | AC2 (Max HR 185 zones), AC3 (LTHR 170 zones), AC4 (sub-zones), AC5 (age estimate), AC10 (logic in utility file), AC12 (input validation) |
| Quality | ✅ No issues. Clean separation of data (zone metadata) from logic (calculation functions). Named constants for validation bounds. Typed exports with HrZone interface and HrMethod type. |
| Test coverage | `hr-zones.test.ts` -- 46 unit tests covering all exported functions, boundary values, and invalid inputs |

### `src/lib/utils/hr-zones.test.ts` (+260 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Unit tests for all 4 exported functions: calculateMaxHrZones, calculateLthrZones, calculateLthrSubZones, estimateMaxHr |
| Issues | #7 |
| Criteria covered | AC2, AC3, AC4, AC5, AC10, AC12 |
| Quality | ✅ No issues. Follows existing test naming convention (MethodName_Scenario_ExpectedResult). Good boundary/edge case coverage. |
| Test coverage | N/A (this IS the test file) |

### `src/routes/hr-zones/+page.svelte` (+333 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Replace stub page with full HR Zone Calculator implementation including segmented control, conditional inputs, zone results table, expandable Zone 5, info tooltip, and footer cross-link |
| Issues | #7 |
| Criteria covered | AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC9, AC11, AC13, AC14 |
| Quality | ✅ No issues. Follows existing codebase patterns (Svelte 5 runes, ToolLayout/InputField components, table styling matches training-paces). Proper accessibility: role="tablist", aria-selected, aria-expanded, aria-live, aria-label. Tooltip dismiss-on-outside-click with cleanup in $effect. |
| Test coverage | `hr-zones.test.ts` -- 37 component tests |

### `src/routes/hr-zones/hr-zones.test.ts` (+293 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Component-level tests covering all user interactions: method switching, input changes, empty state, results rendering, Zone 5 expansion, tooltip, footer link |
| Issues | #7 |
| Criteria covered | AC1-AC14 (all criteria have at least one corresponding test) |
| Quality | ✅ No issues. Follows existing pattern from training-paces.test.ts. Uses @testing-library/svelte with fireEvent for interactions. |
| Test coverage | N/A (this IS the test file) |

---

## Acceptance Criteria Verification

### #7 -- Tool: Heart Rate Zone Calculator (/hr-zones)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC1 | Segmented control toggles between Max HR and LTHR; active tab visually distinct | `+page.svelte:81-108` -- role="tablist", aria-selected, bg-accent/text-white for active | `hr-zones.test.ts:26-43` -- renders tabs, checks aria-selected toggling | ✅ Met |
| AC2 | Max HR 185 produces zones: Z1 93-111, Z2 111-130, Z3 130-148, Z4 148-167, Z5 167-185 | `hr-zones.ts:60-70` -- calculateMaxHrZones with percentage boundaries | `hr-zones.test.ts:59-87` (unit) + `hr-zones.test.ts:135-147` (component) | ✅ Met |
| AC3 | LTHR 170 produces Friel zones: Z1 <145, Z2 145-151, Z3 153-160, Z4 162-168, Z5 170-180 | `hr-zones.ts:143-153` -- calculateLthrZones with Friel percentages | `hr-zones.test.ts:148-176` (unit) + `hr-zones.test.ts:178-192` (component) | ✅ Met |
| AC4 | Zone 5 in LTHR mode expands to show 5a, 5b, 5c sub-zones | `+page.svelte:290-326` -- expandable rows with isExpandable guard; `hr-zones.ts:159-169` -- calculateLthrSubZones | `hr-zones.test.ts:196-244` (component) | ✅ Met |
| AC5 | Age 40 shows estimated max HR 180 bpm with formula limitation note | `+page.svelte:179-187` -- aria-live polite div with estimate + caveat; `hr-zones.ts:180-183` -- estimateMaxHr | `hr-zones.test.ts:81-93` (component) + `hr-zones.test.ts:12-14` (unit) | ✅ Met |
| AC6 | Age input hidden when LTHR method selected | `+page.svelte:169` -- `{#if method === 'maxhr'}` conditional | `hr-zones.test.ts:68-72` | ✅ Met |
| AC7 | Results update instantly as user types (no submit button) | `+page.svelte:20-34` -- $derived reactivity from bpmRaw; no form/submit elements | `hr-zones.test.ts:111-116` -- fireEvent.input triggers table render | ✅ Met |
| AC8 | Empty/invalid input shows placeholder prompt (no results table) | `+page.svelte:192-215` -- `{#if zones === null}` empty state with heart icon | `hr-zones.test.ts:97-107` | ✅ Met |
| AC9 | Page title "Heart Rate Zone Calculator -- Runwise" and meta description targets HR zone keywords | `+page.svelte:67-72` -- svelte:head meta; `+page.svelte:76` -- pageTitle prop | Verified via rendered HTML (curl test in verification) | ✅ Met |
| AC10 | All calculation logic in src/lib/utils/hr-zones.ts with unit tests | `hr-zones.ts` -- 4 exported functions; `hr-zones.test.ts` -- 46 unit tests | `hr-zones.test.ts` -- 46 tests | ✅ Met |
| AC11 | Zone table rows show: zone number (styled badge), zone name, BPM range, purpose | `+page.svelte:252-258` -- rounded-full bg-accent badge; `:260` -- name; `:261` -- BPM range; `:287-289` -- purpose with mobile name prefix | `hr-zones.test.ts:127-133` | ✅ Met |
| AC12 | Input validation rejects implausible ranges (100-220 Max HR, 100-200 LTHR, 10-100 age) | `hr-zones.ts:53-54,61` -- MIN/MAX_MAX_HR; `:136-137,144` -- MIN/MAX_LTHR; `:173-174,181` -- MIN/MAX_AGE | `hr-zones.test.ts:116-138` (unit boundary tests) | ✅ Met |
| AC13 | Results footer contains link to Training Paces calculator | `+page.svelte:333-338` -- href="/training-paces" with descriptive text | `hr-zones.test.ts:255-267` | ✅ Met |
| AC14 | Method selector has info icon/tooltip explaining Max HR vs LTHR | `+page.svelte:110-154` -- info button with aria-label, tooltip with role="tooltip", explanatory text | `hr-zones.test.ts:271-292` | ✅ Met |

**Summary:** 14/14 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 -- LTHR zone gaps between boundaries
- **Category:** Code Quality
- **Location:** `hr-zones.ts:74-110`
- **Description:** LTHR zone boundaries have small gaps (e.g., Zone 2 ends at 89%, Zone 3 starts at 90%; Zone 4 ends at 99%, Zone 5 starts at 100%). These match Joe Friel's published zones accurately, but users may notice 1-2 BPM gaps in their results (e.g., LTHR 170 has no zone covering 152 bpm or 161 bpm). This is by design per Friel's method but could confuse users.
- **Recommendation:** Consider adding a note in the UI or tooltip explaining that small BPM gaps between Friel zones are intentional. Not a blocker.

### Suggestions (optional)

#### S1 -- Consider keyboard navigation between tabs
- **Category:** Accessibility
- **Location:** `+page.svelte:81-108`
- **Description:** The segmented control uses `role="tablist"` and `role="tab"` which is correct, but doesn't implement arrow key navigation between tabs (WAI-ARIA Tabs pattern recommends Left/Right arrow keys to move between tabs). Current implementation works via click/Enter/Space which is functional.
- **Recommendation:** Could add `onkeydown` handler for arrow key tab switching in a future iteration. Not a blocker -- current implementation is accessible via keyboard.

---

## Positive Observations

- **Clean architecture:** Pure utility functions with zero side effects, matching the established pattern (pace.ts, training-paces.ts). Easy to test, easy to extend for future Karvonen method (#21).
- **Thorough test coverage:** 46 unit tests + 37 component tests = 83 new tests. Every acceptance criterion has at least one dedicated test. Boundary cases and edge cases well covered.
- **Consistent codebase conventions:** Svelte 5 runes ($state/$derived), InputField component reuse, table styling matches training-paces page exactly. New developer would see a consistent pattern.
- **Good accessibility:** role="tablist"/role="tab" with aria-selected, aria-expanded on tooltip and Zone 5 expand, aria-live="polite" on age estimate, aria-hidden on decorative SVGs.
- **Expandable Zone 5 design:** Elegant solution to the 5-vs-7 zone problem. Default 5 zones for simplicity, expand for detail. Clickable row + text button ensures both desktop and mobile discoverability.
- **Defensive validation:** All utility functions return null for implausible inputs; the page gracefully shows empty state rather than broken results.

---

## Action Items

### Immediate Fixes (block merge)
None.

### Post-merge improvements
- [ ] m1: Consider adding a note about Friel zone BPM gaps in a future iteration
- [ ] S1: Add arrow key navigation to segmented control tabs

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases
- [x] Lint run -- zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
