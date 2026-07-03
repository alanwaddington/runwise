import { execSync } from 'node:child_process';
import type { Plugin } from 'vite';
import { PAGES } from '../seo';

export const GIT_DATES_MODULE_ID = 'virtual:git-dates';
const RESOLVED_GIT_DATES_MODULE_ID = '\0' + GIT_DATES_MODULE_ID;

/** Paths whose changes affect every route's freshness (shared layout/components/utils). */
const SHARED_PATHS = ['src/routes/+layout.svelte', 'src/lib/components', 'src/lib/utils'];

/** Returns the later of two YYYY-MM-DD date strings, or whichever is non-null. */
export function maxDate(a: string | null, b: string | null): string | null {
	if (!a) return b;
	if (!b) return a;
	return a > b ? a : b;
}

/**
 * Computes a lastmod date per route from git-derived route/shared dates.
 * The home page ('/') is set to the max date across all tool routes.
 */
export function computeRouteDates(
	toolRoutes: string[],
	routeDirDates: Record<string, string | null>,
	sharedDate: string | null,
	fallbackDate: string
): Record<string, string> {
	const dates: Record<string, string> = {};

	for (const route of toolRoutes) {
		dates[route] = maxDate(routeDirDates[route] ?? null, sharedDate) ?? fallbackDate;
	}

	dates['/'] =
		Object.values(dates).reduce<string | null>((max, date) => maxDate(max, date), null) ??
		fallbackDate;

	return dates;
}

/** Returns the most recent commit date (YYYY-MM-DD) touching any of the given paths, or null. */
export function getGitDate(paths: string[], cwd: string = process.cwd()): string | null {
	try {
		const output = execSync(`git log -1 --format=%cs -- ${paths.map((path) => `"${path}"`).join(' ')}`, {
			cwd,
			encoding: 'utf-8'
		}).trim();
		return output || null;
	} catch {
		return null;
	}
}

function routeToDir(route: string): string {
	return `src/routes${route}`;
}

/** Vite plugin exposing `virtual:git-dates` — a per-route lastmod date map derived from git history. */
export function gitDatesPlugin(): Plugin {
	return {
		name: 'git-dates',
		resolveId(id) {
			if (id === GIT_DATES_MODULE_ID) return RESOLVED_GIT_DATES_MODULE_ID;
		},
		load(id) {
			if (id !== RESOLVED_GIT_DATES_MODULE_ID) return;

			const toolRoutes = Object.keys(PAGES).filter((route) => route !== '/');
			const fallbackDate = new Date().toISOString().slice(0, 10);

			const routeDirDates: Record<string, string | null> = {};
			for (const route of toolRoutes) {
				routeDirDates[route] = getGitDate([routeToDir(route)]);
			}

			const sharedDate = getGitDate(SHARED_PATHS);
			const routeDates = computeRouteDates(toolRoutes, routeDirDates, sharedDate, fallbackDate);

			return `export const routeDates = ${JSON.stringify(routeDates)};`;
		}
	};
}
