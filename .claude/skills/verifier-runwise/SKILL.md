---
name: verifier-runwise
description: >
  Launch and browser-verify Runwise (SvelteKit + Tailwind v4 + adapter-vercel) in this
  sandboxed WSL environment, including real Chromium-driven checks of client-side/SSR
  behavior (theme, hydration, FOUC) that jsdom-based Vitest tests cannot observe. Use for
  /run, /verify, and any UI change where visibility depends on compiled CSS or SSR-then-
  hydrate timing.
---

# Runwise — run & verify

This repo has no `vercel.json` and no CSP; the app is a standard SvelteKit site with
`@sveltejs/adapter-vercel`. Two ways to run it, and a Playwright recipe for anything a
Vitest/jsdom component test can't see.

## Launching

### Dev server (fastest, for manual poking / a running URL to hand to the user)

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Run this with `run_in_background: true`. **The startup banner ("Local: …") is frequently
not flushed to the captured log in this environment** — don't wait for it. Instead poll
with curl and/or check the port directly:

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:5173/
ss -tlnp | grep 5173
```

Typically up within 5-10s. If curl still returns `000` after ~15s, check
`ps aux | grep vite` — the process is usually alive and will bind shortly; this
environment's process/network setup is just slow to report readiness, not broken.

### Production build + preview (needed for real SSR + hydration — e.g. anything touching
`app.html`'s pre-paint script, or component state that behaves differently pre-hydration)

```bash
rm -rf .svelte-kit   # stale builds have caused test-runner worker timeouts here before
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

**The preview server (`vite preview`, which serves the real `@sveltejs/adapter-vercel`
output) needs `dangerouslyDisableSandbox: true` on the Bash call** to bind the port in
this environment — the plain dev server usually doesn't need it, but preview reliably
does. It can take 10-15s to actually accept connections even after the process starts;
poll with a short retry loop rather than a single curl:

```bash
for i in $(seq 1 15); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4173/ 2>/dev/null)
  [ "$code" = "200" ] && echo "up after ${i}s" && break
  sleep 1
done
```

Kill any stray server before rebuilding (`pkill -f "vite preview"` / `pkill -f "vite dev"`)
— leftover processes from a previous turn will hold the port and silently serve stale code.

### Running full test suite + build concurrently

Don't. Running `vitest`, `svelte-check`, and `vite build` at the same time in this
environment has caused `[vitest-pool]: Timeout waiting for worker to respond` and other
resource-contention failures. Run them sequentially, or accept that a concurrent run may
need a clean re-run to trust the result.

## Browser verification with Playwright

