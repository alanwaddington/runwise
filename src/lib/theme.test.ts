import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	resolveEffectiveTheme,
	getStoredTheme,
	setStoredTheme,
	applyTheme,
	watchSystemTheme
} from './theme';

describe('resolveEffectiveTheme', () => {
	it('storedIsLight_returnsLight', () => {
		expect(resolveEffectiveTheme('light', true)).toBe('light');
	});

	it('storedIsDark_returnsDark', () => {
		expect(resolveEffectiveTheme('dark', false)).toBe('dark');
	});

	it('noStoredValue_prefersDarkTrue_returnsDark', () => {
		expect(resolveEffectiveTheme(undefined, true)).toBe('dark');
	});

	it('noStoredValue_prefersDarkFalse_returnsLight', () => {
		expect(resolveEffectiveTheme(undefined, false)).toBe('light');
	});
});

describe('getStoredTheme', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('valueIsLight_returnsLight', () => {
		localStorage.setItem('theme', 'light');
		expect(getStoredTheme()).toBe('light');
	});

	it('valueIsDark_returnsDark', () => {
		localStorage.setItem('theme', 'dark');
		expect(getStoredTheme()).toBe('dark');
	});

	it('noValueStored_returnsUndefined', () => {
		expect(getStoredTheme()).toBeUndefined();
	});

	it('valueIsInvalid_returnsUndefined', () => {
		localStorage.setItem('theme', 'not-a-theme');
		expect(getStoredTheme()).toBeUndefined();
	});

	it('localStorageThrows_returnsUndefined', () => {
		const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		expect(getStoredTheme()).toBeUndefined();
		spy.mockRestore();
	});
});

describe('setStoredTheme', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('themeIsLight_persistsLight', () => {
		setStoredTheme('light');
		expect(localStorage.getItem('theme')).toBe('light');
	});

	it('themeIsDark_persistsDark', () => {
		setStoredTheme('dark');
		expect(localStorage.getItem('theme')).toBe('dark');
	});

	it('localStorageThrows_doesNotThrow', () => {
		const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		expect(() => setStoredTheme('dark')).not.toThrow();
		spy.mockRestore();
	});
});

describe('applyTheme', () => {
	afterEach(() => {
		document.documentElement.classList.remove('light', 'dark');
	});

	it('themeIsDark_addsDarkClassRemovesLight', () => {
		document.documentElement.classList.add('light');
		applyTheme('dark');
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(document.documentElement.classList.contains('light')).toBe(false);
	});

	it('themeIsLight_addsLightClassRemovesDark', () => {
		document.documentElement.classList.add('dark');
		applyTheme('light');
		expect(document.documentElement.classList.contains('light')).toBe(true);
		expect(document.documentElement.classList.contains('dark')).toBe(false);
	});
});

describe('watchSystemTheme', () => {
	let listeners: Array<(event: { matches: boolean }) => void>;
	let addEventListenerSpy: ReturnType<typeof vi.fn>;
	let removeEventListenerSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		listeners = [];
		addEventListenerSpy = vi.fn((event: string, listener: (event: { matches: boolean }) => void) => {
			if (event === 'change') listeners.push(listener);
		});
		removeEventListenerSpy = vi.fn();
		vi.spyOn(window, 'matchMedia').mockReturnValue({
			matches: false,
			media: '(prefers-color-scheme: dark)',
			addEventListener: addEventListenerSpy,
			removeEventListener: removeEventListenerSpy
		} as unknown as MediaQueryList);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('systemPreferenceChangesToDark_invokesCallbackWithTrue', () => {
		const callback = vi.fn();
		watchSystemTheme(callback);
		listeners[0]({ matches: true });
		expect(callback).toHaveBeenCalledWith(true);
	});

	it('systemPreferenceChangesToLight_invokesCallbackWithFalse', () => {
		const callback = vi.fn();
		watchSystemTheme(callback);
		listeners[0]({ matches: false });
		expect(callback).toHaveBeenCalledWith(false);
	});

	it('called_registersChangeListenerOnMatchMedia', () => {
		watchSystemTheme(vi.fn());
		expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
	});

	it('unsubscribeCalled_removesChangeListener', () => {
		const unsubscribe = watchSystemTheme(vi.fn());
		unsubscribe();
		expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
	});
});
