# PR #80 Review — chore: optimize OG image assets (#62)

**Date:** 2026-07-14 (m1/S1 fixed 2026-07-14, commit `29deb0f`)
**Author:** alanwaddington
**Branch:** feature/62-optimize-og-images → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass with comments ⚠️ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 22 Met / 24 Total (2 Partially Met) |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

Same pattern as PRs #79/#81: this repo keeps the full requirement → design → implementation trail inside a single GitHub issue (`## Analysis` → `## Design` → `## Develop` sections) rather than a parent/sub-issue tree. Confirmed via the GitHub GraphQL API that issue #62 has no sub-issues and the schema has no `parentIssue` field for this repo — issue #62 is the complete hierarchy for this PR.

### Issue Hierarchy
- [#62](https://github.com/alanwaddington/runwise/issues/62) — chore: optimize og image assets
  - `## Analysis` — root cause investigation (path correction, cache-policy risk, measured compression benchmark), corrected requirements (MoSCoW), user stories, acceptance criteria
  - `## Design` — architecture, solution design, 3-task work breakdown
  - `## Develop` — implementation summary, verification performed

---

## Changed Files Audit

### `scripts/generate-og-images.js` (+7 / -0)

| Property | Detail |
|----------|--------|
| Purpose | Adds an `oxipngSync(['-o', 'max', '--strip', 'safe', outputPath])` call immediately after each of the 7 OG image screenshots, losslessly re-optimizing the just-written PNG in place |
| Issues | #62 (Design Task 2) |
| Criteria covered | Design Task 2 AC1–AC5 |
| Quality | Follows the existing script's structure exactly — single new line + import + comment, no restructuring. Correctly scoped to the `OG_IMAGES` loop only, not `FAVICONS`. One Minor finding: no error handling if `oxipngSync` throws mid-loop — see m1. |
| Test coverage | Indirect — covered by `src/lib/og-assets.test.ts`'s new size-budget assertions, which fail if this step doesn't run/work. No direct unit test of the script itself, consistent with this repo's established convention (`vitest.config.ts`'s `test.include` is `src/**` only; neither this script nor its siblings have dedicated test files). |

### `package.json` / `package-lock.json` (+1 / +11)

| Property | Detail |
|----------|--------|
| Purpose | Adds `oxipng@^1.0.1` as a `devDependency` |
| Issues | #62 (Design Task 2) |
| Criteria covered | Supports Task 2's implementation |
| Quality | ✅ No issues. `dev: true` confirmed in the lockfile entry. Deliberately chosen over `sharp` per the Design's documented rationale (bundles 3 platform binaries directly in its own package, no `optionalDependencies` tree) — verified this holds: `npm ls --all \| grep extraneous` shows only the pre-existing, unrelated #60 wasm packages, nothing new from `oxipng`. |
| Test coverage | N/A (dependency manifest) |

### `src/lib/og-assets.test.ts` (+14 / -1)

| Property | Detail |
|----------|--------|
| Purpose | Adds a `MAX_OG_IMAGE_BYTES` (420KB) size-budget assertion per OG image, alongside the existing file-exists checks |
| Issues | #62 (Design Task 1) |
| Criteria covered | Design Task 1 AC1–AC3 |
| Quality | ✅ No issues. `OG_IMAGE_PATHS` correctly dedupes via `Set` (avoids redundant test cases for routes sharing `DEFAULT_OG_IMAGE`, e.g. `/` and `/privacy`). Threshold has sensible headroom — measured max optimized size is 393275 bytes, budget is 430080 bytes (~9% margin: tight enough to catch a real regression toward the ~480-492KB baseline, loose enough not to be flaky on minor template tweaks). |
| Test coverage | This file *is* the test. |

### `vercel.json` (+6 / -0)

| Property | Detail |
|----------|--------|
| Purpose | Adds a new `headers` rule: `{"source": "/og/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800"}]}` |
| Issues | #62 (Design Task 3) |
| Criteria covered | Design Task 3 AC1, AC2, AC4 (AC3 Partially Met — see Findings) |
| Quality | ✅ No issues. Valid JSON. Additive to the existing `/(.*)"` security-headers rule (untouched, byte-for-byte identical in the diff) — no conflict, since the two rules set different header keys. Path correctly targets `/og/(.*)`, not the issue's original non-existent `/static/og/*`. |
| Test coverage | Not directly testable locally (see Findings M1) — independently verified via `vercel build` (local, no deploy) + inspecting the merged `.vercel/output/config.json`, both by the PR author and, separately, by this review. |

