import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_OG_IMAGE, PAGES } from './seo';

const STATIC_DIR = join(import.meta.dirname, '..', '..', 'static');

describe('OG image assets on disk', () => {
	it('defaultOgImage_fileExists', () => {
		expect(existsSync(join(STATIC_DIR, DEFAULT_OG_IMAGE))).toBe(true);
	});

	it.each(Object.entries(PAGES))('%s ogImage file exists', (_route, page) => {
		expect(existsSync(join(STATIC_DIR, page.ogImage))).toBe(true);
	});
});
