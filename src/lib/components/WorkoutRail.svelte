<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Accessible label for the scrollable region, e.g. "Easy / Recovery workouts". */
		label: string;
		children: Snippet;
	}

	let { label, children }: Props = $props();

	let scrollEl = $state<HTMLDivElement | null>(null);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);
	// Every card shares this height (the tallest card's natural content height) via a CSS
	// custom property, rather than relying on flexbox stretch — which doesn't reliably
	// equalize cross-axis size here since each card's height is otherwise auto/content-based.
	let cardHeight = $state<number | null>(null);

	function updateScrollState() {
		if (!scrollEl) return;
		canScrollLeft = scrollEl.scrollLeft > 4;
		canScrollRight = scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 4;
	}

	function recomputeCardHeight() {
		if (!scrollEl) return;
		// Clear first so every card reports its own natural content height next frame, not a
		// height inflated by a previous (possibly larger) sibling's measurement.
		cardHeight = null;
		requestAnimationFrame(() => {
			if (!scrollEl) return;
			const heights = Array.from(scrollEl.children).map((el) => (el as HTMLElement).offsetHeight);
			cardHeight = heights.length > 0 ? Math.max(...heights) : null;
		});
	}

	function cardWidth(): number {
		const firstCard = scrollEl?.querySelector<HTMLElement>(':scope > *');
		return (firstCard?.offsetWidth ?? 240) + 12; // card width + gap-3
	}

	function scrollByCard(direction: 1 | -1) {
		scrollEl?.scrollBy({ left: cardWidth() * direction, behavior: 'smooth' });
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			scrollByCard(1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			scrollByCard(-1);
		}
	}

	$effect(() => {
		if (!scrollEl) return;
		const el = scrollEl;
		updateScrollState();
		recomputeCardHeight();
		el.addEventListener('scroll', updateScrollState, { passive: true });
		// Native `toggle` events don't bubble, but capture-phase listeners still see them —
		// catches a card's "Purpose & execution" <details> opening/closing so the row can grow
		// (or shrink back) to match. Not observed via ResizeObserver on `el` itself: recomputing
		// transiently shrinks then regrows the row, which would make `el`'s own size observation
		// re-trigger itself every time — a feedback loop, not a fixed point.
		el.addEventListener('toggle', recomputeCardHeight, { capture: true });
		window.addEventListener('resize', recomputeCardHeight);
		// jsdom (component tests) has no ResizeObserver; scroll-affordance chevrons simply never
		// show there, which is fine since layout metrics are always 0 in that environment anyway.
		const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScrollState) : null;
		ro?.observe(el);
		return () => {
			el.removeEventListener('scroll', updateScrollState);
			el.removeEventListener('toggle', recomputeCardHeight, { capture: true });
			window.removeEventListener('resize', recomputeCardHeight);
			ro?.disconnect();
		};
	});
</script>

<div class="group/rail relative">
	{#if canScrollLeft}
		<button
			type="button"
			aria-label="Scroll {label} left"
			onclick={() => scrollByCard(-1)}
			class="absolute top-1/2 left-0 z-10 hidden -translate-y-1/2 rounded-full border border-ink/10 bg-bg p-1.5 opacity-0 shadow-md transition-opacity group-hover/rail:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none sm:flex"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="m15 18-6-6 6-6" />
			</svg>
		</button>
		<div class="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-bg to-transparent" aria-hidden="true"></div>
	{/if}

	<!-- Scrollable region with keyboard support (WAI-ARIA APG scrollable-region pattern) — not
		 a native interactive element, so the a11y linter's default rules don't recognize it. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={scrollEl}
		role="region"
		aria-label={label}
		tabindex="0"
		onkeydown={onKeydown}
		style={cardHeight !== null ? `--card-h: ${cardHeight}px` : ''}
		class="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:thin] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
	>
		{@render children()}
	</div>

	{#if canScrollRight}
		<div class="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-bg to-transparent" aria-hidden="true"></div>
		<button
			type="button"
			aria-label="Scroll {label} right"
			onclick={() => scrollByCard(1)}
			class="absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 rounded-full border border-ink/10 bg-bg p-1.5 opacity-0 shadow-md transition-opacity group-hover/rail:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none sm:flex"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="m9 18 6-6-6-6" />
			</svg>
		</button>
	{/if}
</div>
