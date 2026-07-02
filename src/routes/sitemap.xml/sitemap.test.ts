import { describe, it, expect } from 'vitest';
import { GET } from './+server';
import { BASE_URL, PAGES } from '$lib/seo';

const ALL_ROUTES = Object.keys(PAGES);

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
