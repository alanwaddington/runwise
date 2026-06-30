# PR #13 Review — Project setup: SvelteKit + Tailwind + Vercel (#1)

**Date:** 2026-06-30
**Author:** alanwaddington
**Branch:** feature/1-sveltekit-tailwind-vercel → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass with comments ⚠️ |
| Risk Level | Low |
| Test Coverage | N/A — scaffold with no testable logic |
| Acceptance Criteria | 15/15 Met |

---

## Issues Reviewed

### Issue Hierarchy
- #1 — Project setup: SvelteKit + Tailwind + Vercel (root — contains Analysis and Design sections)

No parent or sub-issues found. This is a standalone foundational issue.

---

## Changed Files Audit

### `.gitignore` (+10 lines)

| Property | Detail |
|----------|--------|
| Purpose | Exclude build artifacts, dependencies, env files, and machine-specific Claude settings |
| Issues | #1 |
| Criteria covered | `.gitignore` excludes `node_modules/`, `.svelte-kit/`, `.vercel/`, `.env*` |
| Quality | ✅ No issues. Includes vite timestamp files and `.claude/settings.local.json` |
| Test coverage | N/A — config file |

### `.nvmrc` (+1 line)

| Property | Detail |
|----------|--------|
| Purpose | Pin Node.js version to 22 |
| Issues | #1 |
| Criteria covered | `.nvmrc` contains `22` |
| Quality | ✅ No issues |
| Test coverage | N/A — config file |

### `.prettierrc` (+15 lines)

| Property | Detail |
|----------|--------|
| Purpose | Configure Prettier with tabs, single quotes, Svelte plugin |
| Issues | #1 |
| Criteria covered | Prettier configured with SvelteKit defaults |
| Quality | ✅ No issues |
| Test coverage | N/A — config file |

### `README.md` (+42 lines)

| Property | Detail |
|----------|--------|
| Purpose | Project description, tool list, dev/build/check instructions, stack |
| Issues | #1 |
| Criteria covered | `README.md` exists with project name, description, and `npm run dev` instructions |
| Quality | ✅ Clear and complete for a scaffold |
| Test coverage | N/A — documentation |

### `eslint.config.js` (+34 lines)

| Property | Detail |
|----------|--------|
| Purpose | ESLint flat config for Svelte + TypeScript with browser/node globals |
| Issues | #1 |
| Criteria covered | `npm run lint` works |
| Quality | ✅ Correctly ignores build directories. `svelte/no-navigation-without-resolve` disabled with justification in PR notes |
| Test coverage | N/A — config file |

### `package-lock.json` (+4291 lines)

| Property | Detail |
|----------|--------|
| Purpose | Lock file for deterministic installs |
| Issues | #1 |
| Criteria covered | `npm install` completes without errors |
| Quality | ✅ No issues |
| Test coverage | N/A — generated file |

### `package.json` (+33 lines)

| Property | Detail |
|----------|--------|
| Purpose | Project metadata, scripts, and devDependencies |
| Issues | #1 |
| Criteria covered | All required deps (`@sveltejs/adapter-vercel`, `tailwindcss`, `@tailwindcss/vite`), all scripts (`dev`, `build`, `check`, `lint`, `format`) |
| Quality | ✅ All deps are devDependencies (correct for a SvelteKit app). `@sveltejs/vite-plugin-svelte` is listed despite not being directly imported in `vite.config.ts` — it's a transitive dep of `@sveltejs/kit` but listing it explicitly is harmless |
| Test coverage | N/A — config file |

### `src/app.css` (+1 line)

| Property | Detail |
|----------|--------|
| Purpose | Tailwind v4 CSS entry point |
| Issues | #1 |
| Criteria covered | `src/app.css` contains `@import "tailwindcss"` |
| Quality | ✅ No issues |
| Test coverage | N/A — CSS |

### `src/app.html` (+12 lines)

| Property | Detail |
|----------|--------|
| Purpose | HTML shell with charset, viewport, favicon, SvelteKit placeholders |
| Issues | #1 |
| Criteria covered | Standard SvelteKit app shell |
| Quality | ✅ Includes `lang="en"`, charset, viewport meta, `data-sveltekit-preload-data` |
| Test coverage | N/A — template |

### `src/routes/+layout.svelte` (+26 lines)

| Property | Detail |
|----------|--------|
| Purpose | Shared layout with CSS import, header nav, and page slot |
| Issues | #1 |
| Criteria covered | Site navigation rendered on all routes with links to each tool; layout wraps all pages |
| Quality | ✅ Uses Svelte 5 `$props()` and `{@render children()}`. Clean Tailwind classes. All 6 tool links present with correct `href` values |
| Test coverage | N/A — UI component, verified via runtime smoke test |

### `src/routes/+page.svelte` (+1 line)

| Property | Detail |
|----------|--------|
| Purpose | Home page with minimal `<h1>Runwise</h1>` placeholder |
| Issues | #1 |
| Criteria covered | `GET /` returns HTTP 200 with `<h1>Runwise</h1>` |
| Quality | ✅ No issues |
| Test coverage | N/A — placeholder |

