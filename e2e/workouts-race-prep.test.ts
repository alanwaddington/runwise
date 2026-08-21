import { test, expect } from '@playwright/test';
import { seedCookieConsent, fillRaceResult, switchWorkoutsMode, isoDateDaysFromNow } from './helpers';

/**
 * #100 Phase 3, Task 1 (AC-9.1): first E2E coverage of the Race-Prep flow through a real browser
 * -- previously only exercised by jsdom component tests (workouts.test.ts) and one-off manual
 * Playwright sessions during /verify. Covers the flow this session's AC-7.6 fix (PR #104) landed
 * in: a Shakeout run as Taper week's final workout, across all three "Train by" modalities.
 */
test.describe('Race-Prep flow', () => {
	test.beforeEach(async ({ page }) => {
		await seedCookieConsent(page);
		await page.goto('/workouts');
	});

	test('race result + a 4-8-week-out race date unlocks the Race-Prep tab', async ({ page }) => {
		await expect(page.getByRole('tab', { name: 'Race-Prep' })).not.toBeVisible();

		await fillRaceResult(page, { time: '22:00', mileageKm: '50', raceDateISO: isoDateDaysFromNow(35) });

		await expect(page.getByRole('tab', { name: 'Race-Prep' })).toBeVisible();
	});

	test('navigating the week stepper reveals all 4 weeks in phase order for a 4-week plan', async ({ page }) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50', raceDateISO: isoDateDaysFromNow(28) });
		await switchWorkoutsMode(page, 'Race-Prep');

		const expectedPhases = ['Week 1: Build Aerobic Base', 'Week 2: Strength', 'Week 3: Peak VO2 Max', 'Week 4: Taper'];
		const weekButtons = page.locator('[role="tablist"][aria-label="Race-prep week"] button');
		await expect(weekButtons).toHaveCount(4);

		for (let i = 0; i < expectedPhases.length; i++) {
			await weekButtons.nth(i).click();
			await expect(page.getByRole('heading', { name: expectedPhases[i] })).toBeVisible();
		}
	});

	test('each of the 3 "Train by" modalities is selectable and produces a plan', async ({ page }) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50', raceDateISO: isoDateDaysFromNow(35) });
		await switchWorkoutsMode(page, 'Race-Prep');
		const weekOneHeading = page.getByRole('heading', { name: /Week 1: /i });

		await page.getByRole('tab', { name: 'Race-prep power modality' }).click();
		await page.locator('#power').fill('280');
		await expect(weekOneHeading).toBeVisible();

		await page.getByRole('tab', { name: 'Race-prep HR modality' }).click();
		await page.locator('#lthr').fill('170');
		await expect(weekOneHeading).toBeVisible();

		await page.getByRole('tab', { name: 'Race-prep pace modality' }).click();
		await expect(weekOneHeading).toBeVisible();
	});

	test('Taper week\'s final workout is a Shakeout run, in every modality (regression: AC-7.6, PR #104)', async ({
		page
	}) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50', raceDateISO: isoDateDaysFromNow(28) });
		await switchWorkoutsMode(page, 'Race-Prep');

		async function assertTaperHasShakeout() {
			const weekButtons = page.locator('[role="tablist"][aria-label="Race-prep week"] button');
			await weekButtons.last().click();
			await expect(page.getByText('Shakeout run')).toBeVisible();
			// AC not distance-prescribed -- no misleading "0 km" stat should render for it.
			const shakeoutCard = page.locator('div.relative.flex.w-64').filter({ hasText: 'Shakeout run' });
			await expect(shakeoutCard).not.toContainText(/0\s*km/);
		}

		await assertTaperHasShakeout();

		await page.getByRole('tab', { name: 'Race-prep power modality' }).click();
		await page.locator('#power').fill('280');
		await assertTaperHasShakeout();

		await page.getByRole('tab', { name: 'Race-prep HR modality' }).click();
		await page.locator('#lthr').fill('170');
		await assertTaperHasShakeout();
	});
});
