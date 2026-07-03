# PR #36 Review — Add optional Google Search Console meta-tag verification

**Date:** 2026-07-03
**Author:** alanwaddington
**Branch:** feature/google-search-console-verification-tag → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate — all three states (set/unset/empty-string) covered by both unit tests and live browser verification |
| Acceptance Criteria | 3 Met / 1 Deferred (out of scope by design) / 0 Not Met |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

None. This PR is not linked to any GitHub issue — no `#NNN` reference in the title, body, branch name, or any commit resolves to a requirements/analysis issue for this PR's own scope (the only `#NNN` references found are `#33`/`#35`, cited in the skill-update commit as prior, unrelated work). A companion issue, **#37 — "Register Runwise with Google Search Console"**, tracks the manual account/DNS steps this PR's code enables, but it is not referenced by number anywhere in this PR and contains no acceptance criteria for this PR's own diff — it's a downstream runbook, not this PR's spec. In place of an issue hierarchy, this review treats the PR body's own "Test plan" checklist as the criteria to verify.

### Issue Hierarchy
- None (ad-hoc PR, consistent with the pattern already used for PR #33 and PR #35)

---

## Changed Files Audit

### `src/lib/components/SeoHead.svelte` (+5 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Reads `env.PUBLIC_GOOGLE_SITE_VERIFICATION` from `$env/dynamic/public` and conditionally renders `<meta name="google-site-verification" content="...">` inside the existing `<svelte:head>` block |
| Issues | None (no linked issue) |
| Criteria covered | PR body Test Plan items 1–2 |
| Quality | ✅ No issues. The `{#if env.PUBLIC_GOOGLE_SITE_VERIFICATION}` guard is a truthy check, correctly treating both `undefined` (unset) and `''` (empty string) as "don't render" — verified this handles the real-world case where a dashboard (Vercel's included) lets you save an env var with an empty value rather than truly omitting it. No injection risk: Svelte's `content={...}` is an attribute binding (`setAttribute`), not string-concatenated or passed through `{@html}` like the pre-existing JSON-LD script elsewhere in this same file — the verification token is deployer-controlled (set in Vercel's dashboard) either way, so this is a low-sensitivity input regardless |
| Test coverage | `SeoHead.test.ts` — 3 new tests covering set/unset/empty-string; independently re-verified live via a real dev server across `/` and `/pace` (a non-home route, confirming the tag is genuinely site-wide via this shared component, not accidentally home-page-only) |

### `src/lib/components/SeoHead.test.ts` (+48 / -10 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds a `describe('SeoHead google-site-verification', ...)` block with 3 tests; converts all pre-existing `render(SeoHead, ...)` calls from a static top-level import to a dynamic `await import('./SeoHead.svelte')` per test, needed so the new `vi.mock('$env/dynamic/public', ...)` at the top of the file is in place before the component module (which now imports `$env/dynamic/public`) is evaluated |
| Issues | None (no linked issue) |
| Criteria covered | PR body Test Plan item 1 (set/unset/empty-string coverage) |
| Quality | ✅ Good use of a mutable `mockPublicEnv` object referenced by the `vi.mock` factory (the same pattern already established in `SiteNav.test.ts` for `matchPage`/`matchMedia`), letting each test mutate the mocked value independently; `afterEach` correctly deletes the key so state doesn't leak between tests |
| Test coverage | N/A — this is the test file. Independently re-ran with `--reporter=verbose`: all 11 individual test names present and passing (8 pre-existing + 3 new) |

### `vitest-setup.ts` (+11 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Adds `vi.mock('$env/dynamic/public', () => ({ env: {} }))` globally, so any component reading `env.PUBLIC_*` doesn't crash when rendered directly by `@testing-library/svelte` |
| Issues | None (no linked issue) |
| Criteria covered | PR body Test Plan item 3 (regression fix) |
| Quality | ✅ This is the most important file in the diff — it's the fix for a genuine, self-discovered regression (see Findings/Positive Observations). Correctly follows the exact pattern already established in this same file for `window.matchMedia`: a default global stub that individual test files can locally override via their own `vi.mock` call for the same module specifier. I independently confirmed the causal claim by re-running exactly the 9 files named in the PR body (`home-page.test.ts`, `tool-pages.test.ts`, `seo-integration.test.ts`, and all 6 individual tool-page tests) — all 9 pass cleanly with this mock in place |
| Test coverage | N/A — test infrastructure, exercised implicitly by every test that transitively renders `SeoHead` |

### `.env.example` (+4 / -0 lines, new file)

| Property | Detail |
|----------|--------|
| Purpose | Documents the new optional `PUBLIC_GOOGLE_SITE_VERIFICATION` variable, per the `.gitignore`'s pre-existing `!.env.example` allowance (this repo had never actually had an `.env.example` file until now) |
| Issues | None (no linked issue) |
| Criteria covered | Supporting documentation, not a Test Plan item |
| Quality | ✅ Clear comment explaining where the value comes from (GSC's HTML-tag verification option) and that only the `content="..."` value is needed, not the full tag |
| Test coverage | N/A — documentation file |

### `docs/Guides/Deployment Guide/deployment-guide.md` (+10 / -0 lines) and its regenerated `.html`/`.pdf`

| Property | Detail |
|----------|--------|
| Purpose | Adds a new "Environment Variables" section documenting the var, where to set it (Vercel dashboard), and that no env vars are required for a first-time deploy |
| Issues | None (no linked issue) |
| Criteria covered | Supporting documentation |
| Quality | ✅ Correctly regenerated via `npm run docs:generate` per this project's CLAUDE.md workflow, and only the actually-changed guide's derived binaries were committed — I confirmed the `Developer Guide`/`User Guide` PDFs, which also get touched by every `docs:generate` run regardless of content change, were correctly restored/excluded rather than committed as spurious diffs |
| Test coverage | N/A — documentation |

### `.claude/skills/verifier-runwise/SKILL.md` (+12 / -3 lines)

| Property | Detail |
|----------|--------|
| Purpose | Corrects a stale note (the "42 pre-existing `svelte-check` errors" baseline, which PRs #33–#35 already fixed) and documents the `$env/dynamic/public` mocking gotcha discovered while building this PR |
| Issues | None (no linked issue) |
| Criteria covered | Supporting tooling documentation |
| Quality | ✅ Good practice — capturing a hard-won debugging discovery (9 test files failing with a cryptic `TypeError`) as a permanent, reusable note for the next person, rather than letting it be rediscovered from scratch |
| Test coverage | N/A — skill documentation |

---

## Acceptance Criteria Verification

### PR body Test Plan (no linked issue — see note above)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Meta tag renders correctly when `PUBLIC_GOOGLE_SITE_VERIFICATION` is set | `SeoHead.svelte:53-55` | `SeoHead.test.ts:101-108`; independently re-verified live via `npm run dev` with the var set — `<meta name="google-site-verification" content="abc123testtoken"/>` rendered correctly on both `/` and `/pace` | ✅ Met |
| 2 | No tag rendered when unset (default, no behavior change for existing deployments) | `SeoHead.svelte:53` (truthy guard) | `SeoHead.test.ts:110-121` (covers both `undefined` and `''`); independently re-verified live — no tag in rendered HTML for both the unset and empty-string cases | ✅ Met |
| 3 | Full test suite green after fixing the `$env/dynamic/public` regression | `vitest-setup.ts:12` | Independently re-ran full suite: `Test Files 32 passed (32)`, `Tests 575 passed (575)`; independently re-ran exactly the 9 previously-broken files named in the PR body: `Test Files 9 passed (9)`, `Tests 216 passed (216)` | ✅ Met |
| 4 | Set the actual verification token in Vercel once registered in Google Search Console (see companion tracking issue) | N/A — out of repo scope | N/A | ⚪ Deferred — correctly left unchecked by the author; this is genuinely not part of this PR's scope, tracked separately in issue #37, and requires Google/Vercel account access no code change can satisfy |

**Summary:** 3/3 in-scope criteria Met; 1 explicitly deferred (not a gap — correctly scoped out).

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

None.

### Suggestions (optional)

None. This PR is notably self-critical in a good way — it found and fixed its own regression before ever reaching review (see Positive Observations), leaving nothing outstanding for this reviewer to catch that wasn't already caught and fixed by the author's own process.

---

## Positive Observations

- The standout quality of this PR is process, not just code: the author implemented the feature, ran the full suite, discovered it broke 9 unrelated test files, root-caused it correctly (SvelteKit's `$env/dynamic/public` needs a live request context that `@testing-library/svelte`'s `render()` never provides), and fixed it with a minimal, well-precedented change — all before opening the PR. This is exactly the "TDD catches real regressions" outcome the project's `/develop` workflow is designed to produce, and the commit history documents the discovery honestly rather than presenting a cleaned-up final state with no trace of the detour.
- The fix generalizes correctly: rather than patching only the one test file that needed it, the global `vitest-setup.ts` mock protects every current and future component that reads `$env/dynamic/public`, following the exact precedent already set by the `window.matchMedia` stub in the same file.
- Truthy-checking (not `!== undefined`) for the env var correctly handles the empty-string case, which is a real-world risk (Vercel's dashboard allows saving an env var with an empty value) — and this was specifically tested, not just handled by accident.
- Documentation discipline: `.env.example`, the deployment guide, and the project's own `verifier-runwise` skill were all updated in the same PR, and the skill update fixed a genuinely stale note rather than leaving it to rot.
- The PR correctly scoped out what it couldn't do (registering with Google, setting the production token) into a separate tracking issue instead of either silently omitting it or falsely claiming completion.

---

## Action Items

### Immediate Fixes (block merge)
None.

### Post-merge improvements
None.

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code — N/A hierarchy (no linked issue); PR body's own Test Plan verified instead
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases — set/unset/empty-string all covered
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced — verified the meta content is attribute-bound, not `{@html}`-injected
- [x] No performance regressions
- [x] Error handling complete and consistent — N/A, no runtime error paths introduced
- [x] Logging adequate for debugging production issues — N/A, no logging surface in this change
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue — every file change is directly traceable to the stated feature, its regression fix, or its documentation
