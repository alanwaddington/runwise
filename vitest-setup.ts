import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

/**
 * $env/dynamic/public's real implementation is populated by SvelteKit's
 * request-handling lifecycle, which never runs when @testing-library/svelte's
 * render() mounts a component directly — reading it throws. This default
 * mock lets any component that reads env.PUBLIC_* do so safely everywhere;
 * a test file that needs to control a specific value can still override this
 * mock locally (e.g. SeoHead.test.ts's own vi.mock for this same module).
 */
vi.mock('$env/dynamic/public', () => ({ env: {} }));

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
