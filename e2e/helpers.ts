import type { Page } from '@playwright/test';

/**
 * Skips the cookie-consent banner by seeding a "necessary only" choice before the app boots —
 * same pattern already used ad-hoc in verifier-runwise's own Playwright recipes and in
 * collapsible-field-focus.test.ts. Call before page.goto().
 */
export async function seedCookieConsent(page: Page): Promise<void> {
	await page.addInitScript(() =>
		localStorage.setItem('cookie-consent', JSON.stringify({ categories: ['necessary'], timestamp: 0 }))
	);
}

export interface RaceResultInput {
	time: string;
	mileageKm: string;
	/** ISO date string (YYYY-MM-DD). Omit to leave the race date field empty. */
	raceDateISO?: string;
}

/**
 * Fills the Pace-mode race result + weekly mileage inputs shared across Pace, Race-Prep, and
 * (indirectly, via the same shared fields) HR/Power mode's mileage input. Assumes the page is
 * already on /workouts and Pace mode is selected (the default on load).
 */
export async function fillRaceResult(page: Page, { time, mileageKm, raceDateISO }: RaceResultInput): Promise<void> {
	await page.fill('#race-time', time);
	await page.fill('#weekly-mileage', mileageKm);
	if (raceDateISO) {
		await page.fill('#race-date', raceDateISO);
	}
}

export type WorkoutsMode = 'Pace' | 'Power' | 'HR' | 'Race-Prep';

/** Switches the top-level Pace/Power/HR/Race-Prep tab. Race-Prep must already be eligible (a
 *  valid 4-8-week-out race date entered) or its tab won't exist. */
export async function switchWorkoutsMode(page: Page, mode: WorkoutsMode): Promise<void> {
	await page.getByRole('tab', { name: mode, exact: true }).click();
}

/** An ISO date string a given number of days from now, for feeding into fillRaceResult's
 *  raceDateISO -- Race-Prep eligibility is 4-8 weeks (28-56 days) out. */
export function isoDateDaysFromNow(days: number): string {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}