Chromium is already installed at `~/.cache/ms-playwright` (installed once via
`npx playwright install chromium` — the `--with-deps` variant fails here, it needs sudo
this environment doesn't have; the browser-only install works fine without it).

Playwright is a devDependency of the project, but a script run from outside the repo root
(e.g. from a scratchpad dir) won't resolve it via plain `node script.js` — module
resolution follows the *script's* location, not `cwd`. Fix with `NODE_PATH`:

```bash
NODE_PATH=/mnt/c/Users/alan/Development/runwise/node_modules node /path/to/script.js
```

### Why jsdom/Vitest can't verify some things

- Vitest component tests use `@testing-library/svelte`'s `render()`, which calls Svelte's
  `mount()` (fresh client-side mount into an empty container) — **never** `hydrate()`
  (reconciling against pre-existing SSR'd markup). Any bug that only exists in the gap
  between "browser paints raw SSR HTML" and "client JS finishes hydrating" is invisible to
  jsdom tests, no matter how the component is written.
- jsdom does not load the project's compiled Tailwind CSS into the test document, so
  `getComputedStyle` can't see `display: none` from a class like `hidden` or a custom
  variant like `dark:inline-flex`. Elements hidden purely via CSS classes are NOT excluded
  from `getByRole` queries in this test setup — write jsdom tests against DOM
  state/localStorage instead of "is this element found by role", and verify actual
  CSS-driven visibility live instead.

### Recipe: OS-preference + stored-preference matrix, checked for flash

Use `page.emulateMedia`/`newContext({ colorScheme })` for OS preference,
`page.addInitScript` to seed `localStorage` before any page script runs, and
`requestAnimationFrame` polling (not a single post-load check) to catch anything that's
correct-on-settle but wrong-on-first-paint:

```js
const { chromium } = require('playwright');

async function probe(colorScheme, storedTheme) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme }); // 'dark' | 'light'
  const page = await context.newPage();
  if (storedTheme) {
    await page.addInitScript((t) => localStorage.setItem('theme', t), storedTheme);
  }
  await page.addInitScript(() => {
    window.__frames = [];
    let count = 0;
    function tick() {
      const buttons = Array.from(document.querySelectorAll('nav button[aria-label^="Switch to"]'));
      const visible = buttons.filter((b) => getComputedStyle(b).display !== 'none');
      window.__frames.push({ t: performance.now(), visibleLabels: visible.map((b) => b.getAttribute('aria-label')) });
      count++;
      if (count < 40) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  await page.waitForTimeout(800); // let all RAF ticks land
  const frames = await page.evaluate(() => window.__frames);
  const distinct = new Set(frames.map((f) => JSON.stringify(f.visibleLabels)));
  console.log(`flash=${distinct.size > 1}`, frames[0]);
  await browser.close();
}
```

Always test the **conflicting** case too (stored preference opposite of OS preference) —
that's what actually proves a pre-paint script or CSS variant wins the race, rather than
merely agreeing with a preference that would've rendered correctly anyway.

### Recipe: interacting with a page right after `page.goto`

`waitUntil: 'load'` is not enough before dispatching `selectOption`/`fill`/etc. — the DOM
can accept the interaction (e.g. a native `<select>`'s value genuinely changes) before
Svelte's hydration has attached the `onchange`/`oninput` handler that drives app state, so
the interaction silently no-ops (the select shows the new value, but nothing downstream
reacts). This burned a full debug cycle during PR #72 review, where a Playwright script
using `waitUntil: 'load'` + 100ms wait made `selectOption('Custom')` appear to do nothing
on every page tested — the fix was `waitUntil: 'networkidle'` plus an explicit
`page.waitForTimeout(300-500)` before the first interaction:

```js
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500); // let hydration finish attaching event handlers
await page.locator('#distance-select').selectOption('Custom'); // now actually works
```

If a script's assertions are all "collapsed" values even after an interaction that should
expand something, suspect hydration timing before suspecting the component.

### Recipe: dismissing the cookie-consent banner

`CookieBanner.svelte` renders a `role="dialog"` fixed to the viewport bottom
(`consentBannerVisible` store) until a choice is made. It doesn't block most interactions
on a normal-height viewport (the existing `e2e/pace.test.ts`/`theme-hover.test.ts` suite
doesn't dismiss it and passes), but it **does** overlap page content on short viewports
(e.g. Playwright's default single-page screenshot at ~500-700px tall) and it sits in the
tab order, so keyboard-navigation tests should neutralize it. Two options:

```js
// Option A — click through it (use when you need to see it render correctly too)
const btn = page.getByRole('button', { name: /necessary only/i });
if (await btn.count()) await btn.click();

// Option B — seed consent before the app boots, skipping the banner entirely
// (preferred for tests that don't care about the banner itself)
await page.addInitScript(() =>
  localStorage.setItem('cookie-consent', JSON.stringify({ categories: ['necessary'], timestamp: 0 }))
);
```

### Recipe: general screenshot/interaction check

```js
const { chromium } = require('playwright');
const browser = await chromium.launch();
const context = await browser.newContext({ colorScheme: 'dark' }); // or 'light'
const page = await context.newPage();
await page.goto('http://127.0.0.1:5173/');
await page.locator('nav button[aria-label^="Switch to"]:visible').click();
await page.screenshot({ path: '/tmp/.../shot.png' });
```

Screenshots always go under the session scratchpad directory, not `/tmp` directly.

## Gotchas specific to this repo

- No `.claude/skills` existed for this before 2026-07-03 (PR #32 review) — this file is
  the first. If it's stale (build commands changed, Playwright version bumped, port
  conventions changed), fix it here rather than rediscovering the recipe from scratch.
- `svelte-check` reports 0 errors on `main` as of PRs #33-#35 (2026-07-03), which fixed
  the 42 pre-existing errors that used to live in `hr-zones.test.ts` (null-narrowing) and
  `seo-integration.test.ts` (a `describe.each` component-type-union inference failure).
  Any error `svelte-check` reports now is newly introduced — don't assume it's baseline
  noise.
- Rendering a component that reads `$env/dynamic/public` (e.g. `SeoHead.svelte`) via
  `@testing-library/svelte`'s `render()` throws `TypeError: Cannot read properties of
  undefined (reading 'env')` unless mocked — that module's real implementation needs a
  live SvelteKit request context that doesn't exist outside actual request handling.
  `vitest-setup.ts` already stubs it globally (`vi.mock('$env/dynamic/public', () => ({
  env: {} }))`, same pattern as the `window.matchMedia` stub) — a test file that needs to
  control a specific value should override this mock locally (see `SeoHead.test.ts`).
- `vite.config.ts`'s `resolve.conditions` is scoped to `process.env.VITEST` only (fixed in
  PR #72 review) — it used to apply globally, which stripped Vite's automatic
  `development`/`production` resolve conditions from the dev server and build. That broke
  `$app/environment`'s `dev` export (sourced from `esm-env`'s condition-keyed package
  exports) app-wide, which silently forced `injectAnalytics()` in `+layout.ts` into
  `mode: 'production'` even in local dev — visible as a console 404 for
  `/_vercel/insights/script.js` on every page load. If `$app/environment`'s `dev` or any
  other condition-exported package behaves oddly again, check `window.vam` in the browser
  console (`window.vam === 'development'` in dev, `'production'` in a real build) before
  assuming the app code is wrong — it may be a resolve-condition regression.
- `playwright.config.ts`'s `webServer` runs `npm run build && npm run preview`, and the
  build alone takes ~50-55s in this environment — close enough to Playwright's default
  60s `webServer` timeout that `npx playwright test` can fail with
  `Error: Timed out waiting 60000ms from config.webServer` even though nothing is broken.
  `reuseExistingServer: !process.env.CI` means a server already listening on port 4173
  will be reused instead of relaunched — so build once, start `npm run preview -- --port
  4173` in the background yourself, wait for it to accept connections, then run
  `npx playwright test`. Needs `dangerouslyDisableSandbox: true` on the preview command,
  same as the manual preview recipe above.
