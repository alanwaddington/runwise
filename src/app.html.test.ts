import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const html = readFileSync(join(import.meta.dirname, 'app.html'), 'utf-8');

describe('app.html favicon', () => {
	it('references the SVG favicon', () => {
		expect(html).toMatch(/<link rel="icon"[^>]*href="[^"]*favicon\.svg"[^>]*type="image\/svg\+xml"/);
	});
});
