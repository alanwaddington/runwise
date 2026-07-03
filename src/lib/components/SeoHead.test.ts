import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { BASE_URL, DEFAULT_OG_IMAGE, PAGES } from '$lib/seo';

const mockPublicEnv: { PUBLIC_GOOGLE_SITE_VERIFICATION?: string } = {};

vi.mock('$env/dynamic/public', () => ({
	env: mockPublicEnv
}));

afterEach(() => {
	cleanup();
	delete mockPublicEnv.PUBLIC_GOOGLE_SITE_VERIFICATION;
});

function getMeta(property: string): HTMLMetaElement | null {
	return (
		document.querySelector(`meta[property="${property}"]`) ??
		document.querySelector(`meta[name="${property}"]`)
	);
}

describe('SeoHead', () => {
	it('rendersCanonicalLink_forKnownRoute_pointsToBaseUrlPlusRoute', async () => {
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/pace' } });
		const link = document.querySelector('link[rel="canonical"]');
		expect(link).not.toBeNull();
		expect(link?.getAttribute('href')).toBe(`${BASE_URL}/pace`);
	});

	it('rendersCanonicalLink_forHomeRoute_pointsToBaseUrlWithoutTrailingSlash', async () => {
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/' } });
		const link = document.querySelector('link[rel="canonical"]');
		expect(link?.getAttribute('href')).toBe(BASE_URL);
	});

	it('rendersOgTags_forKnownRoute_matchesPageConfig', async () => {
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/pace' } });
		const page = PAGES['/pace'];
		expect(getMeta('og:title')?.getAttribute('content')).toBe(page.title);
		expect(getMeta('og:description')?.getAttribute('content')).toBe(page.description);
		expect(getMeta('og:url')?.getAttribute('content')).toBe(`${BASE_URL}/pace`);
		expect(getMeta('og:type')?.getAttribute('content')).toBe('website');
		expect(getMeta('og:image')?.getAttribute('content')).toBe(`${BASE_URL}${page.ogImage}`);
		expect(getMeta('og:site_name')?.getAttribute('content')).toBe('Runwise');
	});

	it('rendersTwitterTags_forKnownRoute_matchesPageConfig', async () => {
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/pace' } });
		const page = PAGES['/pace'];
		expect(getMeta('twitter:card')?.getAttribute('content')).toBe('summary_large_image');
		expect(getMeta('twitter:title')?.getAttribute('content')).toBe(page.title);
		expect(getMeta('twitter:description')?.getAttribute('content')).toBe(page.description);
		expect(getMeta('twitter:image')?.getAttribute('content')).toBe(`${BASE_URL}${page.ogImage}`);
	});

	it('rendersJsonLd_forToolRoute_usesWebApplicationType', async () => {
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/pace' } });
		const script = document.querySelector('script[type="application/ld+json"]');
		expect(script).not.toBeNull();
		const json = JSON.parse(script?.textContent ?? '{}');
		expect(json['@type']).toBe('WebApplication');
		expect(json.name).toBe(PAGES['/pace'].title);
		expect(json.url).toBe(`${BASE_URL}/pace`);
		expect(json.applicationCategory).toBe('HealthApplication');
	});

	it('rendersJsonLd_forHomeRoute_usesWebSiteType', async () => {
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/' } });
		const script = document.querySelector('script[type="application/ld+json"]');
		expect(script).not.toBeNull();
		const json = JSON.parse(script?.textContent ?? '{}');
		expect(json['@type']).toBe('WebSite');
	});

	it('rendersOgImage_forToolRouteWithUniqueImage_usesPerToolImage', async () => {
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/parkrun' } });
		expect(getMeta('og:image')?.getAttribute('content')).toBe(
			`${BASE_URL}${PAGES['/parkrun'].ogImage}`
		);
		expect(PAGES['/parkrun'].ogImage).not.toBe(DEFAULT_OG_IMAGE);
	});

	it('rendersWithoutCrashing_forUnknownRoute_fallsBackToDefaults', async () => {
		const { default: SeoHead } = await import('./SeoHead.svelte');
		expect(() => render(SeoHead, { props: { route: '/does-not-exist' } })).not.toThrow();
		const link = document.querySelector('link[rel="canonical"]');
		expect(link?.getAttribute('href')).toBe(`${BASE_URL}/does-not-exist`);
		expect(getMeta('og:image')?.getAttribute('content')).toBe(`${BASE_URL}${DEFAULT_OG_IMAGE}`);
	});
});

describe('SeoHead google-site-verification', () => {
	it('publicEnvVarSet_rendersGoogleSiteVerificationMetaTag', async () => {
		mockPublicEnv.PUBLIC_GOOGLE_SITE_VERIFICATION = 'abc123verificationtoken';
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/' } });
		expect(getMeta('google-site-verification')?.getAttribute('content')).toBe(
			'abc123verificationtoken'
		);
	});

	it('publicEnvVarUnset_doesNotRenderGoogleSiteVerificationMetaTag', async () => {
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/' } });
		expect(getMeta('google-site-verification')).toBeNull();
	});

	it('publicEnvVarEmptyString_doesNotRenderGoogleSiteVerificationMetaTag', async () => {
		mockPublicEnv.PUBLIC_GOOGLE_SITE_VERIFICATION = '';
		const { default: SeoHead } = await import('./SeoHead.svelte');
		render(SeoHead, { props: { route: '/' } });
		expect(getMeta('google-site-verification')).toBeNull();
	});
});
