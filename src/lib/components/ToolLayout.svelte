<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** The tool's name, rendered as the page heading. */
		title: string;
		/** A short explanation of what the tool does. */
		description: string;
		/** Override the default "{title} | Runwise" document title. */
		pageTitle?: string;
		/** The tool's input/result content, rendered inside the bordered card. */
		children?: Snippet;
	}

	let { title, description, pageTitle, children }: Props = $props();
</script>

<svelte:head>
	<title>{pageTitle ?? `${title} | Runwise`}</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
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
