import { test, expect } from '@playwright/test';
import { seedCookieConsent, fillRaceResult, switchWorkoutsMode } from './helpers';

/**
 * #100 Phase 3, Task 2 (AC-9.2): first E2E coverage of HR mode's zone/confidence-badge mapping
 * and Phase 2's pattern badges (Fartlek/Progression/Decay/Time-based) -- both UI additions with
 * no prior E2E coverage.
 */
test.describe('HR mode zone mapping', () => {
	test.beforeEach(async ({ page }) => {
		await seedCookieConsent(page);
		await page.goto('/workouts');
	});

	test('a valid LTHR + weekly mileage renders 5 zones, each with a BPM range and confidence badge', async ({
		page
	}) => {
		await switchWorkoutsMode(page, 'HR');
		await page.locator('#lthr').fill('170');
		await page.locator('#weekly-mileage').fill('50');

		const zoneRows = page.locator('div.flex.items-center.gap-2.rounded-lg.border');
		await expect(zoneRows).toHaveCount(5);

		for (const zoneKey of ['E', 'M', 'T', 'I', 'R']) {
			await expect(page.getByLabel(`Zone ${zoneKey}`).first()).toBeVisible();
		}

		const confidenceBadges = page.locator('span.capitalize');
		await expect(confidenceBadges).toHaveCount(5);
		const confidenceTexts = await confidenceBadges.allTextContents();
		for (const text of confidenceTexts) {
			expect(['high', 'medium', 'low']).toContain(text.trim());
		}
	});
});

test.describe('Pattern badges (Phase 2, AC-3.7)', () => {
	test.beforeEach(async ({ page }) => {
		await seedCookieConsent(page);
		await page.goto('/workouts');
	});

	test('valid Pace-mode results show Fartlek, Progression, Decay, and Time-based badges', async ({ page }) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50' });

		// Badges render a glyph + label in one span (e.g. "∿Fartlek"), so an exact match on the
		// label alone won't hit -- match by substring instead.
		await expect(page.getByText(/Fartlek/).first()).toBeVisible();
		await expect(page.getByText(/Progression/).first()).toBeVisible();
		await expect(page.getByText(/Decay/).first()).toBeVisible();
		await expect(page.getByText(/Time-based/).first()).toBeVisible();
	});

	test('a standard card (Regular easy run) shows no pattern badge', async ({ page }) => {
		await fillRaceResult(page, { time: '22:00', mileageKm: '50' });

		const regularEasyRunCard = page.locator('div.relative.flex.w-64').filter({ hasText: 'Regular easy run' });
		await expect(regularEasyRunCard).not.toContainText('Fartlek');
		await expect(regularEasyRunCard).not.toContainText('Progression');
		await expect(regularEasyRunCard).not.toContainText('Decay');
		await expect(regularEasyRunCard).not.toContainText('Time-based');
	});
});
