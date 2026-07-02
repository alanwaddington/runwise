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

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OG_TEMPLATE_PATH = join(__dirname, 'og-template.html');
const FAVICON_TEMPLATE_PATH = join(__dirname, 'favicon-template.html');
const OG_OUTPUT_DIR = join(ROOT, 'static', 'og');
const STATIC_DIR = join(ROOT, 'static');

const OG_IMAGES = [
	{ file: 'og-default.png', tool: null },
	{ file: 'og-pace.png', tool: 'Pace Calculator' },
	{ file: 'og-race-predictor.png', tool: 'Race Time Predictor' },
	{ file: 'og-training-paces.png', tool: 'Training Pace Calculator' },
	{ file: 'og-hr-zones.png', tool: 'Heart Rate Zone Calculator' },
	{ file: 'og-vo2max.png', tool: 'VO2 Max Estimator' },
	{ file: 'og-parkrun.png', tool: 'Parkrun Predictor' }
];

const FAVICONS = [
	{ file: 'favicon-32x32.png', size: 32 },
	{ file: 'apple-touch-icon.png', size: 180 }
];

mkdirSync(OG_OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch();

const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const { file, tool } of OG_IMAGES) {
	const url = new URL(pathToFileURL(OG_TEMPLATE_PATH));
	if (tool) url.searchParams.set('tool', tool);

	await ogPage.goto(url.toString());
	await ogPage.waitForTimeout(300); // allow Google Fonts to load before screenshot

	const outputPath = join(OG_OUTPUT_DIR, file);
	await ogPage.screenshot({ path: outputPath });
	console.log(`Generated ${outputPath}`);
}

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

await browser.close();
