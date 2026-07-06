import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';

const mockSet = vi.fn();

vi.mock('$lib/stores/consentBannerVisible', () => ({
	consentBannerVisible: {
		subscribe: (fn: (v: boolean) => void) => {
			fn(false);
			return () => {};
		},
		set: mockSet
	}
}));

afterEach(() => {
	cleanup();
	mockSet.mockClear();
});

describe('SiteFooter', () => {
	it('SiteFooter_renders_privacyPolicyLink', async () => {
		const { default: SiteFooter } = await import('./SiteFooter.svelte');
		const { getByRole } = render(SiteFooter);
		const link = getByRole('link', { name: 'Privacy Policy' });
		expect(link).toHaveAttribute('href', '/privacy');
	});

	it('SiteFooter_renders_manageCookiesButton', async () => {
		const { default: SiteFooter } = await import('./SiteFooter.svelte');
		const { getByRole } = render(SiteFooter);
		expect(getByRole('button', { name: 'Manage Cookies' })).toBeInTheDocument();
	});

	it('SiteFooter_manageCookiesClick_setsConsentBannerVisibleToTrue', async () => {
		const { default: SiteFooter } = await import('./SiteFooter.svelte');
		const { getByRole } = render(SiteFooter);
		await fireEvent.click(getByRole('button', { name: 'Manage Cookies' }));
		expect(mockSet).toHaveBeenCalledWith(true);
	});

	it('SiteFooter_renders_copyrightText', async () => {
		const { default: SiteFooter } = await import('./SiteFooter.svelte');
		const { getByText } = render(SiteFooter);
		expect(getByText(/© 2026 Runwise/)).toBeInTheDocument();
	});

	it('SiteFooter_privacyPolicyLinkAndManageCookiesButton_useExplicitHoverToken', async () => {
		const { default: SiteFooter } = await import('./SiteFooter.svelte');
		const { getByRole } = render(SiteFooter);
		const link = getByRole('link', { name: 'Privacy Policy' });
		const button = getByRole('button', { name: 'Manage Cookies' });
		for (const el of [link, button]) {
			expect(el.className).toContain('hover:text-hover');
			expect(el.className).not.toContain('dark:hover:text-gray-200');
		}
	});
});
