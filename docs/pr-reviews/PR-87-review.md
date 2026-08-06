# PR #87 Review — Add Power Zones calculator (#86)

**Date:** 2026-08-06
**Author:** alanwaddington
**Branch:** feature/86-power-zones-calculator → main
**State:** Open
**Commits reviewed:** 16 (98fb36e..e1a8feb)

**Update (2026-08-06):** Both findings below (m1, S1) have been fixed — see each finding's "Resolution" note. Issue #86 now carries an updated acceptance-criteria correction section and a comment documenting the COROS hidden-state decision.

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 12/12 Met (with evolution notes — see below) |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

### Issue Hierarchy

- #86 — Add Power Zones calculator (Stryd Critical Power) — root issue with analysis, design, and acceptance criteria (no parent issue, no sub-issues)

---

## Changed Files Audit

### `src/lib/utils/power-zones.ts` (+284 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Core calculation utility: per-device zone tables (Stryd, COROS, Garmin, Polar), `calculatePowerZones()`, 50–700W bounds, device metric labels/disclaimers/display names |
| Issues | #86 |
| Criteria covered | AC 1-10 |
| Quality | ✅ Clean. Source/confidence documented per device in code comments. Garmin verified against a live Garmin Connect screenshot. COROS adapted from COROS's own cycling model, flagged as approximation. Stryd verified against Stryd Help Center. |
| Test coverage | `power-zones.test.ts` — 217 lines, comprehensive per-device zone correctness, boundary/bounds validation, pct fields, metric labels, display names |

### `src/routes/power-zones/+page.svelte` (+216 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Page component: 3-way device selector (Stryd/Garmin/Polar, COROS hidden), dynamic input label, zone table with % ranges, Garmin disclaimer, device-switch clearing, keyboard nav, reset |
| Issues | #86 |
| Criteria covered | AC 1, 2, 4, 5, 7, 9 |
| Quality | ✅ Accessible tablist with proper ARIA. Keyboard nav wraps correctly. Focus-follows-selection. |
| Test coverage | `power-zones.test.ts` (route) — 296 lines, covers rendering, device switching, validation, zone table rendering per device, disclaimer visibility, reset, keyboard nav, % range display |

### `src/routes/power-zones/power-zones.test.ts` (+296 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Route-level component tests for the Power Zones page |
| Issues | #86 |
| Quality | ✅ Thorough. Covers COROS-hidden assertion, all 3 visible devices, % range display, keyboard focus |
| Test coverage | Self — this is the test file |

### `src/lib/utils/power-zones.test.ts` (+217 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Unit tests for zone calculation logic across all 4 devices (including hidden COROS), bounds, labels |
| Issues | #86 |
| Quality | ✅ Covers per-device correctness with exact watt and pct expectations |
| Test coverage | Self |

### `src/lib/content/explainers.ts` (+23 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | `/power-zones` explainer: CP vs Threshold Power vs MAP, Garmin note, worked example, power+pace/HR cross-reference |
| Issues | #86 |
| Criteria covered | AC 9 |
| Quality | ✅ Garmin note updated to reflect verified data. No COROS mentions (hidden). |
| Test coverage | Tested indirectly via `PageExplainer` rendering in route tests |

### `src/lib/seo.ts` (+9 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | SEO metadata for `/power-zones`: title, description (151 chars, within convention), OG image, JSON-LD WebApplication |
| Issues | #86 |
| Criteria covered | AC 8 |
| Quality | ✅ Description within 150-160 char convention. Target keyword added to test map. |
| Test coverage | `seo.test.ts` — dynamically derived TOOL_ROUTES now auto-includes `/power-zones` |

### `src/lib/seo.test.ts` (+6 / -2 lines)

| Property | Detail |
|----------|--------|
| Purpose | Fixed TOOL_ROUTES derivation (from hardcoded to dynamic `Object.keys(PAGES)`) + added `/power-zones` keyword |
| Issues | #86 |
| Quality | ✅ Prevents future tool pages from silently missing SEO checks |
| Test coverage | Self |

### `src/lib/affiliates.ts` (+25 / -2 lines)

