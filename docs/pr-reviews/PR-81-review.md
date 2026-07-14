# PR #81 Review — fix: correct vercel dev's dev-command auto-detection

**Date:** 2026-07-14 (m1 fixed same day, commit `07d7262`)
**Author:** alanwaddington
**Branch:** fix/vercel-dev-devcommand → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate (manual — no automated test surface exists for this: it's a Vercel-platform dev-tooling config value, not app code) |
| Acceptance Criteria | 8 Met / 8 Total |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

---

## Issues Reviewed

**No linked GitHub issue.** This PR did not go through the `/analyse` → `/design` → `/develop` workflow — it's an ad-hoc fix discovered opportunistically during the `/verify` review of PR #80 (confirmed: `gh api graphql` for issue #81 returns `NOT_FOUND`; the PR body references `#61`, `#62`, `#80` only contextually — as prior resolved work being cited, not as issues this PR closes — no `Closes #N`/`Fixes #N` syntax anywhere). In the absence of a tracked issue, this review treats the PR's own `## Summary` (4 claims) and `## Test plan` (4 checklist items) as the acceptance criteria to verify — the only documented statement of intent available.

### Issue Hierarchy
- None. This PR stands alone.

---

## Changed Files Audit

### `vercel.json` (+1 / -0)

| Property | Detail |
|----------|--------|
| Purpose | Adds `"devCommand": "npm run dev -- --port $PORT"`, overriding Vercel's broken auto-detected dev command |
| Issues | None (no linked issue) |
| Criteria covered | PR Summary claim 2; Test plan items 1, 2, 4 |
| Quality | ✅ No issues. Single-line, minimal, follows the file's existing JSON formatting (tabs) exactly. Correctly scoped to only affect `vercel dev` — independently confirmed `vercel build` (which uses `buildCommand`, unaffected by this key) still succeeds cleanly. |
| Test coverage | Not automatable (a Vercel-platform CLI behavior, not app code) — verified manually, twice independently by this review (once via a direct `vercel dev` launch, once by re-deriving the root cause from `.vercel/project.json` rather than trusting the PR's stated explanation). |

### `.claude/skills/verifier-runwise/SKILL.md` (+72 / -3)

| Property | Detail |
|----------|--------|
| Purpose | Documents the fix and its root cause; adds a new "Verifying `vercel.json` changes locally" section (two methods: `vercel build` + config inspection, and `vercel dev`); documents `vercel dev`'s forced `no-cache` behavior; documents intermittent dev-server background-launch failures observed during the PR #80 re-verify; corrects a stale "this repo has no vercel.json" claim |
| Issues | None (no linked issue) |
| Criteria covered | PR Summary claims 1, 3, 4 |
| Quality | Well-organized, in the right locations (new content placed logically relative to existing sections, not appended haphazardly). One Minor finding: the `no-cache` claim is phrased more broadly than what's actually true — see m1. |
| Test coverage | N/A (documentation) — but its factual claims are independently checkable, and this review did check them (see Findings). |

---

## Acceptance Criteria Verification

Since no issue exists, these are the PR's own stated claims and test-plan items — each verified independently by this reviewer (not by trusting the PR's checkmarks).

### PR #81 — Self-declared claims and test plan

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| 1 | Root cause: Vercel dashboard's Framework Preset cached as `sveltekit-1`, causing a broken dev-command guess | N/A (diagnosis, not code) | Independently re-derived: `.vercel/project.json` → `"framework": "sveltekit-1"`, confirmed by this reviewer, not just trusted from the PR text | ✅ Met |
| 2 | Fix: explicit `devCommand` added to `vercel.json`, overriding the guess | `vercel.json:3` | `vercel dev --listen 3020` → `Running Dev Command "npm run dev -- --port $PORT"` → resolves to `vite dev --port 3020` → `Ready!` (this review, fresh run) | ✅ Met |
| 3 | Documents the fix, root cause, and a `vercel.json`-verification workflow in the skill | `SKILL.md:76-119`, `253-266` | Ran the documented `vercel build` + config-inspection recipe verbatim (this review) — worked exactly as written | ✅ Met |
| 4 | Corrects the stale "no vercel.json" claim | `SKILL.md:13` | Read in full — no longer claims this; accurately describes current `vercel.json` contents | ✅ Met |
| 5 (Test plan) | `vercel dev --listen 3003` on a clean branch off `main` → correct command, `Ready!`, `200` on first poll | — | Reproduced independently on this review's own run (port 3020) — correct command and `Ready!` confirmed. Note: **first attempt failed** (the documented flakiness pattern), second succeeded — consistent with, not contradicting, this same PR's own documentation of that behavior | ✅ Met |
| 6 (Test plan) | `vercel.json` validated as well-formed JSON | — | `node -e "JSON.parse(...)"` — valid (this review) | ✅ Met |
| 7 (Test plan) | `npm run lint`: zero errors | — | Re-run fresh by this review — zero errors, zero warnings | ✅ Met |
| 8 (Test plan) | No other files touched — diff shows only `vercel.json` (+1 line) and the skill doc | — | `git diff <merge-base> fix/vercel-dev-devcommand --stat` (using the correct merge-base, not current `main` which has since moved past this branch via PR #80) — exactly 2 files, matches | ✅ Met |

**Summary:** 8/8 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 — Skill doc's "every response, every path" claim about `vercel dev`'s no-cache behavior is broader than what's actually true — ✅ Fixed (`07d7262`)
- **Category:** Code Quality (documentation accuracy)
- **Location:** `.claude/skills/verifier-runwise/SKILL.md:113-116`
- **Description:** The skill states: *"`vercel dev` always serves `Cache-Control: no-cache` on every response, on every path, regardless of what `vercel.json` actually configures."* Tested this directly during this review across several path types:
  - Genuine static files (`/favicon.svg`, `/favicon-32x32.png`) → `no-cache`, as claimed.
  - The homepage (`/`, an SSR route) → `public, max-age=0, must-revalidate` — **not** `no-cache`.
  - `/robots.txt` → also `public, max-age=0, must-revalidate`, **not** `no-cache` — even though this looks like a static file, it's actually a SvelteKit route (`src/routes/robots.txt`), and behaves like one.

  So the real pattern is "every **static file** response," not "every response, every path" — SvelteKit-rendered routes (including ones producing non-HTML output, like `robots.txt`) pass through SvelteKit's own default cache-control instead. This doesn't undermine the skill's actionable core point (the `/og/*.png` rule from PR #80 targets genuine static files, so `vercel dev` genuinely can't verify its exact `Cache-Control` value) — but the "every path" phrasing could mislead a future reader checking a caching rule on a dynamic route into wrongly concluding `vercel dev` is forcing `no-cache` there too, when what they're actually seeing is SvelteKit's own unrelated default.
- **Recommendation:** Narrow the claim to "every static file response" (or similar), and optionally note the `robots.txt`-is-actually-a-route nuance as a one-line caveat, so a future session testing a caching rule on a SvelteKit route (as opposed to a `static/` file) doesn't get confused by an apparently-contradictory result.
- **Outcome:** Fixed. Narrowed the claim to "genuine static files" and added the `robots.txt` example as an explicit caveat. Re-verified live on a fresh `vercel dev` run (which, fittingly, hit the same documented flakiness pattern on the first attempt — retry succeeded): `favicon.svg`/`favicon-32x32.png` → `no-cache`; `/` and `/robots.txt` → `public, max-age=0, must-revalidate`. The corrected claim now matches observed behavior exactly.

### Suggestions (optional)

None.

---

## Positive Observations

- Textbook example of "found it, fixed it, wrote it down" — this wasn't left as a TODO or a passing comment during the PR #80 verification; it got its own properly-scoped fix and, notably, its own separate PR rather than being bundled into #80's unrelated OG-image-optimization scope (avoiding scope creep and a merge-conflict risk between the two PRs, both of which touch `vercel.json`).
- The root cause wasn't guessed at — it was diagnosed precisely (`.vercel/project.json`'s cached `sveltekit-1` framework value), and this review independently re-derived that same diagnosis rather than taking the PR's word for it. It holds up.
- The fix works without requiring any out-of-repo action (no Vercel dashboard access needed) — a `vercel.json` value alone overrides the stale cached preset, which is the right fix shape for a repo where dashboard settings aren't version-controlled or reviewable.
- The second commit (`be2dd08`) is a good example of not letting a secondary, unplanned observation (intermittent dev-server launch flakiness, unrelated to the actual fix) get lost — it's recorded precisely, including that the behavior is non-deterministic (a bare retry sometimes suffices, `dangerouslyDisableSandbox` other times), rather than overclaiming a single fix for something that isn't fully understood yet.
- Confirmed empirically during this review's own verification pass: the flakiness is real and exactly as documented (first `vercel dev` launch failed, retry succeeded) — the documentation held up under a fresh, independent test.

---

## Action Items

### Immediate Fixes (block merge)
_None._

### Post-merge improvements
- [x] m1: Narrow the "every response, every path" claim in `SKILL.md` to "every static file response," and note that routes like `robots.txt` (which look static but are actually SvelteKit routes) behave differently. Fixed in `07d7262`.

---

## Checklist

- [x] All acceptance criteria (self-declared, no tracked issue) verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path — N/A for automated coverage (platform config, not app code); manual verification covered the happy path, a genuine failure/retry cycle (unplanned, encountered live during this review), and a root-cause re-derivation
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent — N/A (config value, not runtime code with error paths)
- [x] Logging adequate for debugging production issues — N/A (dev-tooling fix, not production code)
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope — confirmed via correct merge-base diff (2 files, matching the PR's own stated scope)
