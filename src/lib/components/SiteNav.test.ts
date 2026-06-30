import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';

const mockPage = { url: new URL('http://localhost/pace') };

vi.mock('$app/state', () => ({
	page: mockPage
}));

afterEach(() => {
	cleanup();
	mockPage.url = new URL('http://localhost/pace');
});

describe('SiteNav', () => {
	it('renders the brand link to home', async () => {
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		const brand = getByRole('link', { name: 'Runwise' });
		expect(brand).toHaveAttribute('href', '/');
	});

	it('renders all six tool links', async () => {
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('link', { name: 'Pace' })).toHaveAttribute('href', '/pace');
		expect(getByRole('link', { name: 'Race Predictor' })).toHaveAttribute(
			'href',
			'/race-predictor'
		);
		expect(getByRole('link', { name: 'Training Paces' })).toHaveAttribute(
			'href',
			'/training-paces'
		);
		expect(getByRole('link', { name: 'HR Zones' })).toHaveAttribute('href', '/hr-zones');
		expect(getByRole('link', { name: 'VO2 Max' })).toHaveAttribute('href', '/vo2max');
		expect(getByRole('link', { name: 'Parkrun' })).toHaveAttribute('href', '/parkrun');
	});

	it('marks the active route with aria-current="page"', async () => {
		mockPage.url = new URL('http://localhost/pace');
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('link', { name: 'Pace' })).toHaveAttribute('aria-current', 'page');
		expect(getByRole('link', { name: 'HR Zones' })).not.toHaveAttribute('aria-current');
	});

	it('marks a nested route under a tool as active via startsWith match', async () => {
		mockPage.url = new URL('http://localhost/hr-zones/details');
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('link', { name: 'HR Zones' })).toHaveAttribute('aria-current', 'page');
	});

	it('does not mark the brand link active when on a tool route', async () => {
		mockPage.url = new URL('http://localhost/pace');
		const { default: SiteNav } = await import('./SiteNav.svelte');
		const { getByRole } = render(SiteNav);
		expect(getByRole('link', { name: 'Runwise' })).not.toHaveAttribute('aria-current');
	});
});