| Property | Detail |
|----------|--------|
| Purpose | Added `/power-zones` affiliate products (Stryd direct link, Garmin HRM 600 via Amazon). Extended `AffiliateProduct` with `program: 'direct'`, optional `tag`, optional `brand`. |
| Issues | #86 |
| Quality | ✅ Stryd correctly uses `program: 'direct'` since Stryd doesn't sell on Amazon. Comment documents future affiliate-program wiring. |
| Test coverage | `affiliates.test.ts` — covers all routes, validates `direct` program type and Stryd URL |

### `src/lib/affiliates.test.ts` (+23 / -3 lines)

| Property | Detail |
|----------|--------|
| Purpose | Added `/power-zones` to route list, new test for Stryd direct-link validation, updated field-validation to handle `direct` program type |
| Issues | #86 |
| Quality | ✅ |
| Test coverage | Self |

### `src/lib/components/AffiliateLinks.svelte` (+13 / -7 lines)

| Property | Detail |
|----------|--------|
| Purpose | Handle `program: 'direct'` — brand badge, "View at {brand} →" link text, `rel="noopener noreferrer"` (no `sponsored`) |
| Issues | #86 |
| Quality | ✅ Correctly omits `rel="sponsored"` for non-affiliate links |
| Test coverage | `AffiliateLinks.test.ts` |

### `src/lib/components/AffiliateLinks.test.ts` (+30 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Tests for `direct` program: brand badge, link text, rel attribute |
| Issues | #86 |
| Quality | ✅ |
| Test coverage | Self |

### `src/lib/components/EducationalSection.svelte` (+9 / -2 lines)

| Property | Detail |
|----------|--------|
| Purpose | "Seven free calculators" copy + power-zones bullet in "How Runwise Helps" list. Drive-by fix: added `each` key. |
| Issues | #86 |
| Criteria covered | AC 8 |
| Quality | ✅ |
| Test coverage | Tested implicitly via homepage rendering |

### `src/lib/components/HeroSection.svelte` (+1 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | "Six free tools" → "Seven free tools" |
| Issues | #86 |
| Criteria covered | AC 8 |
| Quality | ✅ |
| Test coverage | Implicit via homepage rendering |

### `src/lib/components/SiteFooter.svelte` (+2 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Added Power Zones Calculator to footer nav |
| Issues | #86 |
| Criteria covered | AC 8 |
| Quality | ✅ |
| Test coverage | Implicit via site rendering |

### `src/lib/components/SiteNav.svelte` (+2 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Added "Power Zones" to header nav |
| Issues | #86 |
| Criteria covered | AC 8 |
| Quality | ✅ |
| Test coverage | `SiteNav.test.ts` — updated to assert 7 links |

### `src/lib/components/SiteNav.test.ts` (+2 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | "all six tool links" → "all seven tool links" + Power Zones link assertion |
| Issues | #86 |
| Quality | ✅ |
| Test coverage | Self |

### `src/lib/components/ToolIcon.svelte` (+4 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Added `'power-zones'` icon variant (lightning bolt glyph) |
| Issues | #86 |
| Quality | ✅ |
| Test coverage | Implicit via page rendering |

### `src/routes/+page.svelte` (+7 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Added Power Zones Calculator card to homepage tool grid |
| Issues | #86 |
| Criteria covered | AC 8 |
| Quality | ✅ |
| Test coverage | Implicit via homepage rendering |

### `src/routes/hr-zones/+page.svelte` (+7 / -5 lines)

| Property | Detail |
|----------|--------|
| Purpose | Keyboard focus-follows-selection fix for tablist (ArrowLeft/ArrowRight) |
| Issues | Found during #86 verification |
| Quality | ✅ Identical pattern applied to all 3 tabbed pages |
| Test coverage | `hr-zones.test.ts` — 2 new DOM focus assertions |

### `src/routes/hr-zones/hr-zones.test.ts` (+15 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Focus-follows-selection tests for ArrowRight/ArrowLeft |
| Issues | Found during #86 verification |
| Quality | ✅ |
| Test coverage | Self |

### `src/routes/parkrun/+page.svelte` (+7 / -5 lines)

| Property | Detail |
|----------|--------|
| Purpose | Keyboard focus-follows-selection fix for tablist (same pattern as hr-zones) |
| Issues | Found during #86 verification |
| Quality | ✅ |
| Test coverage | `parkrun.test.ts` — 2 new DOM focus assertions |

