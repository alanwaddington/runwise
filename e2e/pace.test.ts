import { test, expect } from '@playwright/test';

test.describe('Pace Calculator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/pace');
	});

	test('has correct page title', async ({ page }) => {
		await expect(page).toHaveTitle('Pace Calculator — Runwise');
	});

	test('typing 5:30 in min/km updates min/mile and km/h', async ({ page }) => {
		await page.fill('#pace-minkm', '5:30');
		await expect(page.locator('#pace-minmile')).toHaveValue('8:51');
		await expect(page.locator('#pace-kmh')).toHaveValue('10.9');
	});

	test('typing 10.9 in km/h updates min/km and min/mile', async ({ page }) => {
		await page.fill('#pace-kmh', '10.9');
		await expect(page.locator('#pace-minkm')).toHaveValue('5:30');
	});

	test('shows mph, per 400m, per 800m outputs for 5:30/km', async ({ page }) => {
		await page.fill('#pace-minkm', '5:30');
		await expect(page.getByText('6.8')).toBeVisible();
		await expect(page.getByText('2:12')).toBeVisible();
		await expect(page.getByText('4:24')).toBeVisible();
	});

	test('clearing input resets all outputs to em-dash', async ({ page }) => {
		await page.fill('#pace-minkm', '5:30');
		await page.fill('#pace-minkm', '');
		await expect(page.locator('#pace-minmile')).toHaveValue('');
		const dashes = page.getByText('—');
		await expect(dashes).toHaveCount(3);
	});

	test('invalid input does not crash', async ({ page }) => {
		await page.fill('#pace-minkm', 'abc');
		const dashes = page.getByText('—');
		await expect(dashes).toHaveCount(3);
	});
});
