<script lang="ts">
	import type { Workout } from '$lib/utils/workouts';

	interface Props {
		pattern: Workout['pattern'];
		/** Overrides the default per-pattern label, e.g. a mixed-zone pair name like "E+M". */
		label?: string;
	}

	let { pattern, label }: Props = $props();

	// One glyph + neutral pill per pattern, rather than a distinct color per type — stays
	// colorblind-safe and doesn't need a new hue picked for every Phase 2 pattern added.
	const GLYPH: Partial<Record<NonNullable<Workout['pattern']>, string>> = {
		fartlek: '∿',
		progression: '↗',
		decay: '↘',
		'time-based': '⏱',
		'mixed-zone': '⇄',
		recovery: '◐',
		'race-prep': '★'
	};

	const DEFAULT_LABEL: Partial<Record<NonNullable<Workout['pattern']>, string>> = {
		fartlek: 'Fartlek',
		progression: 'Progression',
		decay: 'Decay',
		'time-based': 'Time-based',
		'mixed-zone': 'Mixed-Zone',
		recovery: 'Recovery',
		'race-prep': 'Race-Prep'
	};

	let visible = $derived(!!pattern && pattern !== 'standard');
	let text = $derived(label ?? (pattern ? DEFAULT_LABEL[pattern] : undefined) ?? '');
	let glyph = $derived(pattern ? GLYPH[pattern] : undefined);
</script>

{#if visible}
	<span
		class="mb-2 inline-flex w-fit items-center gap-1 self-start rounded-full border border-ink/10 bg-ink/5 px-2 py-0.5 font-mono text-[10px] font-medium text-ink dark:bg-white/5"
	>
		{#if glyph}<span aria-hidden="true">{glyph}</span>{/if}
		{text}
	</span>
{/if}
