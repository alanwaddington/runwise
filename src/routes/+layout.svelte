<script>
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<header class="border-b border-gray-200 bg-white">
	<nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
		<a href="/" class="text-lg font-bold tracking-tight text-gray-900">Runwise</a>
		<ul class="flex flex-wrap gap-6 text-sm font-medium text-gray-500">
			<li><a href="/pace" class="hover:text-gray-900 transition-colors">Pace</a></li>
			<li>
				<a href="/race-predictor" class="hover:text-gray-900 transition-colors">Race Predictor</a>
			</li>
			<li>
				<a href="/training-paces" class="hover:text-gray-900 transition-colors">Training Paces</a>
			</li>
			<li><a href="/hr-zones" class="hover:text-gray-900 transition-colors">HR Zones</a></li>
			<li><a href="/vo2max" class="hover:text-gray-900 transition-colors">VO2 Max</a></li>
			<li><a href="/parkrun" class="hover:text-gray-900 transition-colors">Parkrun</a></li>
		</ul>
	</nav>
</header>

<main class="mx-auto max-w-5xl px-4 py-12">
	{@render children()}
</main>
