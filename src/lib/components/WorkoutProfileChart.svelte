<script lang="ts">
	import type { WorkoutSegment } from '$lib/utils/workouts';

	interface Props {
		segments: WorkoutSegment[];
	}

	let { segments }: Props = $props();

	const VIEW_WIDTH = 300;
	const VIEW_HEIGHT = 56;
	const BASELINE_HEIGHT = 6;
	const GAP = 1;

	let totalMinutes = $derived(segments.reduce((sum, s) => sum + s.durationMinutes, 0));

	let bars = $derived.by(() => {
		let x = 0;
		return segments.map((segment) => {
			const width = totalMinutes > 0 ? (segment.durationMinutes / totalMinutes) * VIEW_WIDTH : 0;
			const height = BASELINE_HEIGHT + segment.intensity * (VIEW_HEIGHT - BASELINE_HEIGHT);
			const bar = { x, width: Math.max(width - GAP, 0), height, y: VIEW_HEIGHT - height, type: segment.type };
			x += width;
			return bar;
		});
	});
</script>

<svg
	viewBox="0 0 {VIEW_WIDTH} {VIEW_HEIGHT}"
	preserveAspectRatio="none"
	class="mt-3 h-12 w-full"
	aria-hidden="true"
>
	<line x1="0" y1={VIEW_HEIGHT} x2={VIEW_WIDTH} y2={VIEW_HEIGHT} class="stroke-ink/10" stroke-width="1" />
	{#each bars as bar, i (i)}
		<rect
			x={bar.x}
			y={bar.y}
			width={bar.width}
			height={bar.height}
			rx="1"
			class={bar.type === 'work' ? 'fill-accent' : 'fill-gray-300 dark:fill-gray-600'}
		/>
	{/each}
</svg>
