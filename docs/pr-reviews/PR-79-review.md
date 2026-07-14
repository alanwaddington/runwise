# PR #79 Review — chore: add npm run clean:wasm convenience script (#60)

**Date:** 2026-07-14 (findings fixed 2026-07-14, commit `3fa1a7c`)
**Author:** alanwaddington
**Branch:** feature/60-clean-wasm-fallbacks-script → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate (manual — no automated coverage exists for `scripts/*.js` in this repo, by established convention; verified this holds for the two pre-existing scripts too) |
| Acceptance Criteria | 23 Met / 23 Total |
| Lint | 0 errors / 0 warnings (repo-wide, including the new file) |

---

## Issues Reviewed

This repo's workflow keeps the full requirement → design → implementation trail inside a single GitHub issue (`## Analysis` → `## Design` → `## Develop` sections), rather than a parent/sub-issue tree. Confirmed via the GitHub GraphQL API that issue #60 has no sub-issues and the schema has no `parentIssue` field for this repo — issue #60 is the complete hierarchy for this PR.

### Issue Hierarchy
- [#60](https://github.com/alanwaddington/runwise/issues/60) — chore: remove extraneous wasm packages from dependencies
  - `## Analysis` — root cause investigation, corrected requirements (MoSCoW), user stories, acceptance criteria
  - `## Design` — architecture, solution design, 3-task work breakdown
  - `## Develop` — implementation summary, verification performed

---

## Changed Files Audit

### `scripts/clean-wasm-fallbacks.js` (+41 / -0)

| Property | Detail |
|----------|--------|
| Purpose | New CLI script that removes 5 hardcoded, confirmed-extraneous WASM32-WASI fallback packages (`@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`) from `node_modules`, idempotently |
| Issues | #60 (Design Task 1) |
| Criteria covered | Design Task 1 AC1–AC5 (see verification table) |
| Quality | Follows the existing `scripts/generate-og-images.js` convention exactly (ESM, shebang, top-of-file usage comment, `fileURLToPath`/`dirname`/`join`). Correctly resolves paths relative to the script's own location, not CWD. One Minor finding: no `try/catch` around `rmSync` — see M1. |
| Test coverage | No automated test — consistent with the repo's existing convention (`vitest.config.ts`'s `test.include` is `src/**` only; neither `generate-docs.js` nor `generate-og-images.js` has a test file either). Manually verified by this reviewer (see Findings/Verification). |

### `package.json` (+2 / -1)

| Property | Detail |
|----------|--------|
| Purpose | Registers `"clean:wasm": "node scripts/clean-wasm-fallbacks.js"` in `scripts`, alongside the existing `docs:generate`/`og:generate` maintenance scripts |
| Issues | #60 (Design Task 2) |
| Criteria covered | Design Task 2 AC1–AC2 |
| Quality | ✅ No issues. Only the `scripts` object changed — `dependencies`/`devDependencies` untouched, matching the Analysis's explicit "no lockfile/dependency diff" requirement. |
| Test coverage | N/A (config entry); behavior verified manually via `npm run clean:wasm` |

### `docs/Guides/Developer Guide/developer-guide.md` (+12 / -0)

| Property | Detail |
|----------|--------|
| Purpose | New "Cleaning up extraneous WASM fallback packages (optional)" subsection under `## Setup`, explaining the root cause, that it's dev-only/zero production impact, and the `npm run clean:wasm` command |
| Issues | #60 (Design Task 3) |
| Criteria covered | Design Task 3 AC1 |
| Quality | ✅ No issues. Matches the guide's existing terse prose + code-block style. Accurately describes the script's actual behavior (verified against the code — no overstated claims). |
| Test coverage | N/A (documentation) |

### `docs/Guides/Developer Guide/developer-guide.html` (+6 / -0)

