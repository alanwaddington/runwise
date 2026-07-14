import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_OG_IMAGE, PAGES } from './seo';

const STATIC_DIR = join(import.meta.dirname, '..', '..', 'static');

// Lossless re-optimization (see scripts/generate-og-images.js) typically brings these
// ~1200x630 PNGs down to ~385-393KB each (measured: 3.3MB -> 2.7MB across all 7 images).
// 420KB leaves headroom for minor template changes without becoming flaky, while still
// catching a regression back toward the unoptimized ~480-492KB baseline.
const MAX_OG_IMAGE_BYTES = 420 * 1024;

const OG_IMAGE_PATHS = [...new Set([DEFAULT_OG_IMAGE, ...Object.values(PAGES).map((page) => page.ogImage)])];

describe('OG image assets on disk', () => {
	it('defaultOgImage_fileExists', () => {
		expect(existsSync(join(STATIC_DIR, DEFAULT_OG_IMAGE))).toBe(true);
	});

	it.each(Object.entries(PAGES))('%s ogImage file exists', (_route, page) => {
		expect(existsSync(join(STATIC_DIR, page.ogImage))).toBe(true);
	});

	it.each(OG_IMAGE_PATHS)('%s is under the optimized size budget', (ogImage) => {
		const { size } = statSync(join(STATIC_DIR, ogImage));
		expect(size).toBeLessThan(MAX_OG_IMAGE_BYTES);
	});
});
