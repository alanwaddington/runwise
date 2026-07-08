<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import CollapsibleField from '$lib/components/CollapsibleField.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageExplainer from '$lib/components/PageExplainer.svelte';
	import { validatePositive } from '$lib/utils/validation';
	import { STANDARD_DISTANCES, parseTime } from '$lib/utils/race-predictor';
	import { buildTrainingPaceResult } from '$lib/utils/training-paces';

	let selectedOption = $state('5K');
	let customKmRaw = $state('');
	let timeRaw = $state('');

	let customKmTouched = $state(false);
	let timeTouched = $state(false);

	let customKmError = $state<string | null>(null);
	let timeError = $state<string | null>(null);

	let isCustom = $derived(selectedOption === 'Custom');

	let distanceKm = $derived(
		(() => {
			if (!isCustom) {
				return STANDARD_DISTANCES.find((d) => d.name === selectedOption)?.km ?? 5;
			}
			const v = parseFloat(customKmRaw);
			return v > 0 ? v : 0;
		})()
	);

	let timeSeconds = $derived(parseTime(timeRaw));

	let result = $derived(
		timeSeconds !== null && distanceKm > 0
			? buildTrainingPaceResult(distanceKm, timeSeconds)
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

<SeoHead route="/training-paces" />

<ToolLayout
	title="Training Pace Calculator"
	description="Find your optimal training paces from a recent race result."
	route="/training-paces"
>
	<!-- Race distance select -->
	<div class="mb-4">
		<label for="distance-select" class="mb-1.5 block text-sm font-medium text-ink"
			>Race distance</label
		>
		<div class="relative">
			<select
				id="distance-select"
				value={selectedOption}
				onchange={onDistanceChange}
				aria-label="Race distance, required"
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
	<CollapsibleField expanded={isCustom}>
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
	</CollapsibleField>

	<!-- Race time input -->
	<InputField
		id="race-time"
		label="Race time"
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

	<!-- Output states -->
	{#if result === null}
		<!-- State A: Empty -->
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
			<p class="mt-3 text-sm text-muted">
				Enter a race result above to see your training paces.
			</p>
		</div>
	{:else if result === 'out-of-range'}
		<!-- State B: Out-of-range -->
		<div class="py-10 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mx-auto text-amber-500"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M12 16v-4" />
				<path d="M12 8h.01" />
			</svg>
			<p class="mt-3 text-sm font-medium text-ink">
				That time is outside the supported range (VDOT 20–85).
			</p>
			<p class="mt-1 text-sm text-muted">
				Try entering a time closer to a recent race performance.
			</p>
		</div>
	{:else}
		<!-- State C: Valid results -->

		<!-- VDOT headline -->
		<div class="mb-6 text-center">
			<p class="text-xs font-medium uppercase tracking-wide text-muted">Your VDOT</p>
			<p class="text-4xl font-bold tabular-nums text-accent">{result.vdot}</p>
		</div>

		<!-- Zone table -->
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-sm">
				<thead>
					<tr class="border-b border-ink/10">
						<th
							scope="col"
							class="pb-2 text-left text-xs font-medium uppercase tracking-wide text-muted"
							>Zone</th
						>
						<th
							scope="col"
							class="hidden pb-2 text-left text-xs font-medium uppercase tracking-wide text-muted sm:table-cell"
							>Name</th
						>
						<th
							scope="col"
							class="pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted"
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
					{#each result.zones as zone (zone.zone)}
						<tr class="border-b border-ink/10">
							<td class="py-3 pr-2">
								<span
									class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white"
									aria-label="Zone {zone.zone}"
								>
									{zone.zone}
								</span>
							</td>
							<td class="hidden py-3 pr-4 font-medium text-ink sm:table-cell">{zone.name}</td>
							<td class="py-3 text-right tabular-nums text-ink"
								>{zone.paceMinKmHigh}–{zone.paceMinKmLow}</td
							>
							<td class="hidden py-3 text-right tabular-nums text-muted sm:table-cell"
								>{zone.paceMinMileHigh}–{zone.paceMinMileLow}</td
							>
						</tr>
						<tr class="border-b border-ink/10 last:border-0">
							<td colspan="4" class="pb-3 pt-0.5 text-xs leading-relaxed text-muted">
								<span class="mr-1 font-medium text-ink sm:hidden">{zone.name}.</span>
								{zone.description}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Footer link -->
		<p class="mt-6 text-center text-xs text-muted">
			Want to know your aerobic capacity?
			<a href="/vo2max" class="rounded-sm text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
				>Estimate your VO2 max →</a
			>
		</p>
	{/if}

</ToolLayout>

<PageExplainer route="/training-paces" />
