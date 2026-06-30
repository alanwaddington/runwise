<script lang="ts">
	import { page } from '$app/state';

	interface ToolLink {
		href: string;
		label: string;
	}

	/** Top navigation listing every tool page, with the current route highlighted. */
	const tools: ToolLink[] = [
		{ href: '/pace', label: 'Pace' },
		{ href: '/race-predictor', label: 'Race Predictor' },
		{ href: '/training-paces', label: 'Training Paces' },
		{ href: '/hr-zones', label: 'HR Zones' },
		{ href: '/vo2max', label: 'VO2 Max' },
		{ href: '/parkrun', label: 'Parkrun' }
	];

	function isActive(href: string) {
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6 px-4 py-4">
	<a
		href="/"
		class="rounded-sm text-lg font-bold tracking-tight text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
	>
		Runwise
	</a>
	<ul class="flex flex-wrap gap-6 text-sm font-medium">
		{#each tools as tool (tool.href)}
			<li>
				<a
					href={tool.href}
					aria-current={isActive(tool.href) ? 'page' : undefined}
					class="rounded-sm pb-1 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none {isActive(
						tool.href
					)
						? 'border-b-2 border-accent text-ink'
						: 'border-b-2 border-transparent text-gray-500 hover:text-ink'}"
				>
					{tool.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
