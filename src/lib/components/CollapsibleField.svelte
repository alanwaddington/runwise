<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Whether the wrapped content is expanded (visible) or collapsed (hidden). */
		expanded: boolean;
		/** The content to show/hide. */
		children?: Snippet;
	}

	let { expanded, children }: Props = $props();
</script>

<div
	class="overflow-hidden transition-all duration-200"
	class:max-h-0={!expanded}
	class:opacity-0={!expanded}
	class:max-h-24={expanded}
	class:opacity-100={expanded}
	class:mb-4={expanded}
	aria-hidden={!expanded ? 'true' : undefined}
>
	{@render children?.()}
</div>
