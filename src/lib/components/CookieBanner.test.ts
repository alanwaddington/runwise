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
	it('CookieBanner_bannerVisible_rendersRegionWithRole', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByRole } = render(CookieBanner);
		expect(getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument();
	});

	it('CookieBanner_bannerHidden_doesNotRenderRegion', async () => {
		consentBannerVisible.set(false);
		await tick();
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { queryByRole } = render(CookieBanner);
		expect(queryByRole('region')).toBeNull();
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
		expect(queryByRole('region')).toBeNull();
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
		expect(queryByRole('region')).toBeNull();
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
		expect(queryByRole('region')).toBeNull();
	});
});

describe('CookieBanner Necessary cookies section', () => {
	it('necessarySection_usesSemanticCheckboxWithDisabledState_notNonInteractiveDiv', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText } = render(CookieBanner);
		await fireEvent.click(getByText(/Customise/));
		await tick();

		// Query for the necessary section
		const necessarySection = getByText('Necessary').closest('.flex');
		expect(necessarySection).toBeInTheDocument();

		// Assert: checkbox input exists
		const checkbox = necessarySection?.querySelector('input[type="checkbox"]');
		expect(checkbox).toBeInTheDocument();

		// Assert: checkbox is checked
		expect(checkbox).toHaveAttribute('checked');

		// Assert: checkbox is disabled
		expect(checkbox).toHaveAttribute('disabled');

		// Assert: input is hidden from view (sr-only)
		expect(checkbox).toHaveClass('sr-only');

		// Assert: aria-label is removed from the visual div
		const visualDiv = necessarySection?.querySelector('[aria-label]');
		expect(visualDiv).not.toBeInTheDocument();
	});

	it('necessarySection_providesScreenReaderText_viaSrOnlySpan', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText } = render(CookieBanner);
		await fireEvent.click(getByText(/Customise/));
		await tick();

		// Find the label in the necessary section
		const necessarySection = getByText('Necessary').closest('.flex');
		const label = necessarySection?.querySelector('label');
		expect(label).toBeInTheDocument();

		// Query for sr-only span
		const srOnlySpan = label?.querySelector('.sr-only');
		expect(srOnlySpan).toBeInTheDocument();
		expect(srOnlySpan?.textContent).toContain('Necessary cookies');
	});

	it('necessarySection_visualDivHasAriaHidden_preventsScreenReaderDuplication', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText } = render(CookieBanner);
		await fireEvent.click(getByText(/Customise/));
		await tick();

		// Find the necessary section
		const necessarySection = getByText('Necessary').closest('.flex');
		const label = necessarySection?.querySelector('label');
		const innerDiv = label?.querySelector('.relative');
		const visualDiv = innerDiv?.querySelector('[aria-hidden="true"]');

		// Assert: visual div has aria-hidden="true"
		expect(visualDiv).toBeInTheDocument();
		expect(visualDiv).toHaveAttribute('aria-hidden', 'true');
	});

	it('necessarySection_labelHasCursorNotAllowed_visuallyIndicatesDisabled', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText } = render(CookieBanner);
		await fireEvent.click(getByText(/Customise/));
		await tick();

		// Find the label
		const necessarySection = getByText('Necessary').closest('.flex');
		const label = necessarySection?.querySelector('label');

		// Assert: label has cursor-not-allowed class
		expect(label).toHaveClass('cursor-not-allowed');
	});

	it('necessarySection_matchesAnalyticsToggleStructure_samePattern', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText } = render(CookieBanner);
		await fireEvent.click(getByText(/Customise/));
		await tick();

		// Get necessary section structure
		const necessarySection = getByText('Necessary').closest('.flex');
		const necessaryLabel = necessarySection?.querySelector('label');
		const necessarySrOnly = necessaryLabel?.querySelector('.sr-only');
		const necessaryDiv = necessaryLabel?.querySelector('.relative');
		const necessaryInput = necessaryDiv?.querySelector('input[type="checkbox"]');
		const necessaryVisualDiv = necessaryDiv?.querySelector('[aria-hidden="true"]');

		// Get analytics section structure for comparison
		const analyticsSection = getByText('Analytics').closest('.flex');
		const analyticsLabel = analyticsSection?.querySelector('label');
		const analyticsSrOnly = analyticsLabel?.querySelector('.sr-only');
		const analyticsDiv = analyticsLabel?.querySelector('.relative');
		const analyticsInput = analyticsDiv?.querySelector('input[type="checkbox"]');
		const analyticsVisualDiv = analyticsDiv?.querySelector('div');

		// Assert: same structure exists (label → sr-only → .relative → input + visual div)
		expect(necessaryLabel).toBeInTheDocument();
		expect(necessarySrOnly).toBeInTheDocument();
		expect(necessaryInput).toBeInTheDocument();
		expect(necessaryVisualDiv).toBeInTheDocument();

		// Compare to analytics
		expect(analyticsLabel).toBeInTheDocument();
		expect(analyticsSrOnly).toBeInTheDocument();
		expect(analyticsInput).toBeInTheDocument();
		expect(analyticsVisualDiv).toBeInTheDocument();
	});
});

describe('CookieBanner hover/contrast tokens', () => {
	it('necessaryOnlyAndCustomiseButtons_useExplicitHoverToken_noRedundantDarkOverrides', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByRole, getByText } = render(CookieBanner);
		const necessaryOnly = getByRole('button', { name: 'Necessary Only' });
		const customise = getByText(/Customise/);
		for (const el of [necessaryOnly, customise]) {
			expect(el.className).toContain('hover:text-hover');
			expect(el.className).not.toContain('dark:hover:text-gray-200');
			expect(el.className).not.toContain('dark:text-gray-400');
		}
	});

	it('introParagraph_hasNoRedundantDarkTextOverride', async () => {
		const { default: CookieBanner } = await import('./CookieBanner.svelte');
		const { getByText } = render(CookieBanner);
		const paragraph = getByText(/We use cookies to serve ads/);
		expect(paragraph.className).not.toContain('dark:text-gray-400');
	});
});
