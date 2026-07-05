<script lang="ts">
	interface Props {
		size?: 'sm' | 'md';
		class?: string;
		ariaHidden?: boolean;
	}

	const { size = 'sm', class: customClass = '', ariaHidden = true }: Props = $props();

	const width = $derived(size === 'md' ? 20 : 16);
	const height = $derived(size === 'md' ? 20 : 16);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	{width}
	{height}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="shrink-0 {customClass}"
	aria-hidden={ariaHidden}
>
	<circle cx="12" cy="12" r="10" />
	<path d="M12 16v-4" />
	<path d="M12 8h.01" />
</svg>
