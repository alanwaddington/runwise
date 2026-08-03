<script lang="ts">
	import HeroSection from '$lib/components/HeroSection.svelte';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import EducationalSection from '$lib/components/EducationalSection.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	const tools = [
		{
			href: '/pace',
			name: 'Pace Calculator',
			description: 'Convert between min/km, min/mile, and km/h instantly',
			route: '/pace',
			icon: 'pace' as const
		},
		{
			href: '/race-predictor',
			name: 'Race Time Predictor',
			description: 'Predict marathons and half-marathons from any recent race using the Riegel formula',
			route: '/race-predictor',
			icon: 'race-predictor' as const
		},
		{
			href: '/training-paces',
			name: 'Training Paces',
			description: 'Calculate optimal paces for all five training zones using Jack Daniels\' VDOT',
			route: '/training-paces',
			icon: 'training-paces' as const
		},
		{
			href: '/hr-zones',
			name: 'HR Zone Calculator',
			description: 'Find personalized heart rate zones using Max HR or lactate threshold methods',
			route: '/hr-zones',
			icon: 'hr-zones' as const
		},
		{
			href: '/vo2max',
			name: 'VO2 Max Estimator',
			description: 'Estimate aerobic fitness and track your fitness level with age grading',
			route: '/vo2max',
			icon: 'vo2max' as const
		},
		{
			href: '/parkrun',
			name: 'Parkrun Predictor',
			description: 'Predict 5K times with pacing splits and WMA age grading',
			route: '/parkrun',
			icon: 'parkrun' as const
		}
	];
</script>

<SeoHead route="/" />

<HeroSection />

<section class="mb-12">
	<h2 class="mb-6 font-sans text-2xl font-bold text-ink">Running Calculators</h2>
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each tools as tool (tool.href)}
			<ToolCard
				href={tool.href}
				name={tool.name}
				description={tool.description}
				route={tool.route}
				icon={tool.icon}
			/>
		{/each}
	</div>
</section>

<EducationalSection />
