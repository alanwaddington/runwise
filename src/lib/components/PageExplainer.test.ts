import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import PageExplainer from './PageExplainer.svelte';

vi.mock('$lib/content/explainers', () => ({
	EXPLAINERS: {
		'/no-links': {
			heading: 'About the thing',
			intro: 'Intro text.',
			sections: [{ heading: 'A section', body: 'Some body text.' }]
		},
		'/with-links': {
			heading: 'About the other thing',
			intro: 'Intro text.',
			sections: [
				{
					heading: 'A section with links',
					body: 'Some body text.',
					links: [
						{ label: 'Official guide', url: 'https://example.com/guide' },
						{ label: 'Second link', url: 'https://example.com/second' }
					]
				}
			]
		}
	}
}));

afterEach(() => {
	cleanup();
});

describe('PageExplainer component', () => {
	it('PageExplainer_UnknownRoute_RendersNothing', () => {
		const { container } = render(PageExplainer, { props: { route: '/does-not-exist' } });
		expect(container.querySelector('section')).toBeNull();
	});

	it('PageExplainer_SectionWithoutLinks_RendersNoAnchors', () => {
		render(PageExplainer, { props: { route: '/no-links' } });
		expect(screen.queryByRole('link')).toBeNull();
	});

	it('PageExplainer_SectionWithLinks_RendersAnchorsWithCorrectHrefAndLabel', () => {
		render(PageExplainer, { props: { route: '/with-links' } });
		const guideLink = screen.getByRole('link', { name: 'Official guide' });
		expect(guideLink).toHaveAttribute('href', 'https://example.com/guide');

		const secondLink = screen.getByRole('link', { name: 'Second link' });
		expect(secondLink).toHaveAttribute('href', 'https://example.com/second');
	});

	it('PageExplainer_SectionWithLinks_OpensInNewTabSafely', () => {
		render(PageExplainer, { props: { route: '/with-links' } });
		const guideLink = screen.getByRole('link', { name: 'Official guide' });
		expect(guideLink).toHaveAttribute('target', '_blank');
		expect(guideLink).toHaveAttribute('rel', 'noopener noreferrer');
	});
});
