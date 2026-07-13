<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import ResultDisplay from '$lib/components/ResultDisplay.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageExplainer from '$lib/components/PageExplainer.svelte';
	import { validatePositive } from '$lib/utils/validation';
	import { parseTime, formatTime, predictedPaceMinPerKm } from '$lib/utils/race-predictor';
	import { parsePace, formatPace, minPerKmToMinPerMile } from '$lib/utils/pace';
	import {
		REFERENCE_DISTANCES,
		predictParkrunTime,
		generateSplits,
		compareToPb,
		calculateAgeGrade,
		getAgeGradeLabel,
		type Gender,
		type AgeGradeLabel
	} from '$lib/utils/parkrun';

	type InputMode = 'recent-run' | 'average-pace';

	// Shades chosen so white text on each fill meets WCAG AA (4.5:1) — several of the
	// lighter shades used previously (teal-500, amber-500, gray-400) failed contrast.
	const AGE_GRADE_COLOURS: Record<AgeGradeLabel, string> = {
		World: 'bg-purple-600',
		National: 'bg-emerald-700',
		Regional: 'bg-teal-700',
		Local: 'bg-amber-700',
		Recreational: 'bg-gray-600'
	};

	let mode = $state<InputMode>('recent-run');
	let referenceDistanceIndex = $state(2);

	let distanceRaw = $state('');
	let timeRaw = $state('');
	let paceRaw = $state('');

	let pbRaw = $state('');
	let ageRaw = $state<number | string>('');
	let genderRaw = $state('prefer-not-to-say');

	let distanceTouched = $state(false);
	let timeTouched = $state(false);
	let paceTouched = $state(false);

	let distanceError = $state<string | null>(null);
	let timeError = $state<string | null>(null);
	let paceError = $state<string | null>(null);

	let distanceKm = $derived(
		(() => {
			const v = parseFloat(distanceRaw);
			return isFinite(v) && v > 0 ? v : null;
		})()
	);

	let timeSeconds = $derived(parseTime(timeRaw));
	let paceDecimal = $derived(parsePace(paceRaw));

	let referenceDistanceKm = $derived(REFERENCE_DISTANCES[referenceDistanceIndex].km);

	let inputDistanceKm = $derived(mode === 'recent-run' ? distanceKm : referenceDistanceKm);
	let inputTimeSeconds = $derived(
		mode === 'recent-run'
			? timeSeconds
			: paceDecimal !== null
				? paceDecimal * 60 * referenceDistanceKm
				: null
	);

	let predictedSeconds = $derived(
		inputDistanceKm !== null && inputTimeSeconds !== null
			? predictParkrunTime(inputDistanceKm, inputTimeSeconds, referenceDistanceKm)
			: null
	);

	let pbSeconds = $derived(parseTime(pbRaw));

	let age = $derived(
		typeof ageRaw === 'number' && isFinite(ageRaw) && ageRaw > 0 ? Math.round(ageRaw) : null
	);

	let gender = $derived<Gender | 'prefer-not-to-say'>(
		genderRaw === 'male' || genderRaw === 'female' ? genderRaw : 'prefer-not-to-say'
	);

	let ageGradePercent = $derived(
		predictedSeconds !== null && age !== null && (gender === 'male' || gender === 'female')
			? calculateAgeGrade(predictedSeconds, age, gender)
			: null
	);

	let paceMinPerKm = $derived(
		predictedSeconds !== null ? predictedPaceMinPerKm(predictedSeconds, 5) : null
	);

	let splits = $derived(predictedSeconds !== null ? generateSplits(predictedSeconds) : []);

	let pbComparison = $derived(
		predictedSeconds !== null && pbSeconds !== null
			? compareToPb(predictedSeconds, pbSeconds)
			: null
	);

	function selectMode(m: InputMode) {
		mode = m;
		distanceRaw = '';
		timeRaw = '';
		paceRaw = '';
		distanceError = null;
		timeError = null;
		paceError = null;
	}

	function handleTabKeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		const modes: InputMode[] = ['recent-run', 'average-pace'];
		const currentIndex = modes.indexOf(mode);
		if (e.key === 'ArrowRight') {
			selectMode(modes[(currentIndex + 1) % modes.length]);
		} else {
			selectMode(modes[(currentIndex - 1 + modes.length) % modes.length]);
		}
	}

	function onDistanceInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		distanceRaw = raw;
		const validation = validatePositive(raw ? parseFloat(raw) : null);
		distanceError = validation.type === 'invalid' ? validation.error : null;
	}

	function onTimeInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		timeRaw = raw;
		timeError = raw && parseTime(raw) === null ? 'Enter MM:SS or H:MM:SS' : null;
	}

	function onPaceInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		paceRaw = raw;
		paceError = raw && parsePace(raw) === null ? 'Enter pace as M:SS (e.g., 5:30)' : null;
	}

	function onPbInput(e: Event) {
		pbRaw = (e.target as HTMLInputElement).value;
	}

	function onGenderChange(e: Event) {
		genderRaw = (e.target as HTMLSelectElement).value;
	}

	function reset() {
		distanceRaw = '';
		timeRaw = '';
		paceRaw = '';
		pbRaw = '';
		distanceTouched = false;
		timeTouched = false;
		paceTouched = false;
		distanceError = null;
		timeError = null;
		paceError = null;
	}
