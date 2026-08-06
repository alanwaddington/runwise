<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageExplainer from '$lib/components/PageExplainer.svelte';
	import ToolIcon from '$lib/components/ToolIcon.svelte';
	import { validateRange } from '$lib/utils/validation';
	import {
		calculatePowerZones,
		DEVICE_METRIC_LABEL,
		DEVICE_DISPLAY_NAME,
		DEVICE_DISCLAIMER,
		type PowerMeterDevice,
		type PowerZone
	} from '$lib/utils/power-zones';

	// COROS hidden pending further research (see power-zones.ts COROS_ZONE_META comment) — keep out of DEVICES, don't delete backing code.
	const DEVICES: PowerMeterDevice[] = ['stryd', 'garmin', 'polar'];

	let device = $state<PowerMeterDevice>('stryd');
	let powerRaw = $state<number | string>('');

	let powerTouched = $state(false);
	let powerError = $state<string | null>(null);

	let power = $derived(
		typeof powerRaw === 'number' && isFinite(powerRaw) && powerRaw > 0 ? powerRaw : null
	);

	let zones = $derived(power !== null ? calculatePowerZones(power, device) : null);

	function formatWattsRange(zone: PowerZone): string {
		if (zone.wattsLow === null) return `< ${zone.wattsHigh}`;
		if (zone.wattsHigh === null) return `> ${zone.wattsLow}`;
		return `${zone.wattsLow}-${zone.wattsHigh}`;
	}

	function formatPctRange(zone: PowerZone): string {
		if (zone.pctLow === null) return `< ${zone.pctHigh}%`;
		if (zone.pctHigh === null) return `> ${zone.pctLow}%`;
		return `${zone.pctLow}-${zone.pctHigh}%`;
	}

	function onPowerInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		powerRaw = raw ? parseFloat(raw) : '';
		const validation = validateRange(raw ? parseFloat(raw) : null, 50, 700);
		powerError = validation.type === 'invalid' ? validation.error : null;
	}

	function selectDevice(d: PowerMeterDevice) {
		device = d;
		powerRaw = '';
		powerError = null;
		powerTouched = false;
	}

	function reset() {
		powerRaw = '';
		powerTouched = false;
		powerError = null;
	}

	function handleTabKeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		const currentIndex = DEVICES.indexOf(device);
		const nextIndex =
			e.key === 'ArrowRight'
				? (currentIndex + 1) % DEVICES.length
				: (currentIndex - 1 + DEVICES.length) % DEVICES.length;
		selectDevice(DEVICES[nextIndex]);
		const tabs = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]');
		tabs[nextIndex]?.focus();
	}
</script>

<SeoHead route="/power-zones" />

<ToolLayout
	title="Power Zones Calculator"
	description="Calculate your running power training zones for Stryd, Garmin, or Polar."
	route="/power-zones"
>
	<!-- Device selector -->
	<div
		class="mb-4 flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800"
		role="tablist"
		tabindex="-1"
		onkeydown={handleTabKeydown}
	>
		{#each DEVICES as d (d)}
			<button
				role="tab"
				aria-selected={device === d}
				onclick={() => selectDevice(d)}
				class="flex-1 rounded-md py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:text-sm"
				class:bg-accent={device === d}
				class:text-white={device === d}
				class:font-semibold={device === d}
				class:text-muted={device !== d}
				class:hover:text-hover={device !== d}
			>
				{DEVICE_DISPLAY_NAME[d]}
			</button>
		{/each}
	</div>

	<!-- Approximation disclaimer (Garmin, COROS) -->
	{#if DEVICE_DISCLAIMER[device]}
		<p class="mb-4 text-xs text-muted">
			<span class="font-medium text-ink">Note:</span>
			{DEVICE_DISCLAIMER[device]}
		</p>
	{/if}

	<!-- Power input -->
	<InputField
		id="power"
		label={DEVICE_METRIC_LABEL[device]}
		bind:value={powerRaw}
		unit="W"
		type="number"
		inputmode="numeric"
		placeholder="e.g. 250"
		required
		error={powerError}
		touched={powerTouched}
		oninput={onPowerInput}
		onblur={() => (powerTouched = true)}
	/>

	<hr class="my-6 border-t border-ink/10" />

	{#if zones === null}
		<!-- Empty state -->
		<div class="py-10 text-center">
			<ToolIcon name="power-zones" class="mx-auto h-8 w-8 text-gray-300" />
			<p class="mt-3 text-sm text-muted">
				Enter your power above to see your training zones.
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
							class="pb-2 text-left text-xs font-medium uppercase tracking-wide text-muted"
							>Name</th
						>
						<th
							scope="col"
							class="pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted"
							>Watt range</th
						>
					</tr>
				</thead>
				<tbody>
					{#each zones as zone (zone.zone)}
						<tr class="border-b border-ink/10">
							<td class="py-3 pr-2">
								<span
									class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white"
									aria-label="Zone {zone.zone}"
								>
									{zone.zone}
								</span>
							</td>
							<td class="py-3 pr-2 font-medium text-ink sm:pr-4">
								{zone.name}
								<span class="font-normal text-muted">({formatPctRange(zone)})</span>
							</td>
							<td class="py-3 text-right tabular-nums text-ink">{formatWattsRange(zone)}</td>
						</tr>
						<tr class="border-b border-ink/10 last:border-0">
							<td colspan="3" class="pb-3 pt-0.5 text-xs leading-relaxed text-muted">
								{zone.purpose}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Footer cross-link -->
		<p class="mt-6 text-center text-xs text-muted">
			Want to find your heart rate zones too?
			<a href="/hr-zones" class="rounded-sm text-accent-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
				>Heart Rate Zone Calculator →</a
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

<PageExplainer route="/power-zones" />
