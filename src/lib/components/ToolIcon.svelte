<script module lang="ts">
	export type ToolIconName =
		| 'pace'
		| 'race-predictor'
		| 'training-paces'
		| 'hr-zones'
		| 'vo2max'
		| 'parkrun';
</script>

<script lang="ts">
	interface Props {
		name: ToolIconName;
		class?: string;
	}

	let { name, class: customClass = '' }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="shrink-0 {customClass}"
	aria-hidden="true"
>
	{#if name === 'pace'}
		<circle cx="12" cy="13" r="8" />
		<path d="M12 9v4l2.5 2" />
		<path d="M5 3 2.5 5.5" />
		<path d="M22 5.5 19.5 3" />
		<path d="M9.5 1.5h5" />
	{:else if name === 'race-predictor'}
		<path d="M5 3v18" />
		<path d="M5 4h13l-3 4 3 4H5" />
	{:else if name === 'training-paces'}
		<path d="M3 3v18h18" />
		<rect x="7" y="13" width="3" height="5" />
		<rect x="12" y="9" width="3" height="9" />
		<rect x="17" y="5" width="3" height="13" />
	{:else if name === 'hr-zones'}
		<path
			d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
		/>
	{:else if name === 'vo2max'}
		<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
	{:else if name === 'parkrun'}
		<path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z" />
		<circle cx="12" cy="10" r="3" />
	{/if}
</svg>
