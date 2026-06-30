import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(import.meta.dirname, 'app.css'), 'utf-8');

describe('app.css design tokens', () => {
	it('defines the accent colour token', () => {
		expect(css).toMatch(/--color-accent:\s*#1B8A5A/i);
	});

	it('defines the accent-dark colour token', () => {
		expect(css).toMatch(/--color-accent-dark:\s*#146344/i);
	});

	it('defines the background colour token', () => {
		expect(css).toMatch(/--color-bg:\s*#FAFAF8/i);
	});

	it('defines the ink colour token', () => {
		expect(css).toMatch(/--color-ink:\s*#19191A/i);
	});

	it('defines the sans font stack with Manrope', () => {
		expect(css).toMatch(/--font-sans:\s*['"]Manrope['"]/);
	});

	it('defines the mono font stack with IBM Plex Mono', () => {
		expect(css).toMatch(/--font-mono:\s*['"]IBM Plex Mono['"]/);
	});

	it('overrides background and ink tokens for dark mode via prefers-color-scheme', () => {
		const darkModeBlock = css.match(/@media \(prefers-color-scheme:\s*dark\)\s*{([\s\S]*?)}\s*}/);
		expect(darkModeBlock).not.toBeNull();
		expect(darkModeBlock?.[1]).toMatch(/--color-bg:/);
		expect(darkModeBlock?.[1]).toMatch(/--color-ink:/);
	});

	it('keeps the accent colour unchanged in dark mode', () => {
		const darkModeBlock = css.match(/@media \(prefers-color-scheme:\s*dark\)\s*{([\s\S]*?)}\s*}/);
		expect(darkModeBlock).not.toBeNull();
		expect(darkModeBlock?.[1] ?? '').not.toMatch(/--color-accent:/);
	});
});
