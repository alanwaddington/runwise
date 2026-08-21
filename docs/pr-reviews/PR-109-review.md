# PR #109 Review — Phase 3: E2E coverage, accessibility, UX polish, changelog (#100)

**Date:** 2026-08-20
**Author:** alanwaddington
**Branch:** feature/100-phase3-ui-polish-accessibility-release → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass with comments ⚠️ |
| Risk Level | Low |
| Test Coverage | Adequate — thorough, AC-traceable |
| Acceptance Criteria | 12 / 14 fully Met, 2 Partially Met |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

GitHub's sub-issue GraphQL API is unavailable on this repo (`parentIssue`/`subIssues` fields don't exist — confirmed via direct API call), so there is no structured issue hierarchy to traverse. Issue references extracted from the PR title, body, and all 9 commit messages: `#100` (root, this PR's actual scope — Phase 3), `#102`/`#104` (prior merged phases, context only), `#107` (closed, findings already resolved inline), `#108` (deliberately out-of-scope follow-up, filed not fixed), `#98`/`#99` (historical, pre-#100 context in CHANGELOG.md).

### Issue Hierarchy

- **#100** — Enhancement: Expand workout generation with HR mode, new patterns, and advanced formats (root — contains Analysis/Design for all 3 phases inline; no separate sub-issues). This PR implements **Phase 3** (Task 1-8, AC-9.1 through AC-9.11, plus S1).
  - #102 — Phase 1 (merged, unrelated to this PR's diff)
  - #104 — Phase 2 (merged, unrelated to this PR's diff)
  - #107 — UX audit findings (closed within this same work, findings fixed inline)
  - #108 — Two pre-existing, unrelated E2E test issues discovered during this PR's final regression pass, explicitly deferred

---

## Changed Files Audit

### `e2e/helpers.ts` (+48, new file)

| Property | Detail |
|----------|--------|
| Purpose | Shared Playwright setup (cookie-consent seeding, race-result filling, mode switching) for the 5 new `workouts-*.test.ts` files |
| Issues | #100 (AC-9.1–9.4) |
| Criteria covered | Infrastructure for AC-9.1–9.4 |
| Quality | ✅ No issues. Well-scoped, only extracted what's genuinely duplicated across 5 files. Doesn't over-abstract existing single-file specs. |
| Test coverage | N/A — test infrastructure itself |

### `e2e/workouts-race-prep.test.ts` (+80, new)
| Purpose | Race-Prep flow E2E (AC-9.1) | **Quality:** ✅ Good AC traceability in comments; the Taper/Shakeout regression test explicitly cross-references PR #104's AC-7.6 fix. | **Test coverage:** is the test.

### `e2e/workouts-hr-badges.test.ts` (+64, new)
Covers AC-9.2. ✅ No issues — substring-matching fix for the glyph+label badge text is documented inline as a real authoring lesson, not silently patched.

### `e2e/workouts-fit-download.test.ts` (+104, new)
Covers AC-9.3/9.4. ✅ No issues — genuinely exercises real (non-mocked) FIT downloads, a materially different code path from the existing jsdom component tests that mock `buildFitWorkout`. The `devices['iPhone 12']` field-picking workaround (avoiding `defaultBrowserType` conflicts) is documented with the actual error it was fixing.

### `e2e/workouts-accessibility.test.ts` (+59, new)
Covers AC-9.5. ✅ No issues — asserts only on `results.violations`, correctly leaving `results.incomplete` for manual review (documented, not silently ignored).

### `e2e/workouts-modal-keyboard.test.ts` (+92 across 2 commits, new)
Covers the Task 5 focus-fix and its own later Shift+Tab regression (found via this PR's own `/verify` pass, fixed same-PR). 6 tests total. ✅ No issues — this file is the strongest evidence of the PR's own self-correcting process: a real defect surfaced by an independent verification pass, root-caused, fixed, and regression-tested within the same PR before this review.

### `src/routes/workouts/+page.svelte` (+90/-38, modified across 4 commits)

| Property | Detail |
|----------|--------|
| Purpose | (1) Modal focus management (`modalDialogEl`, `modalTriggerEl`, `closeModal`, `handleModalKeydown`); (2) contrast fixes (`bg-accent`→`bg-accent-dark` on active tabs, `text-muted`→`text-subtle dark:text-muted` on inactive-tab/stat-label/segment text, dropped `/70` opacity); (3) link-underline fix; (4) two touch-target fixes (`py-2` on the disclosure `<summary>`, `-m-2 p-2` on the modal close button) |
| Issues | #100 (AC-9.5 through AC-9.8) |
| Quality | ✅ No issues after the Shift+Tab fix (see Findings — this was a real, now-resolved defect). `modalTriggerEl` as a plain (non-`$state`) variable coexisting with `$state` fields is a minor stylistic inconsistency, not a bug (correctly doesn't need reactivity — it's only read imperatively inside event handlers). |
| Test coverage | Full — every behavioral change here has a corresponding E2E assertion |

### `src/lib/components/AffiliateLinks.svelte`, `PageExplainer.svelte`, and 7 route pages (`hr-zones`, `parkrun`, `power-zones`, `privacy`, `race-predictor`, `training-paces`, `vo2max`)

| Property | Detail |
|----------|--------|
| Purpose | Same 3 mechanical fixes (tab-fill contrast, inactive-tab-text contrast, link underline) applied everywhere the identical copy-pasted pattern appears |
| Issues | #100 (AC-9.5) |
| Quality | ✅ No issues — verified each diff hunk is the exact same one-property change as `/workouts`', no drift or inconsistency between pages. Correctly scoped: only touches the specific classes involved, not surrounding markup. |
| Test coverage | ⚠️ No dedicated automated test confirms the fix on these 7 non-`/workouts` pages specifically (the axe scan only covers `/workouts`) — see Findings. |

### `CHANGELOG.md` (+80, new)
Covers AC-9.9. ✅ No issues — reconstructed from git log/PR descriptions rather than memory; includes a self-caught accuracy correction (FIT export predates #100, only HR-target encoding was added in Phase 1) rather than overclaiming.

### `docs/accessibility/workouts-manual-audit.md` (+72, new)
Covers AC-9.6. ⚠️ See Findings — explicitly and honestly discloses that no real screen reader was used, substituting accessibility-tree inspection. The disclosure itself is a quality strength; the underlying gap against the AC's literal text is the finding.

### `docs/Guides/Developer Guide/developer-guide.md` (+6, modified)
Covers AC-9.11. ✅ No issues.

### `e2e/pace.test.ts` (+4/-4, modified)
Fixes 3 stale assertions (unrelated to Phase 3's own scope, but root-caused via `git blame` to commit `cd16d05` and fixed as a 2-line correction during the final regression pass). ✅ No issues — a good example of "fix what you find, cheaply, when fully root-caused" rather than scope creep.

### `package.json` / `package-lock.json`
Adds `@axe-core/playwright ^4.13.0` as a devDependency. ✅ No issues — correctly scoped to devDependencies, no production bundle impact (test-only tooling).

---

## Acceptance Criteria Verification

### #100 — Phase 3 (Task 1-8), AC-9.1 through AC-9.11, S1

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC-9.1 | E2E covers full Race-Prep flow | `e2e/workouts-race-prep.test.ts` | Same file, 4 tests | ✅ Met |
| AC-9.2 | E2E covers HR mode + pattern badges | `e2e/workouts-hr-badges.test.ts` | Same file, 3 tests | ✅ Met |
| AC-9.3 | E2E covers FIT download, 3 modalities | `e2e/workouts-fit-download.test.ts:22-58` | Same file | ✅ Met |
| AC-9.4 | Mobile-viewport pass, representative subset | `e2e/workouts-fit-download.test.ts:65-104` | Same file | ✅ Met |
| AC-9.5 | axe-core zero violations, 4 modes + modal | `e2e/workouts-accessibility.test.ts`; fixes in `+page.svelte` and 9 other files | Same file, 5 tests | ✅ Met |
| AC-9.6 | Manual keyboard nav + **screen-reader spot-check** | `docs/accessibility/workouts-manual-audit.md` | N/A (doc) | ⚠️ **Partially Met** — keyboard-nav portion fully delivered and is excellent (it's what found the critical modal bug); the screen-reader portion explicitly was **not** performed with a real screen reader (VoiceOver/NVDA, as the AC's own text specifies) — substituted with accessibility-tree inspection, honestly disclosed in the doc itself rather than silently glossed over. The disclosure is a quality strength; the gap against the literal AC is still real. |
| AC-9.7 | `/ux` audit scoped to `/workouts`, concrete findings | Issue #107 (closed) | N/A | ✅ Met |
| AC-9.8 | Findings fixed-here or filed-separately, explicit disposition | `+page.svelte` (2 touch-target fixes) | E2E coverage indirectly (no dedicated touch-target-size test) | ✅ Met |
| AC-9.9 | `CHANGELOG.md`, Keep a Changelog, Phase 1+2 backfilled | `CHANGELOG.md` | N/A (doc) | ✅ Met |
| AC-9.10 | Full `npm run test` **and** `npm run test:e2e` **both** pass | N/A (regression claim) | Full suite runs (see below) | ⚠️ **Partially Met** — `npm run test`: 1299/1299, fully passes. `npm run test:e2e` as a bare command does **not** fully pass: `toolbar-sidebar-zoom.test.ts` (18 tests) and one `theme-hover.test.ts` test fail, confirmed pre-existing and unrelated to `/workouts`, deliberately left unfixed and filed as issue #108 instead. This is a reasonable, well-justified, and transparently disclosed engineering call — but the AC's own text says "both still pass" unconditionally, with no carve-out for pre-existing-and-disclosed exceptions. Worded precisely, the criterion as written isn't literally satisfied. |
| AC-9.11 | Dev Guide documents new E2E/a11y convention | `developer-guide.md:325-330` | N/A (doc) | ✅ Met |
| S1 | Correct stale "500+ tests" DoD line | Issue #100 body, corrected to 1299 | N/A (doc) | ✅ Met |

**Summary:** 12/14 fully Met, 2 Partially Met (AC-9.6, AC-9.10). No criterion is Not Met — every AC has real, working, tested implementation; the two Partial verdicts are about literal-text completeness of already-substantially-delivered work, not missing functionality.

---

## Findings

### Major (should fix)

#### M1 — AC-9.6's screen-reader spot-check was not performed with a real screen reader
- **Category:** Test Coverage / Documentation Accuracy
- **Location:** `docs/accessibility/workouts-manual-audit.md`
- **Description:** AC-9.6's own text specifies "a screen-reader spot-check (VoiceOver or NVDA, whichever the developer has available)." The delivered work substitutes accessibility-tree inspection (checking ARIA roles/accessible-names programmatically) — a reasonable and honestly-disclosed proxy given this sandboxed environment has no real screen reader available, but it is not the same activity the AC describes, and doesn't carry the same evidentiary weight (structural correctness ≠ confirmed correct announcement/prosody, as the doc itself notes).
- **Recommendation:** No code change needed. Either (a) have someone with real VoiceOver/NVDA access run the specific spot-check items listed in the doc's own "Not independently re-verified" section, or (b) if that's not practical soon, consider softening AC-9.6's own wording in future similar tasks to explicitly allow accessibility-tree inspection as a first-class fallback when real AT access isn't available, rather than leaving a permanent gap between what the AC asks for and what's realistically deliverable in this environment.

#### M2 — `npm run test:e2e` does not fully pass as a bare command, despite AC-9.10's unconditional wording
- **Category:** Test Coverage / Reliability
- **Location:** `e2e/toolbar-sidebar-zoom.test.ts` (18 tests, all pages), `e2e/theme-hover.test.ts` (1 test) — neither file modified by this PR
- **Description:** Confirmed via direct execution: both failures are pre-existing on `main` (verified for `toolbar-sidebar-zoom` via isolated re-run with a freshly-restarted preview server, ruling out resource contention; verified for the `pace.test.ts` staleness via `git blame` to an unrelated Aug-10 commit) and unrelated to `/workouts`. Filed as issue #108 rather than fixed here — a defensible scope decision (these require interactive debugging of a Chromium zoom-emulation issue and a responsive-nav breakpoint, neither trivial or root-caused the way the `pace.test.ts` fix was). But AC-9.10 says the e2e suite "still pass[es]," full stop — that's not literally true today, and a future contributor running `npm run test:e2e` bare will see 19 failures with no indication (outside this PR's own commit messages and issue #108) that they're expected/pre-existing.
- **Recommendation:** No code change required for this PR. Consider either: (a) a `playwright.config.ts` mechanism to mark/skip known-pre-existing-broken tests with a linked issue reference (so `npm run test:e2e` reports "19 skipped, see #108" instead of silently failing), or (b) prioritizing issue #108 soon so the bare command becomes trustworthy again — right now, a real regression introduced by some future PR could hide among the 19 already-expected failures.

### Minor (nice to fix)

#### m1 — No dedicated automated test confirms the contrast/link fixes on the 7 non-`/workouts` pages
- **Category:** Test Coverage
- **Location:** `src/routes/hr-zones/+page.svelte`, `parkrun`, `power-zones`, `privacy`, `race-predictor`, `training-paces`, `vo2max`
- **Description:** `e2e/workouts-accessibility.test.ts` only scans `/workouts`. The identical fix was correctly applied to 7 other pages (verified by reading every diff hunk — all consistent, no drift), but nothing in the automated suite would catch a future regression on any of those 7 pages specifically, only on `/workouts`.
- **Recommendation:** Consider parameterizing `workouts-accessibility.test.ts`'s scan (or adding a lightweight sibling) to also hit `/hr-zones`, `/parkrun`, `/power-zones` — the three pages that got the full tab-fill + inactive-text contrast fix, not just the link-underline-only fix.

#### m2 — `modalTriggerEl` is a plain variable alongside `$state` fields in the same component
- **Category:** Code Quality
- **Location:** `src/routes/workouts/+page.svelte:120`
- **Description:** Every other piece of component state in this file uses Svelte 5's `$state` rune; `modalTriggerEl` is a bare `let`. This is intentional and correct (it's only read/written imperatively inside event handlers, never needs to trigger a re-render), but it's the one exception to an otherwise consistent pattern, which could read as an oversight to a future maintainer without the explaining comment right above it (which, to be clear, does exist and does explain it).
- **Recommendation:** No change needed — flagging only so a future reader searching for "why is this the one non-`$state` variable" finds the answer faster. Could add a one-line comment specifically on that line if desired.

---

## Positive Observations

- **The PR found and fixed a genuinely critical, pre-existing accessibility bug** (modal focus never entering the dialog, breaking Escape and any focus trap) that no prior test — automated or manual — had caught, and then **found and fixed a second-order bug in its own fix** (the Shift+Tab bypass) via an independent `/verify` pass, all within the same PR before merge. This is exactly the kind of self-correcting process a review process should want to see, not just a static "code looks fine."
- Exceptional AC-to-code-to-test traceability throughout — nearly every test file and commit message cites the specific AC/Task/issue number it addresses, making this review substantially faster and more reliable than typical.
- Honest, specific disclosure patterns repeated throughout: the screen-reader limitation (M1), axe-core's 209 "incomplete" results explicitly *not* claimed as passing, the FIT-export attribution correction in `CHANGELOG.md`, and the deliberate scope boundary on issue #108 (fixed what was cheaply root-caused, filed what wasn't) — all signal a reviewer can trust this PR's own self-reporting rather than needing to double-check every claim from scratch.
- Root-caused fixes reuse existing, previously-unused design tokens (`--color-accent-dark`, `--color-subtle`) rather than inventing new colors — keeps the fix minimal and consistent with the existing (if underused) design system.
- Zero lint errors/warnings, `tsc --noEmit` clean, full unit suite 1299/1299 — all independently re-run during this review, not merely trusted from the PR description.

---

## Action Items

### Immediate Fixes (block merge)
None — no Critical or Not-Met findings. Both Major findings (M1, M2) are about literal-completeness of already-substantially-delivered, well-disclosed work, not missing or broken functionality.

### Post-merge improvements
- [ ] M1: Real screen-reader spot-check when VoiceOver/NVDA access is available, or formally soften AC-9.6's wording for future similar tasks
- [ ] M2: Prioritize issue #108, or add a skip-with-reference mechanism so `npm run test:e2e` stops silently including 19 known-pre-existing failures
- [ ] m1: Extend accessibility scanning to the other affected pages (`/hr-zones`, `/parkrun`, `/power-zones`)
- [ ] m2: Optional — comment on why `modalTriggerEl` isn't `$state`

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases (including a genuinely tricky focus-management edge case)
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions (test-only/devDependency additions, CSS-only production changes)
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues (N/A — client-side calculation tool, no server logging surface)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue (the `pace.test.ts` fix is the one exception, and it's explicitly justified and minimal)
