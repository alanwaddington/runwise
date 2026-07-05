<script lang="ts">
	interface Props {
		/** Tool page route, e.g. "/pace" */
		href: string;
		/** Display name, e.g. "Pace Calculator" */
		name: string;
		/** One-line description */
		description: string;
		/** Route label shown in mono, e.g. "/pace" */
		route: string;
	}

	let { href, name, description, route }: Props = $props();
</script>

<a
	{href}
	aria-label="Go to {name}"
	class="group block rounded-md border border-ink/10 p-6 transition-colors duration-150 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
>
	<div class="flex items-start justify-between gap-4">
		<div class="flex flex-col gap-2">
			<span class="font-sans text-base font-semibold text-ink">{name}</span>
			<span class="text-sm text-muted">{description}</span>
			<span class="font-mono text-xs text-accent">{route}</span>
		</div>
		<span class="mt-0.5 shrink-0 text-muted transition-colors duration-150 group-hover:text-accent"
			>→</span
		>
	</div>
</a>
