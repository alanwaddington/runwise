# PR #26 Review — SEO: meta tags, sitemap, structured data, and Open Graph (#10)

**Date:** 2026-07-02
**Author:** alanwaddington
**Branch:** feature/10-seo-infrastructure → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass ✅ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 15 Met / 15 Total |
| Lint | 0 errors / 0 warnings |

---

## Issues Reviewed

### Issue Hierarchy
- #10 — SEO: meta tags, sitemap, structured data, and Open Graph (root — contains both Analysis and Design sections)

No parent or sub-issues.

---

## Changed Files Audit

### `package.json` (+2 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Add `og:generate` script command for Playwright-based OG image generation |
| Issues | #10 |
| Criteria covered | AC8, AC8a (OG image generation pipeline) |
| Quality | ✅ No issues |
| Test coverage | N/A — build script configuration |

### `scripts/favicon-template.html` (+32 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | HTML template for rendering favicon PNGs via Playwright screenshot |
| Issues | #10 |
| Criteria covered | AC9 (refined favicon) |
| Quality | ✅ No issues — uses same rounded-corner SVG path as favicon.svg |
| Test coverage | N/A — build-time template |

### `scripts/generate-og-images.js` (+66 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Playwright script to generate 7 OG PNGs + 2 favicon PNGs from HTML templates |
| Issues | #10 |
| Criteria covered | AC8, AC8a, AC9 |
| Quality | ✅ Clean, well-structured script with explicit tool→filename mapping |
| Test coverage | `src/lib/og-assets.test.ts` verifies all generated files exist on disk |

### `scripts/og-template.html` (+273 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | HTML/CSS template for 1200×630 OG images with brand design (green gradient, Manrope font, running mark) |
| Issues | #10 |
| Criteria covered | AC8, AC8a |
| Quality | ✅ Professional design with parameterised tool name via query string |
| Test coverage | N/A — build-time template; output verified by `og-assets.test.ts` |

### `src/app.html` (+2 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Add PNG favicon fallback and apple-touch-icon links alongside existing SVG favicon |
| Issues | #10 |
| Criteria covered | AC9 (favicon infrastructure) |
| Quality | ✅ Correct `sizes` attributes for each format |
| Test coverage | `src/app.html.test.ts` — 3 tests verify all favicon references |

### `src/app.html.test.ts` (+12 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Tests that app.html references SVG favicon, PNG fallback, and apple-touch-icon |
| Issues | #10 |
| Criteria covered | AC9 |
| Quality | ✅ No issues |
| Test coverage | Self — test file |

### `src/lib/components/SeoHead.svelte` (+66 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Shared SEO component rendering canonical, OG, Twitter, and JSON-LD tags from centralised config |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC3, AC4, AC5, AC12, AC14 |
| Quality | ✅ Clean Svelte 5 runes usage; JSON-LD properly escapes `<` to prevent XSS; eslint-disable comment documents the reason for `@html` usage |
| Test coverage | `src/lib/components/SeoHead.test.ts` — 7 tests covering canonical, OG, Twitter, JSON-LD, per-tool images, unknown route fallback |

### `src/lib/components/SeoHead.test.ts` (+84 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Component tests for SeoHead rendering across all tag types and edge cases |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC3, AC4, AC5, AC12, AC14 |
| Quality | ✅ Thorough coverage including unknown route fallback |
| Test coverage | Self — test file |

### `src/lib/components/ToolLayout.svelte` (+1 / -7 lines)

| Property | Detail |
|----------|--------|
| Purpose | Remove `pageTitle` prop and `<svelte:head>` title rendering — now handled by SeoHead |
| Issues | #10 |
| Criteria covered | AC10, AC12 (single responsibility — ToolLayout is presentational only) |
| Quality | ✅ Clean removal of duplicated concern |
| Test coverage | `src/lib/components/ToolLayout.test.ts` — updated to remove `pageTitle` assertions |

### `src/lib/components/ToolLayout.test.ts` (+0 / -30 lines)

| Property | Detail |
|----------|--------|
| Purpose | Remove tests for the now-removed `pageTitle` prop and `<title>` rendering |
| Issues | #10 |
| Criteria covered | AC10, AC12 |
| Quality | ✅ Clean test removal matching production code change |
| Test coverage | Self — test file |

### `src/lib/og-assets.test.ts` (+16 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Verify all OG image files exist on disk at the paths referenced by seo.ts |
| Issues | #10 |
| Criteria covered | AC8, AC8a |
| Quality | ✅ Uses `existsSync` for straightforward file presence check |
| Test coverage | Self — test file |

