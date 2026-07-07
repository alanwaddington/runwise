import { test, expect } from '@playwright/test';

/**
 * PR #72 review (finding S1): `CollapsibleField`'s `inert` attribute (added in
 * commit c26c5b7 to stop a keyboard user tabbing into the invisible collapsed
 * custom-distance field) was previously verified only by one-off Playwright
 * scripts run during /verify sessions. This file makes that verification a
 * permanent, repeatable part of the test suite (`npm run test:e2e`) — jsdom
 * cannot observe `inert`'s actual focus-blocking enforcement, only the IDL
 * property assignment (see CollapsibleField.test.ts), so a real browser is
 * required to prove the accessibility guarantee holds.
 */

const TOOLS = [
	{ path: '/vo2max', name: 'VO2 Max' },
	{ path: '/race-predictor', name: 'Race Predictor' },
	{ path: '/training-paces', name: 'Training Paces' }
];

test.describe('CollapsibleField keyboard-focus containment', () => {
	test.beforeEach(async ({ page }) => {
		// Skip the cookie banner — irrelevant to this test and would otherwise
		// sit in the tab order.
		await page.addInitScript(() =>
			localStorage.setItem('cookie-consent', JSON.stringify({ categories: ['necessary'], timestamp: 0 }))
		);
	});

	for (const tool of TOOLS) {
		test(`${tool.name}: Tab from the distance select never reaches the collapsed custom-distance field`, async ({
			page
		}) => {
			await page.goto(tool.path);
			await page.locator('#distance-select').focus();

			for (let i = 0; i < 5; i++) {
				await page.keyboard.press('Tab');
				const activeId = await page.evaluate(() => document.activeElement?.id ?? null);
				expect(activeId).not.toBe('custom-km');
			}
		});

		test(`${tool.name}: Tab reaches the custom-distance field once it's expanded`, async ({ page }) => {
			await page.goto(tool.path);
			await page.locator('#distance-select').selectOption('Custom');
			await page.locator('#distance-select').focus();
			await page.keyboard.press('Tab');
			const activeId = await page.evaluate(() => document.activeElement?.id ?? null);
			expect(activeId).toBe('custom-km');
		});
	}
});
