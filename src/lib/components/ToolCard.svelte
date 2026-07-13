<script lang="ts">
	import ToolIcon, { type ToolIconName } from './ToolIcon.svelte';

	interface Props {
		/** Tool page route, e.g. "/pace" */
		href: string;
		/** Display name, e.g. "Pace Calculator" */
		name: string;
		/** One-line description */
		description: string;
		/** Route label shown in mono, e.g. "/pace" */
		route: string;
		/** Icon representing this tool */
		icon: ToolIconName;
	}

	let { href, name, description, route, icon }: Props = $props();
</script>

<a
	{href}
	aria-label="Go to {name}"
	class="group block rounded-md border border-ink/10 bg-gray-50/50 p-6 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:bg-white/[0.03]"
>
	<div class="flex items-start justify-between gap-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-2.5">
				<span
					class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-text transition-colors duration-150 group-hover:bg-accent/15"
				>
					<ToolIcon name={icon} class="h-4.5 w-4.5" />
				</span>
				<span class="font-sans text-base font-semibold text-ink">{name}</span>
			</div>
			<span class="text-sm text-muted">{description}</span>
			<span class="font-mono text-xs text-accent-text">{route}</span>
		</div>
		<span
			class="mt-0.5 shrink-0 text-muted transition-colors duration-150 group-hover:text-accent-text"
			>→</span
		>
	</div>
</a>