### `src/routes/parkrun/parkrun.test.ts` (+14 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Focus-follows-selection tests for ArrowRight/ArrowLeft |
| Issues | Found during #86 verification |
| Quality | ✅ |
| Test coverage | Self |

### `scripts/generate-og-images.js` (+2 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Added Power Zones entry to OG image generation script |
| Issues | #86 |
| Criteria covered | AC 8 |
| Quality | ✅ |
| Test coverage | `og-assets.test.ts` validates file existence |

### `static/og/og-power-zones.png` (binary, +394KB)

| Property | Detail |
|----------|--------|
| Purpose | OG social-share image for /power-zones |
| Issues | #86 |
| Criteria covered | AC 8 |
| Quality | ✅ File exists, referenced by seo.ts |
| Test coverage | `og-assets.test.ts` validates existence |

### `README.md` (+1 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Added Power Zones Calculator link to tool list |
| Issues | #86 |
| Quality | ✅ |
| Test coverage | N/A — documentation |

### `docs/Guides/User Guide/user-guide.md` (+23 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Power Zones Calculator section: device table, input/output description, Garmin note |
| Issues | #86 |
| Quality | ✅ Accurately reflects current 3-device state (Stryd/Garmin/Polar), Garmin's verified 5-zone model |
| Test coverage | N/A — documentation |

### `docs/Guides/User Guide/user-guide.html` (+37 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Generated HTML from user-guide.md |
| Issues | #86 |
| Quality | ✅ Auto-generated |
| Test coverage | N/A |

### `docs/Guides/User Guide/user-guide.pdf` (binary)

| Property | Detail |
|----------|--------|
| Purpose | Generated PDF from user-guide.md |
| Issues | #86 |
| Quality | ✅ Auto-generated |
| Test coverage | N/A |

### `docs/pr-reviews/PR-87-review.md` (this file)

| Property | Detail |
|----------|--------|
| Purpose | PR review report (this is the current, superseding version) |
| Issues | #87 |
| Quality | N/A |
| Test coverage | N/A |

---

## Acceptance Criteria Verification

### #86 — Add Power Zones calculator (Stryd Critical Power)

The authoritative acceptance criteria are the 12 items from the issue's `## Analysis` section. Several have been **intentionally superseded** by user decisions made during development (COROS hidden, Garmin data corrected). The verdicts below evaluate against the **current, user-approved state**, not the original literal text.

| # | Criterion (original) | Current state | Implementation | Test | Verdict |
|---|-----------|---------------|----------------|------|---------|
| 1 | 4-way device selector: Stryd, COROS, Garmin, Polar | UI shows 3 (COROS intentionally hidden by user decision). Type union still includes all 4. COROS code/tests preserved. | `+page.svelte:18`, `power-zones.ts:1` | `power-zones.test.ts:26-36` | ✅ Met |
| 2 | Stryd and COROS both use verified 5-zone %CP table, sharing one data source | COROS now has its own independent 7-zone table (user corrected the Stryd-alias assumption). COROS hidden from UI. Stryd's own 5-zone table verified. | `power-zones.ts:29-65` (Stryd), `power-zones.ts:82-132` (COROS) | `power-zones.test.ts:7-45`, `power-zones.test.ts:52-75` | ✅ Met |
| 3 | Garmin uses 7-zone table with visible disclaimer (unverified/third-party) | Garmin now uses a verified 5-zone table from a live Garmin Connect screenshot. Disclaimer still present, reworded. | `power-zones.ts:148-184`, `power-zones.ts:255` | `power-zones.test.ts:82-119`, route `power-zones.test.ts:111-130` | ✅ Met |
| 4 | Polar uses own verified 5-zone %MAP table, input labeled "Maximal Aerobic Power (MAP)" | Exactly as specified | `power-zones.ts:192-228`, `power-zones.ts:245` | `power-zones.test.ts:124-158`, route `power-zones.test.ts:97-101` | ✅ Met |
| 5 | Each device's native zone structure preserved (not normalized) | Stryd 5, COROS 7 (hidden), Garmin 5, Polar 5 — each device's actual model | `power-zones.ts` zone arrays | `power-zones.test.ts:8,54,83,126` | ✅ Met |
| 6 | Stryd/COROS Zone 5 closed range (115-130%) | Stryd Zone 5: `highPct: 1.3` (closed). COROS Zone 7 open-ended (its own model). | `power-zones.ts:58-60` | `power-zones.test.ts:41-44` | ✅ Met |
| 7 | Manual CP/TP/MAP entry only (watts) — no device sync | Single watts input | `+page.svelte:118-131` | Route `power-zones.test.ts:86-109` | ✅ Met |
| 8 | Page in nav, footer, sitemap/SEO, OG image, JSON-LD | All present and tested | `SiteNav.svelte`, `SiteFooter.svelte`, `seo.ts:78-86`, `+page.svelte`, OG image | `SiteNav.test.ts`, `seo.test.ts`, `og-assets.test.ts` | ✅ Met |
| 9 | Explainer content covers CP vs TP vs MAP | 4-section explainer | `explainers.ts:179-201` | Implicit via PageExplainer | ✅ Met |
| 10 | Source/confidence documented as code comments | Stryd "Verified", COROS "approximation from cycling", Garmin "verified against live account", Polar "verified from Polar blog" | `power-zones.ts` comment blocks | N/A — comments | ✅ Met |
| 11 | Tests added and passing, covering zone correctness per device | 217 + 296 lines of tests across all 4 devices | `power-zones.test.ts` (util + route) | Self | ✅ Met |
| 12 | No regressions to existing calculators | 844/844 tests passing. hr-zones/parkrun keyboard fix is an improvement. | All test files | `npm run test` | ✅ Met |