### `src/lib/seo.test.ts` (+101 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Comprehensive unit tests for SEO config: constants, PAGES structure, descriptions (length/keywords), JSON-LD types, OG image paths, title separators |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC4, AC5, AC8, AC8a, AC10, AC11, AC14 |
| Quality | ✅ Excellent coverage — tests every AC-relevant property of the config |
| Test coverage | Self — test file |

### `src/lib/seo.ts` (+79 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Centralised SEO config: BASE_URL, SITE_NAME, LAST_UPDATED, PAGES record with per-route title, description, ogImage, jsonLdType, changefreq, priority |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC4, AC5, AC8, AC8a, AC10, AC11, AC12, AC14 |
| Quality | ✅ Single source of truth; all descriptions verified 150–160 chars with target keywords |
| Test coverage | `src/lib/seo.test.ts` — 9 tests |

### `src/routes/+page.svelte` (+2 / -7 lines)

| Property | Detail |
|----------|--------|
| Purpose | Add `<SeoHead route="/" />`, remove inline `<title>` and `<meta description>` |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC3, AC5, AC12 |
| Quality | ✅ No issues |
| Test coverage | `src/routes/seo-integration.test.ts` — cross-cutting tests verify title, canonical, OG image, description |

### `src/routes/hr-zones/+page.svelte` (+2 / -7 lines)

| Property | Detail |
|----------|--------|
| Purpose | Add SeoHead, remove inline `<svelte:head>` SEO tags |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC3, AC4, AC10, AC12 |
| Quality | ✅ No issues |
| Test coverage | `seo-integration.test.ts` |

### `src/routes/pace/+page.svelte` (+3 / -11 lines)

| Property | Detail |
|----------|--------|
| Purpose | Add SeoHead, remove inline SEO tags and `pageTitle` prop |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC3, AC4, AC10, AC12 |
| Quality | ✅ No issues |
| Test coverage | `seo-integration.test.ts` |

### `src/routes/parkrun/+page.svelte` (+4 / -13 lines)

| Property | Detail |
|----------|--------|
| Purpose | Add SeoHead, remove inline SEO tags; fix em-dash separator |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC3, AC4, AC10, AC12 |
| Quality | ✅ No issues |
| Test coverage | `seo-integration.test.ts` |

### `src/routes/race-predictor/+page.svelte` (+3 / -12 lines)

| Property | Detail |
|----------|--------|
| Purpose | Add SeoHead, remove inline SEO tags and explicit `<title>` |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC3, AC4, AC10, AC12 |
| Quality | ✅ No issues |
| Test coverage | `seo-integration.test.ts` |

### `src/routes/robots.txt/+server.ts` (+11 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | robots.txt endpoint allowing all crawlers with sitemap reference |
| Issues | #10 |
| Criteria covered | AC7 |
| Quality | ✅ Clean, minimal endpoint |
| Test coverage | `src/routes/robots.txt/robots.test.ts` — 3 tests |

### `src/routes/robots.txt/robots.test.ts` (+23 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Tests for robots.txt content-type, user-agent, and sitemap reference |
| Issues | #10 |
| Criteria covered | AC7 |
| Quality | ✅ No issues |
| Test coverage | Self — test file |

### `src/routes/seo-integration.test.ts` (+61 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Cross-cutting tests rendering all 7 pages and asserting title, canonical, OG image, description, and pipe separator |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC10, AC12 |
| Quality | ✅ Excellent — uses `describe.each` for DRY parametric testing across all routes |
| Test coverage | Self — test file |

### `src/routes/sitemap.xml/+server.ts` (+18 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | sitemap.xml endpoint generating valid XML from PAGES config |
| Issues | #10 |
| Criteria covered | AC6 |
| Quality | ✅ Clean endpoint; reads from shared config so new pages auto-include |
| Test coverage | `src/routes/sitemap.xml/sitemap.test.ts` — 6 tests |

### `src/routes/sitemap.xml/sitemap.test.ts` (+51 / -0 lines)

| Property | Detail |
|----------|--------|
| Purpose | Tests for sitemap XML structure, content-type, all pages listed, lastmod, changefreq/priority |
| Issues | #10 |
| Criteria covered | AC6 |
| Quality | ✅ Thorough coverage |
| Test coverage | Self — test file |

### `src/routes/training-paces/+page.svelte` (+2 / -8 lines)

| Property | Detail |
|----------|--------|
| Purpose | Add SeoHead, remove inline SEO tags |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC3, AC4, AC10, AC12 |
| Quality | ✅ No issues |
| Test coverage | `seo-integration.test.ts` |

### `src/routes/vo2max/+page.svelte` (+3 / -12 lines)

| Property | Detail |
|----------|--------|
| Purpose | Add SeoHead, remove inline SEO tags and explicit `<title>` |
| Issues | #10 |
| Criteria covered | AC1, AC2, AC3, AC4, AC10, AC12 |
| Quality | ✅ No issues |
| Test coverage | `seo-integration.test.ts` |

