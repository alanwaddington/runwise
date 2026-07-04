import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';

vi.mock('$app/environment', () => ({ browser: true }));

const { mockSetConsent, mockHasConsent, mockGetConsent } = vi.hoisted(() => ({
	mockSetConsent: vi.fn(),
	mockHasConsent: vi.fn(() => false),
	mockGetConsent: vi.fn(() => null)
}));

vi.mock('$lib/stores/consent', () => ({
	setConsent: mockSetConsent,
	hasConsent: mockHasConsent,
	getConsent: mockGetConsent
}));

import { consentBannerVisible } from '$lib/stores/consentBannerVisible';

beforeEach(() => {
	consentBannerVisible.set(true);
	mockSetConsent.mockClear();
	mockHasConsent.mockReset();
	mockHasConsent.mockReturnValue(false);
});

afterEach(() => {
	cleanup();
});

describe('CookieBanner visibility', () => {
	it('CookieBanner_bannerVisible_rendersDialogWithRole', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByRole } = render(CookieBanner);
		expect(getByRole('dialog', { name: 'Cookie consent' })).toBeInTheDocument();
	});

	it('CookieBanner_bannerHidden_doesNotRenderDialog', async () => {
		consentBannerVisible.set(false);
		await tick();
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { queryByRole } = render(CookieBanner);
		expect(queryByRole('dialog')).toBeNull();
	});

	it('CookieBanner_bannerVisible_showsPrivacyPolicyLink', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByRole } = render(CookieBanner);
		const link = getByRole('link', { name: 'Privacy Policy' });
		expect(link).toHaveAttribute('href', '/privacy');
	});
});

describe('CookieBanner Accept All', () => {
	it('CookieBanner_acceptAll_callsSetConsentWithAllThreeCategories', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByRole } = render(CookieBanner);
		await fireEvent.click(getByRole('button', { name: 'Accept All' }));
		expect(mockSetConsent).toHaveBeenCalledWith(['necessary', 'analytics', 'marketing']);
	});

	it('CookieBanner_acceptAll_hidesBanner', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByRole, queryByRole } = render(CookieBanner);
		await fireEvent.click(getByRole('button', { name: 'Accept All' }));
		await tick();
		expect(queryByRole('dialog')).toBeNull();
	});
});

describe('CookieBanner Necessary Only', () => {
	it('CookieBanner_necessaryOnly_callsSetConsentWithNecessaryOnly', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByRole } = render(CookieBanner);
		await fireEvent.click(getByRole('button', { name: 'Necessary Only' }));
		expect(mockSetConsent).toHaveBeenCalledWith(['necessary']);
	});

	it('CookieBanner_necessaryOnly_hidesBanner', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByRole, queryByRole } = render(CookieBanner);
		await fireEvent.click(getByRole('button', { name: 'Necessary Only' }));
		await tick();
		expect(queryByRole('dialog')).toBeNull();
	});
});

describe('CookieBanner Customise panel', () => {
	it('CookieBanner_customiseClick_expandsAnalyticsAndMarketingToggles', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText } = render(CookieBanner);
		await fireEvent.click(getByText(/Customise/));
		await tick();
		expect(getByText('Analytics')).toBeInTheDocument();
		expect(getByText('Marketing')).toBeInTheDocument();
	});

	it('CookieBanner_customisePanel_showsNecessaryAsAlwaysOn', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText } = render(CookieBanner);
		await fireEvent.click(getByText(/Customise/));
		await tick();
		expect(getByText('Necessary')).toBeInTheDocument();
	});

	it('CookieBanner_savePreferences_allEnabled_callsSetConsentWithAllCategories', async () => {
		mockHasConsent.mockReturnValue(true);
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText } = render(CookieBanner);
		await tick();
		await fireEvent.click(getByText(/Customise/));
		await tick();
		await fireEvent.click(getByText('Save Preferences'));
		expect(mockSetConsent).toHaveBeenCalledWith(['necessary', 'analytics', 'marketing']);
	});

	it('CookieBanner_savePreferences_hidesBanner', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText, queryByRole } = render(CookieBanner);
		await fireEvent.click(getByText(/Customise/));
		await tick();
		await fireEvent.click(getByText('Save Preferences'));
		await tick();
		expect(queryByRole('dialog')).toBeNull();
	});
});
