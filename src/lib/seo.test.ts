import { describe, it, expect } from 'vitest';
import { BASE_URL, SITE_NAME, DEFAULT_OG_IMAGE, PAGES } from './seo';

const TOOL_ROUTES = ['/pace', '/race-predictor', '/training-paces', '/hr-zones', '/vo2max', '/parkrun'];
const ALL_ROUTES = ['/', ...TOOL_ROUTES];

const TARGET_KEYWORDS: Record<string, string> = {
	'/pace': 'pace calculator',
	'/race-predictor': 'race time predictor',
	'/training-paces': 'training pace calculator',
	'/hr-zones': 'heart rate zone calculator',
	'/vo2max': 'VO2 max calculator',
	'/parkrun': 'parkrun predictor'
};

describe('seo config constants', () => {
	it('BASE_URL_isDefined_pointsToProductionDomain', () => {
		expect(BASE_URL).toBe('https://runwise.app');
		expect(BASE_URL).toMatch(/^https:\/\//);
	});

	it('SITE_NAME_isDefined_equalsRunwise', () => {
		expect(SITE_NAME).toBe('Runwise');
	});

	it('DEFAULT_OG_IMAGE_isDefined_pointsToSharedOgImage', () => {
		expect(DEFAULT_OG_IMAGE).toBe('/og/og-default.png');
	});
});

describe('PAGES config', () => {
	it('PAGES_everyRoute_hasAllRequiredFields', () => {
		for (const route of ALL_ROUTES) {
			const page = PAGES[route];
			expect(page, `missing PAGES entry for ${route}`).toBeDefined();
			expect(page.title).toBeTruthy();
			expect(page.description).toBeTruthy();
			expect(page.ogImage).toBeTruthy();
			expect(page.changefreq).toBeTruthy();
			expect(typeof page.priority).toBe('number');
		}
	});

	it('PAGES_everyDescription_isBetween150And160Characters', () => {
		for (const route of ALL_ROUTES) {
			const { description } = PAGES[route];
			expect(
				description.length,
				`${route} description is ${description.length} chars: "${description}"`
			).toBeGreaterThanOrEqual(150);
			expect(
				description.length,
				`${route} description is ${description.length} chars: "${description}"`
			).toBeLessThanOrEqual(160);
		}
	});

	it('PAGES_everyToolDescription_containsPrimaryKeyword', () => {
		for (const route of TOOL_ROUTES) {
			const { description } = PAGES[route];
			expect(
				description.toLowerCase(),
				`${route} description missing keyword "${TARGET_KEYWORDS[route]}"`
			).toContain(TARGET_KEYWORDS[route].toLowerCase());
		}
	});

	it('PAGES_everyToolRoute_hasWebApplicationJsonLdType', () => {
		for (const route of TOOL_ROUTES) {
			expect(PAGES[route].jsonLdType).toBe('WebApplication');
		}
	});

	it('PAGES_homeRoute_hasWebSiteJsonLdType', () => {
		expect(PAGES['/'].jsonLdType).toBe('WebSite');
	});

	it('PAGES_homeRoute_usesDefaultOgImage', () => {
		expect(PAGES['/'].ogImage).toBe(DEFAULT_OG_IMAGE);
	});

	it('PAGES_everyToolRoute_hasUniqueOgImagePath', () => {
		const images = TOOL_ROUTES.map((route) => PAGES[route].ogImage);
		expect(new Set(images).size).toBe(images.length);
		for (const image of images) {
			expect(image).not.toBe(DEFAULT_OG_IMAGE);
			expect(image).toMatch(/^\/og\/og-.+\.png$/);
		}
	});

	it('PAGES_everyTitle_usesPipeSeparator', () => {
		for (const route of TOOL_ROUTES) {
			expect(PAGES[route].title).toMatch(/ \| Runwise$/);
			expect(PAGES[route].title).not.toContain('—');
		}
	});
});
