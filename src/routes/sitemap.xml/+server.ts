import { BASE_URL, PAGES } from '$lib/seo';

export function GET() {
	const urls = Object.entries(PAGES)
		.map(([route, page]) => {
			const url = route === '/' ? BASE_URL : `${BASE_URL}${route}`;
			return `\t<url>\n\t\t<loc>${url}</loc>\n\t\t<changefreq>${page.changefreq}</changefreq>\n\t\t<priority>${page.priority}</priority>\n\t</url>`;
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
