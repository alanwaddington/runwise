# Implementation Plan: Favicon / App Icon Redesign

**Spec:** docs/superpowers/specs/2026-07-08-favicon-redesign-design.md
**Date:** 2026-07-08
**Status:** Ready

---

## Overview

Replaces Runwise's old abstract running glyph with a new "diagonal pulse" mark (a 4-segment zigzag reading as both effort/rhythm and forward motion) in a rounded-square container. The mark and container are already fully specified in the approved spec — this plan is purely mechanical: swap the SVG in the favicon source file and its three downstream copies (the favicon PNG-render template, the OG/Twitter-card template, and a new template needed for the apple-touch-icon's different corner-rounding requirement), update the generator script to route each output to the right template, then actually run the generator and commit the resulting PNGs.

---

## Steps

### Step 1: Replace the favicon source SVG

**What:** Replace the entire contents of the current favicon SVG with the new mark in its rounded-square container.
**File:** `static/favicon.svg` (modify — full replace)
**Change:**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
	<rect width="32" height="32" rx="9" fill="#1B8A5A" />
	<path
		d="M6 22 L11.5 22 L15 8.5 L18 15.5 L26 9"
		stroke="#FAFAF8"
		stroke-width="3.2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
```

**Verify:** `cat static/favicon.svg` shows exactly the content above. `npm run check` (svelte-check) still passes — this file isn't type-checked but confirms nothing else broke incidentally.
**Depends on:** none

---

### Step 2: Mirror the new SVG into the favicon render template

**What:** The Playwright screenshot pipeline renders `favicon-32x32.png` from this template's inline `<svg>`, not from `static/favicon.svg` directly — the two must be kept in sync manually (this is a pre-existing constraint, not new). Replace the `<svg>...</svg>` block inside the `<body>` with the same markup as Step 1.
**File:** `scripts/favicon-template.html` (modify)
**Change:** Replace:

```html
	<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="16" cy="16" r="16" fill="#1B8A5A" />
		<path
			d="M11 21.55 Q11 21 11.3 20.48 L13.9 16.02 Q14.2 15.5 13.8 15.06 L12.6 13.74 Q12.2 13.3 11.68 13.6 L10.12 14.5 Q9.6 14.8 9.3 14.28 L8.8 13.42 Q8.5 12.9 9.02 12.6 L11.98 10.9 Q12.5 10.6 12.9 11.04 L15.1 13.46 Q15.5 13.9 15.8 13.38 L17.6 10.32 Q17.9 9.8 17.38 9.5 L17.02 9.3 Q16.5 9 16.66 8.42 L16.94 7.48 Q17.1 6.9 17.62 7.2 L20.88 9.1 Q21.4 9.4 21.1 9.92 L18.3 14.68 Q18 15.2 18.6 15.2 L20.5 15.2 Q21.1 15.2 21.4 15.72 L22.2 17.08 Q22.5 17.6 21.9 17.6 L21 17.6 Q20.4 17.6 20.1 17.08 L19.3 15.72 Q19 15.2 18.7 15.72 L16.2 19.98 Q15.9 20.5 15.37 20.21 L13.53 19.19 Q13 18.9 12.7 19.42 L11.3 21.78 Q11 22.3 11 21.75 Z"
			fill="#FAFAF8"
		/>
	</svg>
```

with:

```html
	<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="32" height="32" rx="9" fill="#1B8A5A" />
		<path
			d="M6 22 L11.5 22 L15 8.5 L18 15.5 L26 9"
			stroke="#FAFAF8"
			stroke-width="3.2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
```

**Verify:** `diff <(sed -n '24,30p' scripts/favicon-template.html)` shows the new markup. Visually: open the file directly in a browser (`file://.../scripts/favicon-template.html`) and confirm it shows the green rounded square with the white zigzag.
**Depends on:** Step 1 (so both files are updated from the same source of truth in one pass, avoiding drift)

---

### Step 3: Create the apple-touch-icon template (unrounded variant)

