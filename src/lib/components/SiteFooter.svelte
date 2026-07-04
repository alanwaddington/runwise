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
		<div class="flex items-center gap-4 text-sm text-gray-400">
			<a href="/privacy" class="transition-colors hover:text-ink dark:hover:text-gray-200">
				Privacy Policy
			</a>
			<span aria-hidden="true">·</span>
			<button
				onclick={manageCookies}
				class="transition-colors hover:text-ink dark:hover:text-gray-200"
			>
				Manage Cookies
			</button>
		</div>
		<p class="text-xs text-gray-400">© 2026 Runwise</p>
	</div>
</footer>
