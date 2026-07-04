<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { BASE_URL, SITE_NAME, DEFAULT_OG_IMAGE, PAGES } from '$lib/seo';

	interface Props {
		route: string;
	}

	let { route }: Props = $props();

	let page = $derived(
		PAGES[route] ?? {
			title: SITE_NAME,
			description: '',
			ogImage: DEFAULT_OG_IMAGE,
			jsonLdType: 'WebApplication' as const,
			changefreq: 'monthly',
			priority: 0.5
		}
	);

	let canonicalUrl = $derived(route === '/' ? BASE_URL : `${BASE_URL}${route}`);
	let ogImageUrl = $derived(`${BASE_URL}${page.ogImage}`);

	let jsonLd = $derived(
		page.jsonLdType === 'WebSite'
			? {
					'@context': 'https://schema.org',
					'@type': 'WebSite',
					name: page.title,
					url: canonicalUrl
				}
			: {
					'@context': 'https://schema.org',
					'@type': 'WebApplication',
					name: page.title,
					description: page.description,
					url: canonicalUrl,
					applicationCategory: 'HealthApplication'
				}
	);

	let jsonLdScript = $derived(
		`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}<${''}/script>`
	);
</script>

<svelte:head>
	<title>{page.title}</title>
	<meta name="description" content={page.description} />
	<link rel="canonical" href={canonicalUrl} />

	{#if env.PUBLIC_GOOGLE_SITE_VERIFICATION}
		<meta name="google-site-verification" content={env.PUBLIC_GOOGLE_SITE_VERIFICATION} />
	{/if}

	{#if env.PUBLIC_GOOGLE_ADSENSE_ACCOUNT}
		<meta name="google-adsense-account" content={env.PUBLIC_GOOGLE_ADSENSE_ACCOUNT} />
	{/if}

	<meta property="og:title" content={page.title} />
	<meta property="og:description" content={page.description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:site_name" content={SITE_NAME} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={page.title} />
	<meta name="twitter:description" content={page.description} />
	<meta name="twitter:image" content={ogImageUrl} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- jsonLdScript is built from trusted internal config, not user input -->
	{@html jsonLdScript}
</svelte:head>
