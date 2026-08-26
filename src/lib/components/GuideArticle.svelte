<script lang="ts">
	import type { GuideContent } from '$lib/content/guides';

	interface Props {
		guide: GuideContent;
	}

	let { guide }: Props = $props();
</script>

<a
	href="/guides"
	class="rounded-sm text-sm text-muted transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
>
	← All guides
</a>

<h1 class="mt-4 text-2xl font-bold text-ink md:text-3xl">{guide.title}</h1>

<p class="mt-4 text-base leading-relaxed text-muted">{guide.intro}</p>

<div class="mt-4 rounded-r-lg border-l-2 border-accent bg-accent/10 px-4 py-3">
	<p class="text-sm text-ink">
		Sourced from: <span class="font-semibold">{guide.sourcesCredited.join(', ')}</span>
	</p>
</div>

<div class="mt-10 space-y-8">
	{#each guide.sections as section (section.heading)}
		<div>
			<h2 class="text-xl font-semibold text-ink">{section.heading}</h2>
			<p class="mt-2 leading-relaxed text-muted">{section.body}</p>
		</div>
	{/each}
</div>

<div class="mt-12 border-t border-gray-200 pt-6 dark:border-gray-700">
	<a
		href="/guides"
		class="rounded-sm text-sm text-muted transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
	>
		← Back to all guides
	</a>
</div>
