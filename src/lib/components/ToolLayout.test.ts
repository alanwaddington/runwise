import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import { createRawSnippet, tick } from 'svelte';
import ToolLayout from './ToolLayout.svelte';
import type { AffiliateProduct } from '$lib/affiliates';

vi.mock('$app/environment', () => ({ browser: true }));

const { mockHasConsent } = vi.hoisted(() => ({
	mockHasConsent: vi.fn(() => false)
}));

vi.mock('$lib/stores/consent', () => ({
	hasConsent: mockHasConsent
}));

const { mockConsentBannerVisible } = vi.hoisted(() => ({
	mockConsentBannerVisible: {
		subscribe: vi.fn((fn: (v: boolean) => void) => {
			fn(false);
			return () => {};
		})
	}
}));

vi.mock('$lib/stores/consentBannerVisible', () => ({
	consentBannerVisible: mockConsentBannerVisible
}));

const { mockEnv } = vi.hoisted(() => ({
	mockEnv: {} as Record<string, string>
}));
vi.mock('$env/dynamic/public', () => ({ env: mockEnv }));

const { mockGetAffiliateLinks } = vi.hoisted(() => ({
	mockGetAffiliateLinks: vi.fn((): AffiliateProduct[] => [])
}));

vi.mock('$lib/affiliates', () => ({
	getAffiliateLinks: mockGetAffiliateLinks
}));

beforeEach(() => {
	mockHasConsent.mockReturnValue(false);
	delete mockEnv.PUBLIC_ADSENSE_CLIENT_ID;
	mockGetAffiliateLinks.mockReturnValue([]);
});

afterEach(() => {
	cleanup();
	document.querySelectorAll('script[src*="adsbygoogle"]').forEach((el) => el.remove());
	delete (window as Window & { adsbygoogle?: unknown }).adsbygoogle;
});

const childSnippet = createRawSnippet(() => ({
	render: () => '<p data-testid="tool-content">Tool content</p>'
}));

describe('ToolLayout', () => {
	it('renders the title as a heading', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', route: '/pace', children: childSnippet }
		});
		expect(screen.getByRole('heading', { level: 1, name: 'Pace Calculator' })).toBeInTheDocument();
	});

	it('renders the description', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', route: '/pace', children: childSnippet }
		});
		expect(screen.getByText('Work out your pace.')).toBeInTheDocument();
	});

	it('description_hasNoRedundantDarkTextOverride', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', route: '/pace', children: childSnippet }
		});
		const description = screen.getByText('Work out your pace.');
		expect(description.className).not.toContain('dark:text-gray-400');
	});

	it('renders a back-to-home link', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', route: '/pace', children: childSnippet }
		});
		const back = screen.getByRole('link', { name: /all tools/i });
		expect(back).toHaveAttribute('href', '/');
	});

	it('backLink_usesExplicitHoverToken_notIncidentalInkFlip', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', route: '/pace', children: childSnippet }
		});
		const back = screen.getByRole('link', { name: /all tools/i });
		expect(back.className).toContain('hover:text-hover');
		expect(back.className).not.toContain('hover:text-ink');
	});

	it('renders the default slot content inside a bordered card', () => {
		render(ToolLayout, {
			props: { title: 'Pace Calculator', description: 'Work out your pace.', route: '/pace', children: childSnippet }
		});
		const content = screen.getByTestId('tool-content');
		expect(content).toBeInTheDocument();
		const card = content.closest('div');
		expect(card?.className).toMatch(/rounded-2xl/);
		expect(card?.className).toMatch(/border/);
	});

	it('renders without crashing when no child content is provided', () => {
		render(ToolLayout, { props: { title: 'Pace Calculator', description: 'Work out your pace.', route: '/pace' } });
		expect(screen.getByRole('heading', { level: 1, name: 'Pace Calculator' })).toBeInTheDocument();
	});

	describe('sidebar', () => {
		it('renders a sidebar aside element', () => {
			render(ToolLayout, {
				props: { title: 'T', description: 'D', route: '/pace', children: childSnippet }
			});
			expect(document.querySelector('aside')).toBeInTheDocument();
		});

		it('sidebar has lg:sticky and print:hidden classes', () => {
			render(ToolLayout, {
				props: { title: 'T', description: 'D', route: '/pace', children: childSnippet }
			});
			const aside = document.querySelector('aside');
			expect(aside?.className).toMatch(/lg:sticky/);
			expect(aside?.className).toMatch(/print:hidden/);
		});

		it('sidebar appears after the main content column in DOM order', () => {
			render(ToolLayout, {
				props: { title: 'T', description: 'D', route: '/pace', children: childSnippet }
			});
			const toolContent = screen.getByTestId('tool-content');
			const aside = document.querySelector('aside');
			expect(aside?.compareDocumentPosition(toolContent)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
		});

		it('renders AdUnit in sidebar when marketing consent and client ID are set', async () => {
			mockHasConsent.mockReturnValue(true);
			mockEnv.PUBLIC_ADSENSE_CLIENT_ID = 'ca-pub-1234567890';
			render(ToolLayout, {
				props: { title: 'T', description: 'D', route: '/pace', children: childSnippet }
			});
			await tick();
			const adUnit = screen.getByTestId('ad-unit');
			const aside = document.querySelector('aside');
			expect(aside?.contains(adUnit)).toBe(true);
		});

		it('renders AffiliateLinks in sidebar when products exist for route', () => {
			mockGetAffiliateLinks.mockReturnValue([
				{
					name: 'Forerunner 165',
					description: 'GPS running watch',
					url: 'https://amazon.com/test',
					program: 'amazon',
					tag: 'runwise21-21'
				}
			]);
			render(ToolLayout, {
				props: { title: 'T', description: 'D', route: '/pace', children: childSnippet }
			});
			const aside = document.querySelector('aside');
			expect(aside?.textContent).toContain('Recommended gear');
		});

		it('passes route prop to AffiliateLinks', () => {
			render(ToolLayout, {
				props: { title: 'T', description: 'D', route: '/pace', children: childSnippet }
			});
			expect(mockGetAffiliateLinks).toHaveBeenCalledWith('/pace');
		});

		it('sidebar_usesHeaderOffsetUtility_notHardcodedOffset', () => {
			render(ToolLayout, {
				props: { title: 'T', description: 'D', route: '/pace', children: childSnippet }
			});
			const aside = document.querySelector('aside');
			expect(aside?.className).toContain('lg:sticky-with-header-offset');
		});

		it('sidebar_removesHardcodedTopOffset_noRegression', () => {
			render(ToolLayout, {
				props: { title: 'T', description: 'D', route: '/pace', children: childSnippet }
			});
			const aside = document.querySelector('aside');
			expect(aside?.className).not.toContain('lg:top-24');
			expect(aside?.className).not.toContain('top-24');
		});
	});
});
