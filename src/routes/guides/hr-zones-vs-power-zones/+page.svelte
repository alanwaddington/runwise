<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import GuideArticle from '$lib/components/GuideArticle.svelte';
	import { guide } from '$lib/content/guides/hr-zones-vs-power-zones';
</script>

<SeoHead route={guide.route} />

<div class="mx-auto max-w-2xl">
	<GuideArticle {guide} />
</div>
