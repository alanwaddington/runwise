<script lang="ts">
	import { page } from '$app/state';
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import CollapsibleField from '$lib/components/CollapsibleField.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageExplainer from '$lib/components/PageExplainer.svelte';
	import { validatePositive, validateRange } from '$lib/utils/validation';
	import { STANDARD_DISTANCES, parseTime } from '$lib/utils/race-predictor';
	import { buildWorkoutsResult, formatDurationMinutes, type Workout } from '$lib/utils/workouts';
	import { parseRaceResultParams, serializeRaceResult } from '$lib/utils/race-result-params';
	import WorkoutProfileChart from '$lib/components/WorkoutProfileChart.svelte';
	import { buildPowerWorkoutsResult } from '$lib/utils/power-workouts';
	import { DEVICE_DISPLAY_NAME, DEVICE_METRIC_LABEL, type PowerMeterDevice } from '$lib/utils/power-zones';
	import { getSegmentPaceRange, getSegmentPowerRange, getSegmentBpmRange } from '$lib/utils/segment-targets';
	import { buildFitWorkout, type FitExportKind } from '$lib/utils/fit-export';
	import { buildTrainingPaceResult, type ZoneKey } from '$lib/utils/training-paces';
	import Toast from '$lib/components/Toast.svelte';
	import { showToast } from '$lib/stores/toast';
	import { buildHrWorkoutsResult } from '$lib/utils/hr-workouts';
	import { formatBpmRange } from '$lib/utils/hr-zones';
	import {
		buildRacePrepResult,
		computeWeeksUntilRace,
		isRacePrepEligible,
		type RacePrepModalityInput
	} from '$lib/utils/race-prep';
	import { buildMixedZoneWorkouts, type MixedZonePairKey } from '$lib/utils/mixed-zone-workouts';
	import { formatPace } from '$lib/utils/pace';
	import PatternBadge from '$lib/components/PatternBadge.svelte';
	import WorkoutRail from '$lib/components/WorkoutRail.svelte';

	interface CardStat {
		icon?: 'clock' | 'refresh';
		text: string;
		srLabel: string;
		muted?: boolean;
	}

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
	let mode = $state<'pace' | 'power' | 'hr' | 'race-prep'>(powerModeParam ? 'power' : 'pace');

	// Shared state
	let sharedWeeklyMileageRaw = $state(mileageParam || '');
	const todayISO = new Date().toISOString().slice(0, 10);
	let raceDateRaw = $state('');

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

	let powerTouched = $state(false);

	let powerError = $state<string | null>(null);

	// HR mode state
	let lthrRaw = $state('');
	let lthrTouched = $state(false);
	let lthrError = $state<string | null>(null);

	// Modal state for expanded workout view
	let selectedWorkout = $state<{
		label: string;
		description: string;
		descriptionExpanded?: string;
		totalVolumeKm: number;
		recovery: string;
		estimatedDurationMinutes: number;
		segments: Array<{
			type: 'warmup' | 'work' | 'recovery' | 'cooldown';
			durationMinutes: number;
			intensity: number;
		}>;
		zoneName: string;
		zone?: ZoneKey;
		pattern?: Workout['pattern'];
		powerRange?: string;
		paceRange?: string;
		hrRange?: string;
		easyPaceRange?: string;
		easyPowerRange?: string;
		easyHrRange?: string;
	} | null>(null);

	let downloadingFit = $state(false);

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

	// Computed regardless of `mode` (not gated to pace mode) so HR/Race-Prep/mixed-zone can
	// also consume its zones when the user has already entered a race result.
	let result = $derived(
		timeSeconds !== null && distanceKm > 0 && weeklyMileageKm > 0
			? buildWorkoutsResult(distanceKm, timeSeconds, weeklyMileageKm)
			: null
	);

	// Power mode derived state
	let powerValidation = $derived(validateRange(powerRaw ? parseFloat(powerRaw) : null, 50, 700));
	let power = $derived(powerValidation.type === 'valid' ? powerValidation.value : null);

	let powerResult = $derived(
		mode === 'power' && power !== null && weeklyMileageKm > 0
			? buildPowerWorkoutsResult(power, selectedDevice, weeklyMileageKm)
			: null
	);

	// Raw TrainingZone[] (distinct from WorkoutZone[] used by `result`), needed by HR mode's
	// optional trainingZones parameter and by mixed-zone workouts — computed regardless of
	// `mode` whenever a race result is present, same rationale as `result` above.
	let trainingPaceResult = $derived(
		timeSeconds !== null && distanceKm > 0 ? buildTrainingPaceResult(distanceKm, timeSeconds) : null
	);

	// HR mode derived state
	let lthrValidation = $derived(validateRange(lthrRaw ? parseFloat(lthrRaw) : null, 100, 200));
	let lthr = $derived(lthrValidation.type === 'valid' ? lthrValidation.value : null);

	let hrResult = $derived(
		mode === 'hr' && lthr !== null && weeklyMileageKm > 0
			? buildHrWorkoutsResult(
					lthr,
					weeklyMileageKm,
					trainingPaceResult !== null && trainingPaceResult !== 'out-of-range'
						? trainingPaceResult.zones
						: undefined
				)
			: null
	);

	// Race-Prep mode derived state
	let weeksUntilRace = $derived(raceDateRaw ? computeWeeksUntilRace(raceDateRaw, todayISO) : null);
	let racePrepEligible = $derived(weeksUntilRace !== null && isRacePrepEligible(weeksUntilRace));

	// Which modality Race-Prep workouts are prescribed in — a sub-selector independent of the
	// top-level Pace/Power/HR tabs (AC-1.6/AC-2.10), since a plan built for "wherever you were
	// last" would be fragile if the user lands directly on Race-Prep or bounces between tabs.
	let racePrepModality = $state<'pace' | 'power' | 'hr'>('pace');

	let racePrepModalityInput = $derived.by((): RacePrepModalityInput | null => {
		if (racePrepModality === 'power') {
			return power !== null ? { modality: 'power', power, device: selectedDevice } : null;
		}
		if (racePrepModality === 'hr') {
			return lthr !== null ? { modality: 'hr', lthr } : null;
		}
		return { modality: 'pace' };
	});

	let racePrepResult = $derived(
		mode === 'race-prep' &&
			distanceKm > 0 &&
			timeSeconds !== null &&
			raceDateRaw &&
			weeklyMileageKm > 0 &&
			racePrepModalityInput !== null
			? buildRacePrepResult(
					distanceKm,
					timeSeconds,
					raceDateRaw,
					todayISO,
					weeklyMileageKm,
					racePrepModalityInput
				)
			: null
	);

	const MIXED_ZONE_PAIRS: MixedZonePairKey[] = ['E+M', 'M+T', 'T+I'];

	// Mixed-zone workouts extend Pace mode's zone sections; only meaningful once a valid
	// pace result exists.
	let mixedZoneWorkouts = $derived(
		trainingPaceResult !== null && trainingPaceResult !== 'out-of-range'
			? MIXED_ZONE_PAIRS.flatMap((pairKey) =>
					buildMixedZoneWorkouts(pairKey, trainingPaceResult.zones, weeklyMileageKm)
				)
			: []
	);

	// Race-Prep plan is read as a timeline, one week at a time, rather than four full-length
	// zone-style sections stacked in a row. Reset to Week 1 whenever a new plan is generated
	// (not on every keystroke — only when the plan's identity actually changes).
	let selectedRacePrepWeek = $state(1);
	let lastRacePrepPlanKey = $state('');
	$effect(() => {
		if (racePrepResult === null || racePrepResult === 'out-of-range') return;
		const key = `${racePrepResult.weeksUntilRace}-${racePrepResult.goalPaceMinKm}-${racePrepResult.weeks.length}`;
		if (key !== lastRacePrepPlanKey) {
			lastRacePrepPlanKey = key;
			selectedRacePrepWeek = 1;
		}
	});

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

	function onRaceDateInput(e: Event) {
		raceDateRaw = (e.target as HTMLInputElement).value;
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

	// HR mode handlers
	function onLthrInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		lthrRaw = raw;
		const validation = validateRange(raw ? parseFloat(raw) : null, 100, 200);
		lthrError = validation.type === 'invalid' ? validation.error : null;
	}

	function switchMode(newMode: 'pace' | 'power' | 'hr' | 'race-prep') {
		const previousMode = mode;
		mode = newMode;

		// Clear a mode's own error/touched state only when leaving it. Weekly mileage and the
		// race date/distance/time fields are shared across modes, so they're intentionally left
		// untouched here regardless of which mode is switched to (AC-1.7).
		if (previousMode === 'pace' && newMode !== 'pace') {
			customKmError = null;
			timeError = null;
			customKmTouched = false;
			timeTouched = false;
		}
		if (previousMode === 'power' && newMode !== 'power') {
			powerError = null;
			powerTouched = false;
		}
		if (previousMode === 'hr' && newMode !== 'hr') {
			lthrError = null;
			lthrTouched = false;
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
			customKmError = null;
			timeError = null;
		} else if (mode === 'power') {
			powerRaw = '';
			selectedDevice = 'stryd';
			powerTouched = false;
			powerError = null;
		} else if (mode === 'hr') {
			lthrRaw = '';
			lthrTouched = false;
			lthrError = null;
		} else {
			raceDateRaw = '';
		}
		weeklyMileageTouched = false;
		weeklyMileageError = null;
	}

	/** The effort text shown per segment in the modal's breakdown — narrowed to the segment's own
	 *  intensity for work segments (via the matching modality's getSegment*Range), or the full
	 *  easy-zone band unnarrowed for warmup/recovery/cooldown. */
	function segmentRangeFor(segment: {
		type: 'warmup' | 'work' | 'recovery' | 'cooldown';
		intensity: number;
	}): string | undefined {
		if (!selectedWorkout) return undefined;
		const isWork = segment.type === 'work';
		if (isWork && selectedWorkout.paceRange) {
			return getSegmentPaceRange(selectedWorkout.paceRange, segment.intensity, segment.type);
		}
		if (isWork && selectedWorkout.powerRange) {
			return getSegmentPowerRange(selectedWorkout.powerRange, segment.intensity, segment.type);
		}
		if (isWork && selectedWorkout.hrRange) {
			return getSegmentBpmRange(selectedWorkout.hrRange, segment.intensity, segment.type);
		}
		if (isWork) return selectedWorkout.paceRange || selectedWorkout.powerRange || selectedWorkout.hrRange;
		return selectedWorkout.easyPaceRange || selectedWorkout.easyPowerRange || selectedWorkout.easyHrRange;
	}

	const PHASE_PURPOSE: Record<string, string> = {
		'Build Aerobic Base': 'Build your aerobic engine with easy volume and race-pace introduction.',
		Strength: 'Add threshold work to build the muscular and metabolic strength for race pace.',
		'Peak VO2 Max': 'Peak fitness with sharp, race-pace interval work.',
		Taper: 'Reduce volume while keeping race-pace feel sharp — arrive fresh.'
	};

	function formatMinutesShort(minutes: number): string {
		return `${Math.round(minutes)} min`;
	}

	// Shared by each card's inline "Purpose & execution" disclosure — kept out of the modal,
	// which now only covers the segment breakdown + FIT download (that content already lives
	// on the card, so repeating it in the modal was pure duplication).
	function workoutPurpose(pattern: Workout['pattern'] | undefined, zoneName: string): string {
		if (pattern === 'mixed-zone') {
			return 'Mixed-zone sessions practice shifting between effort levels within one run, mirroring how race intensity actually varies — a bridge between steady training and race-specific pace changes.';
		}
		if (zoneName.includes('Easy')) {
			return 'Easy runs are the foundation of your training. They build aerobic capacity, aid recovery, and teach your body to rely on fat as fuel at race-ready paces.';
		}
		if (zoneName.includes('Moderate')) {
			return 'Moderate-pace work teaches your body to clear lactate efficiently and prepares your aerobic system for harder efforts. These workouts build mental toughness and race-specific endurance.';
		}
		if (zoneName.includes('Threshold')) {
			return 'Threshold runs teach your body to sustain harder efforts while clearing metabolic byproducts. They improve your lactate threshold and build mental toughness for race day.';
		}
		if (zoneName.includes('Interval')) {
			return 'Interval workouts develop VO₂ max and teach your body to deliver and use oxygen more efficiently. These sessions have the highest return on time invested.';
		}
		if (zoneName.includes('Rep') || zoneName.includes('Sprint')) {
			return 'Repetition workouts at the highest intensity develop neuromuscular power and speed. These brief, all-out efforts train your body to operate at maximum intensity.';
		}
		return 'This workout builds fitness through structured effort and recovery.';
	}

	function workoutExecuteGuidance(pattern: Workout['pattern'] | undefined, zoneName: string): string {
		if (pattern === 'mixed-zone') {
			return 'Settle into the base effort first. As each higher-intensity segment starts, pick up smoothly rather than surging — then ease back to the base pace once it ends.';
		}
		if (zoneName.includes('Easy')) {
			return 'Run at a conversational pace. You should be able to speak in sentences. Focus on relaxation and smooth cadence.';
		}
		if (zoneName.includes('Moderate')) {
			return 'Hold a steady, controlled effort. You can speak a few words but not full sentences. Maintain consistent pacing throughout.';
		}
		if (zoneName.includes('Threshold')) {
			return 'Run at a comfortably hard pace. You can only speak a few words. Maintain consistent effort and focus on controlled breathing.';
		}
		if (zoneName.includes('Interval')) {
			return "Each repeat should feel challenging but sustainable. Take recovery periods seriously; they're part of the workout. Focus on controlled effort.";
		}
		if (zoneName.includes('Rep') || zoneName.includes('Sprint')) {
			return 'Go all out on each repeat. Use recovery periods to fully recover. These should feel hard and fast, but controlled.';
		}
		return 'Execute the prescribed format and maintain consistent effort.';
	}

	async function downloadFitWorkout() {
		// zone is absent for cards with no single zone band (mixed-zone, and race-prep's
		// race-pace-tempo/reps variants) — the download button isn't rendered for those, but
		// guard here too rather than crash if it ever is.
		if (!selectedWorkout || downloadingFit || !selectedWorkout.zone) return;
		const workout = selectedWorkout;

		downloadingFit = true;
		try {
			const kind: FitExportKind = workout.paceRange ? 'pace' : workout.powerRange ? 'power' : 'hr';
			const zoneRange =
				kind === 'pace' ? workout.paceRange! : kind === 'power' ? workout.powerRange! : workout.hrRange!;
			const easyRange =
				kind === 'pace'
					? workout.easyPaceRange!
					: kind === 'power'
						? workout.easyPowerRange!
						: workout.easyHrRange!;

			const { bytes, filename } = await buildFitWorkout({
				label: workout.label,
				zone: workout.zone!,
				kind,
				segments: workout.segments,
				zoneRange,
				easyRange
			});

			// TS's lib.dom BlobPart type requires an ArrayBuffer-backed view, but Uint8Array's
			// generic backing-buffer type widens to ArrayBufferLike (which also covers
			// SharedArrayBuffer) -- a known strictness mismatch, not an actual runtime concern
			// since encoder.close() always returns a plain ArrayBuffer-backed Uint8Array.
			const blob = new Blob([bytes as unknown as ArrayBuffer], { type: 'application/vnd.ant.fit' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			link.click();
			URL.revokeObjectURL(url);

			showToast(`Downloaded ${filename}`, 'success');
		} catch (error) {
			console.error('Failed to build FIT workout file:', error);
			showToast("Couldn't create the file. Try again.", 'error');
		} finally {
			downloadingFit = false;
		}
	}
</script>

<SeoHead route="/workouts" />

{#snippet statIcon(icon: 'clock' | 'refresh')}
	{#if icon === 'clock'}
		<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0">
			<circle cx="12" cy="13" r="8" />
			<path d="M12 9v4l2 2" />
			<path d="M9 3h6" />
			<path d="M12 3v2" />
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0">
			<path d="M21 12a9 9 0 1 1-3-6.7" />
			<path d="M21 3v6h-6" />
		</svg>
	{/if}
{/snippet}

{#snippet workoutCard(
	workout: Workout,
	badgeLabel: string | undefined,
	stats: CardStat[],
	warmupCooldownText: string,
	purposeZoneName: string,
	onOpen: () => void
)}
	<div
		style="min-height: var(--card-h, auto);"
		class="relative flex w-64 shrink-0 snap-start flex-col rounded-lg border border-ink/10 p-4 transition-all hover:border-accent hover:shadow-md"
	>
		<PatternBadge pattern={workout.pattern} label={badgeLabel} />
		<button
			type="button"
			onclick={onOpen}
			class="rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
		>
			<p class="font-medium text-ink">{workout.label}</p>
			<p class="mt-1 text-sm leading-relaxed text-muted">{workout.description}</p>
		</button>
		<dl class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
			{#each stats as stat (stat.srLabel)}
				<div class="inline-flex items-center gap-1 {stat.muted ? 'text-muted/60 italic' : ''}">
					{#if stat.icon}{@render statIcon(stat.icon)}{/if}
					<dt class="sr-only">{stat.srLabel}</dt>
					<dd class="tabular-nums">{stat.text}</dd>
				</div>
			{/each}
		</dl>
		<p class="mt-3 text-xs text-muted">{warmupCooldownText}</p>
		<details class="mt-2 text-xs">
			<summary
				class="flex cursor-pointer list-none items-center gap-1 rounded-sm font-medium text-ink [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0 transition-transform [details[open]_&]:rotate-90">
					<path d="m9 18 6-6-6-6" />
				</svg>
				Purpose &amp; execution
			</summary>
			<div class="mt-2 space-y-2 rounded-md bg-accent/5 p-2.5 leading-relaxed text-muted">
				<p><span class="font-semibold text-accent">Purpose:</span> {workoutPurpose(workout.pattern, purposeZoneName)}</p>
				<p><span class="font-semibold text-accent">How to execute:</span> {workoutExecuteGuidance(workout.pattern, purposeZoneName)}</p>
			</div>
		</details>
		<div class="mt-auto pt-3">
			<WorkoutProfileChart segments={workout.segments} />
			<p class="mt-1 flex items-center gap-3 text-[11px] text-muted">
				<span class="inline-flex items-center gap-1"
					><span class="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true"></span>Work</span
				>
				<span class="inline-flex items-center gap-1"
					><span class="inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true"
					></span>Warm-up / recovery / cool-down</span
				>
			</p>
		</div>
	</div>
{/snippet}

{#snippet powerModalityInputs()}
	<!-- Device selector -->
	<div class="mb-4">
		<label for="device-select" class="mb-1.5 block text-sm font-medium text-ink">Power meter device</label>
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
			<span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
{/snippet}

{#snippet hrModalityInput()}
	<InputField
		id="lthr"
		label="Lactate threshold heart rate (LTHR)"
		bind:value={lthrRaw}
		unit="bpm"
		type="text"
		inputmode="decimal"
		placeholder="e.g. 172"
		required
		error={lthrError}
		touched={lthrTouched}
		oninput={onLthrInput}
		onblur={() => (lthrTouched = true)}
	/>
	<p class="mt-1 text-xs text-muted">
		Your heart rate at lactate threshold — the effort you could sustain for about an hour.
	</p>
{/snippet}

<ToolLayout
	title="Workout Suggestions"
	description="Turn your training paces and power into concrete session plans, scaled to your weekly mileage."
	route="/workouts"
>
	<!-- Mode toggle tabs -->
	<div
		class="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 sm:grid-cols-4 dark:bg-gray-800"
		role="tablist"
		tabindex="-1"
	>
		<button
			type="button"
			role="tab"
			aria-selected={mode === 'pace'}
			onclick={() => switchMode('pace')}
			class="rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			class:bg-accent={mode === 'pace'}
			class:text-white={mode === 'pace'}
			class:font-semibold={mode === 'pace'}
			class:text-muted={mode !== 'pace'}
			class:hover:text-hover={mode !== 'pace'}
		>
			Pace
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={mode === 'power'}
			onclick={() => switchMode('power')}
			class="rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			class:bg-accent={mode === 'power'}
			class:text-white={mode === 'power'}
			class:font-semibold={mode === 'power'}
			class:text-muted={mode !== 'power'}
			class:hover:text-hover={mode !== 'power'}
		>
			Power
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={mode === 'hr'}
			onclick={() => switchMode('hr')}
			class="rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			class:bg-accent={mode === 'hr'}
			class:text-white={mode === 'hr'}
			class:font-semibold={mode === 'hr'}
			class:text-muted={mode !== 'hr'}
			class:hover:text-hover={mode !== 'hr'}
		>
			HR
		</button>
		{#if racePrepEligible}
			<button
				type="button"
				role="tab"
				aria-selected={mode === 'race-prep'}
				onclick={() => switchMode('race-prep')}
				class="rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
				class:bg-accent={mode === 'race-prep'}
				class:text-white={mode === 'race-prep'}
				class:font-semibold={mode === 'race-prep'}
				class:text-muted={mode !== 'race-prep'}
				class:hover:text-hover={mode !== 'race-prep'}
			>
				Race-Prep
			</button>
		{/if}
	</div>

	<!-- PACE / RACE-PREP MODE INPUTS (race-prep reuses the pace race-result inputs) -->
	{#if mode === 'pace' || mode === 'race-prep'}
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

		{#if mode === 'race-prep'}
			<!-- Race-Prep modality sub-selector — which zone system its workouts are prescribed in.
				 Independent of the top-level Pace/Power/HR tabs (AC-1.6/AC-2.10). -->
			<div class="mt-4 border-t border-ink/10 pt-4">
				<span class="mb-1.5 block text-sm font-medium text-ink">Train by</span>
				<div
					class="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800"
					role="tablist"
					aria-label="Race-prep training modality"
				>
					<button
						type="button"
						role="tab"
						aria-label="Race-prep pace modality"
						aria-selected={racePrepModality === 'pace'}
						onclick={() => (racePrepModality = 'pace')}
						class="rounded-md py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
						class:bg-accent={racePrepModality === 'pace'}
						class:text-white={racePrepModality === 'pace'}
						class:font-semibold={racePrepModality === 'pace'}
						class:text-muted={racePrepModality !== 'pace'}
						class:hover:text-hover={racePrepModality !== 'pace'}
					>
						Pace
					</button>
					<button
						type="button"
						role="tab"
						aria-label="Race-prep power modality"
						aria-selected={racePrepModality === 'power'}
						onclick={() => (racePrepModality = 'power')}
						class="rounded-md py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
						class:bg-accent={racePrepModality === 'power'}
						class:text-white={racePrepModality === 'power'}
						class:font-semibold={racePrepModality === 'power'}
						class:text-muted={racePrepModality !== 'power'}
						class:hover:text-hover={racePrepModality !== 'power'}
					>
						Power
					</button>
					<button
						type="button"
						role="tab"
						aria-label="Race-prep HR modality"
						aria-selected={racePrepModality === 'hr'}
						onclick={() => (racePrepModality = 'hr')}
						class="rounded-md py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
						class:bg-accent={racePrepModality === 'hr'}
						class:text-white={racePrepModality === 'hr'}
						class:font-semibold={racePrepModality === 'hr'}
						class:text-muted={racePrepModality !== 'hr'}
						class:hover:text-hover={racePrepModality !== 'hr'}
					>
						HR
					</button>
				</div>
				<p class="mt-1 text-xs text-muted">
					Goal race pace is always shown as a reference, regardless of modality.
				</p>
			</div>

			{#if racePrepModality === 'power'}
				<div class="mt-4">
					{@render powerModalityInputs()}
				</div>
			{:else if racePrepModality === 'hr'}
				<div class="mt-4">
					{@render hrModalityInput()}
				</div>
			{/if}
		{/if}
	{:else if mode === 'power'}
		{@render powerModalityInputs()}
	{:else}
		{@render hrModalityInput()}
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

	<!-- Shared race date input (optional — unlocks the Race-Prep tab) -->
	<InputField id="race-date" label="Race date" bind:value={raceDateRaw} type="date" oninput={onRaceDateInput} />
	{#if raceDateRaw && weeksUntilRace !== null && !racePrepEligible}
		<p class="mt-1 text-xs text-muted">
			Your race is {weeksUntilRace} {weeksUntilRace === 1 ? 'week' : 'weeks'} away — Race-Prep unlocks
			between 4 and 8 weeks out.
		</p>
	{:else}
		<p class="mt-1 text-xs text-muted">
			Optional. Race-Prep mode appears here once your race is 4–8 weeks away.
		</p>
	{/if}

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
				{@const structured = zone.filtered.filter((w) => w.pattern !== 'recovery')}
				{@const recoveryOptions = zone.filtered.filter((w) => w.pattern === 'recovery')}
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
							No workout in this zone fits {timeBand}. Try a longer window.
						</p>
					{:else}
						{#if structured.length > 0}
							<WorkoutRail label="{zone.name} workouts">
								{#each structured as workout (workout.label + workout.description)}
									{@render workoutCard(
										workout,
										workout.pattern === 'mixed-zone' ? workout.label.split(':')[0] : undefined,
										[
											{ icon: 'clock', text: formatDurationMinutes(workout.estimatedDurationMinutes), srLabel: 'Estimated duration' },
											{ text: `${workout.totalVolumeKm} km`, srLabel: 'Total volume' },
											{ icon: 'refresh', text: workout.recovery, srLabel: 'Recovery' }
										],
										`Includes a ${formatMinutesShort(workout.segments[0].durationMinutes)} warm-up and ${formatMinutesShort(workout.segments[workout.segments.length - 1].durationMinutes)} cool-down.`,
										zone.name,
										() => {
											const easyZone = result.zones.find((z) => z.name.includes('Easy'));
											selectedWorkout = {
												...workout,
												zoneName: zone.name,
												zone: zone.zone,
												pattern: workout.pattern,
												paceRange: `${zone.paceMinKmHigh}–${zone.paceMinKmLow} /km`,
												easyPaceRange: easyZone
													? `${easyZone.paceMinKmHigh}–${easyZone.paceMinKmLow} /km`
													: `${zone.paceMinKmHigh}–${zone.paceMinKmLow} /km`
											};
										}
									)}
								{/each}
							</WorkoutRail>
						{/if}

						{#if recoveryOptions.length > 0}
							<!-- Recovery is conceptually distinct from structured R-zone reps (fixed, flexible
								 duration rather than volume-derived) -- its own heading + rail, same pattern
								 already used for Mixed-Zone Sessions below, rather than blending into the R rail
								 above with only a badge to tell them apart. -->
							<div class="mt-6 mb-3">
								<h4 class="text-sm font-medium text-ink">Recovery Options</h4>
								<p class="mt-0.5 text-xs text-muted">
									Flexible, unstructured sessions for active recovery days — not scaled to your
									weekly mileage like the workouts above.
								</p>
							</div>
							<WorkoutRail label="Recovery options">
								{#each recoveryOptions as workout (workout.label + workout.description)}
									{@render workoutCard(
										workout,
										undefined,
										[
											{ icon: 'clock', text: formatDurationMinutes(workout.estimatedDurationMinutes), srLabel: 'Estimated duration' },
											{ icon: 'refresh', text: workout.recovery, srLabel: 'Recovery' }
										],
										`Includes a ${formatMinutesShort(workout.segments[0].durationMinutes)} warm-up and ${formatMinutesShort(workout.segments[workout.segments.length - 1].durationMinutes)} cool-down.`,
										zone.name,
										() => {
											// Recovery workouts run entirely at (or below) Easy effort -- unlike
											// every other R-zone card, there's no "harder work segment" here, so
											// both the work and the warmup/recovery/cooldown segments should target
											// the Easy pace band, not R's (would otherwise prescribe R-pace, R's
											// fastest zone, for what's meant to be an easy recovery session). Same
											// reasoning applies to zoneName/zone below -- these cards are wired into
											// R's buildZoneWorkouts output for volume/mileage purposes only (see
											// recovery-workouts.ts), but the modal header and FIT-export filename
											// should still read "Easy", not "Repetition"/"R-pace", on a workout whose
											// pace targets are Easy's.
											const easyZone = result.zones.find((z) => z.name.includes('Easy'));
											const easyPaceRangeStr = easyZone
												? `${easyZone.paceMinKmHigh}–${easyZone.paceMinKmLow} /km`
												: `${zone.paceMinKmHigh}–${zone.paceMinKmLow} /km`;
											selectedWorkout = {
												...workout,
												zoneName: easyZone ? easyZone.name : zone.name,
												zone: easyZone ? easyZone.zone : zone.zone,
												pattern: workout.pattern,
												paceRange: easyPaceRangeStr,
												easyPaceRange: easyPaceRangeStr
											};
										}
									)}
								{/each}
							</WorkoutRail>
						{/if}
					{/if}
				</section>
			{/each}

			<!-- Mixed-zone sessions -->
			{#if mixedZoneWorkouts.length > 0}
				<section class="mb-8 last:mb-0">
					<div class="mb-3">
						<h3 class="font-medium text-ink">Mixed-Zone Sessions</h3>
						<p class="mt-1 text-sm text-muted">
							Combine two effort zones in one session — a bridge between your steady zones and
							race-specific intensity.
						</p>
					</div>
					<WorkoutRail label="Mixed-zone workouts">
						{#each mixedZoneWorkouts as workout (workout.label)}
							{@render workoutCard(
								workout,
								workout.label.split(':')[0],
								[
									{ icon: 'clock', text: formatDurationMinutes(workout.estimatedDurationMinutes), srLabel: 'Estimated duration' },
									{ text: `${workout.totalVolumeKm} km`, srLabel: 'Total volume' },
									{ icon: 'refresh', text: workout.recovery, srLabel: 'Recovery' }
								],
								`Includes a ${formatMinutesShort(workout.segments[0].durationMinutes)} warm-up and ${formatMinutesShort(workout.segments[workout.segments.length - 1].durationMinutes)} cool-down.`,
								workout.label,
								() => {
									const easyZone = result.zones.find((z) => z.name.includes('Easy'));
									selectedWorkout = {
										...workout,
										zoneName: workout.label,
										pattern: workout.pattern,
										paceRange: undefined,
										easyPaceRange: easyZone
											? `${easyZone.paceMinKmHigh}–${easyZone.paceMinKmLow} /km`
											: undefined
									};
								}
							)}
						{/each}
					</WorkoutRail>
				</section>
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
		{/if}
	{:else if mode === 'power'}
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
							>{zone.wattsLow ?? '-'}–{zone.wattsHigh ?? '-'} W</span
						>
					</div>

					<WorkoutRail label="{zone.name} workouts">
						{#each zone.workouts as workout (workout.label + workout.description)}
							{@render workoutCard(
								workout,
								workout.pattern === 'mixed-zone' ? workout.label.split(':')[0] : undefined,
								[
									{ icon: 'clock', text: formatDurationMinutes(workout.estimatedDurationMinutes), srLabel: 'Estimated duration' },
									{ icon: 'refresh', text: workout.recovery, srLabel: 'Recovery' }
								],
								`Includes a ${formatDurationMinutes(workout.segments[0].durationMinutes)} warm-up and ${formatDurationMinutes(workout.segments[workout.segments.length - 1].durationMinutes)} cool-down.`,
								zone.name,
								() => {
									const easyZone = powerResult.zones.find((z) => z.name.includes('Easy'));
									selectedWorkout = {
										...workout,
										zoneName: zone.name,
										zone: zone.zone,
										pattern: workout.pattern,
										powerRange: `${zone.wattsLow}–${zone.wattsHigh} W`,
										easyPowerRange: easyZone
											? `${easyZone.wattsLow}–${easyZone.wattsHigh} W`
											: `${zone.wattsLow}–${zone.wattsHigh} W`
									};
								}
							)}
						{/each}
					</WorkoutRail>
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
	{:else if mode === 'hr'}
		<!-- HR MODE RESULTS -->
		{#if hrResult === null}
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
					Enter your LTHR and weekly mileage above to see your workout suggestions.
				</p>
			</div>
		{:else if hrResult === 'out-of-range'}
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
					That LTHR is outside the supported range (100–200 bpm).
				</p>
				<p class="mt-1 text-sm text-muted">
					Try entering a value closer to your actual threshold heart rate.
				</p>
			</div>
		{:else}
			<!-- State C: Valid results -->

			<!-- LTHR headline -->
			<div class="mb-6 text-center">
				<p class="text-xs font-medium uppercase tracking-wide text-muted">Your LTHR</p>
				<p class="text-4xl font-bold tabular-nums text-accent">{hrResult.lthr} bpm</p>
			</div>

			{#if hrResult.usedFallbackPace}
				<div class="mb-6 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-ink">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="mt-0.5 shrink-0 text-amber-500"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M12 16v-4" />
						<path d="M12 8h.01" />
					</svg>
					<p>
						Durations are estimated using a general easy pace. Enter a race result on the Pace tab
						for personalized volume.
					</p>
				</div>
			{/if}

			<!-- HR zone mapping -->
			<div class="mb-6 space-y-2">
				{#each hrResult.zones as zone (zone.zone)}
					<div class="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2">
						<span
							class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white"
							aria-label="Zone {zone.zone}"
						>
							{zone.zone}
						</span>
						<span class="flex-1 text-sm text-ink">{zone.name}</span>
						<span class="text-sm tabular-nums text-muted">
							{formatBpmRange(zone.bpmLow, zone.bpmHigh)}
						</span>
						<span
							class="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
							class:bg-green-100={zone.confidence === 'high'}
							class:text-green-800={zone.confidence === 'high'}
							class:dark:bg-green-900={zone.confidence === 'high'}
							class:dark:text-green-200={zone.confidence === 'high'}
							class:bg-amber-100={zone.confidence === 'medium'}
							class:text-amber-800={zone.confidence === 'medium'}
							class:dark:bg-amber-900={zone.confidence === 'medium'}
							class:dark:text-amber-200={zone.confidence === 'medium'}
							class:bg-gray-100={zone.confidence === 'low'}
							class:text-gray-700={zone.confidence === 'low'}
							class:dark:bg-gray-700={zone.confidence === 'low'}
							class:dark:text-gray-300={zone.confidence === 'low'}
							title={zone.confidence === 'high'
								? "This zone's HR range is well-established."
								: zone.confidence === 'medium'
									? 'Threshold HR varies runner to runner.'
									: 'HR lags too much over short efforts — use pace/effort as the primary guide.'}
						>
							{zone.confidence}
						</span>
					</div>
				{/each}
			</div>

			<!-- Per-zone workout cards (HR mode) -->
			{#each hrResult.zones as zone (zone.zone)}
				<section class="mb-8 last:mb-0">
					<div class="mb-3 flex items-center gap-2">
						<span
							class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white"
							aria-label="Zone {zone.zone}"
						>
							{zone.zone}
						</span>
						<h3 class="font-medium text-ink">{zone.name}</h3>
						<span class="text-sm tabular-nums text-muted">
							{formatBpmRange(zone.bpmLow, zone.bpmHigh)}
						</span>
					</div>

					<WorkoutRail label="{zone.name} workouts">
						{#each zone.workouts as workout (workout.label + workout.description)}
							{@render workoutCard(
								workout,
								undefined,
								[
									{ icon: 'clock', text: formatDurationMinutes(workout.estimatedDurationMinutes), srLabel: 'Estimated duration' },
									{ icon: 'refresh', text: workout.recovery, srLabel: 'Recovery' },
									...((zone.zone === 'I' || zone.zone === 'R') && zone.informationalPaceLow
										? [{ text: `${zone.informationalPaceLow}–${zone.informationalPaceHigh} /km`, srLabel: 'Pace (reference only)', muted: true }]
										: [])
								],
								`Includes a ${formatDurationMinutes(workout.segments[0].durationMinutes)} warm-up and ${formatDurationMinutes(workout.segments[workout.segments.length - 1].durationMinutes)} cool-down.`,
								zone.name,
								() => {
									const easyZone = hrResult.zones.find((z) => z.name.includes('Easy'));
									selectedWorkout = {
										...workout,
										zoneName: zone.name,
										zone: zone.zone,
										pattern: workout.pattern,
										hrRange: formatBpmRange(zone.bpmLow, zone.bpmHigh),
										easyHrRange: easyZone
											? formatBpmRange(easyZone.bpmLow, easyZone.bpmHigh)
											: formatBpmRange(zone.bpmLow, zone.bpmHigh)
									};
								}
							)}
						{/each}
					</WorkoutRail>
				</section>
			{/each}
		{/if}
	{:else}
		<!-- RACE-PREP MODE RESULTS -->
		{#if racePrepResult === null}
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
					Enter your race result, race date, and weekly mileage{racePrepModality === 'power'
						? ', plus your power'
						: racePrepModality === 'hr'
							? ', plus your LTHR'
							: ''} above to see your race-prep plan.
				</p>
			</div>
		{:else if racePrepResult === 'out-of-range'}
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
					That combination isn't available for Race-Prep right now.
				</p>
				<p class="mt-1 text-sm text-muted">
					Check your race result is valid and your race date is 4–8 weeks away.
				</p>
			</div>
		{:else}
			<!-- State C: Valid results -->

			<!-- Race-Prep headline -->
			<div class="mb-6 text-center">
				<p class="text-xs font-medium uppercase tracking-wide text-muted">
					{isCustom ? `${racePrepResult.raceDistanceKm}km` : selectedOption} in {racePrepResult.weeksUntilRace}
					{racePrepResult.weeksUntilRace === 1 ? 'week' : 'weeks'}
				</p>
				<p class="text-4xl font-bold tabular-nums text-accent">
					{formatPace(racePrepResult.goalPaceMinKm)}/km
				</p>
				<p class="mt-1 text-xs text-muted">Goal race pace</p>
			</div>

			<!-- Week timeline: navigate the plan's arc instead of scrolling past four full sections -->
			<div class="mb-6 flex items-center" role="tablist" aria-label="Race-prep week">
				{#each racePrepResult.weeks as week, i (week.weekNumber)}
					<button
						type="button"
						role="tab"
						aria-selected={selectedRacePrepWeek === week.weekNumber}
						onclick={() => (selectedRacePrepWeek = week.weekNumber)}
						class="flex flex-1 flex-col items-center gap-1.5 rounded-sm px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
					>
						<span
							class="flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-colors {selectedRacePrepWeek ===
							week.weekNumber
								? 'border-accent bg-accent text-white'
								: 'border-ink/15 text-muted'}"
						>
							{week.weekNumber}
						</span>
						<span
							class="text-center text-[11px] leading-tight font-medium"
							class:text-ink={selectedRacePrepWeek === week.weekNumber}
							class:text-muted={selectedRacePrepWeek !== week.weekNumber}
						>
							{week.phase}
						</span>
					</button>
					{#if i < racePrepResult.weeks.length - 1}
						<div class="mx-1 mb-5 h-0.5 flex-1 rounded-full bg-ink/10" aria-hidden="true"></div>
					{/if}
				{/each}
			</div>

			<!-- Weekly plan -->
			{#each racePrepResult.weeks as week (week.weekNumber)}
				<section class="mb-8 last:mb-0" class:hidden={selectedRacePrepWeek !== week.weekNumber}>
					<div class="mb-3">
						<h3 class="font-medium text-ink">Week {week.weekNumber}: {week.phase}</h3>
						<p class="mt-1 text-sm text-muted">{PHASE_PURPOSE[week.phase]}</p>
					</div>

					<WorkoutRail label="Week {week.weekNumber} workouts">
						{#each week.workouts as workout (workout.label + workout.description)}
							{@const band = workout.zone
								? racePrepResult.zoneBands.find((b) => b.zone === workout.zone)?.rangeLabel
								: undefined}
							{@const easyBand = racePrepResult.zoneBands.find((b) => b.zone === 'E')?.rangeLabel}
							{@render workoutCard(
								workout,
								'Race-Prep',
								[
									{ icon: 'clock', text: formatDurationMinutes(workout.estimatedDurationMinutes), srLabel: 'Estimated duration' },
									...(racePrepResult.modality === 'pace' && workout.totalVolumeKm > 0
										? [{ text: `${workout.totalVolumeKm} km`, srLabel: 'Total volume' }]
										: []),
									{ icon: 'refresh', text: workout.recovery, srLabel: 'Recovery' }
								],
								`Includes a ${formatMinutesShort(workout.segments[0].durationMinutes)} warm-up and ${formatMinutesShort(workout.segments[workout.segments.length - 1].durationMinutes)} cool-down.`,
								week.phase,
								() => {
									selectedWorkout = {
										...workout,
										zoneName: week.phase,
										zone: workout.zone,
										pattern: workout.pattern,
										paceRange: racePrepResult.modality === 'pace' ? band : undefined,
										powerRange: racePrepResult.modality === 'power' ? band : undefined,
										hrRange: racePrepResult.modality === 'hr' ? band : undefined,
										easyPaceRange: racePrepResult.modality === 'pace' ? easyBand : undefined,
										easyPowerRange: racePrepResult.modality === 'power' ? easyBand : undefined,
										easyHrRange: racePrepResult.modality === 'hr' ? easyBand : undefined
									};
								}
							)}
						{/each}
					</WorkoutRail>
				</section>
			{/each}
		{/if}
	{/if}

	{#if (mode === 'pace' && result !== null) || (mode === 'power' && powerResult !== null) || (mode === 'hr' && hrResult !== null) || (mode === 'race-prep' && racePrepResult !== null)}
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

	<!-- Workout details modal -->
	{#if selectedWorkout}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
			aria-labelledby="workout-modal-title"
			tabindex="-1"
			onclick={(e) => {
				if (e.target === e.currentTarget) {
					selectedWorkout = null;
				}
			}}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					selectedWorkout = null;
				}
			}}
		>
			<div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-bg p-6 shadow-lg">
				<div class="mb-4 flex items-start justify-between">
					<div>
						<p class="text-sm text-muted">
							{selectedWorkout.zone ? `Zone ${selectedWorkout.zoneName}` : selectedWorkout.zoneName}
						</p>
						<h2 id="workout-modal-title" class="text-2xl font-bold text-ink">{selectedWorkout.label}</h2>
					</div>
					<button
						type="button"
						onclick={() => {
							selectedWorkout = null;
						}}
						class="rounded-sm text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
						aria-label="Close modal"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M18 6l-12 12M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="mb-6 space-y-4">
					<p class="text-base font-medium text-ink">Format: {selectedWorkout.description}</p>
					{#if selectedWorkout.pattern === 'mixed-zone'}
						<p class="text-sm text-muted">
							This session blends two effort zones — ease into each higher-intensity segment, then
							settle back to the base pace.
						</p>
					{/if}
				</div>

				<div class="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-ink/5 p-4">
					{#if selectedWorkout.totalVolumeKm > 0}
						<div>
							<p class="text-xs font-medium uppercase tracking-wide text-muted">Total Volume</p>
							<p class="text-lg font-bold text-ink">{selectedWorkout.totalVolumeKm} km</p>
						</div>
					{/if}
					<div>
						<p class="text-xs font-medium uppercase tracking-wide text-muted">Estimated Duration</p>
						<p class="text-lg font-bold text-ink">{formatDurationMinutes(selectedWorkout.estimatedDurationMinutes)}</p>
					</div>
					<div>
						<p class="text-xs font-medium uppercase tracking-wide text-muted">Recovery</p>
						<p class="text-lg font-bold text-ink">{selectedWorkout.recovery}</p>
					</div>
					{#if selectedWorkout.powerRange}
						<div>
							<p class="text-xs font-medium uppercase tracking-wide text-muted">Power Range</p>
							<p class="text-lg font-bold text-accent">{selectedWorkout.powerRange}</p>
						</div>
					{/if}
				</div>

				<div class="mb-6">
					<h3 class="mb-4 font-medium text-ink">Workout Profile</h3>
					<WorkoutProfileChart segments={selectedWorkout.segments} />
					<p class="mt-3 flex items-center gap-4 text-sm text-muted">
						<span class="inline-flex items-center gap-2">
							<span class="inline-block h-3 w-3 rounded-full bg-accent" aria-hidden="true"></span>
							Work
						</span>
						<span class="inline-flex items-center gap-2">
							<span class="inline-block h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true"></span>
							Warm-up / Recovery / Cool-down
						</span>
					</p>

					<!-- Segment breakdown -->
					<div class="mt-4 space-y-1 rounded-lg bg-ink/5 p-3 text-sm">
						{#each selectedWorkout.segments as segment, i (i)}
							{@const segmentRange = segmentRangeFor(segment)}
							<div
								class="flex items-center justify-between gap-2 rounded px-2 py-1 transition-colors hover:bg-accent/10"
							>
								<div class="flex items-center gap-3">
									<span
										class="inline-block h-3 w-3 rounded-full"
										class:bg-accent={segment.type === 'work'}
										class:bg-gray-300={segment.type !== 'work'}
										class:dark:bg-gray-600={segment.type !== 'work'}
										aria-hidden="true"
									></span>
									<div class="flex flex-col gap-1">
										<span class="text-ink font-medium capitalize">
											{segment.type}
										</span>
										<span class="text-xs text-muted/70">
											{segmentRange}
										</span>
									</div>
								</div>
								<span class="font-semibold text-ink tabular-nums">
									{formatDurationMinutes(segment.durationMinutes)}
								</span>
							</div>
						{/each}
					</div>
				</div>

				<div class="border-t border-ink/10 pt-4">
					<p class="text-sm text-muted">
						Includes a {formatDurationMinutes(selectedWorkout.segments[0].durationMinutes)} warm-up and {formatDurationMinutes(selectedWorkout.segments[selectedWorkout.segments.length - 1].durationMinutes)} cool-down.
					</p>
				</div>

				<div class="mt-6 flex flex-col gap-3 sm:flex-row">
					{#if selectedWorkout.zone}
					<button
						type="button"
						onclick={downloadFitWorkout}
						disabled={downloadingFit}
						aria-busy={downloadingFit}
						class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-ink/10 px-4 py-2 font-medium text-ink transition-colors hover:border-accent hover:text-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{#if downloadingFit}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								class="animate-spin"
								aria-hidden="true"
							>
								<path d="M21 12a9 9 0 1 1-9-9" />
							</svg>
							Preparing…
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M12 3v12" />
								<path d="m7 10 5 5 5-5" />
								<path d="M5 21h14" />
							</svg>
							Download as .FIT
						{/if}
					</button>
					{/if}
					<button
						type="button"
						onclick={() => {
							selectedWorkout = null;
						}}
						class="flex-1 rounded-lg bg-accent px-4 py-2 font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	{/if}
</ToolLayout>

<Toast />

<PageExplainer route="/workouts" />
