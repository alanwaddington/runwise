import { test, expect } from '@playwright/test';

/**
 * PR #71 review (finding m1): the touch-hover mechanism (`@custom-variant hover
 * (&:hover);` in app.css, which drops Tailwind's default `@media (hover: hover)`
 * guard) was previously verified only by one-off Playwright scripts run during
 * /verify sessions. This file makes that verification a permanent, repeatable
 * part of the test suite (`npm run test:e2e`).
 */

test.describe('Dark-mode contrast and hover feedback', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
	});

	test('muted text meets WCAG AA contrast against the dark background', async ({ page }) => {
		await page.goto('/');
		const contrast = await page.evaluate(() => {
			function relativeLuminance([r, g, b]: [number, number, number]) {
				const linearize = (c: number) => {
					c /= 255;
					return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
				};
				return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
			}
			function parseRgb(value: string): [number, number, number] {
				const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
				if (!match) throw new Error(`Could not parse rgb value: ${value}`);
				return [Number(match[1]), Number(match[2]), Number(match[3])];
			}
			const bg = parseRgb(getComputedStyle(document.body).backgroundColor);
			const muted = document.querySelector('.text-muted');
			if (!muted) throw new Error('No .text-muted element found on the page');
			const mutedRgb = parseRgb(getComputedStyle(muted).color);
			const lumBg = relativeLuminance(bg);
			const lumMuted = relativeLuminance(mutedRgb);
			const [lighter, darker] = lumBg > lumMuted ? [lumBg, lumMuted] : [lumMuted, lumBg];
			return (lighter + 0.05) / (darker + 0.05);
		});
		expect(contrast).toBeGreaterThanOrEqual(4.5);
	});

	test('hovering a nav link with a real mouse changes its color', async ({ page }) => {
		await page.goto('/');
		const link = page.locator('nav a', { hasText: 'Race Predictor' });
		const before = await link.evaluate((el) => getComputedStyle(el).color);
		await link.hover();
		const after = await link.evaluate((el) => getComputedStyle(el).color);
		expect(after).not.toBe(before);
	});

	test('focus-visible ring remains visible on the theme toggle after these changes', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		const boxShadow = await page.evaluate(() => getComputedStyle(document.activeElement as Element).boxShadow);
		expect(boxShadow).not.toBe('none');
	});
});

test.describe('Touch-device hover parity', () => {
	test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
	});

	test('this device reports no true hover capability (sanity check for the scenario this guards)', async ({
		page
	}) => {
		await page.goto('/');
		const canHover = await page.evaluate(() => matchMedia('(hover: hover)').matches);
		expect(canHover).toBe(false);
	});

	test('tapping a nav element still applies its hover color', async ({ page }) => {
		await page.goto('/');
		// A real nav *link* is the wrong target here: SiteNav's desktop <ul> is hidden below the
		// `md` breakpoint (mobile uses a separate hamburger-triggered <ul>), and even once that's
		// opened, tapping a real <a href> both navigates (removing this page/element) and runs
		// SiteNav's own onclick that closes the mobile menu (unmounting the link) -- either one
		// races the post-tap style read out from under itself. The theme toggle button has the
		// same confound (tapping it changes the theme, which changes --color-muted itself --
		// conflating "did :hover apply" with "did the theme change"). The hamburger menu toggle
		// carries the same `hover:text-hover` mechanism under test, is visible at every viewport
		// (not gated behind `md:flex`), stays mounted and its own color unaffected regardless of
		// whether the menu it controls is open or closed, and has no navigation side effect.
		const hamburger = page.getByRole('button', { name: 'Toggle navigation menu' });
		const box = await hamburger.boundingBox();
		if (!box) throw new Error('Hamburger menu button has no bounding box');

		const before = await hamburger.evaluate((el) => getComputedStyle(el).color);
		await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
		const afterTap = await hamburger.evaluate((el) => getComputedStyle(el).color);

		expect(afterTap).not.toBe(before);
	});
});
