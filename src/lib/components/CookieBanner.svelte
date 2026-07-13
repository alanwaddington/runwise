<script lang="ts">
	import { hasConsent, setConsent, type ConsentCategory } from '$lib/stores/consent';
	import { consentBannerVisible } from '$lib/stores/consentBannerVisible';

	let expanded = $state(false);
	let analyticsEnabled = $state(true);
	let marketingEnabled = $state(true);

	$effect(() => {
		if ($consentBannerVisible) {
			analyticsEnabled = hasConsent('analytics');
			marketingEnabled = hasConsent('marketing');
			expanded = false;
		}
	});

	function acceptAll() {
		setConsent(['necessary', 'analytics', 'marketing']);
		consentBannerVisible.set(false);
	}

	function necessaryOnly() {
		setConsent(['necessary']);
		consentBannerVisible.set(false);
	}

	function savePreferences() {
		const categories: ConsentCategory[] = ['necessary'];
		if (analyticsEnabled) categories.push('analytics');
		if (marketingEnabled) categories.push('marketing');
		setConsent(categories);
		consentBannerVisible.set(false);
	}
</script>

{#if $consentBannerVisible}
	<div
		role="region"
		aria-label="Cookie consent"
		class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-bg shadow-lg print:hidden dark:border-gray-700 dark:bg-gray-900"
	>
		<div class="mx-auto max-w-5xl px-4 py-4">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<p class="text-sm text-muted">
					We use cookies to serve ads and understand site usage.
					<a href="/privacy" class="rounded-sm text-accent-text underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">Privacy Policy</a>
				</p>

				<div class="flex flex-col gap-2 sm:items-end">
					<div class="flex flex-wrap gap-2">
						<button
							onclick={necessaryOnly}
							class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-gray-300 hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:border-gray-700"
						>
							Necessary Only
						</button>
						<button
							onclick={acceptAll}
							class="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
						>
							Accept All
						</button>
					</div>
					<button
						onclick={() => (expanded = !expanded)}
						class="rounded-sm text-left text-xs text-muted transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
					>
						Customise {expanded ? '▴' : '▾'}
					</button>
				</div>
			</div>

			{#if expanded}
				<div class="mt-4 space-y-4 border-t border-gray-100 pt-4 dark:border-gray-800">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="text-sm font-medium text-ink">Necessary</p>
							<p class="text-xs text-muted">Required for the site to function.</p>
						</div>
						<label class="mt-0.5 flex-shrink-0 cursor-not-allowed">
							<span class="sr-only">Necessary cookies</span>
							<div class="relative">
								<input type="checkbox" class="peer sr-only" checked disabled />
								<div
									aria-hidden="true"
									class="relative block h-5 w-9 rounded-full bg-accent opacity-50 after:absolute after:right-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:content-['']"
								></div>
							</div>
						</label>
					</div>

					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="text-sm font-medium text-ink">Analytics</p>
							<p class="text-xs text-muted">Helps us understand how the site is used.</p>
						</div>
						<label class="mt-0.5 flex-shrink-0 cursor-pointer">
							<span class="sr-only">Enable analytics cookies</span>
							<div class="relative">
								<input type="checkbox" class="peer sr-only" bind:checked={analyticsEnabled} />
								<div
									class="relative block h-5 w-9 rounded-full bg-gray-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-4 dark:bg-gray-700"
								></div>
							</div>
						</label>
					</div>

					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="text-sm font-medium text-ink">Marketing</p>
							<p class="text-xs text-muted">Used to serve relevant ads via Google AdSense.</p>
						</div>
						<label class="mt-0.5 flex-shrink-0 cursor-pointer">
							<span class="sr-only">Enable marketing cookies</span>
							<div class="relative">
								<input type="checkbox" class="peer sr-only" bind:checked={marketingEnabled} />
								<div
									class="relative block h-5 w-9 rounded-full bg-gray-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-4 dark:bg-gray-700"
								></div>
							</div>
						</label>
					</div>

					<button
						onclick={savePreferences}
						class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
					>
						Save Preferences
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
