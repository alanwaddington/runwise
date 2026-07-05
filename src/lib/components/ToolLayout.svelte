<script lang="ts">
	import type { Snippet } from 'svelte';
	import AdUnit from '$lib/components/AdUnit.svelte';
	import AffiliateLinks from '$lib/components/AffiliateLinks.svelte';

	interface Props {
		/** The tool's name, rendered as the page heading. */
		title: string;
		/** A short explanation of what the tool does. */
		description: string;
		/** The route path for this tool page, used to look up affiliate links. */
		route: string;
		/** The tool's input/result content, rendered inside the bordered card. */
		children?: Snippet;
	}

	let { title, description, route, children }: Props = $props();
</script>

<div class="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-8">
	<div class="min-w-0">
		<a
			href="/"
			class="rounded-sm text-sm text-gray-500 transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			← All tools
		</a>

		<h1 class="mt-4 text-2xl font-bold text-ink md:text-3xl">{title}</h1>
		<p class="mt-2 text-gray-600 dark:text-gray-400">{description}</p>

		<div class="mt-8 rounded-2xl border border-gray-200 bg-bg p-6 dark:border-gray-700">
			{@render children?.()}
		</div>
	</div>

	<aside class="lg:sticky lg:top-24 print:hidden">
		<AdUnit />
		<AffiliateLinks {route} />
	</aside>
</div>
