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

This repo has a `vercel.json` (security headers, a www→apex redirect, and a `/og/*`
cache-control rule — `/_app/immutable/*` caching is handled automatically by
`@sveltejs/adapter-vercel` itself, not `vercel.json`) but no CSP header. The app is a
standard SvelteKit site with `@sveltejs/adapter-vercel`. Two ways to run it, a third way
(`vercel dev`) specifically for verifying `vercel.json` behavior, and a Playwright recipe
for anything a Vitest/jsdom component test can't see.

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

**The background launch itself can fail silently on the first attempt** — a `run_in_background`
dev-server call has failed outright (task status `failed`, exit code 144, zero captured
output, no process left running) on this exact command with no changes in between,
inconsistently: sometimes a bare retry of the identical command fixes it, other times it
needs `dangerouslyDisableSandbox: true` (normally only required for `vite preview`, per
below) to start at all. If `ps aux | grep vite` shows nothing after a `failed` status
(not just a slow-starting `000`), don't assume something's broken — retry the same
command, and reach for `dangerouslyDisableSandbox: true` if a bare retry also fails.

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

### Verifying `vercel.json` changes locally (headers, redirects) — no deploy needed

`vercel.json`'s `headers`/`redirects` are merged by Vercel's own build system, not by
`npm run build` (plain `vite build` via the adapter) — a local `npm run build` will never
show them in `.vercel/output/config.json`. Two ways to check a `vercel.json` change
without creating a real deployment, both already authenticated in this environment
(`vercel whoami` → `alanwaddington`, project already linked):

**1. `vercel build` + inspect the merged config (preferred for confirming exact header values)**

```bash
vercel pull --yes --environment preview   # once per session; read-only, no deploy
rm -rf .vercel/output
vercel build
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('.vercel/output/config.json')).routes, null, 2))"
```

This is a fully local build (no network push) that produces the exact routing table
Vercel's edge will use — the real merged `headers`/`redirects` rules appear as `routes`
entries here, e.g. a `{"source": "/og/(.*)", "headers": [...]}"` rule in `vercel.json`
becomes `{"src": "^/og(?:/(.*))$", "headers": {"Cache-Control": "..."}}"` in the output.
Grep/inspect this JSON directly rather than assuming the rule "must be right" from reading
`vercel.json` alone — confirmed during the PR #80 review that this catches real
merge-time regex/shape differences from what you wrote.

**2. `vercel dev` (for confirming routing/other-headers wiring, NOT for exact Cache-Control values)**

```bash
vercel dev --listen 3002 < /dev/null 2>&1   # needs dangerouslyDisableSandbox: true, same as preview
```

Needs `dangerouslyDisableSandbox: true` on the Bash call (same requirement as `vite
preview` above) — without it the process is killed immediately with no output at all
(exit 144, nothing captured), which looks like a crash but is actually the sandbox
blocking it. Poll `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002/` — it's
typically ready on the first check.

**Important caveat, confirmed during PR #80's verification**: `vercel dev` always serves
`Cache-Control: no-cache` on every response, on every path, regardless of what
`vercel.json` actually configures — this is intentional Vercel dev-server behavior (it
forces no-cache so local iteration never shows stale content), not a bug in your rule.
Use `vercel dev` to confirm a route is reachable and that *other* headers (security
headers, etc.) are wired correctly; use method 1 (`vercel build` + config.json) to confirm
the actual configured `Cache-Control` value that will ship to production.

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

- `vercel dev`'s dev-command auto-detection was broken until 2026-07-14 (PR #80 review):
  it ran `svelte-kit dev --port $PORT`, a SvelteKit 1-era command (`svelte-kit` only has a
  `sync` subcommand now) that crashes instantly on this SvelteKit 2 + Svelte 5 project.
  Root cause: the Vercel dashboard's project Framework Preset is cached locally as
  `sveltekit-1` (`.vercel/project.json` → `"framework": "sveltekit-1"`) even though
  `vercel.json`'s own `"framework": "sveltekit"` is correct and `npm run build`/`vercel
  build` were never affected (they use `buildCommand`, explicitly set to `npm run build`).
  Only the *dev* command guess was wrong. Fixed by adding an explicit `"devCommand": "npm
  run dev -- --port $PORT"` to `vercel.json` — this overrides the guess regardless of the
  stale dashboard preset, no dashboard access needed. If `vercel dev` ever breaks again
  with a similarly nonsensical command, check `.vercel/project.json`'s cached `framework`
  value before assuming the repo is broken.
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