**What:** iOS applies its own corner-rounding mask to whatever square image is provided for `apple-touch-icon.png` — shipping a pre-rounded corner would double up or visibly mismatch that mask. Create a new template identical to the (now-updated) `favicon-template.html`, but with a plain full-bleed `<rect>` (no `rx`).
**File:** `scripts/apple-touch-icon-template.html` (create)
**Change:** Full file content — copy `scripts/favicon-template.html` verbatim (after Step 2) and change only the `<rect>` line:

```html
<!doctype html>
<html>
<head>
<meta charset="UTF-8" />
<style>
	* {
		margin: 0;
		padding: 0;
	}
	html,
	body {
		width: 100%;
		height: 100%;
		background: transparent;
	}
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
</head>
<body>
	<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="32" height="32" fill="#1B8A5A" />
		<path
			d="M6 22 L11.5 22 L15 8.5 L18 15.5 L26 9"
			stroke="#FAFAF8"
			stroke-width="3.2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</body>
</html>
```

**Verify:** File exists at `scripts/apple-touch-icon-template.html`. Opened directly in a browser, it shows the same mark on a full-bleed square (no rounded corners), distinguishable from `favicon-template.html`'s rounded-square version side by side.
**Depends on:** Step 2 (copies its structure)

---

### Step 4: Route the apple-touch-icon render to the new template

**What:** `scripts/generate-og-images.js` currently renders both `favicon-32x32.png` and `apple-touch-icon.png` from the same `FAVICON_TEMPLATE_PATH`/`faviconUrl`. Add the new template path as a constant, give each `FAVICONS` entry its own `templatePath`, and update the render loop to use each entry's own template instead of the one shared URL.
**File:** `scripts/generate-og-images.js` (modify)
**Change:** Replace:

```js
const OG_TEMPLATE_PATH = join(__dirname, 'og-template.html');
const FAVICON_TEMPLATE_PATH = join(__dirname, 'favicon-template.html');
const OG_OUTPUT_DIR = join(ROOT, 'static', 'og');
const STATIC_DIR = join(ROOT, 'static');
```

with:

```js
const OG_TEMPLATE_PATH = join(__dirname, 'og-template.html');
const FAVICON_TEMPLATE_PATH = join(__dirname, 'favicon-template.html');
const APPLE_TOUCH_ICON_TEMPLATE_PATH = join(__dirname, 'apple-touch-icon-template.html');
const OG_OUTPUT_DIR = join(ROOT, 'static', 'og');
const STATIC_DIR = join(ROOT, 'static');
```

Then replace:

```js
const FAVICONS = [
	{ file: 'favicon-32x32.png', size: 32 },
	{ file: 'apple-touch-icon.png', size: 180 }
];
```

with:

```js
const FAVICONS = [
	{ file: 'favicon-32x32.png', size: 32, templatePath: FAVICON_TEMPLATE_PATH },
	{ file: 'apple-touch-icon.png', size: 180, templatePath: APPLE_TOUCH_ICON_TEMPLATE_PATH }
];
```

Then replace:

```js
const faviconUrl = pathToFileURL(FAVICON_TEMPLATE_PATH).toString();
for (const { file, size } of FAVICONS) {
	const faviconPage = await browser.newPage({
		viewport: { width: size, height: size },
		deviceScaleFactor: 1
	});
	await faviconPage.goto(faviconUrl);

	const outputPath = join(STATIC_DIR, file);
	await faviconPage.screenshot({ path: outputPath, omitBackground: true });
	console.log(`Generated ${outputPath}`);
	await faviconPage.close();
}
```

with:

```js
for (const { file, size, templatePath } of FAVICONS) {
	const faviconPage = await browser.newPage({
		viewport: { width: size, height: size },
		deviceScaleFactor: 1
	});
	await faviconPage.goto(pathToFileURL(templatePath).toString());

	const outputPath = join(STATIC_DIR, file);
	await faviconPage.screenshot({ path: outputPath, omitBackground: true });
	console.log(`Generated ${outputPath}`);
	await faviconPage.close();
}
```

