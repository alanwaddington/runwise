<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ContactForm from '$lib/components/ContactForm.svelte';
</script>

<SeoHead route="/about" />

<div class="mx-auto max-w-2xl">
	<a
		href="/"
		class="rounded-sm text-sm text-muted transition-colors hover:text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
	>
		← Home
	</a>

	<h1 class="mt-4 text-2xl font-bold text-ink md:text-3xl">About Runwise</h1>

	<div class="mt-8 space-y-8">
		<section>
			<p class="text-muted">
				Runwise is a free set of running calculators — pace, heart rate zones, VO2 max, training
				paces, race prediction, parkrun prediction, power zones, and workout suggestions — built
				by runners who got tired of spreadsheets, half-remembered formulas, and calculators that
				bury a real answer under a login wall.
			</p>
			<p class="mt-3 text-muted">
				There's no account to create and nothing is tracked beyond anonymous, aggregate usage
				stats. Every number Runwise shows you comes from a published, citable method rather than a
				guess, and every tool explains that method on its own page so you can see exactly how your
				result was calculated.
			</p>
			<p class="mt-3 text-muted">
				We'd rather be the calculator you bookmark and come back to for years than one you use
				once and forget, which means getting the numbers right matters more to us than anything
				else about the site.
			</p>
		</section>

		<section>
			<h2 class="text-lg font-semibold text-ink">The methodology behind the numbers</h2>
			<div class="mt-3 space-y-4 text-sm text-muted">
				<p>
					<strong class="font-medium text-ink">Pete Riegel's endurance-running formula</strong> predicts
					a finish time at one distance from a real result at another, and powers the Race Time
					Predictor and Parkrun Predictor.
				</p>
				<p>
					<strong class="font-medium text-ink">Jack Daniels' VDOT method</strong> turns a recent race
					result into training paces and a VO2 max estimate matched to your current fitness, rather
					than generic paces based on age or experience. It underpins the Training Paces, VO2 Max,
					and Workout Suggestions calculators.
				</p>
				<p>
					<strong class="font-medium text-ink">ACSM normative VO2 max data</strong>, published by the
					American College of Sports Medicine across age and gender brackets, places a VO2 max
					estimate into a fitness category on the VO2 Max calculator.
				</p>
				<p>
					<strong class="font-medium text-ink">WMA/Alan Jones age-factor tables</strong> adjust a
					parkrun time for age and gender, so runners of different ages can compare performances
					fairly on the Parkrun Predictor's rating.
				</p>
			</div>
			<a
				href="/guides"
				class="mt-4 inline-block rounded-sm text-sm text-accent-text underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
			>
				Read our in-depth guides <span aria-hidden="true">→</span>
			</a>
		</section>

		<section>
			<h2 class="text-lg font-semibold text-ink">Get in touch</h2>
			<p class="mt-3 text-sm text-muted">
				Spotted something wrong, got a suggestion, or just want to say hello? Send us a message
				below.
			</p>
			<div class="mt-4">
				<ContactForm />
			</div>
		</section>
	</div>
</div>
