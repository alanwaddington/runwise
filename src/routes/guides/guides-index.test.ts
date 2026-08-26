import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { GUIDES } from '$lib/content/guides';
import GuidesIndexPage from './+page.svelte';

const { mockEnv } = vi.hoisted(() => ({ mockEnv: {} as Record<string, string> }));
vi.mock('$env/dynamic/public', () => ({ env: mockEnv }));

afterEach(() => cleanup());

describe('/guides index page', () => {
	it('rendersALinkForEveryGuide_countMatchesGuidesData', () => {
		const { getAllByRole } = render(GuidesIndexPage);

		const guideLinks = getAllByRole('link').filter((el) =>
			GUIDES.some((guide) => el.getAttribute('href') === guide.route)
		);

		expect(guideLinks).toHaveLength(GUIDES.length);
	});

	it('everyGuide_rendersItsTitleAndExcerpt', () => {
		const { getByText } = render(GuidesIndexPage);

		for (const guide of GUIDES) {
			expect(getByText(guide.title)).toBeInTheDocument();
			expect(getByText(guide.excerpt)).toBeInTheDocument();
		}
	});

	it('everyGuideLink_pointsToItsOwnRoute', () => {
		const { getAllByRole } = render(GuidesIndexPage);
		const hrefs = getAllByRole('link').map((el) => el.getAttribute('href'));

		for (const guide of GUIDES) {
			expect(hrefs).toContain(guide.route);
		}
	});
});
