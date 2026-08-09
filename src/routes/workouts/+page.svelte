<script lang="ts">
	import { page } from '$app/state';
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import CollapsibleField from '$lib/components/CollapsibleField.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageExplainer from '$lib/components/PageExplainer.svelte';
	import { validatePositive, validateRange } from '$lib/utils/validation';
	import { STANDARD_DISTANCES, parseTime } from '$lib/utils/race-predictor';
	import { buildWorkoutsResult, formatDurationMinutes } from '$lib/utils/workouts';
	import { parseRaceResultParams, serializeRaceResult } from '$lib/utils/race-result-params';
	import WorkoutProfileChart from '$lib/components/WorkoutProfileChart.svelte';
	import { buildPowerWorkoutsResult } from '$lib/utils/power-workouts';
	import { DEVICE_DISPLAY_NAME, DEVICE_METRIC_LABEL, type PowerMeterDevice } from '$lib/utils/power-zones';

	const TIME_BANDS = ['Any time', 'Under 30 min', '30–45 min', '45–60 min', '60+ min'] as const;
	type TimeBand = (typeof TIME_BANDS)[number];

	const POWER_DEVICES: PowerMeterDevice[] = ['stryd', 'garmin', 'coros', 'polar'];

	const prefill = parseRaceResultParams(page.url.searchParams);

	// Parse power mode params from URL
	const powerModeParam = page.url.searchParams.get('mode') === 'power';
	const powerDeviceParam = (page.url.searchParams.get('device') as PowerMeterDevice) || 'stryd';
	const powerValueParam = page.url.searchParams.get('power');
	const mileageParam = page.url.searchParams.get('mileage');

	// Mode toggle state
	let mode = $state<'pace' | 'power'>(powerModeParam ? 'power' : 'pace');

	// Shared state
	let sharedWeeklyMileageRaw = $state(mileageParam || '');

	// Pace mode state
	let selectedOption = $state(prefill?.selectedOption ?? '5K');
	let customKmRaw = $state(prefill?.customKmRaw ?? '');
	let timeRaw = $state(prefill?.timeRaw ?? '');
	let timeBand = $state<TimeBand>('Any time');

	let customKmTouched = $state(false);
	let timeTouched = $state(false);
	let weeklyMileageTouched = $state(false);

	let customKmError = $state<string | null>(null);
	let timeError = $state<string | null>(null);
	let weeklyMileageError = $state<string | null>(null);

	// Power mode state
	let powerRaw = $state(powerValueParam ?? '');
	let selectedDevice = $state<PowerMeterDevice>(powerDeviceParam);
	let powerWeeklyMileageRaw = $state(mileageParam || '');

	let powerTouched = $state(false);
	let deviceTouched = $state(false);
	let powerWeeklyMileageTouched = $state(false);

	let powerError = $state<string | null>(null);
	let powerWeeklyMileageError = $state<string | null>(null);

	// Pace mode derived state
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
		validateRange(sharedWeeklyMileageRaw ? parseFloat(sharedWeeklyMileageRaw) : null, 1, 300)
	);
	let weeklyMileageKm = $derived(
		weeklyMileageValidation.type === 'valid' ? weeklyMileageValidation.value : 0
	);

	let result = $derived(
		mode === 'pace' && timeSeconds !== null && distanceKm > 0 && weeklyMileageKm > 0
			? buildWorkoutsResult(distanceKm, timeSeconds, weeklyMileageKm)
			: null
	);

	// Power mode derived state
	let powerValidation = $derived(validateRange(powerRaw ? parseFloat(powerRaw) : null, 50, 700));
	let power = $derived(powerValidation.type === 'valid' ? powerValidation.value : null);

	let powerWeeklyMileageValidation = $derived(
		validateRange(powerWeeklyMileageRaw ? parseFloat(powerWeeklyMileageRaw) : null, 1, 300)
	);
	let powerWeeklyMileageKm = $derived(
		powerWeeklyMileageValidation.type === 'valid' ? powerWeeklyMileageValidation.value : null
	);

	let powerResult = $derived(
		mode === 'power' && power !== null && powerWeeklyMileageKm !== null
			? buildPowerWorkoutsResult(power, selectedDevice, powerWeeklyMileageKm)
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
		sharedWeeklyMileageRaw = raw;
		const validation = validateRange(raw ? parseFloat(raw) : null, 1, 300);
		weeklyMileageError = validation.type === 'invalid' ? validation.error : null;
	}

	function onTimeBandChange(e: Event) {
		timeBand = (e.target as HTMLSelectElement).value as TimeBand;
	}

	// Power mode handlers
	function onPowerInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		powerRaw = raw;
		const validation = validateRange(raw ? parseFloat(raw) : null, 50, 700);
		powerError = validation.type === 'invalid' ? validation.error : null;
	}

	function onDeviceChange(e: Event) {
		selectedDevice = (e.target as HTMLSelectElement).value as PowerMeterDevice;
	}

	function onPowerWeeklyMileageInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		powerWeeklyMileageRaw = raw;
		const validation = validateRange(raw ? parseFloat(raw) : null, 1, 300);
		powerWeeklyMileageError = validation.type === 'invalid' ? validation.error : null;
	}

	function switchMode(newMode: 'pace' | 'power') {
		mode = newMode;
		if (newMode === 'pace') {
			// Clear power mode errors when switching away
			powerError = null;
			powerWeeklyMileageError = null;
			powerTouched = false;
			deviceTouched = false;
			powerWeeklyMileageTouched = false;
		} else {
			// Clear pace mode errors when switching away
			customKmError = null;
			timeError = null;
			weeklyMileageError = null;
			customKmTouched = false;
			timeTouched = false;
			weeklyMileageTouched = false;
		}
	}

	function reset() {
		if (mode === 'pace') {
			selectedOption = '5K';
			customKmRaw = '';
			timeRaw = '';
			timeBand = 'Any time';
			customKmTouched = false;
			timeTouched = false;
			weeklyMileageTouched = false;
			customKmError = null;
			timeError = null;
			weeklyMileageError = null;
		} else {
			powerRaw = '';
			selectedDevice = 'stryd';
			powerTouched = false;
			deviceTouched = false;
			powerWeeklyMileageTouched = false;
			powerError = null;
			powerWeeklyMileageError = null;
		}
	}

	function formatMinutesShort(minutes: number): string {
		return `${Math.round(minutes)} min`;
	}
