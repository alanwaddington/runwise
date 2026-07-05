<script lang="ts">
	import { page } from '$app/state';

	let status = $derived(page.status);
	let isNotFound = $derived(status === 404);
	let heading = $derived(isNotFound ? 'Page not found' : 'Something went wrong');
	let message = $derived(
		isNotFound
			? "This page doesn't exist. Check the link, or head back to the tools."
			: (page.error?.message ?? 'An unexpected error occurred.')
	);
</script>

<svelte:head>
	<title>{status} | Runwise</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<a
		href="/"
		class="rounded-sm text-sm text-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
	>
		← All tools
	</a>

	<h1 class="mt-4 text-2xl font-bold text-ink md:text-3xl">{status}</h1>
	<p class="mt-2 text-muted dark:text-gray-400">{heading}. {message}</p>
</div>
