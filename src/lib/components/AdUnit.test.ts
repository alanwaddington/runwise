import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';

vi.mock('$app/environment', () => ({ browser: true }));

const { mockHasConsent } = vi.hoisted(() => ({
	mockHasConsent: vi.fn(() => false)
}));

vi.mock('$lib/stores/consent', () => ({
	hasConsent: mockHasConsent
}));

const mockConsentBannerVisible = {
	subscribe: vi.fn((fn: (v: boolean) => void) => {
		fn(false);
		return () => {};
	})
};

vi.mock('$lib/stores/consentBannerVisible', () => ({
	consentBannerVisible: mockConsentBannerVisible
}));

const mockEnv: Record<string, string> = {};

vi.mock('$env/dynamic/public', () => ({
	env: mockEnv
}));

beforeEach(() => {
	mockHasConsent.mockReturnValue(false);
	delete mockEnv.PUBLIC_ADSENSE_CLIENT_ID;
});

afterEach(() => {
	cleanup();
	document.querySelectorAll('script[src*="adsbygoogle"]').forEach((el) => el.remove());
	delete (window as { adsbygoogle?: unknown }).adsbygoogle;
});

describe('AdUnit consent gating', () => {
	it('AdUnit_noMarketingConsent_rendersNothing', async () => {
		const { default: AdUnit } = await import('./AdUnit.svelte');
		const { queryByTestId } = render(AdUnit);
		expect(queryByTestId('ad-unit')).toBeNull();
	});

	it('AdUnit_marketingConsentWithClientId_rendersAdUnit', async () => {
		mockHasConsent.mockReturnValue(true);
		mockEnv.PUBLIC_ADSENSE_CLIENT_ID = 'ca-pub-1234567890';
		const { default: AdUnit } = await import('./AdUnit.svelte');
		const { getByTestId } = render(AdUnit);
		await tick();
		expect(getByTestId('ad-unit')).toBeInTheDocument();
	});

	it('AdUnit_marketingConsentButNoClientId_rendersNothing', async () => {
		mockHasConsent.mockReturnValue(true);
		const { default: AdUnit } = await import('./AdUnit.svelte');
		const { queryByTestId } = render(AdUnit);
		expect(queryByTestId('ad-unit')).toBeNull();
	});
});

describe('AdUnit AdSense script injection', () => {
	it('AdUnit_marketingConsentWithClientId_injectsAdSenseScript', async () => {
		mockHasConsent.mockReturnValue(true);
		mockEnv.PUBLIC_ADSENSE_CLIENT_ID = 'ca-pub-1234567890';
		const { default: AdUnit } = await import('./AdUnit.svelte');
		render(AdUnit);
		await tick();
		const script = document.querySelector('script[src*="adsbygoogle"]');
		expect(script).not.toBeNull();
		expect(script?.getAttribute('src')).toContain('ca-pub-1234567890');
	});

	it('AdUnit_noConsent_doesNotInjectAdSenseScript', async () => {
		const { default: AdUnit } = await import('./AdUnit.svelte');
		render(AdUnit);
		await tick();
		expect(document.querySelector('script[src*="adsbygoogle"]')).toBeNull();
	});

	it('AdUnit_renderedTwice_injectsScriptOnlyOnce', async () => {
		mockHasConsent.mockReturnValue(true);
		mockEnv.PUBLIC_ADSENSE_CLIENT_ID = 'ca-pub-1234567890';
		const { default: AdUnit } = await import('./AdUnit.svelte');
		render(AdUnit);
		render(AdUnit);
		await tick();
		expect(document.querySelectorAll('script[src*="adsbygoogle"]').length).toBe(1);
	});
});