### `static/apple-touch-icon.png` (binary)

| Property | Detail |
|----------|--------|
| Purpose | 180×180 apple-touch-icon PNG with refined favicon design |
| Issues | #10 |
| Criteria covered | AC9 |
| Quality | ✅ Correct dimensions (180×180 RGBA) |
| Test coverage | `app.html.test.ts` verifies reference; `og-assets.test.ts` not applicable |

### `static/favicon-32x32.png` (binary)

| Property | Detail |
|----------|--------|
| Purpose | 32×32 PNG favicon fallback |
| Issues | #10 |
| Criteria covered | AC9 |
| Quality | ✅ Correct dimensions (32×32 RGBA) |
| Test coverage | `app.html.test.ts` verifies reference |

### `static/favicon.svg` (+1 / -1 lines)

| Property | Detail |
|----------|--------|
| Purpose | Refined running-figure mark with Quadratic Bézier curves for smoother corners |
| Issues | #10 |
| Criteria covered | AC9 |
| Quality | ✅ Uses Q commands for smooth joins while preserving silhouette |
| Test coverage | `app.html.test.ts` verifies SVG favicon reference |

### `static/og/og-default.png` (binary, new)

| Property | Detail |
|----------|--------|
| Purpose | Shared default OG image (1200×630) |
| Issues | #10 |
| Criteria covered | AC8 |
| Quality | ✅ Correct dimensions |
| Test coverage | `og-assets.test.ts` verifies file exists |

### `static/og/og-hr-zones.png` (binary, new)

| Property | Detail |
|----------|--------|
| Purpose | Per-tool OG image for HR Zone Calculator |
| Issues | #10 |
| Criteria covered | AC8a |
| Quality | ✅ Correct dimensions (1200×630) |
| Test coverage | `og-assets.test.ts` |

### `static/og/og-pace.png` (binary, new)

| Property | Detail |
|----------|--------|
| Purpose | Per-tool OG image for Pace Calculator |
| Issues | #10 |
| Criteria covered | AC8a |
| Quality | ✅ Correct dimensions (1200×630) |
| Test coverage | `og-assets.test.ts` |

### `static/og/og-parkrun.png` (binary, new)

| Property | Detail |
|----------|--------|
| Purpose | Per-tool OG image for Parkrun Predictor |
| Issues | #10 |
| Criteria covered | AC8a |
| Quality | ✅ Correct dimensions (1200×630) |
| Test coverage | `og-assets.test.ts` |

### `static/og/og-race-predictor.png` (binary, new)

| Property | Detail |
|----------|--------|
| Purpose | Per-tool OG image for Race Time Predictor |
| Issues | #10 |
| Criteria covered | AC8a |
| Quality | ✅ Correct dimensions (1200×630) |
| Test coverage | `og-assets.test.ts` |

### `static/og/og-training-paces.png` (binary, new)

| Property | Detail |
|----------|--------|
| Purpose | Per-tool OG image for Training Pace Calculator |
| Issues | #10 |
| Criteria covered | AC8a |
| Quality | ✅ Correct dimensions (1200×630) |
| Test coverage | `og-assets.test.ts` |

### `static/og/og-vo2max.png` (binary, new)

| Property | Detail |
|----------|--------|
| Purpose | Per-tool OG image for VO2 Max Estimator |
| Issues | #10 |
| Criteria covered | AC8a |
| Quality | ✅ Correct dimensions (1200×630) |
| Test coverage | `og-assets.test.ts` |

---

## Acceptance Criteria Verification

