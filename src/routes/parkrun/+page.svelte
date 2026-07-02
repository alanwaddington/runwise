<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import ResultDisplay from '$lib/components/ResultDisplay.svelte';
	import { parseTime, formatTime, predictedPaceMinPerKm } from '$lib/utils/race-predictor';
	import { parsePace, formatPace, minPerKmToMinPerMile } from '$lib/utils/pace';
	import {
		EFFORT_DISTANCES,
		predictParkrunTime,
		generateSplits,
		compareToPb,
		calculateAgeGrade,
		getAgeGradeLabel,
		type EffortLevel,
		type Gender,
		type AgeGradeLabel
	} from '$lib/utils/parkrun';

	type InputMode = 'recent-run' | 'average-pace';

	const AGE_GRADE_COLOURS: Record<AgeGradeLabel, string> = {
		World: 'bg-purple-600',
		National: 'bg-emerald-600',
		Regional: 'bg-teal-500',
		Local: 'bg-amber-500',
		Recreational: 'bg-gray-400'
	};

	let mode = $state<InputMode>('recent-run');
	let effort = $state<EffortLevel>('moderate');

	let distanceRaw = $state<number | string>('');
	let timeRaw = $state('');
	let paceRaw = $state('');

	let pbRaw = $state('');
	let ageRaw = $state<number | string>('');
	let genderRaw = $state('prefer-not-to-say');

	let distanceKm = $derived(
		typeof distanceRaw === 'number' && isFinite(distanceRaw) && distanceRaw > 0 ? distanceRaw : null
	);

	let timeSeconds = $derived(parseTime(timeRaw));
	let paceDecimal = $derived(parsePace(paceRaw));

	let effortDistanceKm = $derived(EFFORT_DISTANCES[effort]);

	let inputDistanceKm = $derived(mode === 'recent-run' ? distanceKm : effortDistanceKm);
	let inputTimeSeconds = $derived(
		mode === 'recent-run'
			? timeSeconds
			: paceDecimal !== null
				? paceDecimal * 60 * effortDistanceKm
				: null
	);

	let predictedSeconds = $derived(
		inputDistanceKm !== null && inputTimeSeconds !== null
			? predictParkrunTime(inputDistanceKm, inputTimeSeconds, effort)
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

	function onTimeInput(e: Event) {
		timeRaw = (e.target as HTMLInputElement).value;
	}

	function onPaceInput(e: Event) {
		paceRaw = (e.target as HTMLInputElement).value;
	}

	function onPbInput(e: Event) {
		pbRaw = (e.target as HTMLInputElement).value;
	}

	function onGenderChange(e: Event) {
		genderRaw = (e.target as HTMLSelectElement).value;
	}
</script>

<svelte:head>
	<title>Parkrun Predictor — Runwise</title>
	<meta
		name="description"
		content="Free parkrun predictor, parkrun pace calculator, and parkrun time calculator for runners. Predict your 5K parkrun time from a recent training run or pace using the Riegel formula, with pacing splits, PB comparison, and WMA age grading."
	/>
</svelte:head>

<ToolLayout
	title="Parkrun Predictor"
	pageTitle="Parkrun Predictor — Runwise"
	description="Predict your parkrun time from recent race performances."
>
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
			class="flex-1 rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
			class:bg-accent={mode === 'recent-run'}
			class:text-white={mode === 'recent-run'}
			class:font-semibold={mode === 'recent-run'}
			class:text-gray-500={mode !== 'recent-run'}
			class:hover:text-ink={mode !== 'recent-run'}
		>
			Recent Run
		</button>
		<button
			role="tab"
			aria-selected={mode === 'average-pace'}
			onclick={() => selectMode('average-pace')}
			class="flex-1 rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
			class:bg-accent={mode === 'average-pace'}
			class:text-white={mode === 'average-pace'}
			class:font-semibold={mode === 'average-pace'}
			class:text-gray-500={mode !== 'average-pace'}
			class:hover:text-ink={mode !== 'average-pace'}
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
			type="number"
			inputmode="decimal"
			step={0.1}
			placeholder="e.g. 8"
		/>
		<div class="mb-4">
			<label for="time" class="mb-1.5 block text-sm font-medium text-ink">Time</label>
			<input
				id="time"
				type="text"
				inputmode="decimal"
				placeholder="e.g. 48:00"
				value={timeRaw}
				oninput={onTimeInput}
				class="h-12 w-full rounded-lg border border-gray-300 bg-bg px-3 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
			/>
		</div>
	{:else}
		<!-- Average Pace input -->
		<div class="mb-4">
			<label for="pace" class="mb-1.5 block text-sm font-medium text-ink">Pace</label>
			<div class="relative">
				<input
					id="pace"
					type="text"
					inputmode="decimal"
					placeholder="e.g. 6:00"
					value={paceRaw}
					oninput={onPaceInput}
					aria-describedby="pace-unit"
					class="h-12 w-full rounded-lg border border-gray-300 bg-bg px-3 pr-14 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
				/>
				<span
					id="pace-unit"
					class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
				>
					/km
				</span>
			</div>
		</div>
	{/if}

	<!-- Effort level selector -->
	<div class="mb-4">
		<span class="mb-1.5 block text-sm font-medium text-ink">Effort level</span>
		<div class="flex gap-2">
			{#each [{ level: 'easy' as EffortLevel, label: 'Easy' }, { level: 'moderate' as EffortLevel, label: 'Moderate' }, { level: 'hard' as EffortLevel, label: 'Hard' }] as option (option.level)}
				<button
					type="button"
					aria-pressed={effort === option.level}
					onclick={() => (effort = option.level)}
					class="flex-1 rounded-lg border py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
					class:border-accent={effort === option.level}
					class:bg-accent={effort === option.level}
					class:text-white={effort === option.level}
					class:font-semibold={effort === option.level}
					class:border-gray-300={effort !== option.level}
					class:text-gray-500={effort !== option.level}
					class:dark:border-gray-700={effort !== option.level}
					class:hover:text-ink={effort !== option.level}
				>
					{option.label}
				</button>
			{/each}
		</div>
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
					class="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-bg px-3 pr-10 text-ink focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-gray-700"
				>
					<option value="prefer-not-to-say">Prefer not to say</option>
					<option value="male">Male</option>
					<option value="female">Female</option>
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
			<p class="mt-3 text-sm text-gray-400">
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
			<p class="mt-3 text-center text-sm text-gray-500">
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
							class="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
							>KM</th
						>
						<th
							scope="col"
							class="pb-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500"
							>Cumulative</th
						>
						<th
							scope="col"
							class="pb-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500"
							>Split Pace</th
						>
					</tr>
				</thead>
				<tbody>
					{#each splits as split (split.km)}
						<tr class="border-b border-ink/10 last:border-0">
							<td class="py-3 font-medium text-ink">{split.km}</td>
							<td class="py-3 text-right tabular-nums text-ink">{split.cumulative}</td>
							<td class="py-3 text-right tabular-nums text-gray-600">{split.splitPace}</td>
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
				class:text-gray-500={pbComparison.deltaSeconds === 0}
			>
				{pbComparison.description}
			</p>
		{/if}

		<!-- Age grade -->
		{#if ageGradePercent !== null}
			{@const label = getAgeGradeLabel(ageGradePercent)}
			<div class="mt-4 flex items-center justify-center gap-3">
				<span class="text-sm text-gray-500">Age grade:</span>
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
		<p class="mt-6 text-center text-xs text-gray-400">
			<a href="/race-predictor" class="text-accent underline-offset-2 hover:underline"
				>Race Time Predictor</a
			>
			&nbsp;·&nbsp;
			<a href="/training-paces" class="text-accent underline-offset-2 hover:underline"
				>Training Pace Calculator</a
			>
			&nbsp;·&nbsp;
			<a href="/vo2max" class="text-accent underline-offset-2 hover:underline">VO2 Max Estimator</a
			>
		</p>
	{/if}
</ToolLayout>
