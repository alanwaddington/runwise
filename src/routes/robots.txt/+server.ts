import { BASE_URL } from '$lib/seo';

export function GET() {
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain'
		}
	});
}
