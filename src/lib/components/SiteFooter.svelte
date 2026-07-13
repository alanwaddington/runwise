<script lang="ts">
	import { consentBannerVisible } from '$lib/stores/consentBannerVisible';

	function manageCookies() {
		consentBannerVisible.set(true);
	}

	const tools = [
		{ href: '/pace', label: 'Pace Calculator' },
		{ href: '/race-predictor', label: 'Race Time Predictor' },
		{ href: '/training-paces', label: 'Training Paces' },
		{ href: '/hr-zones', label: 'HR Zone Calculator' },
		{ href: '/vo2max', label: 'VO2 Max Estimator' },
		{ href: '/parkrun', label: 'Parkrun Predictor' }
	];
</script>

<footer class="mt-12 border-t border-gray-200 px-4 py-10 print:hidden dark:border-gray-700">
	<div class="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:justify-between">
		<div class="max-w-sm">
			<a href="/" class="text-base font-bold tracking-tight text-ink">Runwise</a>
			<p class="mt-2 text-sm text-muted">
				Free running calculators for pace, heart rate zones, VO2 max, training paces, and race
				predictions. No login, no tracking your workouts — just fast, accurate tools.
			</p>
		</div>

		<div>
			<p class="text-xs font-medium uppercase tracking-wide text-muted">Tools</p>
			<ul class="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-1">
				{#each tools as tool (tool.href)}
					<li>
						<a
							href={tool.href}
							class="rounded-sm text-muted transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
						>
							{tool.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div
		class="mx-auto mt-8 flex max-w-5xl flex-col items-center gap-2 border-t border-gray-200 pt-6 dark:border-gray-700"
	>
		<div class="flex items-center gap-4 text-sm text-muted">
			<a
				href="/privacy"
				class="rounded-sm transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			>
				Privacy Policy
			</a>
			<span aria-hidden="true">·</span>
			<button
				onclick={manageCookies}
				class="rounded-sm transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			>
				Manage Cookies
			</button>
		</div>
		<p class="text-xs text-muted">© 2026 Runwise</p>
	</div>
</footer>
