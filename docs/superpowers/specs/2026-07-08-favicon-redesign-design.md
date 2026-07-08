# Favicon / App Icon Redesign

**Date:** 2026-07-08
**Status:** Approved by site owner, pending implementation

## Problem

The current icon (`static/favicon.svg`) is an abstract white glyph on a green (`#1B8A5A`) circle, intended to suggest running/motion. In practice it reads as an indistinct blob, especially at the 16–32px sizes browsers actually render favicons at. The site owner wants a redesign that's recognizable and clean at those sizes.

## Process

Explored via the brainstorming skill's visual companion: 8 initial abstract "motion/speed" style directions (chevrons, sweeping curve, motion-blur bars, orbit arc, stride slash, GPS comet trail, pulse/effort spike, ascending pace ticks), narrowed to the pulse/effort-spike direction, then iterated through 4 reshapes to make it read as running/stride rather than a literal ECG line, then validated the winning shape at actual rendered 16px/32px/180px sizes (not scaled illustrations) to catch legibility loss before finalizing, then chose a container shape (circle vs. rounded square vs. no container).

## Design

### The mark

A diagonal "pulse": a small zigzag that climbs from bottom-left to top-right, reading simultaneously as an effort/rhythm spike and as forward motion — avoiding both the literal-runner-figure cliché and the flat/static feel of a horizontal ECG strip.

- Path: `M6 22 L11.5 22 L15 8.5 L18 15.5 L26 9`, on a `0 0 32 32` viewBox — 5 points (1 `M` + 4 `L`), i.e. 4 line segments
- Stroke: `#FAFAF8`, width `3.2`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"`
- Down from 7 points in an earlier draft — validated at real 16px render size to confirm it stays a crisp zigzag rather than blurring into a smear. The stroke width was deliberately increased from an initial `2.1` to `3.2` for the same reason: thinner strokes anti-alias away at 16px.

### Container

Two variants of the same mark are needed, because the two consumers have different corner-rounding conventions:

1. **Favicon use** (`favicon.svg`, `favicon-32x32.png`, and anywhere else the general icon is used): rounded square, `rx="9"` on the 32×32 box, filled `#1B8A5A` (the existing `--color-accent` design token — do not introduce a new color constant, reference/match the existing token value).
2. **`apple-touch-icon.png` (180×180) only**: the same mark and fill color, but **no corner rounding** — a full-bleed square from edge to edge. iOS applies its own rounded-corner mask on top of whatever square image is provided; shipping a pre-rounded corner here would either double up the rounding or expose a visual seam depending on iOS version. This is a correctness detail, not a style choice — do not "fix" it by rounding both.

Rejected container option: no background container at all (mark alone in brand green with a transparent background) — rejected because it loses guaranteed contrast against arbitrary/dark browser tab backgrounds, and loses the color-block brand recognition at a glance.

Rejected shape option: full circle (the current treatment) — not wrong, but the rounded square was preferred as feeling more aligned with modern app-icon conventions.

### Sizes/contrast validated

- 16×16, 32×32, 180×180 all confirmed by rendering the actual candidate SVG at those pixel sizes (not a scaled-down large illustration) during the design session.
- Contrast of `#FAFAF8` on `#1B8A5A` is the same pairing already used sitewide for buttons/badges; it passes WCAG's 3:1 non-text/graphical-object contrast threshold. No new contrast risk introduced.

## Implementation scope

**Spec review (2026-07-08) caught that this glyph appears in more places than initially scoped — see corrections below.** No application/UI code changes either way; everything is confined to `static/` and `scripts/`.

1. **`static/favicon.svg`** — replace with the new mark (rounded-square container variant).

2. **`scripts/favicon-template.html`** — mirror the same SVG markup exactly; this file is what `scripts/generate-og-images.js` screenshots via Playwright to produce `favicon-32x32.png`. Needs to stay in sync with `favicon.svg` (already true today; this isn't a new constraint, just a reminder for whoever implements this).

3. **`scripts/generate-og-images.js`** — currently generates both `favicon-32x32.png` (32px) and `apple-touch-icon.png` (180px) from the *same* `favicon-template.html` (the `FAVICONS` array/loop drives both sizes off one template path today). Since `apple-touch-icon.png` needs the un-rounded square variant, this needs an actual code change, not just an aside: give the `apple-touch-icon.png` entry in that array its own template path (e.g. a new `scripts/apple-touch-icon-template.html`, identical to `favicon-template.html` but with a plain `<rect>`, no `rx`, on the container), and update the loop so each entry renders from its own template instead of the one shared `faviconUrl`.

4. **`scripts/og-template.html`** — **correction from the first draft of this spec, which incorrectly claimed this file was unaffected.** It embeds the *old* glyph twice and both need updating to the new mark for brand consistency, since `npm run og:generate` screenshots this template to produce every checked-in `static/og/*.png` social-preview image. These same files are also the Twitter Card images — `SeoHead.svelte`'s `twitter:image` meta tag reuses the exact same `ogImageUrl` as `og:image` (there is no separate Twitter-specific asset or template), so regenerating this one template set updates both Open Graph and Twitter Card previews together:
   - The `.watermark` background decoration (large, 9% opacity, muted colors `#2fd88f` fill / `#0b120f` path) — swap the container from `<circle>` to the same rounded-square (`rx` scaled proportionally to its viewBox) and swap in the new path `d`. Keep its existing distinct muted color treatment as-is (that muting is intentional, unrelated to this redesign) — only the shape and path change, matching the favicon's circle→rounded-square change everywhere it appears, not just in the top bar.
   - The `.mark` logo next to the wordmark in the top bar (`#1B8A5A` fill / `#FAFAF8` path, 46×46px via CSS) — swap in the new mark's container + path, matching the main favicon treatment (rounded square, since this isn't the apple-touch-icon context).

5. **Regenerate the PNGs.** `static/favicon-32x32.png`, `static/apple-touch-icon.png`, and every file under `static/og/` are checked-in binaries, not built at deploy time — editing the templates alone ships nothing. Run `npm run og:generate` after the template/script edits above, and commit the regenerated PNGs alongside the source changes.

No changes needed to `src/app.html` (existing `<link rel="icon">`/`<link rel="apple-touch-icon">` tags already point at the right filenames/sizes) or to any manifest/webmanifest file (none exists in the repo).

## Out of scope

- No changes to the app's color tokens, `app.css`, or any in-app UI (this is icon-only).
- No new build tooling — reuses the existing `npm run og:generate` pipeline.
- Historical `favicon-template.html`/`og-template.html` cleanup beyond what's needed for this change.
- Changing the `.watermark`'s distinct muted color treatment in `og-template.html` — only its path shape updates, not its palette.
