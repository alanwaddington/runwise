<script lang="ts">
	import { consentBannerVisible } from '$lib/stores/consentBannerVisible';

	function manageCookies() {
		consentBannerVisible.set(true);
	}
</script>

<footer
	class="mt-12 border-t border-gray-200 px-4 py-6 print:hidden dark:border-gray-700"
>
	<div class="mx-auto max-w-5xl flex flex-col items-center gap-2">
		<div class="flex items-center gap-4 text-sm text-muted">
			<a href="/privacy" class="rounded-sm transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
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
