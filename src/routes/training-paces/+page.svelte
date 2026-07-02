<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { STANDARD_DISTANCES, parseTime } from '$lib/utils/race-predictor';
	import { buildTrainingPaceResult } from '$lib/utils/training-paces';

	let selectedOption = $state('5K');
	let customKmRaw = $state('');
	let timeRaw = $state('');

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
		customKmRaw = (e.target as HTMLInputElement).value;
	}

	function onTimeInput(e: Event) {
		timeRaw = (e.target as HTMLInputElement).value;
	}
</script>

<SeoHead route="/training-paces" />

<ToolLayout
	title="Training Pace Calculator"
	description="Find your optimal training paces from a recent race result."
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
				class="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-bg px-3 pr-10 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
			>
				{#each STANDARD_DISTANCES as dist (dist.name)}
					<option value={dist.name}>{dist.name}</option>
				{/each}
				<option disabled>──────────</option>
				<option value="Custom">Custom (km)</option>
			</select>
			<span
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500"
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
		<div>
			<label for="custom-km" class="mb-1.5 block text-sm font-medium text-ink"
				>Custom distance</label
			>
			<div class="relative">
				<input
					id="custom-km"
					type="text"
					inputmode="decimal"
					placeholder="e.g. 12.5"
					value={customKmRaw}
					oninput={onCustomKmInput}
					aria-describedby="custom-km-unit"
					class="h-12 w-full rounded-lg border border-gray-300 bg-bg px-3 pr-14 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
				/>
				<span
					id="custom-km-unit"
					class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
				>
					km
				</span>
			</div>
		</div>
	</div>

	<!-- Race time input -->
	<div class="mb-4">
		<label for="race-time" class="mb-1.5 block text-sm font-medium text-ink">Race time</label>
		<div class="relative">
			<input
				id="race-time"
				type="text"
				inputmode="decimal"
				placeholder="e.g. 25:00 or 1:56:20"
				value={timeRaw}
				oninput={onTimeInput}
				aria-describedby="time-help"
				class="h-12 w-full rounded-lg border border-gray-300 bg-bg px-3 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
			/>
		</div>
		<p id="time-help" class="mt-1 text-xs text-gray-400">Enter MM:SS or H:MM:SS</p>
	</div>

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
			<p class="mt-3 text-sm text-gray-400">
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
			<p class="mt-1 text-sm text-gray-400">
				Try entering a time closer to a recent race performance.
			</p>
		</div>
	{:else}
		<!-- State C: Valid results -->

		<!-- VDOT headline -->
		<div class="mb-6 text-center">
			<p class="text-xs font-medium uppercase tracking-wide text-gray-500">Your VDOT</p>
			<p class="text-4xl font-bold tabular-nums text-accent">{result.vdot}</p>
		</div>

		<!-- Zone table -->
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-sm">
				<thead>
					<tr class="border-b border-ink/10">
						<th
							scope="col"
							class="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
							>Zone</th
						>
						<th
							scope="col"
							class="hidden pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:table-cell"
							>Name</th
						>
						<th
							scope="col"
							class="pb-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500"
							>Pace/km</th
						>
						<th
							scope="col"
							class="hidden pb-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500 sm:table-cell"
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
							<td class="hidden py-3 text-right tabular-nums text-gray-600 sm:table-cell"
								>{zone.paceMinMileHigh}–{zone.paceMinMileLow}</td
							>
						</tr>
						<tr class="border-b border-ink/10 last:border-0">
							<td colspan="4" class="pb-3 pt-0.5 text-xs leading-relaxed text-gray-400">
								<span class="mr-1 font-medium text-ink sm:hidden">{zone.name}.</span>
								{zone.description}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Footer link -->
		<p class="mt-6 text-center text-xs text-gray-400">
			Want to know your aerobic capacity?
			<a href="/vo2max" class="text-accent underline-offset-2 hover:underline"
				>Estimate your VO2 max →</a
			>
		</p>
	{/if}
</ToolLayout>
