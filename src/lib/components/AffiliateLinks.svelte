<script lang="ts">
	import { getAffiliateLinks, type AffiliateProduct } from '$lib/affiliates';

	interface Props {
		route: string;
	}

	let { route }: Props = $props();

	let products: AffiliateProduct[] = $derived(getAffiliateLinks(route));

	function badgeLabel(program: AffiliateProduct['program']): string {
		return program === 'garmin' ? 'Garmin' : 'Amazon';
	}

	function linkLabel(program: AffiliateProduct['program']): string {
		return program === 'garmin' ? 'View on Garmin →' : 'View on Amazon →';
	}
</script>

{#if products.length > 0}
	<div class="print:hidden">
		<p class="mb-3 mt-6 text-xs font-medium uppercase tracking-wide text-muted">
			Recommended gear
		</p>

		<div class="grid grid-cols-1 gap-3">
			{#each products as product (product.url)}
				<div
					class="rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm dark:border-gray-700 dark:bg-white/[0.03]"
				>
					<span
						class="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted dark:bg-gray-800"
					>
						{badgeLabel(product.program)}
					</span>
					<p class="mt-2 text-sm font-medium text-ink">{product.name}</p>
					<p class="mt-1 text-xs text-muted">{product.description}</p>
					<a
						href={product.url}
						target="_blank"
						rel="noopener noreferrer sponsored"
						class="mt-2 block rounded-sm text-xs font-medium text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
					>
						{linkLabel(product.program)}
					</a>
				</div>
			{/each}
		</div>

		<p class="mt-3 text-xs text-muted">
			As an Amazon Associate, we may earn from qualifying purchases.
		</p>
	</div>
{/if}
