import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	getConsent,
	setConsent,
	hasConsent,
	clearConsent,
	type ConsentCategory,
	type ConsentState
} from './consent';

const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		})
	};
})();

beforeEach(() => {
	vi.stubGlobal('localStorage', localStorageMock);
	localStorageMock.clear();
	vi.clearAllMocks();
});

describe('getConsent', () => {
	it('getConsent_noStoredValue_returnsNull', () => {
		expect(getConsent()).toBeNull();
	});

	it('getConsent_storedValue_returnsConsentState', () => {
		const state: ConsentState = { categories: ['necessary', 'marketing'], timestamp: 1234567890 };
		localStorageMock.setItem('cookie-consent', JSON.stringify(state));
		expect(getConsent()).toEqual(state);
	});

	it('getConsent_invalidJson_returnsNull', () => {
		localStorageMock.setItem('cookie-consent', 'not-valid-json');
		expect(getConsent()).toBeNull();
	});

	it('getConsent_localStorageUnavailable_returnsNull', () => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn(() => { throw new Error('localStorage unavailable'); })
		});
		expect(getConsent()).toBeNull();
	});
});

describe('setConsent', () => {
	it('setConsent_validCategories_persistsToLocalStorage', () => {
		setConsent(['necessary', 'analytics', 'marketing']);
		const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1] as string) as ConsentState;
		expect(stored.categories).toEqual(['necessary', 'analytics', 'marketing']);
		expect(stored.timestamp).toBeTypeOf('number');
	});

	it('setConsent_necessaryOnly_persistsOnlyNecessary', () => {
		setConsent(['necessary']);
		const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1] as string) as ConsentState;
		expect(stored.categories).toEqual(['necessary']);
	});

	it('setConsent_localStorageUnavailable_doesNotThrow', () => {
		vi.stubGlobal('localStorage', {
			setItem: vi.fn(() => { throw new Error('localStorage unavailable'); })
		});
		expect(() => setConsent(['necessary'])).not.toThrow();
	});
});

describe('hasConsent', () => {
	it('hasConsent_noConsentStored_returnsFalse', () => {
		expect(hasConsent('marketing')).toBe(false);
	});

	it('hasConsent_marketingAccepted_returnsTrue', () => {
		setConsent(['necessary', 'analytics', 'marketing']);
		expect(hasConsent('marketing')).toBe(true);
	});

	it('hasConsent_onlyNecessaryAccepted_returnsFalseForMarketing', () => {
		setConsent(['necessary']);
		expect(hasConsent('marketing')).toBe(false);
	});

	it('hasConsent_necessaryAlwaysAccepted_returnsTrue', () => {
		setConsent(['necessary']);
		expect(hasConsent('necessary')).toBe(true);
	});

	it('hasConsent_analyticsAccepted_returnsTrueForAnalytics', () => {
		setConsent(['necessary', 'analytics']);
		expect(hasConsent('analytics')).toBe(true);
	});
});

describe('clearConsent', () => {
	it('clearConsent_storedConsent_removesFromLocalStorage', () => {
		setConsent(['necessary', 'marketing']);
		clearConsent();
		expect(getConsent()).toBeNull();
	});

	it('clearConsent_noConsent_doesNotThrow', () => {
		expect(() => clearConsent()).not.toThrow();
	});

	it('clearConsent_localStorageUnavailable_doesNotThrow', () => {
		vi.stubGlobal('localStorage', {
			removeItem: vi.fn(() => { throw new Error('localStorage unavailable'); })
		});
		expect(() => clearConsent()).not.toThrow();
	});
});

describe('ConsentCategory type', () => {
	it('accepts_necessary_as_valid_category', () => {
		const cat: ConsentCategory = 'necessary';
		expect(cat).toBe('necessary');
	});

	it('accepts_analytics_as_valid_category', () => {
		const cat: ConsentCategory = 'analytics';
		expect(cat).toBe('analytics');
	});

	it('accepts_marketing_as_valid_category', () => {
		const cat: ConsentCategory = 'marketing';
		expect(cat).toBe('marketing');
	});
});