### `static/og/*.png` (7 files, binary, ~490KB → ~390KB each)

| Property | Detail |
|----------|--------|
| Purpose | Regenerated via `npm run og:generate` with the new optimization step |
| Issues | #62 (Design Task 2) |
| Criteria covered | Design Task 2 AC1, AC2; Analysis AC "no visual quality loss" |
| Quality | ✅ No issues. Total size: 3407368 → 2724676 bytes (**20.04% reduction**, slightly better than the PR's claimed 18-20%). Dimensions unchanged (1200×630) on all 7. |
| Test coverage | Pixel-perfect losslessness independently verified via PIL pixel-diff against the pre-change (`main`) committed versions — the PR author sampled 3 of 7 (`og-default`, `og-vo2max`, `og-parkrun`); this review independently pixel-diffed the remaining 4 (`og-pace`, `og-training-paces`, `og-hr-zones`, `og-race-predictor`). **All 7 of 7 now confirmed pixel-identical**, exceeding the PR's own stated 3/7 sample. |

---

## Acceptance Criteria Verification

Every criterion below was verified independently by this reviewer — running `npm run og:generate`, `npm run lint`, the full test suite, `vercel build` (local, no deploy), and pixel-diffing all 7 images — not by trusting the issue's checked boxes.

### #62 — Root-level acceptance criteria (original, corrected during `/analyse`)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Cache headers for the images' actual served path (`/og/*`, corrected from `/static/og/*`) | `vercel.json:21-26` | `vercel build` + `.vercel/output/config.json` inspection (this review) | ✅ Met |
| 2 | WebP conversion evaluated, deferred as documented Could | Issue `## Analysis` §2 | N/A (decision record) | ✅ Met |
| 3 | Image sizes documented in comments | `scripts/generate-og-images.js:52-54` | N/A (docs) | ✅ Met |
| 4 | No visual quality loss | `oxipngSync(['-o', 'max', ...])` — lossless mode, no quantization | PIL pixel-diff, 7/7 images (this review + PR author combined) | ✅ Met |

### #62 — `## Analysis` acceptance criteria

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Cache headers added for `/og/*` | `vercel.json:21-26` | `vercel build` config inspection | ✅ Met |
| 2 | Cache policy is `public, max-age=86400, stale-while-revalidate=604800` (not immutable) | `vercel.json:24` | Config value confirmed correct via `vercel build`; **literal live-deployed `curl -I` not performed** (no deployment exists yet) | ⚠️ Partially Met — see Finding M1 |
| 3 | Lossless PNG re-optimization integrated into `og:generate` flow | `scripts/generate-og-images.js:55` | Re-ran `npm run og:generate` live, confirmed output | ✅ Met |
| 4 | Total size reduced ~18-19% | 7 files regenerated | Measured: 3407368 → 2724676 bytes (20.04%) | ✅ Met |
| 5 | Optimized output pixel-identical | `oxipng` lossless mode | PIL pixel-diff, 7/7 images | ✅ Met |
| 6 | Image size impact documented in comment | `scripts/generate-og-images.js:52-54` | N/A (docs) | ✅ Met |
| 7 | WebP NOT implemented, documented as deferred | Issue `## Analysis` §2 | `git diff main --stat` — no WebP-related files | ✅ Met |
| 8 | No changes to `seo.ts`, `SeoHead.svelte`, or OG image URLs/filenames | N/A | `git diff main --stat` — confirmed absent from the 12-file changeset | ✅ Met |

### #62 — `## Design` Task 1 acceptance criteria (size-regression test)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | New size-threshold assertion per OG image | `src/lib/og-assets.test.ts:25-28` | N/A (is the test) | ✅ Met |
| 2 | Test fails (RED) against current unoptimized files at time of writing | Commit `273ca33` | Verified via commit history: `273ca33` (test added) predates `fc0ea5d` (optimization landed) — matches TDD RED→GREEN sequence | ✅ Met |
| 3 | Existing file-exists tests remain unmodified and passing | `src/lib/og-assets.test.ts:17-23` | Full suite: 743/743 passing (this review) | ✅ Met |

### #62 — `## Design` Task 2 acceptance criteria (oxipng integration)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `og:generate` succeeds, produces 7 visually-identical, smaller images | `scripts/generate-og-images.js:42-58` | Re-ran live; PIL pixel-diff 7/7 identical | ✅ Met |
| 2 | Total size reduced ~18-19% | — | Measured 20.04% (this review) | ✅ Met |
| 3 | Task 1's tests now pass (GREEN) | — | 743/743 passing | ✅ Met |
| 4 | Favicon files unmodified | `FAVICONS` loop untouched | `git diff main --stat` — no favicon files in changeset | ✅ Met |
| 5 | Code comment documenting measured impact | `scripts/generate-og-images.js:52-54` | N/A (docs) | ✅ Met |

### #62 — `## Design` Task 3 acceptance criteria (vercel.json cache rule)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Valid JSON, `source` is `/og/(.*)` | `vercel.json:22` | `node -e "JSON.parse(...)"` — valid; `vercel build` merges to `"src": "^/og(?:/(.*))$"` | ✅ Met |
| 2 | Cache policy value exactly `public, max-age=86400, stale-while-revalidate=604800` | `vercel.json:24` | Exact string match confirmed in both `vercel.json` and merged `.vercel/output/config.json` | ✅ Met |
| 3 | Post-deploy `curl -I` confirms header live | — | **Not performed** — no deployment exists for this PR; strongly corroborated instead via `vercel build`'s merged routing table (the literal artifact Vercel's edge will use), independently reproduced twice (once by the PR author, once by this review) | ⚠️ Partially Met — see Finding M1 |
| 4 | Existing security headers still present on `/og/*`, unaffected | `vercel.json:12-20` (untouched) | `git diff` shows this rule byte-for-byte unchanged; dev-server responses confirmed carrying these headers on `/og/*` requests | ✅ Met |

