import { describe, it, expect } from 'vitest';
import { GET } from './+server';
import { BASE_URL } from '$lib/seo';

describe('GET /robots.txt', () => {
	it('respondsWithPlainTextContentType', async () => {
		const response = await GET();
		expect(response.headers.get('Content-Type')).toBe('text/plain');
	});

	it('allowsAllUserAgents', async () => {
		const response = await GET();
		const body = await response.text();
		expect(body).toContain('User-agent: *');
		expect(body).toContain('Allow: /');
	});

	it('referencesTheSitemap', async () => {
		const response = await GET();
		const body = await response.text();
		expect(body).toContain(`Sitemap: ${BASE_URL}/sitemap.xml`);
	});
});
