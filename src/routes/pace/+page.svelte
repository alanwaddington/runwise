<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import ResultDisplay from '$lib/components/ResultDisplay.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdUnit from '$lib/components/AdUnit.svelte';
	import AffiliateLinks from '$lib/components/AffiliateLinks.svelte';
	import {
		parsePace,
		formatPace,
		minPerKmToMinPerMile,
		minPerMileToMinPerKm,
		minPerKmToKmh,
		kmhToMinPerKm,
		kmhToMph,
		minPerKmToPer400m,
		minPerKmToPer800m
	} from '$lib/utils/pace';

	// Raw text values shown in each input field
	let minkmRaw = $state('');
	let minmileRaw = $state('');
	let kmhRaw = $state('');

	// Canonical internal representation — decimal minutes per km
	let minPerKm = $state<number | null>(null);

	// Read-only derived outputs
	let mphDisplay = $derived(
		minPerKm !== null ? kmhToMph(minPerKmToKmh(minPerKm)).toFixed(1) : '—'
	);
	let per400mDisplay = $derived(
		minPerKm !== null ? formatPace(minPerKmToPer400m(minPerKm)) : '—'
	);
	let per800mDisplay = $derived(
		minPerKm !== null ? formatPace(minPerKmToPer800m(minPerKm)) : '—'
	);

	// Update canonical value and all non-source fields atomically
	function update(source: 'minkm' | 'minmile' | 'kmh', mkm: number | null) {
		minPerKm = mkm;
		if (mkm !== null) {
			if (source !== 'minkm') minkmRaw = formatPace(mkm);
			if (source !== 'minmile') minmileRaw = formatPace(minPerKmToMinPerMile(mkm));
			if (source !== 'kmh') kmhRaw = minPerKmToKmh(mkm).toFixed(1);
		} else {
			if (source !== 'minkm') minkmRaw = '';
			if (source !== 'minmile') minmileRaw = '';
			if (source !== 'kmh') kmhRaw = '';
		}
	}

	function onMinkmInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		minkmRaw = raw;
		update('minkm', parsePace(raw));
	}

	function onMinmileInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		minmileRaw = raw;
		const parsed = parsePace(raw);
		update('minmile', parsed !== null ? minPerMileToMinPerKm(parsed) : null);
	}

	function onKmhInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		kmhRaw = raw;
		const kmh = parseFloat(raw);
		update('kmh', raw && !isNaN(kmh) ? kmhToMinPerKm(kmh) : null);
	}
</script>

<SeoHead route="/pace" />

<ToolLayout title="Pace Calculator" description="Convert between min/km, min/mile, km/h and mph instantly.">
	<!-- min/km -->
	<div class="mb-4">
		<label for="pace-minkm" class="mb-1.5 block text-sm font-medium text-ink">Pace</label>
		<div class="relative">
			<input
				id="pace-minkm"
				type="text"
				inputmode="decimal"
				placeholder="e.g. 5:30"
				value={minkmRaw}
				oninput={onMinkmInput}
				aria-describedby="pace-minkm-unit"
				class="h-12 w-full rounded-lg border border-gray-300 bg-bg px-3 pr-16 text-ink focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none dark:border-gray-700"
			/>
			<span
				id="pace-minkm-unit"
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
			>
				min/km
			</span>
		</div>
	</div>

	<!-- min/mile -->
	<div class="mb-4">
		<label for="pace-minmile" class="mb-1.5 block text-sm font-medium text-ink">Pace</label>
		<div class="relative">
			<input
				id="pace-minmile"
				type="text"
				inputmode="decimal"
				placeholder="e.g. 8:51"
				value={minmileRaw}
				oninput={onMinmileInput}
				aria-describedby="pace-minmile-unit"
				class="h-12 w-full rounded-lg border border-gray-300 bg-bg px-3 pr-20 text-ink focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none dark:border-gray-700"
			/>
			<span
				id="pace-minmile-unit"
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
			>
				min/mile
			</span>
		</div>
	</div>

	<!-- km/h -->
	<div class="mb-4">
		<label for="pace-kmh" class="mb-1.5 block text-sm font-medium text-ink">Speed</label>
		<div class="relative">
			<input
				id="pace-kmh"
				type="number"
				inputmode="decimal"
				step="0.1"
				placeholder="e.g. 10.9"
				value={kmhRaw}
				oninput={onKmhInput}
				aria-describedby="pace-kmh-unit"
				class="h-12 w-full rounded-lg border border-gray-300 bg-bg px-3 pr-14 text-ink focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none dark:border-gray-700"
			/>
			<span
				id="pace-kmh-unit"
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
			>
				km/h
			</span>
		</div>
	</div>

	<hr class="my-6 border-t border-ink/10" />

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
		<ResultDisplay value={mphDisplay} label="mph" />
		<ResultDisplay value={per400mDisplay} label="per 400 m" />
		<ResultDisplay value={per800mDisplay} label="per 800 m" />
	</div>

	{#snippet afterCard()}
		<AdUnit />
		<AffiliateLinks route="/pace" />
	{/snippet}
</ToolLayout>
