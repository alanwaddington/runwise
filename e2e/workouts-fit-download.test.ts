import { test, expect, devices } from '@playwright/test';
import { seedCookieConsent, fillRaceResult, switchWorkoutsMode } from './helpers';

/**
 * #100 Phase 3, Task 3 (AC-9.3, AC-9.4): real (non-mocked) FIT download through a real browser --
 * genuinely different coverage from workouts.test.ts's component tests, which mock
 * buildFitWorkout entirely. Also covers a mobile-viewport (iPhone 12-equivalent) re-run of a
 * representative subset: Race-Prep tab unlock + one Pace-mode FIT download.
 */
test.describe('Download as .FIT (real download, all 3 modalities)', () => {
	test.use({ acceptDownloads: true });

	test.beforeEach(async ({ page }) => {
		await seedCookieConsent(page);
		await page.goto('/workouts');
	});

	async function openFirstCardModal(page: import('@playwright/test').Page) {
		await page.locator('section button[type="button"]').first().click();
	}

	test('Pace mode: downloads a real .fit file with the expected filename pattern', async ({ page }) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50' });
		await openFirstCardModal(page);

		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /download as \.fit/i }).click()
		]);

		expect(download.suggestedFilename()).toMatch(/^runwise-.+-pace\.fit$/);
	});

	test('Power mode: downloads a real .fit file with the expected filename pattern', async ({ page }) => {
		await switchWorkoutsMode(page, 'Power');
		await page.locator('#power').fill('280');
		await page.locator('#weekly-mileage').fill('50');
		await openFirstCardModal(page);

		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /download as \.fit/i }).click()
		]);

		expect(download.suggestedFilename()).toMatch(/^runwise-.+-power\.fit$/);
	});

	test('HR mode: downloads a real .fit file with the expected filename pattern', async ({ page }) => {
		await switchWorkoutsMode(page, 'HR');
		await page.locator('#lthr').fill('170');
		await page.locator('#weekly-mileage').fill('50');
		await openFirstCardModal(page);

		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /download as \.fit/i }).click()
		]);

		expect(download.suggestedFilename()).toMatch(/^runwise-.+-hr\.fit$/);
	});
});

test.describe('Mobile viewport (390px-equivalent)', () => {
	// Spreading the full iPhone 12 device preset also sets defaultBrowserType, which conflicts
	// with this project's single chromium project when applied inside a describe block -- only
	// pull the viewport/touch-emulation fields we actually need.
	test.use({
		viewport: devices['iPhone 12'].viewport,
		isMobile: devices['iPhone 12'].isMobile,
		hasTouch: devices['iPhone 12'].hasTouch,
		acceptDownloads: true
	});

	test.beforeEach(async ({ page }) => {
		await seedCookieConsent(page);
		await page.goto('/workouts');
	});

	test('Race-Prep tab still unlocks and no horizontal overflow occurs', async ({ page }) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50' });
		const d = new Date();
		d.setDate(d.getDate() + 35);
		await page.fill('#race-date', d.toISOString().slice(0, 10));

		await expect(page.getByRole('tab', { name: 'Race-Prep' })).toBeVisible();

		const hasHorizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth
		);
		expect(hasHorizontalOverflow).toBe(false);
	});

	test('a Pace-mode FIT download still works at mobile width', async ({ page }) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50' });
		await page.locator('section button[type="button"]').first().click();

		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /download as \.fit/i }).click()
		]);

		expect(download.suggestedFilename()).toMatch(/^runwise-.+-pace\.fit$/);
	});
});
