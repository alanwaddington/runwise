<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import ResultDisplay from '$lib/components/ResultDisplay.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageExplainer from '$lib/components/PageExplainer.svelte';
	import { validatePositive } from '$lib/utils/validation';
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

	// Touched state for each field
	let minkmTouched = $state(false);
	let minmileTouched = $state(false);
	let kmhTouched = $state(false);

	// Canonical internal representation — decimal minutes per km
	let minPerKm = $state<number | null>(null);

	// Error messages for each field
	let minkmError = $state<string | null>(null);
	let minmileError = $state<string | null>(null);
	let kmhError = $state<string | null>(null);

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
		const parsed = parsePace(raw);
		const validation = validatePositive(parsed);
		minkmError = validation.type === 'invalid' ? validation.error : null;
		update('minkm', validation.type === 'valid' ? validation.value : null);
	}

	function onMinmileInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		minmileRaw = raw;
		const parsed = parsePace(raw);
		const validation = validatePositive(parsed);
		minmileError = validation.type === 'invalid' ? validation.error : null;
		update('minmile', validation.type === 'valid' ? minPerMileToMinPerKm(validation.value) : null);
	}

	function onKmhInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		kmhRaw = raw;
		const kmh = parseFloat(raw);
		const validation = validatePositive(kmh);
		kmhError = validation.type === 'invalid' ? validation.error : null;
		update('kmh', validation.type === 'valid' ? kmhToMinPerKm(validation.value) : null);
	}

	function reset() {
		minkmRaw = '';
		minmileRaw = '';
		kmhRaw = '';
		minkmTouched = false;
		minmileTouched = false;
		kmhTouched = false;
		minPerKm = null;
		minkmError = null;
		minmileError = null;
		kmhError = null;
	}
</script>

<SeoHead route="/pace" />

<ToolLayout title="Pace Calculator" description="Convert between min/km, min/mile, km/h and mph instantly." route="/pace">
	<InputField
		id="pace-minkm"
		label="Pace"
		bind:value={minkmRaw}
		unit="min/km"
		type="text"
		placeholder="e.g. 5:30"
		required
		error={minkmError}
		touched={minkmTouched}
		oninput={onMinkmInput}
		onblur={() => (minkmTouched = true)}
	/>

	<InputField
		id="pace-minmile"
		label="Pace"
		bind:value={minmileRaw}
		unit="min/mile"
		type="text"
		placeholder="e.g. 8:51"
		required
		error={minmileError}
		touched={minmileTouched}
		oninput={onMinmileInput}
		onblur={() => (minmileTouched = true)}
	/>

	<InputField
		id="pace-kmh"
		label="Speed"
		bind:value={kmhRaw}
		unit="km/h"
		type="number"
		inputmode="decimal"
		step={0.1}
		placeholder="e.g. 10.9"
		required
		error={kmhError}
		touched={kmhTouched}
		oninput={onKmhInput}
		onblur={() => (kmhTouched = true)}
	/>

	<hr class="my-6 border-t border-ink/10" />

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
		<ResultDisplay value={mphDisplay} label="mph" />
		<ResultDisplay value={per400mDisplay} label="per 400 m" />
		<ResultDisplay value={per800mDisplay} label="per 800 m" />
	</div>

	{#if minPerKm !== null}
		<div class="mt-6 text-center">
			<button
				type="button"
				onclick={reset}
				class="rounded-sm text-xs font-medium text-muted transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			>
				Clear
			</button>
		</div>
	{/if}

</ToolLayout>

<PageExplainer route="/pace" />
