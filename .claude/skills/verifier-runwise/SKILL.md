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
- `svelte-check` currently reports 42 pre-existing errors unrelated to any single PR
  (mostly `hr-zones.test.ts` null-narrowing and a `seo-integration.test.ts` component-type
  mismatch) — don't treat these as newly introduced unless a diff touches those files.
