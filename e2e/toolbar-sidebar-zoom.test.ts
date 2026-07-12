import { test, expect } from '@playwright/test';

const toolPages = [
	{ path: '/pace', title: 'Pace Calculator' },
	{ path: '/race-predictor', title: 'Race Predictor' },
	{ path: '/training-paces', title: 'Training Paces' },
	{ path: '/hr-zones', title: 'HR Zones' },
	{ path: '/vo2max', title: 'VO2 Max' },
	{ path: '/parkrun', title: 'Parkrun' }
];

test.describe('ToolLayout sidebar alignment at different zoom levels', () => {
	test.beforeEach(async ({ page }) => {
		// Ensure viewport is large enough for lg breakpoint (1024px+)
		await page.setViewportSize({ width: 1280, height: 720 });
	});

	for (const toolPage of toolPages) {
		test.describe(`${toolPage.title} (${toolPage.path})`, () => {
			test('sidebar_alignsWithHeaderBottom_at100PercentZoom', async ({ page }) => {
				await page.goto(`${page.url()}${toolPage.path}`);
				await page.evaluate(() => window.scrollTo(0, 0));

				const headerBox = await page.locator('header').boundingBox();
				const sidebarBox = await page.locator('aside').boundingBox();

				expect(headerBox).toBeTruthy();
				expect(sidebarBox).toBeTruthy();

				if (headerBox && sidebarBox) {
					// Sidebar top should be at header bottom (within 5px tolerance for rounding)
					const headerBottom = (headerBox.y ?? 0) + (headerBox.height ?? 0);
					const sidebarTop = sidebarBox.y ?? 0;
					expect(Math.abs(sidebarTop - headerBottom)).toBeLessThan(5);
				}
			});

			test('sidebar_alignsWithHeaderBottom_at110PercentZoom', async ({ page }) => {
				await page.goto(`${page.url()}${toolPage.path}`);

				// Set zoom to 110%
				await page.evaluate(() => {
					document.documentElement.style.zoom = '110%';
				});

				await page.evaluate(() => window.scrollTo(0, 0));
				await page.waitForTimeout(100);

				const headerBox = await page.locator('header').boundingBox();
				const sidebarBox = await page.locator('aside').boundingBox();

				expect(headerBox).toBeTruthy();
				expect(sidebarBox).toBeTruthy();

				if (headerBox && sidebarBox) {
					const headerBottom = (headerBox.y ?? 0) + (headerBox.height ?? 0);
					const sidebarTop = sidebarBox.y ?? 0;
					expect(Math.abs(sidebarTop - headerBottom)).toBeLessThan(5);
				}
			});

			test('sidebar_alignsWithHeaderBottom_at125PercentZoom', async ({ page }) => {
				await page.goto(`${page.url()}${toolPage.path}`);

				// Set zoom to 125%
				await page.evaluate(() => {
					document.documentElement.style.zoom = '125%';
				});

				await page.evaluate(() => window.scrollTo(0, 0));
				await page.waitForTimeout(100);

				const headerBox = await page.locator('header').boundingBox();
				const sidebarBox = await page.locator('aside').boundingBox();

				expect(headerBox).toBeTruthy();
				expect(sidebarBox).toBeTruthy();

				if (headerBox && sidebarBox) {
					const headerBottom = (headerBox.y ?? 0) + (headerBox.height ?? 0);
					const sidebarTop = sidebarBox.y ?? 0;
					expect(Math.abs(sidebarTop - headerBottom)).toBeLessThan(5);
				}
			});
		});
	}

	test('sidebar_noOverlapWithHeader_acrossAllPagesAndZooms', async ({ page }) => {
		for (const toolPage of toolPages) {
			await page.goto(`${page.url()}${toolPage.path}`);
			await page.evaluate(() => window.scrollTo(0, 0));

			for (const zoom of [100, 110, 125]) {
				await page.evaluate((z: number) => {
					document.documentElement.style.zoom = `${z}%`;
				}, zoom);

				await page.waitForTimeout(50);

				const headerBottom = await page.evaluate(() => {
					const header = document.querySelector('header');
					return header?.getBoundingClientRect().bottom ?? 0;
				});

				const sidebarTop = await page.evaluate(() => {
					const sidebar = document.querySelector('aside');
					return sidebar?.getBoundingClientRect().top ?? 0;
				});

				// Sidebar should not overlap header (sidebarTop >= headerBottom - small tolerance)
				expect(sidebarTop).toBeGreaterThanOrEqual(headerBottom - 5);
			}
		}
	});
});
