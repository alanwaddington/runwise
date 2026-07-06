import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';

const mockPage = { url: new URL('http://localhost/pace') };

vi.mock('$app/state', () => ({
	page: mockPage
}));

afterEach(() => {
	cleanup();
	mockPage.url = new URL('http://localhost/pace');
	document.documentElement.classList.remove('light', 'dark');
	localStorage.clear();
	vi.restoreAllMocks();
});

describe('SiteNav', () => {
	it('renders the brand link to home', async () => {
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		const brand = getByRole('link', { name: 'Runwise' });
		expect(brand).toHaveAttribute('href', '/');
	});

	it('renders all six tool links', async () => {
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('link', { name: 'Pace' })).toHaveAttribute('href', '/pace');
		expect(getByRole('link', { name: 'Race Predictor' })).toHaveAttribute(
			'href',
			'/race-predictor'
		);
		expect(getByRole('link', { name: 'Training Paces' })).toHaveAttribute(
			'href',
			'/training-paces'
		);
		expect(getByRole('link', { name: 'HR Zones' })).toHaveAttribute('href', '/hr-zones');
		expect(getByRole('link', { name: 'VO2 Max' })).toHaveAttribute('href', '/vo2max');
		expect(getByRole('link', { name: 'Parkrun' })).toHaveAttribute('href', '/parkrun');
	});

	it('marks the active route with aria-current="page"', async () => {
		mockPage.url = new URL('http://localhost/pace');
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('link', { name: 'Pace' })).toHaveAttribute('aria-current', 'page');
		expect(getByRole('link', { name: 'HR Zones' })).not.toHaveAttribute('aria-current');
	});

	it('marks a nested route under a tool as active via startsWith match', async () => {
		mockPage.url = new URL('http://localhost/hr-zones/details');
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('link', { name: 'HR Zones' })).toHaveAttribute('aria-current', 'page');
	});

	it('does not mark the brand link active when on a tool route', async () => {
		mockPage.url = new URL('http://localhost/pace');
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('link', { name: 'Runwise' })).not.toHaveAttribute('aria-current');
	});
});

