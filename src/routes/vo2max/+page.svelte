<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import CollapsibleField from '$lib/components/CollapsibleField.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageExplainer from '$lib/components/PageExplainer.svelte';
	import { validatePositive } from '$lib/utils/validation';
	import { STANDARD_DISTANCES, parseTime, buildPredictionTable } from '$lib/utils/race-predictor';
	import { calculateVdot } from '$lib/utils/training-paces';
	import {
		getFitnessCategory,
		getAcsmTable,
		CATEGORY_COLOURS,
		CATEGORIES,
		type Gender
	} from '$lib/utils/vo2max';

	let selectedOption = $state('5K');
	let customKmRaw = $state('');
	let timeRaw = $state('');
	let ageRaw = $state<number | string>('');
	let genderRaw = $state('prefer-not-to-say');

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
	let customKm = $derived(isCustom && parseFloat(customKmRaw) > 0 ? parseFloat(customKmRaw) : null);

	let age = $derived(
		typeof ageRaw === 'number' && isFinite(ageRaw) && ageRaw > 0 ? Math.round(ageRaw) : null
	);

	let gender = $derived<Gender | 'prefer-not-to-say'>(
		genderRaw === 'male' || genderRaw === 'female' ? genderRaw : 'prefer-not-to-say'
	);

	type VdotState = { type: 'empty' } | { type: 'out-of-range' } | { type: 'valid'; vdot: number };

	let vdotState = $derived<VdotState>(
		(() => {
			if (timeSeconds === null || distanceKm <= 0) return { type: 'empty' };
			const raw = calculateVdot(distanceKm, timeSeconds);
			if (raw === null) return { type: 'out-of-range' };
			return { type: 'valid', vdot: Math.round(raw * 10) / 10 };
		})()
	);

	let predictionRows = $derived(
		vdotState.type === 'valid' && timeSeconds !== null
			? buildPredictionTable(timeSeconds, distanceKm, customKm)
			: null
	);

	let fitnessResult = $derived(
		vdotState.type === 'valid' && age !== null && (gender === 'male' || gender === 'female')
			? getFitnessCategory(vdotState.vdot, age, gender)
			: null
	);

	let acsmTable = $derived(getAcsmTable());

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

	function onGenderChange(e: Event) {
		genderRaw = (e.target as HTMLSelectElement).value;
	}
</script>

<SeoHead route="/vo2max" />

