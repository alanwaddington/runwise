import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';

vi.mock('$lib/affiliates', () => ({
	getAffiliateLinks: vi.fn((route: string) => {
		if (route === '/hr-zones') {
			return [
				{
					name: 'Garmin HRM-Pro Plus',
					description: 'Premium chest strap heart rate monitor.',
					url: 'https://www.amazon.co.uk/dp/B09Y8HM3ZY?tag=runwise-21',
					program: 'garmin',
					tag: 'runwise-21'
				},
				{
					name: 'Garmin HRM-Dual',
					description: 'Dual-band heart rate monitor.',
					url: 'https://www.amazon.co.uk/dp/B07CNKRHC7?tag=runwise-21',
					program: 'amazon',
					tag: 'runwise-21'
				}
			];
		}
		return [];
	})
}));

afterEach(() => {
	cleanup();
});

describe('AffiliateLinks', () => {
	it('AffiliateLinks_emptyRoute_rendersNoHeading', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { queryByText } = render(AffiliateLinks, { props: { route: '/' } });
		expect(queryByText(/Recommended gear/i)).toBeNull();
	});

	it('AffiliateLinks_unknownRoute_rendersNoHeading', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { queryByText } = render(AffiliateLinks, { props: { route: '/privacy' } });
		expect(queryByText(/Recommended gear/i)).toBeNull();
	});

	it('AffiliateLinks_knownRoute_rendersHeading', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getByText } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		expect(getByText(/Recommended gear/i)).toBeInTheDocument();
	});

	it('AffiliateLinks_knownRoute_rendersProductNames', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getByText } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		expect(getByText('Garmin HRM-Pro Plus')).toBeInTheDocument();
		expect(getByText('Garmin HRM-Dual')).toBeInTheDocument();
	});

	it('AffiliateLinks_knownRoute_rendersProductDescriptions', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getByText } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		expect(getByText('Premium chest strap heart rate monitor.')).toBeInTheDocument();
	});

	it('AffiliateLinks_productLinks_haveTargetBlank', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getAllByRole } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		const links = getAllByRole('link');
		for (const link of links) {
			expect(link).toHaveAttribute('target', '_blank');
		}
	});

	it('AffiliateLinks_productLinks_haveRelNoopenerNoreferrerSponsored', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getAllByRole } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		const links = getAllByRole('link');
		for (const link of links) {
			expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored');
		}
	});

	it('AffiliateLinks_garminProduct_showsGarminBadge', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getByText } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		expect(getByText('Garmin')).toBeInTheDocument();
	});

	it('AffiliateLinks_amazonProduct_showsAmazonBadge', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getByText } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		expect(getByText('Amazon')).toBeInTheDocument();
	});

	it('AffiliateLinks_knownRoute_showsAffiliateDisclosure', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getByText } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		expect(getByText(/may earn from qualifying purchases/i)).toBeInTheDocument();
	});

	it('AffiliateLinks_garminProduct_showsViewOnGarminLink', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getByText } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		expect(getByText('View on Garmin →')).toBeInTheDocument();
	});

	it('AffiliateLinks_amazonProduct_showsViewOnAmazonLink', async () => {
		const { default: AffiliateLinks } = await import('./AffiliateLinks.svelte');
		const { getByText } = render(AffiliateLinks, { props: { route: '/hr-zones' } });
		expect(getByText('View on Amazon →')).toBeInTheDocument();
	});
});
