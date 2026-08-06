# PR #89 Review — Make Stryd store link location-aware (#88)

**Date:** 2026-08-06
**Author:** alanwaddington
**Branch:** feature/88-stryd-store-region-link → main
**State:** Open
**Commits reviewed:** 1 (d8dce04)

**Update (2026-08-06):** The one finding below (S1) has been fixed rather than left for future work — see its "Resolution" note. Commit `b68aa44`.

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 5 Met / 5 Total |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

### Issue Hierarchy

- #88 — Make Stryd store link location-aware — root issue with `## Analysis` and `## Design` sections, no parent issue, no sub-issues (confirmed via GraphQL — this repo embeds the full analysis/design hierarchy inside one issue rather than using native sub-issues, same convention as #86)

---

## Changed Files Audit

### `src/lib/affiliates.ts` (+14 / -2 lines)

| Property | Detail |
|----------|--------|
| Purpose | Replace the Stryd entry's hardcoded UK-only `url` (`stryd.com/uk/en/store`) with Stryd's own region-auto-detecting entry point (`stryd.com/store`); extend the existing code comment with the delegation rationale and verification method/date |
| Issues | #88 |
| Criteria covered | Analysis AC 1, 2, 4; Design Task 1 AC 1, 2, 4 |
| Quality | ✅ Comment is thorough and dated, gives a future reader the actual evidence trail (redirect chain, regions confirmed, source of the URL) rather than an unsubstantiated claim. Correctly extends the pre-existing comment about the pending Stryd affiliate-program application rather than replacing it, and adds a forward-looking note to check the future tracking link preserves this redirect. |
| Test coverage | `affiliates.test.ts:40-48` (`AFFILIATE_LINKS_powerZones_strydIsDirectLink`) |

### `src/lib/affiliates.test.ts` (+5 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Tighten `AFFILIATE_LINKS_powerZones_strydIsDirectLink` from a `stryd.com` prefix-match (`toMatch(/^https:\/\/www\.stryd\.com/)`) to an exact URL match (`toBe('https://www.stryd.com/store')`) |
| Issues | #88 |
| Criteria covered | Analysis AC 3; Design Task 1 AC 3 |
| Quality | ✅ The prior prefix assertion would have silently continued passing even if a region-specific path were reintroduced (e.g. `/uk/en/store`) — the stated purpose of this change (a regression guard) is genuinely achieved by the tightened assertion, not just claimed. Comment explains why the stricter form matters, not just what it checks. |
| Test coverage | Self — this is the test file |

---

## Acceptance Criteria Verification

### #88 — Make Stryd store link location-aware

Both the `## Analysis` and `## Design` sections define acceptance criteria; the Analysis's 5-item list is the authoritative one (Design's Task 1 list is a restatement of the same 5 items in task-scoped form, verified identically below).

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `affiliates.ts`'s Stryd entry uses `https://www.stryd.com/store` as its `url`, not a region-specific path | `affiliates.ts:129` — `url: 'https://www.stryd.com/store'` | `affiliates.test.ts:47` | ✅ Met |
| 2 | Code comment documents delegation to Stryd's own redirect, verification method, and verification date | `affiliates.ts:118-126` — states the redirect chain, the regions/currencies checked, the "Global" fallback, the homepage-nav corroboration, and the date `2026-08-06` | N/A — comment, not independently testable | ✅ Met |
| 3 | `affiliates.test.ts` asserts the Stryd product's `url` is the generic auto-detecting endpoint, not a region-specific one | `affiliates.test.ts:47` — `expect(stryd?.url).toBe('https://www.stryd.com/store')`, replacing a prefix-only check | Self | ✅ Met |
| 4 | No new server-side code, headers, locale/geo utility, or `AffiliateProduct` interface changes | Confirmed by reading `affiliates.ts` (interface unchanged, lines 1-10) and `AffiliateLinks.svelte` (byte-identical to pre-PR, untouched by this diff) — no `hooks.server.ts`, `+page.server.ts`, or `+layout.server.ts` exist anywhere in the app, before or after | N/A — absence-of-change criterion, verified by direct inspection | ✅ Met |
| 5 | Original (pre-analysis) Acceptance Criteria and Technical sections marked as superseded, pointing to the Analysis as authoritative | Issue #88 body, immediately above the original checklist: *"Superseded by the `## Analysis` section below..."* | N/A — issue-body content, not code | ✅ Met |

**Summary:** 5/5 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

None.

### Suggestions (optional)

#### S1 — `{#each products as product (product.url)}` uses the changed field as its Svelte keying identity — ✅ Fixed

- **Category:** Code Quality
- **Location:** `src/lib/components/AffiliateLinks.svelte:34` (not modified by this PR, but interacts with the changed data)
- **Description:** The affiliate cards list keys each `{#each}` iteration on `product.url`. Since this PR changes the Stryd entry's `url` value, Svelte's reconciliation will treat the Stryd card as a newly-inserted node relative to any previously-rendered instance with the old URL, rather than an in-place update, on the next render where both values could coexist in a diff (e.g. HMR during development, or any future scenario with transitions/local per-item state). In this specific case it's inert — the card has no local component state and nothing observably differs — so this isn't a bug, just a latent sharp edge worth knowing about if this component ever gains per-item state or enter/exit transitions later.
- **Recommendation:** No action needed for this PR. If `AffiliateLinks.svelte` ever adds local per-card state or transition animations, key on `product.name` (stable across URL changes) instead of `product.url`.
- **Resolution:** Fixed rather than deferred, per instruction to leave no findings for future work. Changed the key to `product.name` (commit `b68aa44`); confirmed via a one-off test that `name` is unique within every route's array in `AFFILIATE_LINKS`, so it's a safe, stable keying field.

---

## Positive Observations

- **Evidence-based comment, not an assertion.** The extended code comment in `affiliates.ts` records the actual verification method (a `curl` redirect-chain trace) and which regions/currencies were individually checked, plus the corroborating detail that the same URL is Stryd's own homepage "Buy" link — this is exactly the kind of comment that saves a future maintainer from re-deriving or wrongly second-guessing the decision.
- **Test tightened for a real reason, not cosmetic.** The prefix-to-exact-match change in `affiliates.test.ts` measurably changes what the test can catch (demonstrated: it now fails against the pre-PR code, confirmed during `/develop`'s TDD red phase) rather than being a no-op rewording.
- **Correctly minimal diff.** True to the Design's stated intent (1 task, 2 files, ~19 lines) — no scope creep into `AffiliateLinks.svelte`, the `AffiliateProduct` interface, or any server-side code, all of which the issue's original (pre-analysis) plan assumed would be needed.
- **Forward-compatibility note included.** The comment flags that the pending Stryd affiliate-program tracking link should be checked for redirect-preservation before being wired in later, rather than silently assuming it will behave the same way.

---

## Action Items

### Immediate Fixes (block merge)

None.

### Post-merge improvements

None required. (S1 is a no-action-needed observation, not a deferred task.)

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases (edge case here being the regression path the tightened assertion guards against)
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent (N/A — no new error paths; this is a static config value)
- [x] Logging adequate for debugging production issues (N/A — client-side static link, no logging surface)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
