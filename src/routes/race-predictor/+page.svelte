<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { validatePositive } from '$lib/utils/validation';
	import { STANDARD_DISTANCES, parseTime, buildPredictionTable } from '$lib/utils/race-predictor';

	let selectedOption = $state('5K');
	let customKmRaw = $state('');
	let timeRaw = $state('');

	let customKmTouched = $state(false);
	let timeTouched = $state(false);

	let customKmError = $state<string | null>(null);
	let timeError = $state<string | null>(null);

	let isCustom = $derived(selectedOption === 'Custom');

	let knownDistanceKm = $derived(
		(() => {
			if (!isCustom) {
				return STANDARD_DISTANCES.find((d) => d.name === selectedOption)?.km ?? 5;
			}
			const v = parseFloat(customKmRaw);
			return v > 0 ? v : 0;
		})()
	);

	let knownTimeSeconds = $derived(parseTime(timeRaw));

	let customKm = $derived(
		isCustom && parseFloat(customKmRaw) > 0 ? parseFloat(customKmRaw) : null
	);

	let predictionRows = $derived(
		knownTimeSeconds !== null && knownDistanceKm > 0
			? buildPredictionTable(knownTimeSeconds, knownDistanceKm, customKm)
			: null
	);

	function onDistanceChange(e: Event) {
		selectedOption = (e.target as HTMLSelectElement).value;
	}

	function onCustomKmInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		customKmRaw = raw;
		const validation = validatePositive(raw ? parseFloat(raw) : null);
		customKmError = validation.type === 'invalid' ? validation.error : null;
	}

	function onTimeInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		timeRaw = raw;
		timeError = raw && parseTime(raw) === null ? 'Enter MM:SS or H:MM:SS' : null;
	}
</script>

<SeoHead route="/race-predictor" />

<ToolLayout title="Race Time Predictor" description="Predict your race finish time based on a recent result." route="/race-predictor">
	<!-- Known distance select -->
	<div class="mb-4">
		<label for="distance-select" class="mb-1.5 block text-sm font-medium text-ink"
			>Known distance</label
		>
		<div class="relative">
			<select
				id="distance-select"
				value={selectedOption}
				onchange={onDistanceChange}
				class="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-bg px-3 pr-10 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
			>
				{#each STANDARD_DISTANCES as dist (dist.name)}
					<option value={dist.name}>{dist.name}</option>
				{/each}
				<option disabled>──────────</option>
				<option value="Custom">Custom (km)</option>
			</select>
			<span
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted"
				aria-hidden="true"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</span>
		</div>
	</div>

	<!-- Custom distance input (conditional) -->
	<div
		class="overflow-hidden transition-all duration-200"
		class:max-h-0={!isCustom}
		class:opacity-0={!isCustom}
		class:max-h-24={isCustom}
		class:opacity-100={isCustom}
		class:mb-4={isCustom}
		aria-hidden={!isCustom ? 'true' : undefined}
	>
		<InputField
			id="custom-km"
			label="Custom distance"
			bind:value={customKmRaw}
			unit="km"
			type="text"
			inputmode="decimal"
			placeholder="e.g. 12.5"
			required={isCustom}
			error={customKmError}
			touched={customKmTouched}
			oninput={onCustomKmInput}
			onblur={() => (customKmTouched = true)}
		/>
	</div>

	<!-- Known time input -->
	<InputField
		id="known-time"
		label="Known time"
		bind:value={timeRaw}
		type="text"
		inputmode="decimal"
		placeholder="e.g. 25:00 or 1:56:20"
		required
		error={timeError}
		touched={timeTouched}
		oninput={onTimeInput}
		onblur={() => (timeTouched = true)}
	/>
	<p class="mt-1 text-xs text-muted">Enter MM:SS or H:MM:SS</p>

	<hr class="my-6 border-t border-ink/10" />

	<!-- Results -->
	{#if predictionRows === null}
		<div class="py-10 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mx-auto text-gray-300"
			>
				<circle cx="12" cy="13" r="8" />
				<path d="M12 9v4l2 2" />
				<path d="M9 3h6" />
				<path d="M12 3v2" />
			</svg>
			<p class="mt-3 text-sm text-muted">Enter a race result above to see your predictions.</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-sm">
				<thead>
					<tr class="border-b border-ink/10">
						<th
							scope="col"
							class="pb-2 text-left text-xs font-medium uppercase tracking-wide text-muted"
							>Distance</th
						>
						<th
							scope="col"
							class="pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted"
							>Time</th
						>
						<th
							scope="col"
							class="hidden pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted sm:table-cell"
							>Pace/km</th
						>
						<th
							scope="col"
							class="hidden pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted sm:table-cell"
							>Pace/mile</th
						>
					</tr>
				</thead>
				<tbody>
					{#each predictionRows as row (row.name)}
						{@const isHighlighted = Math.abs(row.km - knownDistanceKm) < 0.001}
						<tr
							class="relative border-b border-ink/10 last:border-0 {isHighlighted ? 'bg-accent/10' : ''}"
							aria-current={isHighlighted ? 'true' : undefined}
						>
							<td class="relative py-3 font-medium text-ink">
								{#if isHighlighted}
									<span
										class="absolute inset-y-0 left-0 w-0.5 rounded-r bg-accent"
										aria-hidden="true"
									></span>
								{/if}
								{row.name}
							</td>
							<td class="py-3 text-right tabular-nums text-ink">{row.timeFormatted}</td>
							<td class="hidden py-3 text-right tabular-nums text-muted sm:table-cell"
								>{row.paceMinKm}</td
							>
							<td class="hidden py-3 text-right tabular-nums text-muted sm:table-cell"
								>{row.paceMinMile}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="mt-4 text-center text-xs text-muted">
			Predictions use the Riegel formula (exponent 1.06). Results are estimates.
		</p>
		<p class="mt-3 text-center text-xs text-muted">
			Want to know your aerobic capacity?
			<a href="/vo2max" class="rounded-sm text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
				>Estimate your VO2 max →</a
			>
		</p>
	{/if}

</ToolLayout>