### #10 — SEO: meta tags, sitemap, structured data, and Open Graph

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC1 | Every page has `<link rel="canonical">` with configurable `BASE_URL` | `SeoHead.svelte:50`, `seo.ts:1` | `SeoHead.test.ts:18-29`, `seo-integration.test.ts:32-36` | ✅ Met |
| AC2 | Every page has `og:title`, `og:description`, `og:url`, `og:type`, `og:image` | `SeoHead.svelte:52-56` | `SeoHead.test.ts:31-39`, `seo-integration.test.ts:39-43` | ✅ Met |
| AC3 | Every page has `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` | `SeoHead.svelte:59-62` | `SeoHead.test.ts:42-49` | ✅ Met |
| AC4 | Every tool page has `WebApplication` JSON-LD with name, description, url, applicationCategory | `SeoHead.svelte:33-39`, `seo.ts:31-77` (all tool routes have `jsonLdType: 'WebApplication'`) | `SeoHead.test.ts:51-59`, `seo.test.ts:72-76` | ✅ Met |
| AC5 | Home page has `WebSite` JSON-LD | `SeoHead.svelte:27-31`, `seo.ts:17` | `SeoHead.test.ts:62-68`, `seo.test.ts:78-80` | ✅ Met |
| AC6 | `GET /sitemap.xml` returns valid XML with `<loc>`, `<lastmod>`, `<changefreq>` for all 7 pages, Content-Type `application/xml` | `sitemap.xml/+server.ts:1-18` | `sitemap.test.ts:7-51` (6 tests) | ✅ Met |
| AC7 | `GET /robots.txt` returns `User-agent: *`, `Allow: /`, `Sitemap:` directive, Content-Type `text/plain` | `robots.txt/+server.ts:1-11` | `robots.test.ts:5-23` (3 tests) | ✅ Met |
| AC8 | Branded shared OG image (1200×630px PNG) in `static/`, referenced by default | `static/og/og-default.png` (verified 1200×630), `seo.ts:20` | `og-assets.test.ts:9-11`, `seo.test.ts:82-84` | ✅ Met |
| AC8a | Each tool page has unique 1200×630px OG image, shares brand palette, visually distinct | All 6 `static/og/og-*.png` verified 1200×630, `seo.ts:29-77` (unique paths) | `og-assets.test.ts:13-15`, `seo.test.ts:86-93` | ✅ Met |
| AC9 | Favicon updated to refined, professional version | `static/favicon.svg` uses Quadratic Bézier curves for rounded corners | `app.html.test.ts:9-11` | ✅ Met |
| AC10 | All titles use `{Tool} | Runwise` pipe separator; Parkrun fixed from em-dash | `seo.ts:26-77` (all use ` | Runwise`) | `seo.test.ts:95-99`, `seo-integration.test.ts:57-60` | ✅ Met |
| AC11 | All descriptions 150–160 chars with primary keywords | `seo.ts:18-73` (all verified 152–157 chars) | `seo.test.ts:48-69` | ✅ Met |
| AC12 | SEO tags injected via shared mechanism — adding a tool requires only passing props | `SeoHead.svelte` component, each page just adds `<SeoHead route="..." />` | `SeoHead.test.ts`, `seo-integration.test.ts` | ✅ Met |
| AC13 | All existing tests pass; new tests cover sitemap, robots, SeoHead, per-page image resolution | 532 tests passing (462 existing + 70 new) | Full test suite run | ✅ Met |
| AC14 | `og:site_name` set to "Runwise" on all pages | `SeoHead.svelte:57` | `SeoHead.test.ts:39` | ✅ Met |

**Summary:** 15/15 criteria met (AC1–AC14 including AC8a).

---

## Findings

### Critical (must fix before merge)

_None._

### Major (should fix)

_None._

### Minor (nice to fix)

_None._

### Suggestions (optional)

#### S1 — Consider adding `<lastmod>` update mechanism

- **Category:** Code Quality
- **Location:** `src/lib/seo.ts:4`
- **Description:** `LAST_UPDATED` is a hardcoded date string (`'2026-07-02'`). It will drift from reality as future PRs land without updating this constant. For now this is fine (the tools don't have blog-style freshness signals), but if the site grows, consider deriving it from build time or git commit date.
- **Recommendation:** No action needed now — note for future consideration.

---

## Positive Observations

- **Single source of truth:** `seo.ts` centralises all SEO metadata beautifully — titles, descriptions, OG images, JSON-LD types, sitemap config. Adding a new tool page requires one PAGES entry and one `<SeoHead route="..." />` line.
- **Thorough test coverage:** 70 new tests across 8 test files covering every AC from multiple angles — unit (seo.test.ts), component (SeoHead.test.ts), integration (seo-integration.test.ts), endpoint (sitemap.test.ts, robots.test.ts), and asset verification (og-assets.test.ts, app.html.test.ts).
- **Security-aware JSON-LD:** The `@html` usage in SeoHead.svelte escapes `<` characters (`\\u003c`) and sources all data from internal config — properly defended against injection with a clear eslint-disable comment explaining why.
- **Clean separation of concerns:** ToolLayout was properly trimmed to be purely presentational (removed `pageTitle`/`<title>` handling), with SEO concerns moved entirely to SeoHead.
- **Reproducible OG image pipeline:** `npm run og:generate` regenerates all 7 OG images + 2 favicon PNGs from HTML templates via Playwright — no external design tool dependency.
- **Professional visual quality:** The OG images are branded, visually distinct per tool, and correctly sized at 1200×630. The favicon uses proper Bézier curves for a polished appearance.

---

## Action Items

### Immediate Fixes (block merge)

_None — clean pass._

### Post-merge improvements

- [ ] S1: Consider automating `LAST_UPDATED` from build time — create issue via `/analyse` if the site adds content pages

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent
- [x] Logging adequate for debugging production issues
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
