import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const html = readFileSync(join(import.meta.dirname, 'app.html'), 'utf-8');

describe('app.html favicon', () => {
	it('references the SVG favicon', () => {
		expect(html).toMatch(/<link rel="icon"[^>]*href="[^"]*favicon\.svg"[^>]*type="image\/svg\+xml"/);
	});

	it('references the 32x32 PNG favicon fallback', () => {
		expect(html).toMatch(
			/<link rel="icon"[^>]*href="[^"]*favicon-32x32\.png"[^>]*type="image\/png"[^>]*sizes="32x32"/
		);
	});

	it('references the apple-touch-icon', () => {
		expect(html).toMatch(
			/<link rel="apple-touch-icon"[^>]*href="[^"]*apple-touch-icon\.png"[^>]*sizes="180x180"/
		);
	});
});
