import { describe, it, expect } from 'vitest';
import { GET } from './+server';
import { BASE_URL, PAGES } from '$lib/seo';
import { routeDates } from 'virtual:git-dates';

const ALL_ROUTES = Object.keys(PAGES);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function extractLastmods(body: string): string[] {
	return [...body.matchAll(/<lastmod>(.+?)<\/lastmod>/g)].map((match) => match[1]);
}

describe('GET /sitemap.xml', () => {
	it('respondsWithXmlContentType', async () => {
		const response = await GET();
		expect(response.headers.get('Content-Type')).toBe('application/xml');
	});

	it('respondsWithValidXmlDeclaration', async () => {
		const response = await GET();
		const body = await response.text();
		expect(body.trim().startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
	});

	it('includesUrlsetRootElement', async () => {
		const response = await GET();
		const body = await response.text();
		expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(body).toContain('</urlset>');
	});

	it('includesEveryPageFromSeoConfig', async () => {
		const response = await GET();
		const body = await response.text();
		for (const route of ALL_ROUTES) {
			const url = route === '/' ? BASE_URL : `${BASE_URL}${route}`;
			expect(body).toContain(`<loc>${url}</loc>`);
		}
	});

	it('includesLastmodForEachPage', async () => {
		const response = await GET();
		const body = await response.text();
		const lastmods = extractLastmods(body);
		expect(lastmods).toHaveLength(ALL_ROUTES.length);
	});

	it('everyLastmod_isAValidIso8601Date', async () => {
		const response = await GET();
		const body = await response.text();
		for (const lastmod of extractLastmods(body)) {
			expect(lastmod).toMatch(ISO_DATE_PATTERN);
			expect(Number.isNaN(new Date(lastmod).getTime())).toBe(false);
		}
	});

	it('eachRoute_usesItsOwnGitDerivedLastmod', async () => {
		const response = await GET();
		const body = await response.text();
		for (const route of ALL_ROUTES) {
			const url = route === '/' ? BASE_URL : `${BASE_URL}${route}`;
			expect(body).toContain(
				`<loc>${url}</loc>\n\t\t<lastmod>${routeDates[route]}</lastmod>`
			);
		}
	});

	it('homePage_lastmodEqualsMaxDateAcrossAllRoutes', async () => {
		const response = await GET();
		const body = await response.text();
		const lastmods = extractLastmods(body);
		const maxDate = lastmods.reduce((max, date) => (date > max ? date : max));
		expect(routeDates['/']).toBe(maxDate);
	});

	it('includesChangefreqAndPriorityForEachPage', async () => {
		const response = await GET();
		const body = await response.text();
		for (const route of ALL_ROUTES) {
			const { changefreq, priority } = PAGES[route];
			expect(body).toContain(`<changefreq>${changefreq}</changefreq>`);
			expect(body).toContain(`<priority>${priority}</priority>`);
		}
	});
});
