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

	// Note: Design specified an optional sidebar snippet prop for customization, but all 6 tool pages use
	// identical AdUnit + AffiliateLinks content. Hard-coding this avoids unnecessary complexity. If a
	// future tool page needs a custom sidebar, the snippet prop can be added then without breaking changes.

	let { title, description, route, children }: Props = $props();
</script>

<div class="lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-8">
	<div class="min-w-0">
		<a
			href="/"
			class="rounded-sm text-sm text-muted transition-colors hover:text-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			← All tools
		</a>

		<h1 class="mt-4 text-2xl font-bold text-ink md:text-3xl">{title}</h1>
		<p class="mt-2 text-muted">{description}</p>

		<div class="mt-8 rounded-2xl border border-gray-200 bg-bg p-6 dark:border-gray-700">
			{@render children?.()}
		</div>
	</div>

	<aside class="mt-8 lg:mt-0 lg:sticky-with-header-offset print:hidden">
		<AdUnit />
		<AffiliateLinks {route} />
	</aside>
</div>
