# PR #111 Review — Site trust signals: About page, contact form, and editorial guides (#110)

**Date:** 2026-08-26
**Author:** alanwaddington
**Branch:** feature/110-site-trust-signals-about-contact-guides → main
**State:** Open

---

## Summary

| Item | Result |
|------|--------|
| Overall Assessment | Pass with comments ⚠️ |
| Risk Level | Low |
| Test Coverage | Adequate |
| Acceptance Criteria | 15 Met / 15 Total |
| Lint | 0 errors / 0 warnings (0 in diff, 0 pre-existing) |

Full unit suite (`npm run test`): 71 files, 1380 tests passing. Full e2e suite (`npm run test:e2e`): 71 tests passing (includes 9-route WCAG AA scan and the new contact-form flow). Both confirmed by direct execution during this review and during the prior `/verify 111` pass, not taken on trust from the PR description.

---

## Issues Reviewed

This project's workflow (per `CLAUDE.md`) keeps requirements/design in sections of a single issue rather than GitHub native sub-issues — confirmed no `parentIssue`/`subIssues` exist for #110 via the GraphQL API (schema doesn't expose those fields for this repo, and no other issue number appears in the PR body, branch name, or any commit message).

### Issue Hierarchy
- #110 — Site trust signals: About page, contact form, and editorial guides (AdSense re-review) — single issue containing `## Analysis` (15 acceptance criteria) and `## Design` (7-task work breakdown, each task's own ACs mapped back to the same AC-1..15 set)

---

## Changed Files Audit

### `src/lib/server/rateLimiter.ts` (+33 / -0)
| Property | Detail |
|----------|--------|
| Purpose | Per-key sliding-window rate limiter factory, used by the contact endpoint |
| Issues | #110 (AC-5) |
| Criteria covered | AC-5 |
| Quality | ✅ No issues — clean factory pattern, DI-friendly (`isAllowed(key, now)` takes time as a param instead of calling `Date.now()` internally, making it trivially testable) |
| Test coverage | `rateLimiter.test.ts` — 5 tests: under-limit, over-limit, window-expiry, per-key isolation, boundary-inclusive window |

### `src/lib/server/contactValidation.ts` (+53 / -0)
| Property | Detail |
|----------|--------|
| Purpose | Pure validation function for contact submissions incl. honeypot detection |
| Issues | #110 (AC-5) |
| Criteria covered | AC-5 |
| Quality | m1: email regex duplicated in `ContactForm.svelte` (see Minor findings) |
| Test coverage | `contactValidation.test.ts` — 9 tests covering valid/honeypot/missing-field/malformed-email/over-length/non-object-body/non-string-field paths |

