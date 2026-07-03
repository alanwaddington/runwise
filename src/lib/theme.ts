export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function isTheme(value: unknown): value is Theme {
	return value === 'light' || value === 'dark';
}

export function resolveEffectiveTheme(stored: Theme | undefined, prefersDark: boolean): Theme {
	if (isTheme(stored)) return stored;
	return prefersDark ? 'dark' : 'light';
}

export function getStoredTheme(): Theme | undefined {
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		return isTheme(value) ? value : undefined;
	} catch {
		return undefined;
	}
}

export function setStoredTheme(theme: Theme): void {
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		// localStorage may be unavailable (e.g. privacy mode); the toggle still
		// works for the current page load, it just won't persist.
	}
}

export function applyTheme(theme: Theme): void {
	const root = document.documentElement;
	root.classList.toggle('dark', theme === 'dark');
	root.classList.toggle('light', theme === 'light');
}

export function watchSystemTheme(callback: (prefersDark: boolean) => void): () => void {
	const query = window.matchMedia('(prefers-color-scheme: dark)');
	const listener = (event: { matches: boolean }) => callback(event.matches);
	query.addEventListener('change', listener);
	return () => query.removeEventListener('change', listener);
}
