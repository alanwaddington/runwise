import { test, expect } from '@playwright/test';
import { seedCookieConsent } from './helpers';

/**
 * #110 AC-3/AC-4/AC-5: real-browser coverage of the /about contact form, complementing the
 * Vitest unit tests for ContactForm.svelte and the /api/contact endpoint. Network calls are
 * intercepted via page.route so this suite never hits the real Resend API.
 */
test.describe('/about contact form', () => {
	test.beforeEach(async ({ page }) => {
		await seedCookieConsent(page);
		await page.goto('/about');
	});

	test('happy path: fill and submit shows a success message', async ({ page }) => {
		await page.route('**/api/contact', async (route) => {
			await route.fulfill({ status: 200, json: { ok: true } });
		});

		await page.getByLabel('Name').fill('Jamie Runner');
		await page.getByLabel('Email').fill('jamie@example.com');
		await page.getByLabel('Message').fill('Love the pace calculator, thanks!');
		await page.getByRole('button', { name: 'Send message' }).click();

		await expect(page.getByText(/message sent/i)).toBeVisible();
	});

	test('server error response shows an inline alert and keeps field values', async ({ page }) => {
		await page.route('**/api/contact', async (route) => {
			await route.fulfill({
				status: 429,
				json: { error: 'Too many requests. Please try again later.' }
			});
		});

		await page.getByLabel('Name').fill('Jamie Runner');
		await page.getByLabel('Email').fill('jamie@example.com');
		await page.getByLabel('Message').fill('Love the pace calculator, thanks!');
		await page.getByRole('button', { name: 'Send message' }).click();

		await expect(page.getByRole('alert')).toHaveText('Too many requests. Please try again later.');
		await expect(page.getByLabel('Name')).toHaveValue('Jamie Runner');
	});

	test('submitting with empty fields shows validation errors and never calls the API', async ({ page }) => {
		let apiCalled = false;
		await page.route('**/api/contact', async (route) => {
			apiCalled = true;
			await route.fulfill({ status: 200, json: { ok: true } });
		});

		await page.getByRole('button', { name: 'Send message' }).click();

		await expect(page.getByText('Name is required.')).toBeVisible();
		expect(apiCalled).toBe(false);
	});

	test('no email address is present in visible text or a mailto: link', async ({ page }) => {
		const visibleText = await page.locator('body').innerText();
		expect(visibleText).not.toMatch(/[^\s@]+@[^\s@]+\.[^\s@]+/);
		expect(await page.locator('a[href^="mailto:"]').count()).toBe(0);
	});
});