<ToolLayout title="VO2 Max Estimator" description="Estimate your VO2 max from race times or field tests." route="/vo2max">
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

	<!-- Custom distance input -->
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

	<!-- Finish time input -->
	<InputField
		id="finish-time"
		label="Finish time"
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

	<!-- Optional: Age + Gender -->
	<div class="mb-4 grid grid-cols-2 gap-3">
		<div>
			<InputField
				id="age"
				label="Age (optional)"
				bind:value={ageRaw}
				unit="yrs"
				type="number"
				inputmode="numeric"
				placeholder="e.g. 35"
			/>
		</div>
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
	{#if vdotState.type === 'empty'}
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
				<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
			</svg>
			<p class="mt-3 text-sm text-muted">
				Enter a race result above to see your VO2 max.
			</p>
		</div>
	{:else if vdotState.type === 'out-of-range'}
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
				aria-hidden="true"
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
		<!-- VDOT headline -->
		<div class="mb-6 text-center">
			<p class="text-xs font-medium uppercase tracking-wide text-muted">Your VDOT / VO2 max</p>
			<p class="text-4xl font-bold tabular-nums text-accent" data-testid="vdot-value">{vdotState.vdot}</p>
			<p class="mt-1 text-sm text-muted">ml/kg/min</p>
			<p class="mt-3 text-xs text-muted">
				<span class="font-medium text-ink">What is VDOT?</span>
				VDOT is a practical proxy for VO2 max — your body's ability to use oxygen during exercise. Derived from your race performance using Jack Daniels' formula, it accounts for both aerobic capacity and running economy.
			</p>
			<p class="mt-2 text-xs text-muted">
				<span class="font-medium text-ink">Why does this differ from my GPS watch?</span>
				Devices like Garmin and Coros estimate VO2 max from heart rate and pace trends across many runs, and can run several points higher than a race-derived VDOT — especially if your watch's max heart rate is set too high. This estimate reflects what your race result actually demonstrated on the day, so treat both figures as estimates rather than exact measurements.
			</p>
		</div>

		<hr class="mb-6 border-t border-ink/10" />

		<!-- Fitness category -->
		<div class="mb-6">
			<p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Fitness Category</p>

			{#if fitnessResult !== null}
				<!-- Personalised result -->
				<div data-testid="fitness-category-personalised" class="rounded-lg border border-ink/10 p-4">
					<div class="flex items-center gap-3">
						<span
							data-testid="category-badge"
							class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white {CATEGORY_COLOURS[fitnessResult.category]}"
						>
							{fitnessResult.category}
						</span>
						<p class="text-sm text-muted">
							for a {fitnessResult.gender} age {fitnessResult.bracket}
						</p>
					</div>
					{#if fitnessResult.isApproximate}
						<p class="mt-2 text-xs text-muted">
							Based on nearest available bracket ({fitnessResult.bracket}) — ACSM norms cover ages 20–79.
						</p>
					{/if}
				</div>
			{:else if age !== null && gender === 'prefer-not-to-say'}
				<!-- Prefer not to say — show both genders for that age bracket -->
				{@const bracketResult = getFitnessCategory(vdotState.vdot, age, 'male')}
				{@const femaleBracketResult = getFitnessCategory(vdotState.vdot, age, 'female')}
				{#if bracketResult !== null && femaleBracketResult !== null}
					<div data-testid="fitness-both-genders" class="rounded-lg border border-ink/10 p-4">
						<p class="mb-3 text-xs text-muted">Age {bracketResult.bracket} reference ranges:</p>
						<div class="flex gap-4">
							<div>
								<p class="mb-1 text-xs font-medium text-muted">Male</p>
								<span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white {CATEGORY_COLOURS[bracketResult.category]}">
									{bracketResult.category}
								</span>
							</div>
							<div>
								<p class="mb-1 text-xs font-medium text-muted">Female</p>
								<span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white {CATEGORY_COLOURS[femaleBracketResult.category]}">
									{femaleBracketResult.category}
								</span>
							</div>
						</div>
						{#if bracketResult.isApproximate}
							<p class="mt-2 text-xs text-muted">
								Based on nearest available bracket ({bracketResult.bracket}) — ACSM norms cover ages 20–79.
							</p>
						{/if}
					</div>
				{/if}
			{:else}
				<!-- General ACSM reference — both male and female norms -->
				<div data-testid="acsm-reference-table">
					<p class="mb-3 text-xs text-muted">
						Enter your age and gender above for your personalised category. ACSM reference norms (ml/kg/min):
					</p>

					<!-- Male norms -->
					<div class="mb-4">
						<p class="mb-2 text-xs font-medium text-muted">Male</p>
						<div class="grid grid-cols-6 border-b border-ink/10 pb-1 text-xs font-medium text-muted">
							<span>Age</span>
							{#each CATEGORIES.slice(0, 5) as cat (cat)}
								<span class="text-right">{cat}</span>
							{/each}
						</div>
						{#each acsmTable as bracket (bracket.label)}
							<div class="grid grid-cols-6 border-b border-ink/10 py-1 text-xs last:border-0">
								<span class="font-medium text-ink">{bracket.label}</span>
								<span class="text-right tabular-nums text-muted">{bracket.male.superior}+</span>
								<span class="text-right tabular-nums text-muted">{bracket.male.excellent}+</span>
								<span class="text-right tabular-nums text-muted">{bracket.male.good}+</span>
								<span class="text-right tabular-nums text-muted">{bracket.male.fair}+</span>
								<span class="text-right tabular-nums text-muted">{bracket.male.poor}+</span>
							</div>
						{/each}
					</div>

					<!-- Female norms -->
					<div>
						<p class="mb-2 text-xs font-medium text-muted">Female</p>
						<div class="grid grid-cols-6 border-b border-ink/10 pb-1 text-xs font-medium text-muted">
							<span>Age</span>
							{#each CATEGORIES.slice(0, 5) as cat (cat)}
								<span class="text-right">{cat}</span>
							{/each}
						</div>
						{#each acsmTable as bracket (bracket.label)}
							<div class="grid grid-cols-6 border-b border-ink/10 py-1 text-xs last:border-0">
								<span class="font-medium text-ink">{bracket.label}</span>
								<span class="text-right tabular-nums text-muted">{bracket.female.superior}+</span>
								<span class="text-right tabular-nums text-muted">{bracket.female.excellent}+</span>
								<span class="text-right tabular-nums text-muted">{bracket.female.good}+</span>
								<span class="text-right tabular-nums text-muted">{bracket.female.fair}+</span>
								<span class="text-right tabular-nums text-muted">{bracket.female.poor}+</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<hr class="mb-6 border-t border-ink/10" />

		<!-- Race predictions table -->
		{#if predictionRows}
			<div class="mb-6">
				<p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Equivalent Race Times</p>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-sm">
						<thead>
							<tr class="border-b border-ink/10">
								<th scope="col" class="pb-2 text-left text-xs font-medium uppercase tracking-wide text-muted">Distance</th>
								<th scope="col" class="pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted">Time</th>
								<th scope="col" class="hidden pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted sm:table-cell">Pace/km</th>
								<th scope="col" class="hidden pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted sm:table-cell">Pace/mile</th>
							</tr>
						</thead>
						<tbody>
							{#each predictionRows as row (row.name)}
								{@const isHighlighted = Math.abs(row.km - distanceKm) < 0.001}
								<tr
									class="relative border-b border-ink/10 last:border-0 {isHighlighted ? 'bg-accent/10' : ''}"
									aria-current={isHighlighted ? 'true' : undefined}
								>
									<td class="relative py-3 font-medium text-ink">
										{#if isHighlighted}
											<span class="absolute inset-y-0 left-0 w-0.5 rounded-r bg-accent" aria-hidden="true"></span>
										{/if}
										{row.name}
									</td>
									<td class="py-3 text-right tabular-nums text-ink">{row.timeFormatted}</td>
									<td class="hidden py-3 text-right tabular-nums text-muted sm:table-cell">{row.paceMinKm}</td>
									<td class="hidden py-3 text-right tabular-nums text-muted sm:table-cell">{row.paceMinMile}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="mt-2 text-xs text-muted">Predictions use the Riegel formula (exponent 1.06). Results are estimates.</p>
			</div>
		{/if}

		<!-- Footer cross-links -->
		<p class="mt-6 text-center text-xs text-muted">
			Find your training paces →
			<a href="/training-paces" class="rounded-sm text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">Training Pace Calculator</a>
			&nbsp;·&nbsp;
			<a href="/race-predictor" class="rounded-sm text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">Race Time Predictor</a>
		</p>
	{/if}

</ToolLayout>

<PageExplainer route="/vo2max" />