| Property | Detail |
|----------|--------|
| Purpose | Regenerated from the `.md` via `npm run docs:generate`, per `CLAUDE.md`'s docs workflow |
| Issues | #60 (Design Task 3) |
| Criteria covered | Design Task 3 AC2 |
| Quality | ✅ Content verified to match the `.md` source 1:1 (same prose, same code block, same heading). |
| Test coverage | N/A |

### `docs/Guides/Developer Guide/developer-guide.pdf` (binary, 12602 → 14169 bytes)

| Property | Detail |
|----------|--------|
| Purpose | Regenerated PDF counterpart |
| Issues | #60 (Design Task 3) |
| Criteria covered | Design Task 3 AC2 |
| Quality | ✅ Valid PDF (`file` confirms "PDF document, version 1.3, 5 page(s)"), size increase consistent with added content. |
| Test coverage | N/A |

**Scope check:** Confirmed via `git diff main --stat -- "docs/Guides/Deployment Guide/" "docs/Guides/User Guide/"` that neither of the other two guides was touched — satisfies the Design's explicit requirement that only the Developer Guide's derived binaries be committed (per `CLAUDE.md`'s "restore unmodified binaries" instruction).

---

## Acceptance Criteria Verification

Every criterion below was verified independently by this reviewer — running the script, diffing `npm ls --all` output, reading the code, and re-running `npm run build`/`npm run dev` — not by trusting the issue's checked boxes.

### #60 — Root-level acceptance criteria (original, corrected during `/analyse`)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | ~~Run npm clean-install to remove extraneous packages~~ (corrected: replaced with `npm run clean:wasm`) | `scripts/clean-wasm-fallbacks.js`, `package.json:17` | Manual — reviewer confirmed `npm ci` alone leaves all 5 packages present (fresh install, verified this session) | ✅ Met |
| 2 | Verify no build errors after cleanup | N/A (verification criterion) | `npm run build` re-run by reviewer with packages removed → `✓ built in 57.81s` | ✅ Met |
| 3 | node_modules size reduced | `scripts/clean-wasm-fallbacks.js` | Reviewer independently measured: 246M → 237M (~9MB) after `npm run clean:wasm` on a fresh `npm ci` | ✅ Met |
| 4 | Test build and dev server run normally | N/A (verification criterion) | `npm run build` (above) + `npm run dev` re-run by reviewer, confirmed `VITE ready`, `curl` returned `HTTP/1.1 200 OK` | ✅ Met |

### #60 — `## Analysis` acceptance criteria

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Root cause documented | `docs/Guides/Developer Guide/developer-guide.md:35-36` | N/A (docs) | ✅ Met |
| 2 | Confirmed `npm ci`/`npm prune` don't remove the packages | N/A (empirical finding) | Reviewer independently ran a fresh `npm ci` this session — all 5 packages present afterward, confirming the claim | ✅ Met |
| 3 | Confirmed packages are `dev`-only, unreferenced in source | N/A | Reviewer re-ran `grep -RIl "emnapi\|napi-rs\|tybys" src/` (no hits) and inspected `package-lock.json` (`dev: true` for all 5) this session | ✅ Met |
| 4 | `npm run build` succeeds with packages present (baseline) | N/A | Verified in prior `/verify` session with packages present; build succeeded | ✅ Met |
| 5 | `npm run dev` starts normally with packages present | N/A | Verified in prior `/develop`/`/verify` sessions | ✅ Met |
| 6 | Decision recorded: accept as harmless bloat + provide script | Issue `## Analysis` §2 Requirements | N/A (decision record) | ✅ Met |
| 7 | `clean:wasm` script added, exact 5 packages, idempotent, doesn't touch the 2 real wasm32 packages or anything else | `scripts/clean-wasm-fallbacks.js:19-25` (hardcoded `TARGET_PACKAGES`, no glob logic anywhere in the file) | Reviewer ran the script twice this session (removed → idempotent no-op on 2nd run) and diffed `npm ls --all` output (excluding targets) before/after — identical | ✅ Met |
| 8 | Script documented | `docs/Guides/Developer Guide/developer-guide.md:35-43` | N/A (docs) | ✅ Met |
| 9 | No `package.json` `dependencies`/lockfile diff | `package.json` diff (scripts entry only) | Reviewer confirmed `git status --short package.json package-lock.json` empty after running the script this session | ✅ Met |

### #60 — `## Design` Task 1 acceptance criteria (`scripts/clean-wasm-fallbacks.js`)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Removes all 5 present packages, prints "removed" per package + summary | `scripts/clean-wasm-fallbacks.js:29-41` | Reviewer ran `npm run clean:wasm` this session against a fresh `npm ci` → all 5 removed, correct log lines, `5 of 5 packages removed.` summary | ✅ Met |
| 2 | Idempotent — 2nd run exits 0, prints "already absent" | `scripts/clean-wasm-fallbacks.js:32-38` (`force: true` makes `rmSync` a no-op on missing paths) | Reviewer ran the script a 2nd time immediately after → `already absent` × 5, `0 of 5 packages removed.`, exit 0 | ✅ Met |
| 3 | Fresh `npm ci` reproduces deterministically | N/A | Reviewer ran `npm ci` twice independently across this and the `/verify` session — both times all 5 packages were present and removable identically | ✅ Met |
| 4 | Doesn't touch `@tailwindcss/oxide-wasm32-wasi`, `@rolldown/binding-wasm32-wasi`, or any other package | `scripts/clean-wasm-fallbacks.js:19-25` (no wildcard/glob anywhere in file) | `npm ls --all` diffed before/after (excluding the 5 targets) — identical; both wasm32-wasi folders remain absent throughout (never installed on this platform, untouched either way) | ✅ Met |
| 5 | No `package.json`/`package-lock.json` change from running the script | N/A | `git status --short package.json package-lock.json` empty after running | ✅ Met |

### #60 — `## Design` Task 2 acceptance criteria (`package.json` wiring)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | `npm run clean:wasm` behaves identically to direct `node` invocation | `package.json:17` | Reviewer ran `npm run clean:wasm` — output matched the direct-invocation pattern verified in Task 1 | ✅ Met |
| 2 | `npm run` lists `clean:wasm` | `package.json:17` | Confirmed in prior `/develop` session (`npm run` output includes `clean:wasm`) | ✅ Met |

### #60 — `## Design` Task 3 acceptance criteria (documentation)

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Developer Guide documents what/why/optional/re-run-needed | `developer-guide.md:35-43` | Read in full this session — all 4 elements present and accurate | ✅ Met |
| 2 | `docs:generate` was run, html/pdf reflect new `.md` content | `developer-guide.html:71-77`, `developer-guide.pdf` | `.html` content diffed against `.md` (1:1 match); `.pdf` confirmed valid, 5 pages, size change consistent | ✅ Met |
| 3 | Only Developer Guide's derived files changed, no other guide's binaries | N/A | `git diff main --stat -- "docs/Guides/Deployment Guide/" "docs/Guides/User Guide/"` — empty | ✅ Met |

**Summary:** 23/23 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 — No error handling around `rmSync` in the cleanup script — ✅ Fixed (`3fa1a7c`)
- **Category:** Reliability
- **Location:** `scripts/clean-wasm-fallbacks.js:33`
- **Description:** `rmSync(packagePath, { recursive: true, force: true })` is called without a `try/catch`. `force: true` only suppresses "path doesn't exist" errors — it does not suppress other failure modes (e.g. a file locked by a running process, an EPERM/EBUSY on the WSL 9p-mounted filesystem this repo already has documented flakiness on for other tooling — see the `pool: 'threads'` comment in `vite.config.ts`). If package 3 of 5 fails to delete for such a reason, the script throws an uncaught exception and exits non-zero without reporting the status of packages 4 and 5, and without the friendly per-package summary. This isn't silent (Node prints a stack trace), but it doesn't meet the project's stated error-handling bar of "log before handling, catch per-item, continue processing remaining items" for a loop over independent items.
- **Recommendation:** Wrap each `rmSync` call in a `try/catch`, log a clear per-package failure line (e.g. `failed to remove <name>: <error.message>`) and continue to the next package; consider exiting 1 at the end if any deletions failed, so CI/scripting callers can detect partial failure.
- **Outcome:** Fixed. Each `rmSync` is now wrapped in `try/catch`; a failure logs `failed to remove <name>: <error.message>` via `console.error` and the loop continues to the next package; the script exits 1 at the end if any package failed. Verified against a real `EACCES` failure (chmod 555 on a package's parent directory on a native ext4 filesystem, since `/mnt/c`'s DrvFs mount doesn't enforce Unix permissions) — confirmed the script logged the failure and still removed the remaining packages instead of crashing.

### Suggestions (optional)

#### S1 — Consider re-checking `extraneous` status at runtime instead of a static list — ✅ Fixed (`3fa1a7c`)
- **Category:** Code Quality / Future-proofing
- **Location:** `scripts/clean-wasm-fallbacks.js:19-25`
- **Description:** The script trusts a hardcoded list of 5 package names rather than re-deriving "is this actually extraneous" from `npm ls --json` at runtime. This is the right tradeoff today (explicit and glob-free, per the Design's deliberate safety rationale), but if the upstream `@tailwindcss/oxide`/`@rolldown/binding` WASM bundle names or versions ever change, the script will silently stop matching anything (reporting "already absent" for packages that no longer exist under those names, while new extraneous packages under different names go unnoticed).
- **Recommendation:** No action needed now — just worth a one-line code comment noting that the list may need updating if Tailwind/Rolldown ever rename their WASM fallback bundles. Not worth the added complexity of dynamic `npm ls` parsing for a ~9MB local convenience script.
- **Outcome:** Fixed. Added a 3-line comment directly above `TARGET_PACKAGES` explaining the hardcoding rationale and noting the list may need updating if the upstream bundle names change.

---

## Positive Observations

- Exemplary root-cause investigation: the PR doesn't just implement what the original issue asked for — it empirically tested the original issue's own acceptance criterion (`npm clean-install` removes the packages) and found it false, then corrected the issue text and requirements accordingly before writing any code. This is exactly the kind of "verify before you build" discipline that prevents shipping a fix for the wrong problem.
- The script deliberately avoids the tempting-but-dangerous `*wasm*` glob approach, with a clearly documented rationale (the two real WASM32 fallback packages must never be touched, in case a future platform genuinely needs them). This shows real judgment about blast radius, not just "make the immediate case work."
- Strong adherence to existing repo conventions rather than introducing a new pattern — the script mirrors `generate-og-images.js`'s structure closely, and the decision to skip automated tests is justified by (and consistent with) the existing `vitest.config.ts` scope and the two prior `scripts/*.js` files, rather than being a shortcut.
- Correctly scoped the `CLAUDE.md` docs-regeneration workflow — only the Developer Guide's binaries were committed, with the other two guides' incidentally-regenerated PDFs discarded, exactly as instructed.
- Idempotency was a first-class design goal, not an afterthought — verified.
- Production-impact claim (zero footprint in the Vercel build) was verified against the actual `.vercel/output` build artifacts, not just inferred from `devDependencies` status.

---

## Action Items

### Immediate Fixes (block merge)
_None._

### Post-merge improvements
- [x] m1: Add per-package `try/catch` error handling to `scripts/clean-wasm-fallbacks.js` so a single failed deletion doesn't abort reporting on the rest. Fixed in `3fa1a7c`.
- [x] S1: Add a one-line comment noting the hardcoded package list may need updating if upstream WASM bundle names change. Fixed in `3fa1a7c`.

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases — N/A: no automated tests exist by established repo convention; manual verification covered happy path + idempotency + scope-safety edge cases
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent — see m1 (minor gap, not blocking)
- [x] Logging adequate for debugging production issues — N/A (local dev script, not production code)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
