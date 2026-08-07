<script lang="ts">
	interface Concept {
		title: string;
		description: string;
		icon: string;
		link?: string;
	}

	const concepts: Concept[] = [
		{
			title: 'Training Pace Zones',
			description:
				'Running at the right pace for each workout is crucial for building fitness. Easy runs develop aerobic base, tempo runs build lactate threshold, and interval training improves VO2 max. Most runners run their easy runs too fast, which limits their training progress.',
			icon: '🏃'
		},
		{
			title: 'Heart Rate Zones',
			description:
				'Heart rate is an objective measure of training intensity. By training in specific HR zones, you ensure workouts match your intended purpose. Zone 2 (easy) builds aerobic capacity, while Zone 4–5 (hard) develops speed and power.',
			icon: '❤️'
		},
		{
			title: 'VO2 Max & Fitness Level',
			description:
				'VO2 max (millilitres of oxygen per kilogram per minute) measures your aerobic fitness. It\'s the best single predictor of running performance and can be improved through consistent interval training and tempo work over weeks and months.',
			icon: '📊'
		},
		{
			title: 'Race Prediction Science',
			description:
				'Modern race prediction models use power laws to extrapolate performance across distances. The Riegel formula (used by Runwise) assumes performance consistency and lets you confidently predict marathon times from a 5K result.',
			icon: '🎯'
		}
	];
</script>

<section class="space-y-8 py-12">
	<div class="space-y-4">
		<h2 class="font-sans text-3xl font-bold text-ink">Running Training Fundamentals</h2>
		<p class="max-w-2xl text-lg text-muted">
			Runwise calculators are built on established running science. Here's what you need to know to
			train smarter.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		{#each concepts as concept (concept.title)}
			<div
				class="rounded-lg border border-ink/10 bg-gray-50/50 p-6 dark:bg-white/3"
			>
				<div class="mb-3 text-3xl">{concept.icon}</div>
				<h3 class="mb-2 font-sans font-semibold text-ink">{concept.title}</h3>
				<p class="text-sm text-muted leading-relaxed">{concept.description}</p>
			</div>
		{/each}
	</div>
</section>

<section class="space-y-6 border-t border-ink/10 py-12">
	<div class="space-y-4">
		<h2 class="font-sans text-3xl font-bold text-ink">Common Running Mistakes</h2>
		<p class="max-w-2xl text-lg text-muted">
			Runwise helps runners avoid these frequent pitfalls.
		</p>
	</div>

	<div class="space-y-4">
		<div class="rounded-lg border border-ink/10 bg-gray-50/50 p-6 dark:bg-white/3">
			<h3 class="mb-2 font-sans font-semibold text-ink">Running all easy runs too fast</h3>
			<p class="text-sm text-muted leading-relaxed">
				Without pace targets, most runners run easy efforts too hard, which wastes recovery time
				and limits training adaptation. The Training Paces calculator gives you specific targets so
				your easy runs truly develop aerobic fitness without building fatigue.
			</p>
		</div>

		<div class="rounded-lg border border-ink/10 bg-gray-50/50 p-6 dark:bg-white/3">
			<h3 class="mb-2 font-sans font-semibold text-ink">Training at the wrong heart rate zones</h3>
			<p class="text-sm text-muted leading-relaxed">
				Training intensity should match your goal. Without HR zone targets, you might do easy runs
				at tempo pace (wasting energy) or tempo runs at easy pace (not building fitness). The HR Zone
				Calculator ensures each workout drives the right adaptation.
			</p>
		</div>

		<div class="rounded-lg border border-ink/10 bg-gray-50/50 p-6 dark:bg-white/3">
			<h3 class="mb-2 font-sans font-semibold text-ink">Setting unrealistic race goals</h3>
			<p class="text-sm text-muted leading-relaxed">
				Without a scientific prediction method, it's easy to aim too high (demoralizing) or too low
				(wasted potential). Race time predictors let you set realistic but ambitious targets based
				on current fitness, boosting motivation and pacing strategy.
			</p>
		</div>

		<div class="rounded-lg border border-ink/10 bg-gray-50/50 p-6 dark:bg-white/3">
			<h3 class="mb-2 font-sans font-semibold text-ink">Ignoring aerobic fitness data</h3>
			<p class="text-sm text-muted leading-relaxed">
				VO2 max is the strongest predictor of running performance. Knowing yours lets you track
				progress, predict across all distances, and see how training investments pay off over time.
			</p>
		</div>
	</div>
</section>

<section class="space-y-6 border-t border-ink/10 py-12">
	<div class="space-y-4">
		<h2 class="font-sans text-3xl font-bold text-ink">How Runwise Helps</h2>
		<p class="max-w-2xl text-lg text-muted">
			Eight free calculators to train smarter and race faster.
		</p>
	</div>

	<ul class="space-y-3 text-muted">
		<li class="flex gap-3">
			<span class="shrink-0 text-accent-text">→</span>
			<span
				><strong class="text-ink">Convert paces</strong> between formats (min/km, min/mile, km/h) in
				one click</span
			>
		</li>
		<li class="flex gap-3">
			<span class="shrink-0 text-accent-text">→</span>
			<span
				><strong class="text-ink">Predict race times</strong> across all distances using the Riegel
				formula</span
			>
		</li>
		<li class="flex gap-3">
			<span class="shrink-0 text-accent-text">→</span>
			<span
				><strong class="text-ink">Calculate training paces</strong> using Jack Daniels' VDOT
				method</span
			>
		</li>
		<li class="flex gap-3">
			<span class="shrink-0 text-accent-text">→</span>
			<span
				><strong class="text-ink">Find your heart rate zones</strong> using Max HR or lactate
				threshold methods</span
			>
		</li>
		<li class="flex gap-3">
			<span class="shrink-0 text-accent-text">→</span>
			<span
				><strong class="text-ink">Estimate VO2 max</strong> from race performance and track
				fitness trends</span
			>
		</li>
		<li class="flex gap-3">
			<span class="shrink-0 text-accent-text">→</span>
			<span
				><strong class="text-ink">Predict parkrun times</strong> with pacing splits and age grading</span
			>
		</li>
		<li class="flex gap-3">
			<span class="shrink-0 text-accent-text">→</span>
			<span
				><strong class="text-ink">Get power training zones</strong> for Stryd, Garmin, and
				Polar</span
			>
		</li>
	</ul>
</section>
