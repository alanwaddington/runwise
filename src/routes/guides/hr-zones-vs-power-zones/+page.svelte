<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import GuideArticle from '$lib/components/GuideArticle.svelte';
	import { GUIDES } from '$lib/content/guides';

	const guide = GUIDES.find((g) => g.slug === 'hr-zones-vs-power-zones')!;
</script>

<SeoHead route={guide.route} />

<div class="mx-auto max-w-2xl">
	<GuideArticle {guide} />
</div>
