/**
 * Dynamically measure and update the --header-height CSS custom property
 * when the header element resizes (e.g., due to responsive nav changes).
 *
 * Usage:
 *   const cleanup = observeHeaderHeight(document.querySelector('header'));
 *   // On component unmount or page nav:
 *   cleanup();
 */
export function observeHeaderHeight(headerElement: HTMLElement | null): () => void {
	if (!headerElement) return () => {};

	const updateHeaderHeight = () => {
		const height = headerElement.offsetHeight;
		document.documentElement.style.setProperty('--header-height', `${height}px`);
	};

	// Initial measurement
	updateHeaderHeight();

	// Measure on resize
	const observer = new ResizeObserver(updateHeaderHeight);
	observer.observe(headerElement);

	return () => observer.disconnect();
}