**Summary:** 12/12 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 — Issue #86 acceptance criteria not updated to match current state — ✅ Fixed

- **Category:** Documentation
- **Location:** Issue #86, Analysis section acceptance criteria
- **Description:** The 12 acceptance criteria in issue #86 still describe the original plan (4-way selector, COROS as Stryd alias, Garmin 7-zone). The current implementation is better (verified Garmin data, independent COROS model, COROS hidden pending research), but a future reader of the issue would be confused by the mismatch.
- **Recommendation:** Update the issue's acceptance criteria or add a note explaining the evolution.
- **Resolution:** Added a "Correction (2026-08-06, post-PR-#87-review)" section to issue #86's body, marking the original `### Acceptance Criteria` checklist as superseded and documenting the authoritative current state item-by-item (3-way UI selector, AC 2/3 obsolete/incorrect and why, commits `a9bf305`/`271b1be`/`e1a8feb` referenced).

### Suggestions (optional)

#### S1 — Document COROS hidden-state decision on issue #86 — ✅ Fixed

- **Category:** Documentation
- **Location:** Issue #86
- **Description:** The decision to hide COROS is documented in commit messages and the PR description but not as a comment on the issue itself.
- **Recommendation:** Add a brief comment on #86 noting COROS is hidden and linking to the relevant commit.
- **Resolution:** Posted a comment on issue #86 explaining the COROS hidden-state decision and linking commit `a9bf305`.

---

## Positive Observations

- **Data quality trajectory:** The PR evolved from a third-party Garmin approximation to verified first-party data from a live Garmin Connect screen — a meaningful improvement in data integrity over the original plan.
- **Deliberate COROS handling:** Rather than shipping unverified COROS zone data, the team chose to hide it while preserving all code and tests — a mature "flag it, don't fabricate certainty" approach.
- **Cross-cutting keyboard-focus fix:** The focus-follows-selection fix was applied consistently to all 3 tabbed pages with matching tests.
- **Stryd affiliate link correction:** Catching that Stryd doesn't sell on Amazon and fixing it proactively with provisions for the real affiliate program shows attention to user experience.
- **Comprehensive test coverage:** 844 tests with dedicated test files for both the utility layer and the route/component layer.
- **SEO test derivation fix:** `seo.test.ts`'s TOOL_ROUTES changed from hardcoded to dynamically derived from `PAGES` — future tool pages automatically inherit quality checks.

---

## Action Items

### Immediate Fixes (block merge)

None.

### Post-merge improvements

- [x] m1: Update issue #86's acceptance criteria to reflect current state
- [x] S1: Comment on #86 about COROS being hidden and why

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues (N/A — client-side calculator)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
