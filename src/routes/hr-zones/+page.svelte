<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { validatePositive, validateRange } from '$lib/utils/validation';
	import {
		calculateMaxHrZones,
		calculateLthrZones,
		calculateLthrSubZones,
		estimateMaxHr,
		type HrMethod,
		type HrZone
	} from '$lib/utils/hr-zones';

	let method = $state<HrMethod>('maxhr');
	let bpmRaw = $state<number | string>('');
	let ageRaw = $state<number | string>('');
	let showTooltip = $state(false);
	let zone5Expanded = $state(false);
	let tooltipContainer: HTMLElement | null = null;

	let bpmTouched = $state(false);
	let ageTouched = $state(false);

	let bpmError = $state<string | null>(null);
	let ageError = $state<string | null>(null);

	let bpm = $derived(
		typeof bpmRaw === 'number' && isFinite(bpmRaw) && bpmRaw > 0 ? bpmRaw : null
	);

	let age = $derived(
		typeof ageRaw === 'number' && isFinite(ageRaw) && ageRaw > 0 ? Math.round(ageRaw) : null
	);

	let zones = $derived(
		bpm !== null
			? method === 'maxhr'
				? calculateMaxHrZones(bpm)
				: calculateLthrZones(bpm)
			: null
	);

	let subZones = $derived(
		method === 'lthr' && bpm !== null ? calculateLthrSubZones(bpm) : null
	);

	let estimatedHr = $derived(age !== null ? estimateMaxHr(age) : null);

	function formatBpmRange(zone: HrZone): string {
		if (zone.bpmLow === null) return `< ${zone.bpmHigh}`;
		if (zone.bpmHigh === null) return `> ${zone.bpmLow}`;
		return `${zone.bpmLow}-${zone.bpmHigh}`;
	}

	function onBpmInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		bpmRaw = raw ? parseFloat(raw) : '';
		const validation = validatePositive(raw ? parseFloat(raw) : null);
		bpmError = validation.type === 'invalid' ? validation.error : null;
	}

	function onAgeInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		ageRaw = raw ? parseFloat(raw) : '';
		const validation = validateRange(raw ? parseFloat(raw) : null, 10, 100);
		ageError = validation.type === 'invalid' ? validation.error : null;
	}

	function selectMethod(m: HrMethod) {
		method = m;
		bpmRaw = '';
		ageRaw = '';
		bpmError = null;
		ageError = null;
		zone5Expanded = false;
	}

	$effect(() => {
		if (!showTooltip) return;
		function handleOutsideClick(e: MouseEvent) {
			if (tooltipContainer && !tooltipContainer.contains(e.target as Node)) {
				showTooltip = false;
			}
		}
		document.addEventListener('click', handleOutsideClick);
		return () => document.removeEventListener('click', handleOutsideClick);
	});

	function handleTabKeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		const methods: HrMethod[] = ['maxhr', 'lthr'];
		const currentIndex = methods.indexOf(method);
		if (e.key === 'ArrowRight') {
			selectMethod(methods[(currentIndex + 1) % methods.length]);
		} else {
			selectMethod(methods[(currentIndex - 1 + methods.length) % methods.length]);
		}
	}
</script>

<SeoHead route="/hr-zones" />

<ToolLayout
	title="Heart Rate Zone Calculator"
	description="Calculate your personalised heart rate training zones."
	route="/hr-zones"
