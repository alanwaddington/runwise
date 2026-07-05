<script lang="ts">
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { hasConsent } from '$lib/stores/consent';
	import { consentBannerVisible } from '$lib/stores/consentBannerVisible';

	let consented = $state(browser ? hasConsent('marketing') : false);

	$effect(() => {
		const visible = $consentBannerVisible;
		if (!visible && browser) {
			consented = hasConsent('marketing');
		}
	});

	$effect(() => {
		if (!consented || !browser) return;
		const clientId = env.PUBLIC_ADSENSE_CLIENT_ID;
		if (!clientId) return;
		if (document.querySelector('script[src*="adsbygoogle"]')) return;
		if ((window as { adsbygoogle?: unknown }).adsbygoogle) return;

		const script = document.createElement('script');
		script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
		script.async = true;
		script.crossOrigin = 'anonymous';
		document.head.appendChild(script);
	});
</script>

{#if consented && env.PUBLIC_ADSENSE_CLIENT_ID}
	<div data-testid="ad-unit" class="my-4 min-h-[100px] w-full overflow-hidden print:hidden">
		<ins
			class="adsbygoogle block"
			style="display:block"
			data-ad-client={env.PUBLIC_ADSENSE_CLIENT_ID}
			data-ad-format="auto"
			data-full-width-responsive="true"
		></ins>
	</div>
{/if}