**Summary:** 22/24 criteria fully met; 2 Partially Met (both the same underlying gap: live post-deploy header confirmation, not yet possible since this PR hasn't been deployed).

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

#### M1 — Live post-deploy cache-header verification not yet performed — ⏳ Tracked as post-merge follow-up
- **Category:** Reliability / Process
- **Location:** `vercel.json:21-26` (the criterion, not a code defect)
- **Description:** Two acceptance criteria (Analysis AC2, Design Task 3 AC3) call for confirming the `Cache-Control` header via `curl -I` against a deployed URL. That hasn't happened — there's no deployment for this PR yet, so it's not currently possible to fully satisfy this literally. The PR author was transparent about this the entire way through (flagged in the issue, the Design section, commit messages, and the PR description itself) rather than silently marking it done.
- **Recommendation:** Not a blocker — this is inherent to how Vercel processes `vercel.json` (merged by the platform build/deploy step, not observable via a local `npm run build`) and can only be closed out after merge/deploy. The strongest verification achievable pre-merge has already been done, independently, twice: `vercel build` (local, authenticated, no deploy) merges `vercel.json` into `.vercel/output/config.json`, and both the PR author and this review confirmed the exact rule appears there: `{"src": "^/og(?:/(.*))$", "headers": {"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"}}`. This is the literal routing table Vercel's edge will use — about as strong as evidence gets without an actual deployment. Action item: run `curl -I https://runwise.app/og/og-default.png` once this PR is deployed, to close the loop (tracked as a post-merge follow-up, not a merge blocker).
- **Outcome:** Deliberately left open as a post-merge follow-up, per stakeholder direction — asked explicitly whether to trigger a real preview deployment now to close this out early, or defer until after merge (matching how #61's identical situation was handled). Stakeholder chose to defer; no deployment was triggered. Not fixed by a code change (none is possible here), but not a blocker either.

### Minor (nice to fix)

#### m1 — No error handling around `oxipngSync` in the generation loop — ✅ Fixed (`29deb0f`)
- **Category:** Reliability
- **Location:** `scripts/generate-og-images.js:55`
- **Description:** `oxipngSync(['-o', 'max', '--strip', 'safe', outputPath])` is called without a `try/catch`. If it throws (e.g. an unsupported platform — `oxipng` only bundles x86_64 binaries for macOS/Linux-musl/Windows, no arm64 — or a corrupted intermediate PNG), the whole `og:generate` script halts mid-loop. Remaining images in `OG_IMAGES` never even get their Playwright screenshot taken, leaving `static/og/` in a partially-regenerated, inconsistent state with no specific error message pointing at what failed or why. Lower severity than it might otherwise be: this is a manual, immediately-visible dev-tooling script (a crash surfaces loudly in the terminal, not silently), not something running unattended in CI or production.
- **Recommendation:** Wrap the `oxipngSync` call in a `try/catch`, log a clear per-image failure message (including the platform-support caveat if relevant), and either continue to the next image or fail fast with a clear summary — same pattern already established in `scripts/clean-wasm-fallbacks.js` (PR #79) for an analogous external-process-call scenario in this same `scripts/` directory.
- **Outcome:** Fixed. Each `oxipngSync` call is now wrapped in `try/catch`; a failure logs `Failed to optimize <path>: <error.message>`, keeps the unoptimized screenshot, and continues to the next image; the script exits 1 at the end if any image failed. Verified in an isolated harness reproducing the exact loop/try-catch logic against a guaranteed oxipng failure (invalid PNG bytes) — confirmed all items are still processed (loop doesn't abort early) and the script exits 1. Happy path re-verified unchanged (regenerated images byte-identical to committed versions).

### Suggestions (optional)

#### S1 — Document the arm64 platform gap in-code — ✅ Fixed (`29deb0f`)
- **Category:** Code Quality / Future-proofing
- **Location:** `scripts/generate-og-images.js:12` (the `oxipng` import) or near the `oxipngSync` call
- **Description:** `oxipng`'s npm package only bundles x86_64 binaries for macOS, Linux (musl), and Windows — no native arm64 build. This was a consciously accepted tradeoff during `/design` (documented in the issue's Design section), but the script itself has no comment noting it, so a future contributor on Apple Silicon or an arm64 Linux CI runner hitting `Missing binary for platform` would have to rediscover this from scratch.
- **Recommendation:** A one-line comment near the `oxipngSync` call noting the platform limitation would save that rediscovery — same lightweight-comment pattern already used elsewhere in this PR (the size-impact comment) and in PR #79's `clean-wasm-fallbacks.js`. Genuinely optional given how rarely this script runs and how visible a failure would be.
- **Outcome:** Fixed. Added to the existing size-impact comment block directly above the `try` block, noting the x86_64-only support and the exact error message a future contributor would see.

---

## Positive Observations

- Same rigor pattern established in #60/#61/#79: the PR doesn't just implement what the issue asked for — it corrected a factual error in the issue itself (`/static/og/*` doesn't exist as a served route; `npm run og:generate`'s output is served at `/og/*`) before writing any code, and backed the "significant savings" judgment call with an actual measured benchmark (`oxipng -o max` against the real production images) rather than assuming compression would help.
- Deliberately rejected `sharp` in favor of `oxipng` specifically to avoid reintroducing the `optionalDependencies` platform-proliferation problem from #60 — verified this holds: no new extraneous packages from this dependency.
- Losslessness wasn't just asserted from the tool's documentation — it was independently proven via a real pixel-diff against the pre-change committed images (now 7/7 confirmed across the PR author's and this review's combined sampling), which is exactly the kind of "don't trust, verify" discipline this repo's recent history has consistently shown.
- Cache-policy choice (`max-age=86400, stale-while-revalidate=604800` instead of `immutable`/1yr) is grounded in a real, cited precedent — these exact filenames already got overwritten in place once by a genuine redesign (2026-07-08) — not a generic "be safe" hand-wave.
- WebP was seriously evaluated and explicitly deferred with a clear, specific risk rationale (inconsistent social-crawler support) rather than either blindly implementing it or dismissing it without consideration.
- TDD followed properly and verifiably: the RED commit (`273ca33`) genuinely predates the GREEN commit (`fc0ea5d`) in the git history, not just claimed in a commit message.

---

## Action Items

### Immediate Fixes (block merge)
_None._

### Post-merge improvements
- [ ] M1: Run `curl -I <deployed-url>/og/og-default.png` once this PR is deployed, to close the loop on live cache-header confirmation. Confirmed with stakeholder: deliberately deferred to post-merge rather than triggering a deployment now.
- [x] m1: Add `try/catch` error handling around `oxipngSync` in `scripts/generate-og-images.js`, matching the pattern in `scripts/clean-wasm-fallbacks.js` (PR #79). Fixed in `29deb0f`.
- [x] S1: Add a one-line comment noting `oxipng`'s x86_64-only platform support. Fixed in `29deb0f`.

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited (including binary diffs — pixel-verified all 7 PNGs, 4 independently by this review)
- [x] Tests cover happy path — error-path coverage has a gap (see m1); not blocking given the manual, dev-only nature of the script
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions — net improvement (smaller assets, caching added)
- [x] Error handling complete and consistent — see m1 (minor gap, non-blocking)
- [x] Logging adequate for debugging production issues — N/A (build tooling, not production runtime code)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
