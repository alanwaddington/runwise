<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { consentBannerVisible } from '$lib/stores/consentBannerVisible';

	function manageCookies() {
		consentBannerVisible.set(true);
	}
</script>

<SeoHead route="/privacy" />

<div class="mx-auto max-w-2xl">
	<a
		href="/"
		class="rounded-sm text-sm text-gray-600 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
	>
		← Home
	</a>

	<h1 class="mt-4 text-2xl font-bold text-ink md:text-3xl">Privacy Policy</h1>
	<p class="mt-2 text-sm text-gray-600">Last updated: 5 July 2026</p>

	<div class="mt-8 space-y-8 text-gray-600 dark:text-gray-400">
		<section>
			<h2 class="mb-3 text-lg font-semibold text-ink">What we collect</h2>
			<p>
				Runwise is a free tool — we do not require an account and we do not collect personally
				identifiable information. When you use Runwise, the following data may be processed:
			</p>
			<ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>Anonymous usage statistics via Vercel Analytics (page views, country, device type)</li>
				<li>Ad serving and personalisation data via Google AdSense (only with your consent)</li>
				<li>Referral tracking if you click an affiliate link</li>
				<li>Your cookie consent preference, stored locally in your browser</li>
			</ul>
		</section>

		<section>
			<h2 class="mb-3 text-lg font-semibold text-ink">Cookies</h2>
			<p class="text-sm">
				We use three categories of cookies. You can manage your preferences at any time using the
				button below.
			</p>
			<ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>
					<strong class="font-medium text-ink">Necessary</strong> — stores your cookie consent
					preference in localStorage. No tracking.
				</li>
				<li>
					<strong class="font-medium text-ink">Analytics</strong> — Vercel Analytics collects
					anonymous page view data. No personal data is stored or sold.
				</li>
				<li>
					<strong class="font-medium text-ink">Marketing</strong> — Google AdSense may set cookies
					to serve relevant ads. See
					<a
						href="https://policies.google.com/privacy"
						target="_blank"
						rel="noopener noreferrer"
						class="text-accent hover:underline">Google's Privacy Policy</a
					> for details.
				</li>
			</ul>
		</section>

		<section>
			<h2 class="mb-3 text-lg font-semibold text-ink">Google AdSense</h2>
			<p class="text-sm">
				We use Google AdSense to display ads. Google may use cookies and similar technologies to
				show personalised ads based on your browsing history. AdSense is only activated when you
				consent to marketing cookies. You can opt out of personalised advertising at
				<a
					href="https://www.google.com/settings/ads"
					target="_blank"
					rel="noopener noreferrer"
					class="text-accent hover:underline">google.com/settings/ads</a
				>.
			</p>
		</section>

		<section>
			<h2 class="mb-3 text-lg font-semibold text-ink">Affiliate links</h2>
			<p class="text-sm">
				Some pages include links to products on Amazon. These are affiliate links — if you click a
				link and make a purchase, we may earn a small commission at no extra cost to you. Affiliate
				links do not set cookies on runwise.app. Cookies may be set by Amazon once you follow a
				link to their site, subject to their privacy policy.
			</p>
		</section>

		<section>
			<h2 class="mb-3 text-lg font-semibold text-ink">Your rights (GDPR)</h2>
			<p class="text-sm">
				If you are in the European Economic Area or the UK, you have the following rights under
				GDPR:
			</p>
			<ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>The right to access data we hold about you</li>
				<li>The right to have inaccurate data corrected</li>
				<li>The right to have your data deleted</li>
				<li>The right to object to processing</li>
				<li>The right to withdraw consent at any time</li>
			</ul>
			<p class="mt-3 text-sm">
				Because Runwise does not collect personal data directly, most requests apply to our
				third-party processors (Google, Vercel). You can withdraw cookie consent at any time using
				the button below.
			</p>
		</section>

		<section>
			<h2 class="mb-3 text-lg font-semibold text-ink">Contact</h2>
			<p class="text-sm">
				For privacy-related enquiries, contact us at
				<a href="mailto:privacy@runwise.app" class="rounded-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
					>privacy@runwise.app</a
				>.
			</p>
		</section>
	</div>

	<div class="mt-10 border-t border-gray-200 pt-6 dark:border-gray-700">
		<button
			onclick={manageCookies}
			class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
		>
			Manage cookie preferences
		</button>
	</div>
</div>