</script>

<SeoHead route="/parkrun" />

<ToolLayout title="Parkrun Predictor" description="Predict your parkrun time from recent race performances." route="/parkrun">
	<!-- Input mode toggle -->
	<div
		class="mb-4 flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800"
		role="tablist"
		tabindex="-1"
		onkeydown={handleTabKeydown}
	>
		<button
			role="tab"
			aria-selected={mode === 'recent-run'}
			onclick={() => selectMode('recent-run')}
			class="flex-1 rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			class:bg-accent={mode === 'recent-run'}
			class:text-white={mode === 'recent-run'}
			class:font-semibold={mode === 'recent-run'}
			class:text-muted={mode !== 'recent-run'}
			class:hover:text-hover={mode !== 'recent-run'}
		>
			Recent Run
		</button>
		<button
			role="tab"
			aria-selected={mode === 'average-pace'}
			onclick={() => selectMode('average-pace')}
			class="flex-1 rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			class:bg-accent={mode === 'average-pace'}
			class:text-white={mode === 'average-pace'}
			class:font-semibold={mode === 'average-pace'}
			class:text-muted={mode !== 'average-pace'}
			class:hover:text-hover={mode !== 'average-pace'}
		>
			Average Pace
		</button>
	</div>

	<!-- Recent Run inputs -->
	{#if mode === 'recent-run'}
		<InputField
			id="distance"
			label="Distance"
			bind:value={distanceRaw}
			unit="km"
			type="text"
			inputmode="decimal"
			placeholder="e.g. 8"
			required
			error={distanceError}
			touched={distanceTouched}
			oninput={onDistanceInput}
			onblur={() => (distanceTouched = true)}
		/>
		<InputField
			id="time"
			label="Time"
			bind:value={timeRaw}
			type="text"
			inputmode="decimal"
			placeholder="e.g. 48:00"
			required
			error={timeError}
			touched={timeTouched}
			oninput={onTimeInput}
			onblur={() => (timeTouched = true)}
			aria-describedby="time-help"
		/>
		<p id="time-help" class="mt-1 text-xs text-muted">Enter MM:SS or H:MM:SS</p>
	{:else}
		<!-- Average Pace input -->
		<InputField
			id="pace"
			label="Pace"
			bind:value={paceRaw}
			unit="/km"
			type="text"
			inputmode="decimal"
			placeholder="e.g. 6:00"
			required
			error={paceError}
			touched={paceTouched}
			oninput={onPaceInput}
			onblur={() => (paceTouched = true)}
			aria-describedby="pace-help"
		/>
		<p id="pace-help" class="mt-1 text-xs text-muted">Enter pace as M:SS (e.g., 5:30)</p>
	{/if}

	<!-- Reference distance slider -->
	<div class="mb-4">
		<label for="reference-distance" class="mb-1.5 block text-sm font-medium text-ink"
			>Reference distance</label
		>
		<p class="mb-2 text-xs text-muted">
			Pick the distance your {mode === 'recent-run' ? 'entered time' : 'pace'} best represents an
			all-out effort for &mdash; we'll extrapolate from that effort down to a 5K prediction.
		</p>
		<input
			id="reference-distance"
			type="range"
			min="0"
			max={REFERENCE_DISTANCES.length - 1}
			step="1"
			bind:value={referenceDistanceIndex}
			aria-valuetext={REFERENCE_DISTANCES[referenceDistanceIndex].name}
			class="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-accent
			       [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
			       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
			       [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:transition-transform
			       [&::-webkit-slider-thumb]:duration-150 hover:[&::-webkit-slider-thumb]:scale-110
			       [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none
			       [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0
			       [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:transition-transform
			       [&::-moz-range-thumb]:duration-150 hover:[&::-moz-range-thumb]:scale-110
			       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
			       dark:bg-gray-700"
		/>
		<div class="mt-1 flex justify-between px-0.5 text-xs text-muted">
			{#each REFERENCE_DISTANCES as stop, i (stop.name)}
				<span
					class:text-accent-text={i === referenceDistanceIndex}
					class:font-semibold={i === referenceDistanceIndex}
				>
					{stop.short}
				</span>
			{/each}
		</div>
		<p class="mt-2 text-center text-sm text-muted">
			{REFERENCE_DISTANCES[referenceDistanceIndex].name} &middot; {referenceDistanceKm.toFixed(1)} km
		</p>
		<p class="mt-2 text-xs text-muted">
			Closer reference distances extrapolate more accurately &mdash; try 5K or 10K for the most
			reliable estimate, or a longer distance if that's what you actually race at.
		</p>
	</div>

	<!-- Optional fields: PB, Age, Gender -->
	<div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
		<div>
			<label for="pb" class="mb-1.5 block text-sm font-medium text-ink">PB (optional)</label>
			<input
				id="pb"
				type="text"
				inputmode="decimal"
				placeholder="e.g. 24:30"
				value={pbRaw}
				oninput={onPbInput}
				aria-label="PB, optional"
				class="h-12 w-full rounded-lg border border-gray-300 bg-bg px-3 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
			/>
		</div>
		<InputField
			id="age"
			label="Age (optional)"
			bind:value={ageRaw}
			unit="yrs"
			type="number"
			inputmode="numeric"
			placeholder="e.g. 35"
		/>
		<div>
			<label for="gender-select" class="mb-1.5 block text-sm font-medium text-ink"
				>Gender (optional)</label
			>
			<div class="relative">
				<select
					id="gender-select"
					value={genderRaw}
					onchange={onGenderChange}
					aria-label="Gender, optional"
					class="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-bg px-3 pr-10 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
				>
					<option value="prefer-not-to-say">Prefer not to say</option>
					<option value="male">Male</option>
					<option value="female">Female</option>
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
	</div>

	<hr class="my-6 border-t border-ink/10" />

	<!-- Results -->
	{#if predictedSeconds === null}
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
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="9" />
				<path d="M12 7v5l3 3" />
				<path d="M12 2v2" />
				<path d="M9 2h6" />
			</svg>
			<p class="mt-3 text-sm text-muted">
				{#if mode === 'recent-run'}
					Enter a distance and time above to predict your parkrun.
				{:else}
					Enter your average pace above to predict your parkrun.
				{/if}
			</p>
		</div>
	{:else}
		<ResultDisplay value={formatTime(predictedSeconds)} label="Predicted Parkrun Time" />

		{#if paceMinPerKm !== null}
			<p class="mt-3 text-center text-sm text-muted">
				{formatPace(paceMinPerKm)} /km · {formatPace(minPerKmToMinPerMile(paceMinPerKm))} /mile
			</p>
		{/if}

		<hr class="my-6 border-t border-ink/10" />

		<!-- Split table -->
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-sm">
				<thead>
					<tr class="border-b border-ink/10">
						<th
							scope="col"
							class="pb-2 text-left text-xs font-medium uppercase tracking-wide text-muted"
							>KM</th
						>
						<th
							scope="col"
							class="pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted"
							>Cumulative</th
						>
						<th
							scope="col"
							class="pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted"
							>Split Pace</th
						>
					</tr>
				</thead>
				<tbody>
					{#each splits as split (split.km)}
						<tr class="border-b border-ink/10 last:border-0">
							<td class="py-3 font-medium text-ink">{split.km}</td>
							<td class="py-3 text-right tabular-nums text-ink">{split.cumulative}</td>
							<td class="py-3 text-right tabular-nums text-muted">{split.splitPace}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- PB comparison -->
		{#if pbComparison !== null}
			<p
				class="mt-4 text-center text-sm"
				class:text-emerald-600={pbComparison.deltaSeconds > 0}
				class:text-red-500={pbComparison.deltaSeconds < 0}
				class:text-muted={pbComparison.deltaSeconds === 0}
			>
				{pbComparison.description}
			</p>
		{/if}

		<!-- Age grade -->
		{#if ageGradePercent !== null}
			{@const label = getAgeGradeLabel(ageGradePercent)}
			<div class="mt-4 flex items-center justify-center gap-3">
				<span class="text-sm text-muted">Age grade:</span>
				<span class="text-sm font-semibold tabular-nums text-ink">
					{ageGradePercent.toFixed(1)}%
				</span>
				<span
					class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white {AGE_GRADE_COLOURS[
						label
					]}"
				>
					{label}
				</span>
			</div>
		{/if}

		<!-- Footer cross-links -->
		<p class="mt-6 text-center text-xs text-muted">
			<a href="/race-predictor" class="rounded-sm text-accent-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
				>Race Time Predictor</a
			>
			&nbsp;·&nbsp;
			<a href="/training-paces" class="rounded-sm text-accent-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
				>Training Pace Calculator</a
			>
			&nbsp;·&nbsp;
			<a href="/vo2max" class="rounded-sm text-accent-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">VO2 Max Estimator</a
			>
		</p>

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

<PageExplainer route="/parkrun" />
