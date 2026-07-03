import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Home from './+page.svelte';
import Pace from './pace/+page.svelte';
import RacePredictor from './race-predictor/+page.svelte';
import TrainingPaces from './training-paces/+page.svelte';
import HrZones from './hr-zones/+page.svelte';
import Vo2max from './vo2max/+page.svelte';
import Parkrun from './parkrun/+page.svelte';
import { BASE_URL, PAGES } from '$lib/seo';

afterEach(() => {
	cleanup();
});

const pages = [
	{ component: Pace, route: '/pace' },
	{ component: RacePredictor, route: '/race-predictor' },
	{ component: TrainingPaces, route: '/training-paces' },
	{ component: HrZones, route: '/hr-zones' },
	{ component: Vo2max, route: '/vo2max' },
	{ component: Parkrun, route: '/parkrun' }
];

describe('SEO integration for /', () => {
	it('setsDocumentTitle_toConfiguredPageTitle', () => {
		render(Home);
		expect(document.title).toBe(PAGES['/'].title);
	});

	it('rendersCanonicalLink_matchingRoute', () => {
		render(Home);
		const link = document.querySelector('link[rel="canonical"]');
		expect(link?.getAttribute('href')).toBe(BASE_URL);
	});

	it('rendersOgImage_matchingConfiguredImage', () => {
		render(Home);
		const meta = document.querySelector('meta[property="og:image"]');
		expect(meta?.getAttribute('content')).toBe(`${BASE_URL}${PAGES['/'].ogImage}`);
	});

	it('rendersMetaDescription_matchingConfiguredDescription', () => {
		render(Home);
		const meta =
			document.querySelector('meta[property="og:description"]') ??
			document.querySelector('meta[name="description"]');
		expect(meta?.getAttribute('content')).toBe(PAGES['/'].description);
	});
});

describe.each(pages)('SEO integration for $route', ({ component, route }) => {
	it('setsDocumentTitle_toConfiguredPageTitle', () => {
		render(component);
		expect(document.title).toBe(PAGES[route].title);
	});

	it('rendersCanonicalLink_matchingRoute', () => {
		render(component);
		const link = document.querySelector('link[rel="canonical"]');
		expect(link?.getAttribute('href')).toBe(`${BASE_URL}${route}`);
	});

	it('rendersOgImage_matchingConfiguredImage', () => {
		render(component);
		const meta = document.querySelector('meta[property="og:image"]');
		expect(meta?.getAttribute('content')).toBe(`${BASE_URL}${PAGES[route].ogImage}`);
	});

	it('rendersMetaDescription_matchingConfiguredDescription', () => {
		render(component);
		const meta =
			document.querySelector('meta[property="og:description"]') ??
			document.querySelector('meta[name="description"]');
		expect(meta?.getAttribute('content')).toBe(PAGES[route].description);
	});
});

describe('Tool page titles', () => {
	it.each(pages)('$route title uses pipe separator, not em-dash', ({ route }) => {
		expect(PAGES[route].title).toMatch(/ \| Runwise$/);
		expect(PAGES[route].title).not.toContain('—');
	});
});
