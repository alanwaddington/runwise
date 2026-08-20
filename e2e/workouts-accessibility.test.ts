import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { seedCookieConsent, fillRaceResult, switchWorkoutsMode } from './helpers';

/**
 * #100 Phase 3, Task 4 (AC-9.5): automated WCAG AA scan across all 4 modes' valid-results state,
 * plus the open workout-detail modal. Kept in its own file, separate from the flow-behavior
 * tests (workouts-race-prep/hr-badges/fit-download.test.ts) -- an accessibility regression and a
 * flow regression are different concerns, and mixing them would obscure which failed.
 */
test.describe('WCAG AA accessibility scan', () => {
	test.beforeEach(async ({ page }) => {
		await seedCookieConsent(page);
		await page.goto('/workouts');
	});

	async function scan(page: import('@playwright/test').Page) {
		return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
	}

	test('Pace mode, valid results', async ({ page }) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50' });
		const results = await scan(page);
		expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
	});

	test('Power mode, valid results', async ({ page }) => {
		await switchWorkoutsMode(page, 'Power');
		await page.locator('#power').fill('280');
		await page.locator('#weekly-mileage').fill('50');
		const results = await scan(page);
		expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
	});

	test('HR mode, valid results', async ({ page }) => {
		await switchWorkoutsMode(page, 'HR');
		await page.locator('#lthr').fill('170');
		await page.locator('#weekly-mileage').fill('50');
		const results = await scan(page);
		expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
	});

	test('Race-Prep mode, valid results', async ({ page }) => {
		const d = new Date();
		d.setDate(d.getDate() + 35);
		await fillRaceResult(page, { time: '22:00', mileageKm: '50', raceDateISO: d.toISOString().slice(0, 10) });
		await switchWorkoutsMode(page, 'Race-Prep');
		const results = await scan(page);
		expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
	});

	test('workout detail modal open', async ({ page }) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50' });
		await page.locator('section button[type="button"]').first().click();
		await expect(page.getByRole('dialog')).toBeVisible();
		const results = await scan(page);
		expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
	});
});
