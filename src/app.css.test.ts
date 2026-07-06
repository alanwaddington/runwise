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

/**
 * PR #71 review (finding m1): the two facts this fix depends on — the
 * dark-mode contrast ratio and the touch-hover CSS mechanism — were
 * previously verified only by one-off Playwright scripts during /verify
 * sessions, so a future edit to app.css could silently regress either while
 * `npm run test` stays green. These tests parse the raw source (not the
 * compiled Tailwind output), so they run fast and need no build step.
 */
describe('app.css color-contrast regression guard (PR #71)', () => {
	function relativeLuminance([r, g, b]: [number, number, number]): number {
		const linearize = (channel: number) => {
			const c = channel / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		};
		return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
	}

	function hexToRgb(hex: string): [number, number, number] {
		const clean = hex.replace('#', '');
		return [
			parseInt(clean.slice(0, 2), 16),
			parseInt(clean.slice(2, 4), 16),
			parseInt(clean.slice(4, 6), 16)
		];
	}

	function contrastRatio(hexA: string, hexB: string): number {
		const lumA = relativeLuminance(hexToRgb(hexA));
		const lumB = relativeLuminance(hexToRgb(hexB));
		const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
		return (lighter + 0.05) / (darker + 0.05);
	}

	function extractBlock(source: string, selector: string): string {
		const match = source.match(new RegExp(`${selector}\\s*{([^}]*)}`));
		if (!match) throw new Error(`Could not find a "${selector} { ... }" block in app.css`);
		return match[1];
	}

	function extractHexVar(block: string, varName: string): string {
		const match = block.match(new RegExp(`${varName}:\\s*(#[0-9a-fA-F]{6})`));
		if (!match) throw new Error(`Could not find ${varName} as a hex value in the given block`);
		return match[1];
	}

	it('--color-muted meets WCAG AA (>=4.5:1) against --color-bg in dark mode', () => {
		const darkBlock = extractBlock(css, 'html\\.dark');
		const bg = extractHexVar(darkBlock, '--color-bg');
		const muted = extractHexVar(darkBlock, '--color-muted');
		expect(contrastRatio(bg, muted)).toBeGreaterThanOrEqual(4.5);
	});

	it('--color-muted meets WCAG AA (>=4.5:1) against --color-bg in light mode', () => {
		const lightBlock = extractBlock(css, 'html\\.light');
		const bg = extractHexVar(lightBlock, '--color-bg');
		const muted = extractHexVar(lightBlock, '--color-muted');
		expect(contrastRatio(bg, muted)).toBeGreaterThanOrEqual(4.5);
	});

	it('the no-JS prefers-color-scheme fallback matches the html.dark override', () => {
		const fallbackBlock = extractBlock(css, '@media \\(prefers-color-scheme: dark\\)\\s*{\\s*:root');
		const darkBlock = extractBlock(css, 'html\\.dark');
		expect(extractHexVar(fallbackBlock, '--color-muted')).toBe(extractHexVar(darkBlock, '--color-muted'));
		expect(extractHexVar(fallbackBlock, '--color-bg')).toBe(extractHexVar(darkBlock, '--color-bg'));
	});

	it('color tokens live under the --color-* namespace, not --text-* (Tailwind reserves --text-* for font-size, not color)', () => {
		expect(css).not.toMatch(/--text-muted\s*:/);
		expect(css).not.toMatch(/--text-subtle\s*:/);
		expect(css).not.toMatch(/--text-hover\s*:/);
		expect(css).toMatch(/--color-muted\s*:/);
		expect(css).toMatch(/--color-subtle\s*:/);
		expect(css).toMatch(/--color-hover\s*:/);
	});

	it('the hover variant is redefined to apply unconditionally, not gated behind @media (hover: hover)', () => {
		expect(css).toMatch(/@custom-variant hover \(&:hover\);/);
	});
});