### `src/routes/hr-zones/+page.svelte` (+2 lines)

| Property | Detail |
|----------|--------|
| Purpose | HR Zones placeholder page |
| Issues | #1 |
| Criteria covered | `GET /hr-zones` returns HTTP 200 with placeholder content |
| Quality | ✅ No issues |
| Test coverage | N/A — placeholder |

### `src/routes/pace/+page.svelte` (+2 lines)

| Property | Detail |
|----------|--------|
| Purpose | Pace Calculator placeholder page |
| Issues | #1 |
| Criteria covered | `GET /pace` returns HTTP 200 with placeholder content |
| Quality | ✅ No issues |
| Test coverage | N/A — placeholder |

### `src/routes/parkrun/+page.svelte` (+2 lines)

| Property | Detail |
|----------|--------|
| Purpose | Parkrun Predictor placeholder page |
| Issues | #1 |
| Criteria covered | `GET /parkrun` returns HTTP 200 with placeholder content |
| Quality | ✅ No issues |
| Test coverage | N/A — placeholder |

### `src/routes/race-predictor/+page.svelte` (+2 lines)

| Property | Detail |
|----------|--------|
| Purpose | Race Time Predictor placeholder page |
| Issues | #1 |
| Criteria covered | `GET /race-predictor` returns HTTP 200 with placeholder content |
| Quality | ✅ No issues |
| Test coverage | N/A — placeholder |

### `src/routes/training-paces/+page.svelte` (+4 lines)

| Property | Detail |
|----------|--------|
| Purpose | Training Pace Calculator placeholder page |
| Issues | #1 |
| Criteria covered | `GET /training-paces` returns HTTP 200 with placeholder content |
| Quality | ✅ Slightly different formatting (multi-line `<p>` tag) due to Prettier wrapping — functionally identical |
| Test coverage | N/A — placeholder |

### `src/routes/vo2max/+page.svelte` (+2 lines)

| Property | Detail |
|----------|--------|
| Purpose | VO2 Max Estimator placeholder page |
| Issues | #1 |
| Criteria covered | `GET /vo2max` returns HTTP 200 with placeholder content |
| Quality | ✅ No issues |
| Test coverage | N/A — placeholder |

### `svelte.config.js` (+11 lines)

| Property | Detail |
|----------|--------|
| Purpose | Configure SvelteKit with `adapter-vercel` and `vitePreprocess` |
| Issues | #1 |
| Criteria covered | `@sveltejs/adapter-vercel` referenced in `svelte.config.js` |
| Quality | ✅ Clean, minimal config |
| Test coverage | N/A — config file |

### `tsconfig.json` (+14 lines)

| Property | Detail |
|----------|--------|
| Purpose | TypeScript configuration extending SvelteKit defaults with strict mode |
| Issues | #1 |
| Criteria covered | TypeScript strict mode enabled |
| Quality | ✅ Enables `strict: true`, `checkJs`, `forceConsistentCasingInFileNames` |
| Test coverage | N/A — config file |

### `vercel.json` (+3 lines)

| Property | Detail |
|----------|--------|
| Purpose | Minimal Vercel framework config |
| Issues | #1 |
| Criteria covered | Vercel adapter configured for production build |
| Quality | ✅ Minimal and correct — `@sveltejs/adapter-vercel` handles the rest |
| Test coverage | N/A — config file |

### `vite.config.ts` (+7 lines)

| Property | Detail |
|----------|--------|
| Purpose | Vite config with Tailwind CSS and SvelteKit plugins |
| Issues | #1 |
| Criteria covered | Tailwind CSS v4 configured via `@tailwindcss/vite` plugin |
| Quality | ✅ Correct import from `@sveltejs/kit/vite` |
| Test coverage | N/A — config file |

---

## Acceptance Criteria Verification

### #1 — Project setup: SvelteKit + Tailwind + Vercel

#### Original Issue Acceptance Criteria

| # | Criterion | Implementation | Verdict |
|---|-----------|----------------|---------|
| 1 | Dev server starts cleanly on localhost | `package.json:6` script `"dev": "vite dev"` | ✅ Met |
| 2 | All 6 tool routes return a 200 with placeholder content | `src/routes/pace/+page.svelte`, `race-predictor/+page.svelte`, `training-paces/+page.svelte`, `hr-zones/+page.svelte`, `vo2max/+page.svelte`, `parkrun/+page.svelte` — all present with h1 + description | ✅ Met |
| 3 | Tailwind classes apply correctly | `vite.config.ts:2` — `@tailwindcss/vite` plugin; `src/app.css:1` — `@import 'tailwindcss'`; verified via runtime smoke test | ✅ Met |
| 4 | Vercel adapter is configured for production build | `svelte.config.js:1` — `import adapter from '@sveltejs/adapter-vercel'`; `vercel.json` present | ✅ Met |

#### Analysis Section Acceptance Criteria

