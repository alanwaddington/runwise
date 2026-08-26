#!/usr/bin/env node
// Renders scripts/og-template.html and scripts/favicon-template.html with
// Playwright to produce the shared default OG image, one branded OG image
// per tool page, and refreshed favicon PNGs at standard sizes.
// Run: node scripts/generate-og-images.js
// Or:  npm run og:generate

import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { oxipngSync } from 'oxipng';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OG_TEMPLATE_PATH = join(__dirname, 'og-template.html');
const FAVICON_TEMPLATE_PATH = join(__dirname, 'favicon-template.html');
const APPLE_TOUCH_ICON_TEMPLATE_PATH = join(__dirname, 'apple-touch-icon-template.html');
const OG_OUTPUT_DIR = join(ROOT, 'static', 'og');
const STATIC_DIR = join(ROOT, 'static');

const OG_IMAGES = [
	{ file: 'og-default.png', tool: null },
	{ file: 'og-pace.png', tool: 'Pace Calculator' },
	{ file: 'og-race-predictor.png', tool: 'Race Time Predictor' },
	{ file: 'og-training-paces.png', tool: 'Training Pace Calculator' },
	{ file: 'og-hr-zones.png', tool: 'Heart Rate Zone Calculator' },
	{ file: 'og-vo2max.png', tool: 'VO2 Max Estimator' },
	{ file: 'og-parkrun.png', tool: 'Parkrun Predictor' },
	{ file: 'og-power-zones.png', tool: 'Power Zones Calculator' },
	{ file: 'og-workouts.png', tool: 'Workout Suggestions' },
	{
		file: 'og-about.png',
		tool: 'About Runwise',
		eyebrow: 'About',
		tagline: "Who's behind Runwise, and the methodology behind every calculator."
	},
	{
		file: 'og-guides.png',
		tool: 'Running Guides',
		eyebrow: 'Guides',
		tagline: "In-depth articles on the methods behind Runwise's calculators."
	},
	{
		file: 'og-guide-understanding-vdot.png',
		tool: 'Understanding VDOT',
		eyebrow: 'Guide',
		tagline: "How Jack Daniels' VDOT method drives your training paces."
	},
	{
		file: 'og-guide-hr-zones-vs-power-zones.png',
		tool: 'HR Zones vs Power',
		eyebrow: 'Guide',
		tagline: 'Heart rate and running power measure different things — here’s how to use each.'
	},
	{
		file: 'og-guide-how-race-predictions-work.png',
		tool: 'Race Predictions',
		eyebrow: 'Guide',
		tagline: 'How the Riegel formula predicts race times, and when to distrust it.'
	},
	{
		file: 'og-guide-reading-your-vo2max.png',
		tool: 'Reading VO2 Max',
		eyebrow: 'Guide',
		tagline: 'What a VO2 max estimate means, and how to actually improve it.'
	}
];

const FAVICONS = [
	{ file: 'favicon-32x32.png', size: 32, templatePath: FAVICON_TEMPLATE_PATH },
	{ file: 'apple-touch-icon.png', size: 180, templatePath: APPLE_TOUCH_ICON_TEMPLATE_PATH }
];

mkdirSync(OG_OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch();

let optimizeFailures = 0;

const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const { file, tool, eyebrow, tagline } of OG_IMAGES) {
	const url = new URL(pathToFileURL(OG_TEMPLATE_PATH));
	if (tool) url.searchParams.set('tool', tool);
	if (eyebrow) url.searchParams.set('eyebrow', eyebrow);
	if (tagline) url.searchParams.set('tagline', tagline);

	await ogPage.goto(url.toString());
	await ogPage.waitForTimeout(300); // allow Google Fonts to load before screenshot

	const outputPath = join(OG_OUTPUT_DIR, file);
	await ogPage.screenshot({ path: outputPath });
	console.log(`Generated ${outputPath}`);

	// Lossless re-optimization typically reduces these ~1200x630 PNGs by ~18-19%
	// (measured: 3.3MB -> 2.7MB across all 7 images) — the template's noise-texture
	// overlay otherwise defeats Playwright's uncompressed PNG output. Bundles only
	// x86_64 binaries (macOS, Linux-musl, Windows) — no native arm64 build, so this
	// throws "Missing binary for platform" on arm64 machines/CI runners.
	try {
		oxipngSync(['-o', 'max', '--strip', 'safe', outputPath]);
		console.log(`Optimized ${outputPath}`);
	} catch (error) {
		console.error(`Failed to optimize ${outputPath}: ${error.message}`);
		console.error('Keeping the unoptimized screenshot and continuing.');
		optimizeFailures++;
	}
}

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

await browser.close();

if (optimizeFailures > 0) {
	console.error(`\n${optimizeFailures} of ${OG_IMAGES.length} OG image(s) failed to optimize — see errors above.`);
	process.exit(1);
}
