import { describe, it, expect } from 'vitest';
import { getAffiliateLinks, AFFILIATE_LINKS, type AffiliateProduct } from './affiliates';
import { PAGES } from './seo';

// Derived from PAGES rather than hardcoded so every new tool route automatically requires
// affiliate links without needing a matching edit here — mirrors seo.test.ts's TOOL_ROUTES
// derivation and home-page.test.ts's card-count guard (PR #90 review finding M2). A hardcoded
// list here previously went stale and silently missed /workouts having no affiliate entry at
// all, unlike every other tool page.
const TOOL_ROUTES = Object.keys(PAGES).filter((route) => route !== '/' && route !== '/privacy');

describe('AFFILIATE_LINKS config', () => {
	it('AFFILIATE_LINKS_everyToolRoute_hasAtLeastOneProduct', () => {
		for (const route of TOOL_ROUTES) {
			expect(AFFILIATE_LINKS[route], `missing affiliate links for ${route}`).toBeDefined();
			expect(AFFILIATE_LINKS[route].length, `${route} has no products`).toBeGreaterThan(0);
		}
	});

	it('AFFILIATE_LINKS_everyProduct_hasAllRequiredFields', () => {
		for (const route of TOOL_ROUTES) {
			for (const product of AFFILIATE_LINKS[route]) {
				expect(product.name, `${route} product missing name`).toBeTruthy();
				expect(product.description, `${route} product missing description`).toBeTruthy();
				expect(product.url, `${route} product missing url`).toBeTruthy();
				expect(product.program, `${route} product missing program`).toMatch(
					/^(amazon|garmin|direct)$/
				);
				if (product.program === 'direct') {
					expect(product.brand, `${route} direct product missing brand`).toBeTruthy();
				} else {
					expect(product.tag, `${route} ${product.program} product missing tag`).toBeTruthy();
				}
			}
		}
	});

	it('AFFILIATE_LINKS_powerZones_strydIsDirectLink', () => {
		const stryd = AFFILIATE_LINKS['/power-zones'].find((p) => p.name.startsWith('Stryd'));
		expect(stryd).toMatchObject({ program: 'direct', brand: 'Stryd' });
		// Exact match, not just a stryd.com prefix -- a prefix check would still
		// pass for a hardcoded region path (e.g. /uk/en/store), silently losing
		// this regression guard. Stryd's own site auto-redirects visitors to
		// their regional store from this URL (verified via curl, #88).
		expect(stryd?.url).toBe('https://www.stryd.com/store');
	});

	it('AFFILIATE_LINKS_everyUrl_isHttps', () => {
		for (const route of TOOL_ROUTES) {
			for (const product of AFFILIATE_LINKS[route]) {
				expect(product.url, `${route} ${product.name} url not https`).toMatch(/^https:\/\//);
			}
		}
	});

	it('AFFILIATE_LINKS_hrZones_allAmazonProducts', () => {
		const hrProducts = AFFILIATE_LINKS['/hr-zones'];
		const allAmazon = hrProducts.every((p) => p.program === 'amazon');
		expect(allAmazon).toBe(true);
	});

	it('AFFILIATE_LINKS_noHomepageEntry', () => {
		expect(AFFILIATE_LINKS['/']).toBeUndefined();
	});

	it('AFFILIATE_LINKS_noPrivacyEntry', () => {
		expect(AFFILIATE_LINKS['/privacy']).toBeUndefined();
	});
});

describe('getAffiliateLinks', () => {
	it('getAffiliateLinks_knownRoute_returnsProducts', () => {
		const links = getAffiliateLinks('/hr-zones');
		expect(links.length).toBeGreaterThan(0);
	});

	it('getAffiliateLinks_unknownRoute_returnsEmptyArray', () => {
		expect(getAffiliateLinks('/')).toEqual([]);
		expect(getAffiliateLinks('/privacy')).toEqual([]);
		expect(getAffiliateLinks('/nonexistent')).toEqual([]);
	});

	it('getAffiliateLinks_paceRoute_returnsAmazonProducts', () => {
		const links = getAffiliateLinks('/pace');
		const amazonProduct = links.find((p) => p.program === 'amazon');
		expect(amazonProduct).toBeDefined();
	});

	it('getAffiliateLinks_returnsImmutableCopy', () => {
		const links1 = getAffiliateLinks('/pace');
		const links2 = getAffiliateLinks('/pace');
		expect(links1).not.toBe(links2);
	});
});

describe('AffiliateProduct type', () => {
	it('AffiliateProduct_programField_acceptsAmazon', () => {
		const product: AffiliateProduct = {
			name: 'Test',
			description: 'Test product',
			url: 'https://amazon.co.uk',
			program: 'amazon',
			tag: 'runwise-21'
		};
		expect(product.program).toBe('amazon');
	});

	it('AffiliateProduct_programField_acceptsGarmin', () => {
		const product: AffiliateProduct = {
			name: 'Test',
			description: 'Test product',
			url: 'https://buy.garmin.com',
			program: 'garmin',
			tag: 'runwise'
		};
		expect(product.program).toBe('garmin');
	});
});
