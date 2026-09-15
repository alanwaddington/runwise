<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import GuideArticle from '$lib/components/GuideArticle.svelte';
	import { guide } from '$lib/content/guides/interval-training-explained';
</script>

<SeoHead route={guide.route} />

<div class="mx-auto max-w-2xl">
	<GuideArticle {guide} />
</div>
