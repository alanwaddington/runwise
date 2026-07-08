<script lang="ts">
	import { EXPLAINERS } from '$lib/content/explainers';

	interface Props {
		/** The route path used to look up explainer content. */
		route: string;
	}

	let { route }: Props = $props();

	let content = $derived(EXPLAINERS[route]);
</script>

{#if content}
	<section class="mt-16 max-w-2xl">
		<div class="mb-3 h-1 w-10 rounded-full bg-accent" aria-hidden="true"></div>
		<h2 class="text-xl font-bold text-ink md:text-2xl">{content.heading}</h2>
		<p class="mt-3 leading-relaxed text-muted">{content.intro}</p>

		<div class="mt-8 space-y-6">
			{#each content.sections as section (section.heading)}
				<div>
					<h3 class="font-semibold text-ink">{section.heading}</h3>
					<p class="mt-1.5 text-sm leading-relaxed text-muted">{section.body}</p>
				</div>
			{/each}
		</div>
	</section>
{/if}
