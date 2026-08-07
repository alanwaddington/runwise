<script lang="ts">
	import { page } from '$app/state';
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import CollapsibleField from '$lib/components/CollapsibleField.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageExplainer from '$lib/components/PageExplainer.svelte';
	import { validatePositive, validateRange } from '$lib/utils/validation';
	import { STANDARD_DISTANCES, parseTime } from '$lib/utils/race-predictor';
	import { buildWorkoutsResult, WARMUP_COOLDOWN_MINUTES } from '$lib/utils/workouts';
	import { parseRaceResultParams, serializeRaceResult } from '$lib/utils/race-result-params';

	const TIME_BANDS = ['Any time', 'Under 30 min', '30–45 min', '45–60 min', '60+ min'] as const;
	type TimeBand = (typeof TIME_BANDS)[number];

	const prefill = parseRaceResultParams(page.url.searchParams);

	let selectedOption = $state(prefill?.selectedOption ?? '5K');
	let customKmRaw = $state(prefill?.customKmRaw ?? '');
	let timeRaw = $state(prefill?.timeRaw ?? '');
	let weeklyMileageRaw = $state('');
	let timeBand = $state<TimeBand>('Any time');

	let customKmTouched = $state(false);
	let timeTouched = $state(false);
	let weeklyMileageTouched = $state(false);

	let customKmError = $state<string | null>(null);
	let timeError = $state<string | null>(null);
	let weeklyMileageError = $state<string | null>(null);

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

	let weeklyMileageValidation = $derived(
		validateRange(weeklyMileageRaw ? parseFloat(weeklyMileageRaw) : null, 1, 300)
	);
	let weeklyMileageKm = $derived(
		weeklyMileageValidation.type === 'valid' ? weeklyMileageValidation.value : 0
	);

	let result = $derived(
		timeSeconds !== null && distanceKm > 0 && weeklyMileageKm > 0
			? buildWorkoutsResult(distanceKm, timeSeconds, weeklyMileageKm)
			: null
	);

	function fitsBand(minutes: number, band: TimeBand): boolean {
		switch (band) {
			case 'Any time':
				return true;
			case 'Under 30 min':
				return minutes < 30;
			case '30–45 min':
				return minutes >= 30 && minutes < 45;
			case '45–60 min':
				return minutes >= 45 && minutes < 60;
			case '60+ min':
				return minutes >= 60;
		}
	}

	let zonesWithFilteredWorkouts = $derived(
		result !== null && result !== 'out-of-range'
			? result.zones.map((zone) => ({
					...zone,
					filtered: zone.workouts.filter((w) => fitsBand(w.estimatedDurationMinutes, timeBand))
				}))
			: []
	);

	let raceResultQuery = $derived(
		timeSeconds !== null && distanceKm > 0
			? serializeRaceResult({ selectedOption, customKmRaw, timeRaw })
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

	function onWeeklyMileageInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		weeklyMileageRaw = raw;
		const validation = validateRange(raw ? parseFloat(raw) : null, 1, 300);
		weeklyMileageError = validation.type === 'invalid' ? validation.error : null;
	}

	function onTimeBandChange(e: Event) {
		timeBand = (e.target as HTMLSelectElement).value as TimeBand;
	}

	function reset() {
		selectedOption = '5K';
		customKmRaw = '';
		timeRaw = '';
		weeklyMileageRaw = '';
		timeBand = 'Any time';
		customKmTouched = false;
		timeTouched = false;
		weeklyMileageTouched = false;
		customKmError = null;
		timeError = null;
		weeklyMileageError = null;
	}
</script>

<SeoHead route="/workouts" />

<ToolLayout
	title="Workout Suggestions"
	description="Turn your training paces into concrete session plans, scaled to your weekly mileage."
	route="/workouts"
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
		placeholder="e.g. 25:00 or 1:56:20"
		required
		error={timeError}
		touched={timeTouched}
		oninput={onTimeInput}
		onblur={() => (timeTouched = true)}
	/>
	<p class="mt-1 text-xs text-muted">Enter MM:SS or H:MM:SS</p>

	<!-- Weekly mileage input -->
	<InputField
		id="weekly-mileage"
		label="Weekly training mileage"
		bind:value={weeklyMileageRaw}
		unit="km"
		type="text"
		inputmode="decimal"
		placeholder="e.g. 50"
		required
		error={weeklyMileageError}
		touched={weeklyMileageTouched}
		oninput={onWeeklyMileageInput}
		onblur={() => (weeklyMileageTouched = true)}
	/>
	<p class="mt-1 text-xs text-muted">Your current average weekly distance, in km.</p>

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
				Enter a race result and your weekly mileage above to see your workout suggestions.
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

		<!-- Time-band filter -->
		<div class="mb-6">
			<label for="time-band-select" class="mb-1.5 block text-sm font-medium text-ink"
				>Time available</label
			>
			<div class="relative">
				<select
					id="time-band-select"
					value={timeBand}
					onchange={onTimeBandChange}
					aria-label="Time available"
					class="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-bg px-3 pr-10 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
				>
					{#each TIME_BANDS as band (band)}
						<option value={band}>{band}</option>
					{/each}
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

		<!-- Per-zone workout cards -->
		{#each zonesWithFilteredWorkouts as zone (zone.zone)}
			<section class="mb-8 last:mb-0">
				<div class="mb-3 flex items-center gap-2">
					<span
						class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white"
						aria-label="Zone {zone.zone}"
					>
						{zone.zone}
					</span>
					<h3 class="font-medium text-ink">{zone.name}</h3>
					<span class="text-sm tabular-nums text-muted"
						>{zone.paceMinKmHigh}–{zone.paceMinKmLow} /km</span
					>
				</div>

				{#if zone.filtered.length === 0}
					<p class="text-sm text-muted">
						No workout in this zone fits {timeBand} — try a longer window.
					</p>
				{:else}
					<div class="grid gap-3 sm:grid-cols-2">
						{#each zone.filtered as workout (workout.label + workout.description)}
							<div class="rounded-lg border border-ink/10 p-4">
								<p class="font-medium text-ink">{workout.label}</p>
								<p class="mt-1 text-sm leading-relaxed text-muted">{workout.description}</p>
								<dl class="mt-3 space-y-1 text-xs text-muted">
									<div class="flex justify-between gap-2">
										<dt>Recovery</dt>
										<dd class="text-right">{workout.recovery}</dd>
									</div>
									<div class="flex justify-between gap-2">
										<dt>Total volume</dt>
										<dd class="tabular-nums">{workout.totalVolumeKm} km</dd>
									</div>
									<div class="flex justify-between gap-2">
										<dt>Estimated duration</dt>
										<dd class="tabular-nums">{workout.estimatedDurationMinutes} min</dd>
									</div>
								</dl>
								<p class="mt-3 text-xs text-muted">
									Includes a {WARMUP_COOLDOWN_MINUTES / 2} min warm-up and {WARMUP_COOLDOWN_MINUTES /
										2} min cool-down.
								</p>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{/each}
	{/if}

	<!-- Footer link -->
	{#if raceResultQuery !== null}
		<p class="mt-6 text-center text-xs text-muted">
			Want to see your full training pace ranges?
			<a
				href="/training-paces?{raceResultQuery}"
				class="rounded-sm text-accent-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
				>View training paces →</a
			>
		</p>
	{/if}

	{#if result !== null}
		<div class="mt-4 text-center">
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

<PageExplainer route="/workouts" />
