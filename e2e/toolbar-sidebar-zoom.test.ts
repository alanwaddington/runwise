import { test, expect } from '@playwright/test';

const toolPages = [
	{ path: '/pace', title: 'Pace Calculator' },
	{ path: '/race-predictor', title: 'Race Predictor' },
	{ path: '/training-paces', title: 'Training Paces' },
	{ path: '/hr-zones', title: 'HR Zones' },
	{ path: '/vo2max', title: 'VO2 Max' },
	{ path: '/parkrun', title: 'Parkrun' }
];

/**
 * Rewritten during #100 Phase 3's pr-reviewer follow-up (issue #108). The original assertion --
 * sidebar.top === header.bottom, within 5px, at scroll position 0 -- never actually matched this
 * layout: <main> has a 48px `py-12` gap between the header and page content (by design, scaling
 * with zoom exactly as measured: 48px -> 52.8px -> 60px at 100/110/125%), and <header> has never
 * been position:sticky/fixed in this project's history (confirmed via `git log -p`), so it simply
 * scrolls away with the page rather than staying pinned. Neither of those things is a bug.
 *
 * The tests only ever "passed" because an unrelated bug (`page.goto(\`${page.url()}...\`)`, using
 * page.url() before any navigation had happened -- always "about:blank" -- producing an invalid
 * URL) made every assertion after the very first test time out at the locator stage before ever
 * reaching the alignment check.
 *
 * The real property worth guarding -- and the one issue #54 actually cared about ("ads/affiliate
 * links overlap[ping] header") -- is that the sticky sidebar never visually overlaps the header,
 * at any scroll position or zoom level. Since the header isn't fixed, this holds trivially once
 * scrolled past the header entirely; the only real-risk window is the transition zone where the
 * sidebar's sticky positioning first engages. These tests sweep that zone directly instead of
 * checking one specific (and, for this layout, structurally guaranteed-mismatched) scroll offset.
 */
function noOverlap(headerBottom: number, sidebarTop: number): boolean {
	// A small tolerance for sub-pixel rounding at fractional zoom levels (e.g. 110%) -- not a
	// re-introduction of the old test's loose alignment tolerance, just float rounding slack.
	return sidebarTop >= headerBottom - 1;
}

test.describe('ToolLayout sidebar never overlaps the header, across scroll positions and zoom levels', () => {
	test.beforeEach(async ({ page }) => {
		// Ensure viewport is large enough for lg breakpoint (1024px+)
		await page.setViewportSize({ width: 1280, height: 720 });
	});

	for (const toolPage of toolPages) {
		test.describe(`${toolPage.title} (${toolPage.path})`, () => {
			for (const zoomPercent of [100, 110, 125]) {
				test(`sidebar_neverOverlapsHeader_at${zoomPercent}PercentZoom`, async ({ page }) => {
					await page.goto(toolPage.path);
					await page.evaluate((z) => {
						document.documentElement.style.zoom = `${z}%`;
					}, zoomPercent);
					await page.waitForTimeout(100);

					// Sweep from the top of the page through the sidebar's sticky-engage transition
					// and a bit beyond -- the only window where overlap is structurally possible.
					for (let scrollY = 0; scrollY <= 400; scrollY += 40) {
						await page.evaluate((y) => window.scrollTo(0, y), scrollY);
						await page.waitForTimeout(30);

						const { headerBottom, sidebarTop } = await page.evaluate(() => {
							const header = document.querySelector('header');
							const aside = document.querySelector('aside');
							return {
								headerBottom: header?.getBoundingClientRect().bottom ?? 0,
								sidebarTop: aside?.getBoundingClientRect().top ?? 0
							};
						});

						expect(
							noOverlap(headerBottom, sidebarTop),
							`at scrollY=${scrollY}, zoom=${zoomPercent}%: header bottom ${headerBottom} vs sidebar top ${sidebarTop}`
						).toBe(true);
					}
				});
			}
		});
	}
});
