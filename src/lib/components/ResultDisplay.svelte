<script lang="ts">
	interface Props {
		/** The calculated result, formatted as a display-ready string. */
		value: string;
		/** A short label describing what the value represents. */
		label: string;
	}

	let { value, label }: Props = $props();

	let copied = $state(false);
	let clipboardAvailable = $derived(typeof navigator !== 'undefined' && !!navigator.clipboard);
	let copyTimeout: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		await navigator.clipboard.writeText(value);
		copied = true;
		clearTimeout(copyTimeout);
		copyTimeout = setTimeout(() => {
			copied = false;
		}, 1500);
	}
</script>

<div class="flex flex-col items-center text-center">
	<p class="text-xs font-medium tracking-wide text-gray-500 uppercase">{label}</p>
	<p class="mt-2 font-mono text-5xl font-bold tabular-nums text-accent md:text-6xl lg:text-7xl">
		{value}
	</p>

	{#if clipboardAvailable}
		<button
			type="button"
			onclick={copy}
			aria-label={copied ? 'Copied' : 'Copy'}
			class="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-gray-500 transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			{#if copied}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-4 w-4 text-accent"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
				Copied
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-4 w-4"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
				Copy
			{/if}
		</button>
	{/if}
</div>
