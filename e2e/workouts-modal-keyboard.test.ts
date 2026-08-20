import { test, expect } from '@playwright/test';
import { seedCookieConsent, fillRaceResult } from './helpers';

/**
 * #100 Phase 3, Task 5 (manual keyboard audit): regression coverage for a real bug the manual
 * audit found -- the workout detail modal never moved focus into itself on open, so Escape and
 * the Tab focus trap both silently no-op'd (keydown bubbles from wherever focus actually is,
 * which stayed on the card button behind the overlay, outside the dialog's own DOM subtree).
 * Not caught by axe-core (focus management isn't something it tests) or any existing jsdom
 * component test.
 */
test.describe('Workout detail modal keyboard behavior', () => {
	test.beforeEach(async ({ page }) => {
		await seedCookieConsent(page);
		await page.goto('/workouts');
		await fillRaceResult(page, { time: '22:00', mileageKm: '50' });
	});

	async function openFirstCardModal(page: import('@playwright/test').Page) {
		await page.locator('section button[type="button"]').first().click();
		await expect(page.getByRole('dialog')).toBeVisible();
	}

	test('opening the modal moves focus inside it (regression)', async ({ page }) => {
		await openFirstCardModal(page);
		const focusInsideDialog = await page.evaluate(() => {
			const dialog = document.querySelector('[role="dialog"]');
			return dialog ? dialog.contains(document.activeElement) : false;
		});
		expect(focusInsideDialog).toBe(true);
	});

	test('Escape closes the modal (regression)', async ({ page }) => {
		await openFirstCardModal(page);
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).not.toBeVisible();
	});

	test('closing via Escape returns focus to the triggering card, not <body> (regression)', async ({ page }) => {
		await openFirstCardModal(page);
		await page.keyboard.press('Escape');
		await page.waitForTimeout(100);
		const activeTag = await page.evaluate(() => document.activeElement?.tagName);
		expect(activeTag).toBe('BUTTON');
	});

	test('Tab cycles focus within the modal rather than escaping into the underlying page (focus trap)', async ({
		page
	}) => {
		await openFirstCardModal(page);
		let leftDialog = false;
		for (let i = 0; i < 20; i++) {
			await page.keyboard.press('Tab');
			const inDialog = await page.evaluate(() => {
				const dialog = document.querySelector('[role="dialog"]');
				return dialog ? dialog.contains(document.activeElement) : false;
			});
			if (!inDialog) {
				leftDialog = true;
				break;
			}
		}
		expect(leftDialog).toBe(false);
	});

	test('the close (X) button and bottom Close button both close the modal', async ({ page }) => {
		await openFirstCardModal(page);
		await page.getByRole('button', { name: 'Close modal' }).click();
		await expect(page.getByRole('dialog')).not.toBeVisible();

		await openFirstCardModal(page);
		await page.getByRole('button', { name: 'Close', exact: true }).click();
		await expect(page.getByRole('dialog')).not.toBeVisible();
	});
});