### `src/lib/server/mailer.ts` (+30 / -0)
| Property | Detail |
|----------|--------|
| Purpose | Wraps the Resend SDK to send the contact-form notification email |
| Issues | #110 (AC-4) |
| Criteria covered | AC-4 |
| Quality | ⚠️ M1 — `new Resend(env.RESEND_API_KEY)` (line 11) executes outside the `try` block (line 13), so a missing/invalid key throws unhandled instead of returning the tested `{success: false}` path |
| Test coverage | `mailer.test.ts` — 6 tests, but none cover a missing/undefined `RESEND_API_KEY` (every test's `beforeEach` sets it) |

### `src/routes/api/contact/+server.ts` (+45 / -0)
| Property | Detail |
|----------|--------|
| Purpose | POST endpoint orchestrating validation → honeypot → rate limit → send |
| Issues | #110 (AC-3, AC-4, AC-5) |
| Criteria covered | AC-3, AC-4, AC-5 |
| Quality | ✅ Correct ordering (honeypot check before rate-limit consumption, confirmed by `honeypotFilled_doesNotConsumeRateLimit` test); errors logged via `console.error` before returning a generic message, per the project's error-handling convention |
| Test coverage | `contact.test.ts` — 8 tests, all branches (valid/honeypot/invalid/malformed-JSON/rate-limited/keyed-by-IP/mailer-failure) |

### `src/lib/components/ContactForm.svelte` (+190 / -0)
| Property | Detail |
|----------|--------|
| Purpose | Contact form UI: fields, honeypot, client validation, loading/success/error states |
| Issues | #110 (AC-3, AC-5, AC-10) |
| Criteria covered | AC-3, AC-5, AC-10 |
| Quality | m1 (duplicated email regex), m2 (no `maxlength` on the message textarea) — both Minor. Honeypot hiding (`aria-hidden` + `tabindex="-1"` + off-screen `clip`) verified correct live in a real browser during `/verify` — it's genuinely removed from the tab order, not just visually hidden |
| Test coverage | `ContactForm.test.ts` — 10 tests: fields/labels, no-email-in-DOM, honeypot hidden, empty-submit validation, invalid-email validation, POST body shape, success state, error state + retained values, network failure, loading/disabled state |

### `src/lib/components/GuideArticle.svelte` (+44 / -0)
| Property | Detail |
|----------|--------|
| Purpose | Shared rendering component for a guide article's title/intro/sources/sections |
| Issues | #110 (AC-8, AC-14) |
| Criteria covered | AC-8, AC-14 |
| Quality | ✅ No issues — the "Sourced from" callout's WCAG AA contrast bug (caught in Task 7) is fixed here with `text-ink`/`font-semibold` instead of `text-muted` |
| Test coverage | `GuideArticle.test.ts` — 5 tests: H1, intro, sources-credited rendering, H2 sections, guides-index links |

### `src/routes/about/+page.svelte` (+83 / -0)
| Property | Detail |
|----------|--------|
| Purpose | `/about` page: identity content, methodology summary, embedded contact form |
| Issues | #110 (AC-1, AC-2, AC-3) |
| Criteria covered | AC-1, AC-2, AC-3 |
| Quality | ✅ No issues — matches the `/privacy` bare-content-page pattern rather than introducing a new layout, as the design specified |
| Test coverage | `about.test.ts` — 6 tests: renders, no-individual-named, four-methodologies-referenced, links-to-guides, no-email-in-DOM, contact-form-present |

### `src/routes/guides/+page.svelte` (+32 / -0)
| Property | Detail |
|----------|--------|
| Purpose | `/guides` index, listing all `GUIDES` entries |
| Issues | #110 (AC-13) |
| Criteria covered | AC-13 |
| Quality | ✅ No issues — sourced from `GUIDES` data, not hardcoded, so it can't silently drift |
| Test coverage | `guides-index.test.ts` — 3 tests: link count matches data length, title/excerpt render, hrefs match |

### `src/routes/guides/{understanding-vdot,hr-zones-vs-power-zones,how-race-predictions-work,reading-your-vo2max}/+page.svelte` (+13 each / -0)
| Property | Detail |
|----------|--------|
| Purpose | 4 thin route wrappers, each rendering its own `GuideArticle` |
| Issues | #110 (AC-7) |
| Criteria covered | AC-7 |
| Quality | ✅ No issues — identical, minimal pattern across all 4 |
| Test coverage | `guides-routes.test.ts` — parametrised over `GUIDES`, one assertion per route |

### `src/lib/content/guides.ts` (+168 / -0)
| Property | Detail |
|----------|--------|
| Purpose | The 4 guides' typed content, mirroring `explainers.ts`'s shape |
| Issues | #110 (AC-7, AC-8, AC-14) |
| Criteria covered | AC-7, AC-8, AC-14 |
| Quality | ✅ Content read in full — original prose, distinct from and building on `explainers.ts` rather than copying it (e.g. the VDOT guide's "Jimmy Gilbert co-author" detail, Riegel guide's "VDOT vs Riegel disagreement direction" detail — neither appears in the existing tool explainers) |
| Test coverage | `guides.test.ts` — 7 tests: exact count, unique slugs, route-matches-slug, word-count floor, shape validity, ≥1 credited source, ≥1 guide names its methodology in body text |

### `src/lib/seo.ts` (+34 / -1)
| Property | Detail |
|----------|--------|
| Purpose | Registers `/about`, `/guides`, and the 4 guide routes in the `PAGES` SEO/sitemap registry |
| Issues | #110 (AC-9) |
| Criteria covered | AC-9 |
| Quality | ✅ No issues — guide entries generated from `GUIDES` via `Object.fromEntries`, so a 5th guide would automatically get an SEO entry with no risk of a forgotten manual addition |
| Test coverage | `seo.test.ts` (updated), `sitemap.test.ts` (unmodified, generically covers new routes via `Object.keys(PAGES)`) |

### `src/routes/privacy/+page.svelte` (+19 / -3)
| Property | Detail |
|----------|--------|
| Purpose | Removes the non-functional `mailto:` link; adds a Contact-form-processing section and repoints Contact to `/about#contact` |
| Issues | #110 (AC-6, AC-11, AC-15) |
| Criteria covered | AC-6, AC-11, AC-15 |
| Quality | ✅ No issues |
| Test coverage | `privacy.test.ts` — 3 tests: no email/mailto, links to `/about#contact`, mentions Resend processing |

### `src/lib/components/SiteFooter.svelte` (+15 / -1) and `src/routes/+page.svelte` (+12 / -0)
| Property | Detail |
|----------|--------|
| Purpose | Site-wide About/Guides footer links; homepage About link |
| Issues | #110 (AC-1) |
| Criteria covered | AC-1 |
| Quality | ✅ No issues — confirmed live during `/verify` that the footer links render correctly on an unrelated tool page (`/pace`) |
| Test coverage | `SiteFooter.test.ts` (2 new tests), `home-page.test.ts` (1 new test) |

### `src/routes/home-page.test.ts`, `src/lib/seo.test.ts`, `src/lib/affiliates.test.ts` (test-only diffs)
| Property | Detail |
|----------|--------|
| Purpose | Fix 3 pre-existing `PAGES`-derived route filters that would otherwise misclassify `/about`/`/guides`/guide routes as tool pages (requiring "Go to X" cards, tool-page SEO conventions, and affiliate links they were never meant to have) |
| Issues | #110 (regression prevention, not a new AC) |
| Criteria covered | — (protects AC-9/AC-1 test integrity) |
| Quality | ✅ Correctly identified and fixed rather than working around; comments updated to explain the exclusion |
| Test coverage | Self-covering (these are the tests) |

### `scripts/generate-og-images.js` (+40 / -2), `scripts/og-template.html` (+6 / -2)
| Property | Detail |
|----------|--------|
| Purpose | Generate 6 new branded OG images; add optional `eyebrow`/`tagline` query-param overrides so non-calculator pages don't say "Free Running Calculator" |
| Issues | #110 (AC-9) |
| Criteria covered | AC-9 |
| Quality | ✅ No issues — backwards compatible (falls back to the original copy when the new params are absent), confirmed the 9 pre-existing tool OG images are byte-unchanged in the diff (only the 6 new files appear) |
| Test coverage | `og-assets.test.ts` (unmodified, generically covers new `PAGES` entries) |

### `.env.example` (+12 / -0), `.gitignore` (+1 / -0), `package.json`/`package-lock.json` (+`resend` dependency)
| Property | Detail |
|----------|--------|
| Purpose | Document new server-only env vars; ignore `.env*.local` (added by the Vercel CLI during provisioning); add the `resend` runtime dependency |
| Issues | #110 (AC-4) |
| Criteria covered | AC-4 |
| Quality | ✅ No issues — secrets correctly documented as server-only (no `PUBLIC_`/`VITE_` prefix), no actual secret values committed |
| Test coverage | N/A (config) |

### `e2e/contact-form.test.ts` (+63 / -0), `e2e/workouts-accessibility.test.ts` (+14 / -1)
| Property | Detail |
|----------|--------|
| Purpose | Real-browser coverage of the contact form's happy/error/validation paths; extends the WCAG AA scan to the 6 new routes |
| Issues | #110 (AC-3, AC-4, AC-5, AC-10) |
| Criteria covered | AC-3, AC-4, AC-5, AC-10 |
| Quality | m3 — network is intercepted via `page.route`, so the real `+server.ts` → `mailer.ts` → Resend call is never exercised end-to-end by CI (see Minor findings) |
| Test coverage | Self-covering; confirmed passing live (18/18 and 71/71 respectively) during `/verify` |

### `static/og/*.png` (6 new files)
| Property | Detail |
|----------|--------|
| Purpose | Generated OG images for the 6 new routes |
| Issues | #110 (AC-9) |
| Criteria covered | AC-9 |
| Quality | ✅ No issues — binary, generated output; existence and size-budget verified by `og-assets.test.ts` |
| Test coverage | `og-assets.test.ts` (unmodified) |

---

## Acceptance Criteria Verification

### #110 — Site trust signals: About page, contact form, and editorial guides

| # | Criterion | Implementation | Test | Verdict |
|---|-----------|----------------|------|---------|
| AC-1 | `/about` reachable from footer (every page) + homepage, no individual named | `about/+page.svelte`; `SiteFooter.svelte:55-60`; `+page.svelte:88-98` | `about.test.ts:16-24`, `SiteFooter.test.ts:59-64`, `home-page.test.ts:71-77` | ✅ Met |
| AC-2 | `/about` references sourced methodologies (Riegel, VDOT, ACSM, WMA) | `about/+page.svelte:40-63` | `about.test.ts:26-35` | ✅ Met |
| AC-3 | `/about` includes contact form; no email in DOM | `about/+page.svelte:72-81`, `ContactForm.svelte` | `about.test.ts:45-52`, `ContactForm.test.ts:39-45` | ✅ Met |
| AC-4 | Submissions delivered server-side to a real, env-configured address | `mailer.ts:11,16`; `.env.example:28-30` | `mailer.test.ts:32-43` | ✅ Met (see M1 — real config-failure path untested/unguarded) |
| AC-5 | Basic spam/abuse mitigation (honeypot and/or rate limiting) | `contactValidation.ts:26-28`, `rateLimiter.ts`, `+server.ts:33-35` | `contactValidation.test.ts`, `rateLimiter.test.ts`, `contact.test.ts:77-110` | ✅ Met |
| AC-6 | `/privacy` Contact no longer shows `mailto:`, routes through `/about` form | `privacy/+page.svelte:111-135` | `privacy.test.ts:10-25` | ✅ Met |
| AC-7 | Exactly 4 guide articles, own routes, linked from index/footer/homepage | `guides.ts` (4 entries), 4 route dirs, `SiteFooter.svelte`, `guides/+page.svelte` | `guides.test.ts:12-14`, `guides-routes.test.ts`, `guides-index.test.ts` | ✅ Met |
| AC-8 | Guides original, long-form, meaningfully expand on (not duplicate) explainers, minimum length | `guides.ts` (read in full; original content distinct from `explainers.ts`) | `guides.test.ts:27-31` (≥900 words) | ✅ Met |
| AC-9 | `/about`, Guides index, 4 guide routes in sitemap.xml + standard SEO metadata | `seo.ts:107-137` | `sitemap.test.ts` (generic), `seo.test.ts` | ✅ Met |
| AC-10 | `/about`, Guides index, 4 guide routes pass WCAG AA axe scan | (styling, GuideArticle/ContactForm contrast fixes) | `e2e/workouts-accessibility.test.ts:77-94` — confirmed passing live (18/18) | ✅ Met |
| AC-11 | Privacy Policy updated for new contact-form processing | `privacy/+page.svelte:111-123` | `privacy.test.ts:27-32` | ✅ Met |
| AC-12 | Full `npm run test` + `npm run test:e2e` pass | — | Confirmed directly: 1380/1380 unit, 71/71 e2e | ✅ Met |
| AC-13 | Dedicated Guides index linking to all 4 articles | `guides/+page.svelte` | `guides-index.test.ts` | ✅ Met |
| AC-14 | ≥1 guide explicitly credits its methodology | `guides.ts` content + `GuideArticle.svelte:22-26` | `guides.test.ts:47-54` | ✅ Met |
| AC-15 | No page (incl. `/privacy`) renders a visible email address | `privacy/+page.svelte`, `about/+page.svelte`, `ContactForm.svelte` | `privacy.test.ts:10-17`, `about.test.ts:45-52`, `ContactForm.test.ts:39-45`, `e2e/contact-form.test.ts:58-62` | ✅ Met |

**Summary:** 15/15 criteria met.

---

## Findings

### Critical (must fix before merge)

None.

### Major (should fix)

#### M1 — Resend client construction is not exception-safe against a missing/invalid API key
- **Category:** Reliability
- **Location:** `src/lib/server/mailer.ts:11`
- **Description:** `const resend = new Resend(env.RESEND_API_KEY);` executes *before* the `try` block starts (line 13). Reading the Resend SDK source (`node_modules/resend/dist/index.cjs:1259-1261`) confirms its constructor throws synchronously — `"Missing API key. Pass it to the constructor..."` — whenever the key argument and `process.env.RESEND_API_KEY` are both falsy. Because `sendContactEmail` is an `async function`, that synchronous throw becomes a rejected promise; the caller, `src/routes/api/contact/+server.ts:37`, does `const sendResult = await sendContactEmail(result.data);` with no surrounding `try/catch`. If `RESEND_API_KEY` is ever empty (a misconfigured preview deploy, an env var accidentally cleared, a future refactor of the Vercel integration), a contact-form submission would produce an unhandled exception and SvelteKit's generic 500 error page — not the deliberately-designed, tested `{error: 'Failed to send message...'}` 502 response this endpoint otherwise handles well. `mailer.test.ts`'s `beforeEach` always sets `RESEND_API_KEY`, so this path has zero test coverage.
- **Recommendation:** Move the `new Resend(...)` call inside the `try` block (or guard with an explicit `if (!env.RESEND_API_KEY) return { success: false, error: 'Email service not configured' };` before constructing the client), and add a test that unsets `RESEND_API_KEY` and asserts a graceful `{success: false}` result.

### Minor (nice to fix)

#### m1 — Email-format regex duplicated between client and server
- **Category:** Code Quality
- **Location:** `src/lib/server/contactValidation.ts:1`, `src/lib/components/ContactForm.svelte:4`
- **Description:** `const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;` is defined identically in both files. If the pattern is ever tightened or loosened, it's easy to update one and forget the other, producing client/server validation disagreement.
- **Recommendation:** Extract to a small shared module (e.g. `src/lib/validation/email.ts`) imported by both.

#### m2 — Contact-form message textarea has no client-side length cap
- **Category:** Code Quality
- **Location:** `src/lib/components/ContactForm.svelte:164-174`
- **Description:** The server enforces a 5000-character maximum (`contactValidation.ts:2,44-46`), but the `<textarea>` has no `maxlength` attribute and the component's client-side validation doesn't check length. A user who writes a very long message gets no feedback until they submit and receive the server's "Message is too long" error.
- **Recommendation:** Add `maxlength={5000}` to the textarea, optionally with a character counter.

#### m3 — No automated test exercises the real `/api/contact` → Resend integration end-to-end
- **Category:** Test Coverage
- **Location:** `src/routes/api/contact/contact.test.ts`, `e2e/contact-form.test.ts`
- **Description:** Vitest mocks `$lib/server/mailer` entirely; the e2e suite intercepts `**/api/contact` via `page.route` before it ever reaches the server. This is a reasonable, standard choice (avoiding real third-party API calls in CI), but it means the actual live wiring — the real endpoint calling the real `mailer.ts` calling the real Resend API — has only ever been exercised manually (during this PR's `/verify` pass, deliberately without an unmocked send to avoid spamming the configured inbox).
- **Recommendation:** No change required; noting for awareness. If this integration ever needs stronger confidence, a manual/staging smoke-test checklist item (rather than a CI test) would be the appropriate next step.

### Suggestions (optional)

#### S1 — Per-instance rate limiting is a known, already-documented limitation
- **Category:** Scalability
- **Location:** `src/lib/server/rateLimiter.ts:11-13`
- **Description:** The in-memory `Map`-based limiter is scoped to a single Vercel Fluid Compute instance, not global across concurrent instances — already called out in a code comment and in the issue's `## Design` section. Not a new finding; flagging only so it's visible in this report as an accepted trade-off rather than an oversight.

---

## Positive Observations

- Strict TDD is evident throughout: every new server module (`rateLimiter`, `contactValidation`, `mailer`) ships with an isolated, dependency-injection-friendly unit test file — mocking is done via factory functions and `vi.hoisted`, matching the codebase's existing test conventions exactly.
- The honeypot is correctly removed from *both* the accessibility tree and the tab order (`aria-hidden="true"` + `tabindex="-1"`, not just CSS) — verified live in a real browser (not just asserted in jsdom) during `/verify`, confirming keyboard/screen-reader users never encounter it while a naive scripted bot still fills it.
- `guides.test.ts` enforces exact article count, unique slugs, a minimum word-count floor, and that at least one guide names its methodology in body text — strong guardrails against silent content regression as this content evolves.
- The `PAGES`-driven test-derivation convention already established in this codebase (`home-page.test.ts`, `seo.test.ts`, `affiliates.test.ts` all deriving route lists from `Object.keys(PAGES)`) was correctly *fixed* rather than *worked around* — the PR identified that adding `/about`/`/guides` to `PAGES` would silently misclassify them as tool pages in three existing tests, and updated the filters with a clear comment rather than skipping or loosening the assertions.
- Two real WCAG AA contrast failures (`GuideArticle`'s "Sourced from" callout, `ContactForm`'s submit button) were caught by the new accessibility-scan coverage in Task 7 and fixed within the same PR, not deferred.
- The Privacy Policy update goes beyond the minimum ask — it doesn't just remove the broken `mailto:` link, it adds a new section actually explaining the contact form's data flow through Resend.
- OG image generation is backwards-compatible: the template's new `eyebrow`/`tagline` query params are optional and fall back to the original calculator-page copy, so none of the 9 pre-existing OG images changed.

---

## Action Items

### Immediate Fixes (block merge)

None — no Critical findings.

### Post-merge improvements
- [ ] M1: Guard `mailer.ts`'s `new Resend(...)` construction against a missing/invalid API key so a misconfiguration degrades gracefully instead of crashing the endpoint
- [ ] m1: Extract the duplicated email-validation regex into a shared module
- [ ] m2: Add a `maxlength` to the contact form's message textarea

---

## Checklist

- [x] All acceptance criteria from the full issue hierarchy verified by reading actual code
- [x] Every changed file read and audited
- [x] Tests cover happy path, error paths, and edge cases
- [x] Lint run — zero errors introduced by this PR
- [x] No security vulnerabilities introduced
- [x] No performance regressions
- [x] Error handling complete and consistent (one gap noted: M1)
- [x] Logging adequate for debugging production issues
- [x] Code follows existing codebase conventions
- [x] No unnecessary changes outside scope of the issue