describe('SiteNav theme toggle', () => {
	// The toggle is two always-present buttons whose visibility is decided purely
	// by the dark: CSS variant against <html>'s class (so the icon is correct at
	// first paint with no JS round-trip). jsdom doesn't load the compiled
	// stylesheet, so these tests can't observe which button is CSS-hidden — that
	// is verified live (see the /verify session's RAF probe). What's tested here
	// is the DOM/localStorage state each button's click handler produces, and
	// that both buttons carry the correct static markup unconditionally.

	function mockMatchMedia(matches: boolean) {
		const addEventListener = vi.fn();
		const removeEventListener = vi.fn();
		vi.spyOn(window, 'matchMedia').mockReturnValue({
			matches,
			media: '(prefers-color-scheme: dark)',
			addEventListener,
			removeEventListener
		} as unknown as MediaQueryList);
		return { addEventListener, removeEventListener };
	}

	it('rendersBothToggleButtonsWithStaticAccessibleLabels', async () => {
		mockMatchMedia(false);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
		expect(getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
	});

	it('clickingSwitchToDarkButton_whenLight_flipsHtmlClassAndPersists', async () => {
		document.documentElement.classList.add('light');
		mockMatchMedia(false);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);

		await fireEvent.click(getByRole('button', { name: 'Switch to dark mode' }));

		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(document.documentElement.classList.contains('light')).toBe(false);
		expect(localStorage.getItem('theme')).toBe('dark');
	});

	it('clickingSwitchToLightButton_whenDark_flipsHtmlClassAndPersists', async () => {
		document.documentElement.classList.add('dark');
		mockMatchMedia(false);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);

		await fireEvent.click(getByRole('button', { name: 'Switch to light mode' }));

		expect(document.documentElement.classList.contains('light')).toBe(true);
		expect(document.documentElement.classList.contains('dark')).toBe(false);
		expect(localStorage.getItem('theme')).toBe('light');
	});

	it('toggleClickedTwice_returnsToOriginalTheme', async () => {
		document.documentElement.classList.add('light');
		mockMatchMedia(false);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);

		await fireEvent.click(getByRole('button', { name: 'Switch to dark mode' }));
		await fireEvent.click(getByRole('button', { name: 'Switch to light mode' }));

		expect(document.documentElement.classList.contains('light')).toBe(true);
		expect(localStorage.getItem('theme')).toBe('light');
	});

	it('noStoredPreference_systemPreferenceChangeUpdatesHtmlClass', async () => {
		document.documentElement.classList.add('light');
		const listeners: Array<(event: { matches: boolean }) => void> = [];
		vi.spyOn(window, 'matchMedia').mockReturnValue({
			matches: false,
			media: '(prefers-color-scheme: dark)',
			addEventListener: (_event: string, listener: (event: { matches: boolean }) => void) => {
				listeners.push(listener);
			},
			removeEventListener: vi.fn()
		} as unknown as MediaQueryList);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		render(SiteNav);

		listeners[0]({ matches: true });
		await tick();

		expect(document.documentElement.classList.contains('dark')).toBe(true);
	});

	it('storedPreferenceExists_systemPreferenceChangeDoesNotOverrideHtmlClass', async () => {
		document.documentElement.classList.add('light');
		localStorage.setItem('theme', 'light');
		const listeners: Array<(event: { matches: boolean }) => void> = [];
		vi.spyOn(window, 'matchMedia').mockReturnValue({
			matches: false,
			media: '(prefers-color-scheme: dark)',
			addEventListener: (_event: string, listener: (event: { matches: boolean }) => void) => {
				listeners.push(listener);
			},
			removeEventListener: vi.fn()
		} as unknown as MediaQueryList);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		render(SiteNav);

		listeners[0]({ matches: true });
		await tick();

		expect(document.documentElement.classList.contains('light')).toBe(true);
	});

	it('toggleButtons_haveConsistentFocusRingClasses', async () => {
		mockMatchMedia(false);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		for (const name of ['Switch to dark mode', 'Switch to light mode']) {
			const button = getByRole('button', { name });
			expect(button.className).toContain('focus-visible:ring-2');
			expect(button.className).toContain('focus-visible:ring-accent');
			expect(button.className).toContain('focus-visible:ring-offset-2');
		}
	});

	it('toggleIcons_areHiddenFromAssistiveTechnology', async () => {
		mockMatchMedia(false);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		for (const name of ['Switch to dark mode', 'Switch to light mode']) {
			const button = getByRole('button', { name });
			expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
		}
	});

	it('switchToDarkButton_hasDarkHiddenClass_switchToLightButton_hasDarkVisibleClass', async () => {
		mockMatchMedia(false);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('button', { name: 'Switch to dark mode' }).className).toContain('dark:hidden');
		expect(getByRole('button', { name: 'Switch to light mode' }).className).toContain('hidden');
		expect(getByRole('button', { name: 'Switch to light mode' }).className).toContain(
			'dark:inline-flex'
		);
	});

	it('toggleButtons_useExplicitHoverToken_notIncidentalInkFlip', async () => {
		mockMatchMedia(false);
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		for (const name of ['Switch to dark mode', 'Switch to light mode']) {
			const button = getByRole('button', { name });
			expect(button.className).toContain('hover:text-hover');
			expect(button.className).not.toContain('hover:text-ink');
		}
	});
});

describe('SiteNav tool links', () => {
	it('toolLink_usesExplicitHoverToken_notIncidentalInkFlip', async () => {
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		const link = getByRole('link', { name: 'HR Zones' });
		expect(link.className).toContain('hover:text-hover');
		expect(link.className).not.toContain('hover:text-ink');
	});
});
