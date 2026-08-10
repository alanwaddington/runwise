<script lang="ts">
	import { toast, dismissToast } from '$lib/stores/toast';
</script>

{#if $toast}
	{@const current = $toast}
	<div class="pointer-events-none fixed inset-x-0 bottom-4 z-60 flex justify-center px-4">
		<div
			role={current.variant === 'error' ? 'alert' : 'status'}
			aria-live={current.variant === 'error' ? 'assertive' : 'polite'}
			class="pointer-events-auto flex max-w-sm animate-[toast-in_200ms_ease-out] items-center gap-3 rounded-lg border-l-4 bg-bg py-3 pl-4 pr-3 shadow-lg"
			class:border-accent={current.variant === 'success'}
			class:border-[color:var(--color-error)]={current.variant === 'error'}
		>
			{#if current.variant === 'success'}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="shrink-0 text-accent"
					aria-hidden="true"
				>
					<path d="M20 6 9 17l-5-5" />
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="shrink-0 text-error"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4" />
					<path d="M12 8h.01" />
				</svg>
			{/if}
			<p class="text-sm font-medium text-ink">{current.message}</p>
			<button
				type="button"
				onclick={dismissToast}
				aria-label="Dismiss notification"
				class="shrink-0 rounded-sm text-muted transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
					<path d="M18 6l-12 12M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	/*
	 * -global- keeps this keyframes name unscoped so the animate-[toast-in_...] Tailwind
	 * arbitrary-value utility above can reference it by name. Plain CSS keyframes (rather
	 * than svelte/transition's fly/fade) avoid a dependency on the Web Animations API,
	 * which jsdom (used by this repo's Vitest component tests) doesn't implement.
	 */
	@keyframes -global-toast-in {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