**Verify:** `node --check scripts/generate-og-images.js` (syntax check only, no execution). Re-read the file to confirm `faviconUrl` no longer appears anywhere (it's fully replaced by per-entry `templatePath`).
**Depends on:** Step 3 (references `APPLE_TOUCH_ICON_TEMPLATE_PATH`, which must exist)

---

### Step 5: Update the OG/Twitter-card template's watermark glyph

**What:** `scripts/og-template.html`'s background `.watermark` decoration embeds the old glyph (muted colors, 9% opacity via its CSS class — do not touch the color values or opacity, only the shape). Swap its `<circle>` container for the same rounded-square treatment as the main mark, and swap the path.
**File:** `scripts/og-template.html` (modify)
**Change:** Replace:

```html
			<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="16" cy="16" r="16" fill="#2fd88f" />
				<path
					d="M11 21.55 Q11 21 11.3 20.48 L13.9 16.02 Q14.2 15.5 13.8 15.06 L12.6 13.74 Q12.2 13.3 11.68 13.6 L10.12 14.5 Q9.6 14.8 9.3 14.28 L8.8 13.42 Q8.5 12.9 9.02 12.6 L11.98 10.9 Q12.5 10.6 12.9 11.04 L15.1 13.46 Q15.5 13.9 15.8 13.38 L17.6 10.32 Q17.9 9.8 17.38 9.5 L17.02 9.3 Q16.5 9 16.66 8.42 L16.94 7.48 Q17.1 6.9 17.62 7.2 L20.88 9.1 Q21.4 9.4 21.1 9.92 L18.3 14.68 Q18 15.2 18.6 15.2 L20.5 15.2 Q21.1 15.2 21.4 15.72 L22.2 17.08 Q22.5 17.6 21.9 17.6 L21 17.6 Q20.4 17.6 20.1 17.08 L19.3 15.72 Q19 15.2 18.7 15.72 L16.2 19.98 Q15.9 20.5 15.37 20.21 L13.53 19.19 Q13 18.9 12.7 19.42 L11.3 21.78 Q11 22.3 11 21.75 Z"
					fill="#0b120f"
				/>
			</svg>
```

with:

```html
			<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="32" height="32" rx="9" fill="#2fd88f" />
				<path
					d="M6 22 L11.5 22 L15 8.5 L18 15.5 L26 9"
					stroke="#0b120f"
					stroke-width="3.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
```

Note: this changes the path element from a filled shape (`fill="#0b120f"`, no stroke) to a stroked line (`stroke="#0b120f"`, `fill="none"`), matching how the new mark is drawn everywhere else — it is not still a filled silhouette.

**Verify:** Visual check after Step 8's regeneration — the large faint background decoration in `static/og/og-default.png` (and all other `og-*.png` files) shows a rounded square with a diagonal zigzag, at 9% opacity, same muted colors as before.
**Depends on:** none (independent of Steps 1-4)

---

### Step 6: Update the OG/Twitter-card template's top-bar logo mark

**What:** The `.mark` element next to the "RUNWISE" wordmark in the same template uses the full-brightness brand colors (`#1B8A5A` / `#FAFAF8`, same as the favicon). Swap it the same way as Step 5, keeping its colors as-is.
**File:** `scripts/og-template.html` (modify)
**Change:** Replace:

```html
			<svg class="mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="16" cy="16" r="16" fill="#1B8A5A" />
				<path
					d="M11 21.55 Q11 21 11.3 20.48 L13.9 16.02 Q14.2 15.5 13.8 15.06 L12.6 13.74 Q12.2 13.3 11.68 13.6 L10.12 14.5 Q9.6 14.8 9.3 14.28 L8.8 13.42 Q8.5 12.9 9.02 12.6 L11.98 10.9 Q12.5 10.6 12.9 11.04 L15.1 13.46 Q15.5 13.9 15.8 13.38 L17.6 10.32 Q17.9 9.8 17.38 9.5 L17.02 9.3 Q16.5 9 16.66 8.42 L16.94 7.48 Q17.1 6.9 17.62 7.2 L20.88 9.1 Q21.4 9.4 21.1 9.92 L18.3 14.68 Q18 15.2 18.6 15.2 L20.5 15.2 Q21.1 15.2 21.4 15.72 L22.2 17.08 Q22.5 17.6 21.9 17.6 L21 17.6 Q20.4 17.6 20.1 17.08 L19.3 15.72 Q19 15.2 18.7 15.72 L16.2 19.98 Q15.9 20.5 15.37 20.21 L13.53 19.19 Q13 18.9 12.7 19.42 L11.3 21.78 Q11 22.3 11 21.75 Z"
					fill="#FAFAF8"
				/>
			</svg>
```

with:

```html
			<svg class="mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="32" height="32" rx="9" fill="#1B8A5A" />
				<path
					d="M6 22 L11.5 22 L15 8.5 L18 15.5 L26 9"
					stroke="#FAFAF8"
					stroke-width="3.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
```

**Verify:** Visual check after Step 8's regeneration — the small 46×46px logo mark next to "RUNWISE" in the top-left of every `og-*.png` shows the new rounded-square mark instead of the old circular glyph.
**Depends on:** none (independent of Step 5, but same file — do both edits in one pass to avoid two separate diffs against the same file)

---

### Step 7: Regenerate all PNG assets

**What:** `favicon-32x32.png`, `apple-touch-icon.png`, and every `static/og/*.png` are checked-in binaries, not built at deploy time. Run the existing generator script to produce updated PNGs from the templates edited in Steps 1-6.
**File:** none (command only)
**Change:**

```bash
npm run og:generate
```

**Verify:** Command exits 0 and logs `Generated .../static/favicon-32x32.png`, `Generated .../static/apple-touch-icon.png`, and one `Generated .../static/og/<name>.png` line per entry in `OG_IMAGES` (7 total) — 9 "Generated" lines in total. `git status --short` shows all of `static/favicon-32x32.png`, `static/apple-touch-icon.png`, and every file under `static/og/` as modified.
**Depends on:** Steps 1-6 (all templates must be updated first, or this regenerates the old glyph)

---

### Step 8: Visually confirm the regenerated assets

**What:** Open the regenerated files to confirm they show the new mark correctly before committing — this is a manual/visual check, not something a command can assert.
**File:** none (manual check)
**Change:** `[MANUAL]` Open `static/favicon.svg`, `static/favicon-32x32.png`, `static/apple-touch-icon.png`, and at least one file under `static/og/` (e.g. `static/og/og-default.png`) in an image viewer or browser. Confirm:
- `favicon.svg` / `favicon-32x32.png`: rounded-square green icon with the white zigzag, no visible artifacts.
- `apple-touch-icon.png`: same mark, but a plain square with sharp (unrounded) corners.
- `og-default.png`: both the large faint background watermark and the small top-bar logo show the new zigzag shape in their respective existing colors; the rest of the OG image layout (headline, tagline, tools list) is unchanged.

**Verify:** Visual confirmation per above — no further automated check applies.
**Depends on:** Step 7

---

### Step 9: Run the existing test suite

**What:** Confirm nothing broke. The relevant tests (`src/app.html.test.ts`, `src/lib/components/HeroSection.test.ts`) only assert on filenames/attributes in `<link>` tags and an `<img src>`, not on SVG path content, so they're expected to still pass unchanged — this step is a safety check, not an expected source of failures.
**File:** none (command only)
**Change:**

```bash
npm run test
```

**Verify:** All tests pass (particularly `src/app.html.test.ts` and `src/lib/components/HeroSection.test.ts`). If either fails, stop and re-examine — it would mean an assumption in this plan about test scope was wrong.
**Depends on:** Step 7
