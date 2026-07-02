<script lang="ts">
	import HeroSection from '$lib/components/HeroSection.svelte';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	const tools = [
		{
			href: '/pace',
			name: 'Pace Calculator',
			description: 'Convert between min/km, min/mile, and km/h',
			route: '/pace'
		},
		{
			href: '/race-predictor',
			name: 'Race Time Predictor',
			description: 'Predict your half or marathon from a recent race',
			route: '/race-predictor'
		},
		{
			href: '/training-paces',
			name: 'Training Paces',
			description: 'Get your easy, tempo, and interval paces',
			route: '/training-paces'
		},
		{
			href: '/hr-zones',
			name: 'HR Zone Calculator',
			description: 'Find your 5 heart rate training zones',
			route: '/hr-zones'
		},
		{
			href: '/vo2max',
			name: 'VO2 Max Estimator',
			description: 'Estimate your aerobic fitness from a race time',
			route: '/vo2max'
		},
		{
			href: '/parkrun',
			name: 'Parkrun Predictor',
			description: 'Predict your 5K time from recent training',
			route: '/parkrun'
		}
	];
</script>

<SeoHead route="/" />

<HeroSection />

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each tools as tool (tool.href)}
		<ToolCard href={tool.href} name={tool.name} description={tool.description} route={tool.route} />
	{/each}
</div>
