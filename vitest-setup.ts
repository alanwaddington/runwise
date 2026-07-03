import '@testing-library/jest-dom/vitest';

/**
 * jsdom does not implement matchMedia. Tests that need to control OS
 * preference changes (e.g. theme toggling) use vi.spyOn(window, 'matchMedia')
 * to override this default per-test; this stub just ensures the property
 * exists as a spy-able function everywhere else.
 */
if (!window.matchMedia) {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false
		}) as unknown as MediaQueryList;
}
