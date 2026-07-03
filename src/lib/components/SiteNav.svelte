<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getStoredTheme, setStoredTheme, applyTheme, watchSystemTheme } from '$lib/theme';

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

	onMount(() => {
		return watchSystemTheme((prefersDark) => {
			if (getStoredTheme() === undefined) {
				applyTheme(prefersDark ? 'dark' : 'light');
			}
		});
	});

	/**
	 * <html>'s class (set pre-paint by the inline script in app.html, and kept in
	 * sync by applyTheme() thereafter) is the single source of truth for the
	 * current theme — there's no separate Svelte state to drift out of sync with
	 * it. The two toggle buttons below are shown/hidden purely via the dark:
	 * variant, so their icon and label are correct at first paint with no JS
	 * round-trip required, matching how the page background is already flash-free.
	 */
	function toggleTheme() {
		const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
		applyTheme(next);
		setStoredTheme(next);
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
	<button
		type="button"
		onclick={toggleTheme}
		aria-label="Switch to dark mode"
		class="rounded-sm p-2 text-gray-500 transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none dark:hidden"
	>
		<svg
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
		</svg>
	</button>
	<button
		type="button"
		onclick={toggleTheme}
		aria-label="Switch to light mode"
		class="hidden rounded-sm p-2 text-gray-500 transition-colors dark:inline-flex hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
	>
		<svg
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		>
			<circle cx="12" cy="12" r="4" />
			<path
				d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
			/>
		</svg>
	</button>
</nav>
