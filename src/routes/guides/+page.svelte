<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { GUIDES } from '$lib/content/guides';
</script>

<SeoHead route="/guides" />

<div class="mx-auto max-w-2xl">
	<a
		href="/"
		class="rounded-sm text-sm text-muted transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
	>
		← Home
	</a>

	<h1 class="mt-4 text-2xl font-bold text-ink md:text-3xl">Guides</h1>
	<p class="mt-2 text-muted">
		In-depth articles expanding on the methodology behind Runwise's calculators.
	</p>

	<div class="mt-8 space-y-4">
		{#each GUIDES as guide (guide.slug)}
			<a
				href={guide.route}
				class="block rounded-lg border border-gray-300 p-5 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:border-gray-700"
			>
				<h2 class="text-lg font-semibold text-ink">{guide.title}</h2>
				<p class="mt-1.5 text-sm text-muted">{guide.excerpt}</p>
			</a>
		{/each}
	</div>
</div>