</script>

<SeoHead route="/workouts" />

<ToolLayout
	title="Workout Suggestions"
	description="Turn your training paces and power into concrete session plans, scaled to your weekly mileage."
	route="/workouts"
>
	<!-- Mode toggle tabs -->
	<div class="mb-6 flex gap-2 border-b border-ink/10">
		<button
			type="button"
			onclick={() => switchMode('pace')}
			class="px-4 py-2 text-sm font-medium transition-colors {mode === 'pace'
				? 'border-b-2 border-accent text-accent'
				: 'text-muted hover:text-ink'}"
		>
			Pace
		</button>
		<button
			type="button"
			onclick={() => switchMode('power')}
			class="px-4 py-2 text-sm font-medium transition-colors {mode === 'power'
				? 'border-b-2 border-accent text-accent'
				: 'text-muted hover:text-ink'}"
		>
			Power
		</button>
	</div>

	<!-- PACE MODE INPUTS -->
	{#if mode === 'pace'}
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
	{:else}
		<!-- POWER MODE INPUTS -->
		<!-- Device selector -->
		<div class="mb-4">
			<label for="device-select" class="mb-1.5 block text-sm font-medium text-ink"
				>Power meter device</label
			>
			<div class="relative">
				<select
					id="device-select"
					value={selectedDevice}
					onchange={onDeviceChange}
					aria-label="Power meter device, required"
					class="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-bg px-3 pr-10 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
				>
					{#each POWER_DEVICES as device (device)}
						<option value={device}>{DEVICE_DISPLAY_NAME[device]}</option>
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

		<!-- Power input -->
		<InputField
			id="power"
			label={DEVICE_METRIC_LABEL[selectedDevice]}
			bind:value={powerRaw}
			unit="W"
			type="text"
			inputmode="decimal"
			placeholder="e.g. 250"
			required
			error={powerError}
			touched={powerTouched}
			oninput={onPowerInput}
			onblur={() => (powerTouched = true)}
		/>
		<p class="mt-1 text-xs text-muted">Enter your device's power value (watts).</p>
	{/if}

	<!-- Shared weekly mileage input -->
	<InputField
		id="weekly-mileage"
		label="Weekly training mileage"
		bind:value={sharedWeeklyMileageRaw}
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
	{#if mode === 'pace'}
		<!-- PACE MODE RESULTS -->
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

			<!-- Per-zone workout cards (Pace mode) -->
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
								<div class="flex h-full flex-col rounded-lg border border-ink/10 p-4">
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
											<dd class="tabular-nums">{formatDurationMinutes(workout.estimatedDurationMinutes)}</dd>
										</div>
									</dl>
									<p class="mt-3 text-xs text-muted">
										Includes a {formatMinutesShort(workout.segments[0].durationMinutes)} warm-up and {formatMinutesShort(workout
											.segments[workout.segments.length - 1].durationMinutes)} cool-down.
									</p>
									<div class="mt-auto">
										<WorkoutProfileChart segments={workout.segments} />
										<p class="mt-1 flex items-center gap-3 text-[11px] text-muted">
											<span class="inline-flex items-center gap-1"
												><span class="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true"
												></span>Work</span
											>
											<span class="inline-flex items-center gap-1"
												><span
													class="inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"
													aria-hidden="true"
												></span>Warm-up / recovery / cool-down</span
											>
										</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			{/each}

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
		{/if}
	{:else}
		<!-- POWER MODE RESULTS -->
		{#if powerResult === null}
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
					Enter your power and weekly mileage above to see your workout suggestions.
				</p>
			</div>
		{:else if powerResult === 'out-of-range'}
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
					That power is outside the supported range (50–700 watts).
				</p>
				<p class="mt-1 text-sm text-muted">
					Try entering a power value closer to your actual {DEVICE_METRIC_LABEL[selectedDevice].toLowerCase()}.
				</p>
			</div>
		{:else}
			<!-- State C: Valid results -->

			<!-- Power metric headline -->
			<div class="mb-6 text-center">
				<p class="text-xs font-medium uppercase tracking-wide text-muted"
					>{DEVICE_DISPLAY_NAME[selectedDevice]} Power</p
				>
				<p class="text-4xl font-bold tabular-nums text-accent">{powerResult.power} W</p>
			</div>

			<!-- Per-zone workout cards (Power mode) -->
			{#each powerResult.zones as zone (zone.zone)}
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
							>{zone.wattsLow ?? '—'}–{zone.wattsHigh ?? '—'} W</span
						>
					</div>

					<div class="grid gap-3 sm:grid-cols-2">
						{#each zone.workouts as workout (workout.label + workout.description)}
							<div class="flex h-full flex-col rounded-lg border border-ink/10 p-4">
								<p class="font-medium text-ink">{workout.label}</p>
								<p class="mt-1 text-sm leading-relaxed text-muted">{workout.description}</p>
								<dl class="mt-3 space-y-1 text-xs text-muted">
									<div class="flex justify-between gap-2">
										<dt>Recovery</dt>
										<dd class="text-right">{workout.recovery}</dd>
									</div>
									<div class="flex justify-between gap-2">
										<dt>Estimated duration</dt>
										<dd class="tabular-nums">{formatDurationMinutes(workout.estimatedDurationMinutes)}</dd>
									</div>
								</dl>
								<p class="mt-3 text-xs text-muted">
									Includes a {formatDurationMinutes(workout.segments[0].durationMinutes)} warm-up and {formatDurationMinutes(workout
										.segments[workout.segments.length - 1].durationMinutes)} cool-down.
								</p>
								<div class="mt-auto">
									<WorkoutProfileChart segments={workout.segments} />
									<p class="mt-1 flex items-center gap-3 text-[11px] text-muted">
										<span class="inline-flex items-center gap-1"
											><span class="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true"
											></span>Work</span
										>
										<span class="inline-flex items-center gap-1"
											><span
												class="inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"
												aria-hidden="true"
											></span>Warm-up / recovery / cool-down</span
										>
									</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/each}

			<!-- Cross-link to power zones -->
			<p class="mt-6 text-center text-xs text-muted">
				Want to explore your power zones in more detail?
				<a
					href="/power-zones?device={selectedDevice}&power={powerResult.power}"
					class="rounded-sm text-accent-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
					>View power zones →</a
				>
			</p>
		{/if}
	{/if}

	{#if (mode === 'pace' && result !== null) || (mode === 'power' && powerResult !== null)}
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
