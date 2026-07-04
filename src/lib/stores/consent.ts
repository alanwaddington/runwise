export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';

export interface ConsentState {
	categories: ConsentCategory[];
	timestamp: number;
}

const STORAGE_KEY = 'cookie-consent';

export function getConsent(): ConsentState | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as ConsentState;
	} catch {
		return null;
	}
}

export function setConsent(categories: ConsentCategory[]): void {
	try {
		const state: ConsentState = { categories, timestamp: Date.now() };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// localStorage unavailable (private mode etc.) — fail silently
	}
}

export function hasConsent(category: ConsentCategory): boolean {
	const state = getConsent();
	if (!state) return false;
	return state.categories.includes(category);
}

export function clearConsent(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// localStorage unavailable — fail silently
	}
}