>
	<!-- Method selector + info tooltip -->
	<div class="mb-4 flex items-center gap-3">
		<div class="flex flex-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist" tabindex="-1" onkeydown={handleTabKeydown}>
			<button
				role="tab"
				aria-selected={method === 'maxhr'}
				onclick={() => selectMethod('maxhr')}
				class="flex-1 rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
				class:bg-accent={method === 'maxhr'}
				class:text-white={method === 'maxhr'}
				class:font-semibold={method === 'maxhr'}
				class:text-muted={method !== 'maxhr'}
				class:hover:text-hover={method !== 'maxhr'}
			>
				Max HR
			</button>
			<button
				role="tab"
				aria-selected={method === 'lthr'}
				onclick={() => selectMethod('lthr')}
				class="flex-1 rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
				class:bg-accent={method === 'lthr'}
				class:text-white={method === 'lthr'}
				class:font-semibold={method === 'lthr'}
				class:text-muted={method !== 'lthr'}
				class:hover:text-hover={method !== 'lthr'}
			>
				LTHR
			</button>
		</div>

		<div class="relative" bind:this={tooltipContainer}>
			<button
				type="button"
				aria-label="About these methods"
				aria-expanded={showTooltip}
				onclick={(e) => {
					e.stopPropagation();
					showTooltip = !showTooltip;
				}}
				class="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-gray-100 hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 dark:hover:bg-gray-800"
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
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4" />
					<path d="M12 8h.01" />
				</svg>
			</button>

			{#if showTooltip}
				<div
					role="tooltip"
					class="absolute right-0 top-10 z-10 w-72 rounded-lg border border-gray-200 bg-bg p-3 text-sm shadow-lg dark:border-gray-700"
				>
					<p class="mb-2 text-muted">
						<span class="font-semibold text-ink">Max HR</span> — Simple percentage-based zones using
						your maximum heart rate. Easy to use without specialist testing.
					</p>
					<p class="text-muted">
						<span class="font-semibold text-ink">LTHR</span> — Joe Friel's lactate threshold method.
						More precise for coached athletes and triathletes.
					</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- BPM input -->
	<InputField
		id="bpm"
		label={method === 'maxhr' ? 'Max heart rate' : 'Lactate threshold heart rate'}
		bind:value={bpmRaw}
		unit="bpm"
		type="number"
		inputmode="numeric"
		placeholder={method === 'maxhr' ? 'e.g. 185' : 'e.g. 170'}
		required
		error={bpmError}
		touched={bpmTouched}
		oninput={onBpmInput}
		onblur={() => (bpmTouched = true)}
	/>

	<!-- Age input (Max HR mode only) -->
	{#if method === 'maxhr'}
		<InputField
			id="age"
			label="Age (optional)"
			bind:value={ageRaw}
			unit="years"
			type="number"
			inputmode="numeric"
			placeholder="e.g. 35"
			error={ageError}
			touched={ageTouched}
			oninput={onAgeInput}
			onblur={() => (ageTouched = true)}
		/>
		{#if estimatedHr !== null}
			<div class="mb-4 -mt-2" aria-live="polite">
				<p class="text-sm font-medium text-ink">Estimated max HR: {estimatedHr} bpm</p>
				<p class="mt-0.5 text-xs text-muted">
					Age-based formulas vary significantly between individuals and are not a reliable
					substitute for a measured max HR test.
				</p>
			</div>
		{/if}
	{/if}

	<hr class="my-6 border-t border-ink/10" />

	{#if zones === null}
		<!-- Empty state -->
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
				<path
					d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
				/>
			</svg>
			<p class="mt-3 text-sm text-muted">
				Enter your heart rate above to see your training zones.
			</p>
		</div>
	{:else}
		<!-- Zone results table -->
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
							>BPM range</th
						>
						<th
							scope="col"
							class="hidden pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted sm:table-cell"
						></th>
					</tr>
				</thead>
				<tbody>
					{#each zones as zone (zone.zone)}
						{@const isExpandable = zone.zone === 5 && method === 'lthr'}
						<tr
							class="border-b border-ink/10"
							class:cursor-pointer={isExpandable}
							class:hover:bg-gray-50={isExpandable}
							onclick={isExpandable ? () => (zone5Expanded = !zone5Expanded) : undefined}
						>
							<td class="py-3 pr-2">
								<span
									class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white"
									aria-label="Zone {zone.zone}"
								>
									{zone.zone}
								</span>
							</td>
							<td class="hidden py-3 pr-4 font-medium text-ink sm:table-cell">{zone.name}</td>
							<td class="py-3 text-right tabular-nums text-ink">{formatBpmRange(zone)}</td>
							<td class="hidden py-3 pl-4 text-right sm:table-cell">
								{#if isExpandable}
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
										class="ml-auto text-muted transition-transform duration-200"
										class:rotate-180={zone5Expanded}
										aria-hidden="true"
									>
										<path d="m6 9 6 6 6-6" />
									</svg>
								{/if}
							</td>
						</tr>
						<tr
							class="border-b border-ink/10"
							class:last:border-0={!isExpandable || !zone5Expanded}
						>
							<td colspan="4" class="pb-3 pt-0.5 text-xs leading-relaxed text-muted">
								<span class="mr-1 font-medium text-ink sm:hidden">{zone.name}.</span>
								{zone.purpose}
								{#if isExpandable}
									<button
										type="button"
										onclick={(e) => {
											e.stopPropagation();
											zone5Expanded = !zone5Expanded;
										}}
										class="ml-1 rounded-sm text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
										aria-expanded={zone5Expanded}
									>
										{zone5Expanded ? 'Hide' : 'Show'} sub-zones
									</button>
								{/if}
							</td>
						</tr>

						<!-- Zone 5 sub-zones (LTHR only, expandable) -->
						{#if isExpandable && zone5Expanded && subZones}
							{#each subZones as sub (sub.zone)}
								<tr class="border-b border-ink/10 bg-gray-50 dark:bg-gray-800/40">
									<td class="py-2 pl-1 pr-2">
										<span class="font-mono text-xs font-medium text-muted">{sub.zone}</span>
									</td>
									<td class="hidden py-2 pr-4 font-medium text-ink sm:table-cell">{sub.name}</td>
									<td class="py-2 text-right tabular-nums text-ink">{formatBpmRange(sub)}</td>
									<td class="hidden py-2 sm:table-cell"></td>
								</tr>
								<tr
									class="border-b border-ink/10 last:border-0 bg-gray-50 dark:bg-gray-800/40"
								>
									<td colspan="4" class="pb-2 pt-0.5 pl-1 text-xs leading-relaxed text-muted">
										<span class="mr-1 font-medium text-ink sm:hidden">{sub.name}.</span>
										{sub.purpose}
									</td>
								</tr>
							{/each}
						{/if}
					{/each}
				</tbody>
			</table>
		</div>

		<!-- LTHR zone gap note -->
		{#if method === 'lthr'}
			<p class="mt-4 text-xs text-muted">
				<span class="font-medium text-ink">Note:</span> Joe Friel's zone boundaries intentionally have small gaps between them. This is by design and doesn't indicate an error.
			</p>
		{/if}

		<!-- Footer cross-link -->
		<p class="mt-6 text-center text-xs text-muted">
			Want to find your training paces?
			<a href="/training-paces" class="rounded-sm text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
				>Training Pace Calculator →</a
			>
		</p>
	{/if}

</ToolLayout>