| # | Criterion | Implementation | Verdict |
|---|-----------|----------------|---------|
| 1 | `npm run dev` starts without errors at `http://localhost:5173` | `package.json:6`; verified via runtime | ✅ Met |
| 2 | `GET /` returns HTTP 200 with `<h1>Runwise</h1>` | `src/routes/+page.svelte:1` | ✅ Met |
| 3 | `GET /pace` returns HTTP 200 | `src/routes/pace/+page.svelte` | ✅ Met |
| 4 | `GET /race-predictor` returns HTTP 200 | `src/routes/race-predictor/+page.svelte` | ✅ Met |
| 5 | `GET /training-paces` returns HTTP 200 | `src/routes/training-paces/+page.svelte` | ✅ Met |
| 6 | `GET /hr-zones` returns HTTP 200 | `src/routes/hr-zones/+page.svelte` | ✅ Met |
| 7 | `GET /vo2max` returns HTTP 200 | `src/routes/vo2max/+page.svelte` | ✅ Met |
| 8 | `GET /parkrun` returns HTTP 200 | `src/routes/parkrun/+page.svelte` | ✅ Met |
| 9 | `<nav>` rendered on all 7 routes with links | `src/routes/+layout.svelte:7-21` — nav with all 6 tool hrefs | ✅ Met |
| 10 | Tailwind utility class visibly applies | `@tailwindcss/vite` in `vite.config.ts`; classes used throughout | ✅ Met |
| 11 | `npm run build` exits 0 | Vercel adapter produces output; verified via runtime | ✅ Met |
| 12 | `@sveltejs/adapter-vercel` in `package.json` and `svelte.config.js` | `package.json:16`, `svelte.config.js:1` | ✅ Met |
| 13 | `.gitignore` excludes required paths | `.gitignore:1-4` — `node_modules`, `.svelte-kit`, `build`, `.vercel`, `.env`, `.env.*` | ✅ Met |
| 14 | `README.md` with project name, description, dev instructions | `README.md:1-42` | ✅ Met |
| 15 | `npm run check` exits with zero errors | `package.json:9`; verified via runtime | ✅ Met |

**Summary:** 15/15 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

None.

### Minor (nice to fix)

#### m1 — Missing `<title>` tag per route
- **Category:** Code Quality
- **Location:** All `+page.svelte` files
- **Description:** No `<svelte:head>` with `<title>` is set on any route. The browser tab shows "localhost:5173" in dev and no meaningful title in production. While SEO is deferred to issue #10, a basic `<title>Runwise</title>` in the layout would improve dev experience and is trivial to add.
- **Recommendation:** Add `<svelte:head><title>Runwise</title></svelte:head>` in `+layout.svelte`, or per-page titles. Can be addressed in issue #2 or #10.

#### m2 — No `engines` field in `package.json`
- **Category:** Reliability
- **Location:** `package.json`
- **Description:** `.nvmrc` pins Node 22, but `package.json` has no `engines` field. Someone running `npm install` on Node 18 or 24 wouldn't get a warning.
- **Recommendation:** Add `"engines": { "node": ">=22" }` to `package.json`.

#### m3 — Nav has no mobile responsiveness
- **Category:** Code Quality
- **Location:** `src/routes/+layout.svelte:9`
- **Description:** The nav uses `flex-wrap` which prevents overflow, but on very narrow viewports the 6 links will wrap into multiple lines without a hamburger/mobile pattern. This is acceptable for a placeholder — issue #2 (design system) should address it.
- **Recommendation:** No action needed now; tracked by issue #2.

### Suggestions (optional)

#### S1 — `@sveltejs/vite-plugin-svelte` is listed as a direct devDependency
- **Location:** `package.json:18`
- **Description:** `vite.config.ts` imports `sveltekit` from `@sveltejs/kit/vite`, not from `@sveltejs/vite-plugin-svelte`. However, `svelte.config.js` imports `vitePreprocess` from it, so it is correctly needed. The direct listing ensures version control. No action needed.

---

## Positive Observations

- Clean Svelte 5 syntax — uses `$props()` and `{@render children()}` correctly (not the deprecated `$$props`/`<slot>`)
- All dependencies are devDependencies, which is correct for SvelteKit (framework compiles everything)
- Tailwind v4 setup is minimal and correct — CSS-based config, no legacy `tailwind.config.js`
- `.gitignore` is thorough — includes vite timestamp files and machine-specific Claude settings
- ESLint config correctly uses flat config format with TypeScript parser for `.svelte` files
- PR notes clearly document the two compatibility fixes discovered during implementation
- Commits are well-structured with clear messages referencing the issue and task numbers

---

## Action Items

### Immediate Fixes (block merge)

None — all acceptance criteria are met.

### Post-merge improvements
- [ ] m1: Add a basic `<title>` tag — can be addressed in issue #2 or #10
- [ ] m2: Add `"engines": { "node": ">=22" }` to `package.json`
- [ ] m3: Mobile nav responsiveness — tracked by issue #2

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases — N/A (scaffold, no logic)
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent — N/A (no logic)
- [x] Logging adequate for debugging production issues — N/A (no logic)
- [x] Code follows existing codebase conventions — greenfield, establishes conventions
- [x] No unnecessary changes outside scope of the issue
