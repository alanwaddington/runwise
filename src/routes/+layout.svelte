<script>
	import '../app.css';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<CookieBanner />

<header class="border-b border-gray-200 bg-bg">
	<SiteNav />
</header>

<main class="mx-auto max-w-5xl px-4 py-12">
	{@render children()}
</main>

<SiteFooter />
