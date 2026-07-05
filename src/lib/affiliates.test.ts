import { describe, it, expect } from 'vitest';
import { getAffiliateLinks, AFFILIATE_LINKS, type AffiliateProduct } from './affiliates';

const TOOL_ROUTES = ['/pace', '/race-predictor', '/training-paces', '/hr-zones', '/vo2max', '/parkrun'];

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
				expect(product.program, `${route} product missing program`).toMatch(/^(amazon|garmin)$/);
				expect(product.tag, `${route} product missing tag`).toBeTruthy();
			}
		}
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
