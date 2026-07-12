import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { observeHeaderHeight } from './headerHeightObserver';

describe('observeHeaderHeight', () => {
	let mockHeader: HTMLElement;
	let observeSpy: ReturnType<typeof vi.fn>;
	let disconnectSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockHeader = document.createElement('header');
		mockHeader.style.height = '96px';
		document.body.appendChild(mockHeader);

		observeSpy = vi.fn();
		disconnectSpy = vi.fn();

		class MockResizeObserver {
			constructor(_callback: ResizeObserverCallback) {}
			observe = observeSpy;
			disconnect = disconnectSpy;
			unobserve = vi.fn();
		}

		global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
	});

	afterEach(() => {
		mockHeader.remove();
		document.documentElement.style.removeProperty('--header-height');
	});

	it('observeHeaderHeight_setsInitialHeight', () => {
		observeHeaderHeight(mockHeader);
		const headerHeight = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
		expect(headerHeight.trim()).toBe('0px');
	});

	it('observeHeaderHeight_activatesResizeObserver', () => {
		observeHeaderHeight(mockHeader);
		expect(observeSpy).toHaveBeenCalledWith(mockHeader);
	});

	it('observeHeaderHeight_returnsCleanupFunction', () => {
		const cleanup = observeHeaderHeight(mockHeader);
		expect(typeof cleanup).toBe('function');
	});

	it('observeHeaderHeight_cleanupDisconnectsObserver', () => {
		const cleanup = observeHeaderHeight(mockHeader);
		cleanup();
		expect(disconnectSpy).toHaveBeenCalled();
	});

	it('observeHeaderHeight_returnsNoOpForNullHeader', () => {
		const cleanup = observeHeaderHeight(null);
		cleanup();
		expect(cleanup).toBeDefined();
	});
});
