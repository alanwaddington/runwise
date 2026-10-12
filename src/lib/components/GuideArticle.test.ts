import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import GuideArticle from './GuideArticle.svelte';
import type { GuideContent } from '$lib/content/guides';

afterEach(() => cleanup());

const GUIDE: GuideContent = {
	slug: 'test-guide',
	route: '/guides/test-guide',
	title: 'Test Guide Title',
	excerpt: 'A short excerpt.',
	sourcesCredited: ['Riegel formula', 'ACSM data'],
	intro: 'This is the intro paragraph.',
	sections: [
		{ heading: 'First section', body: 'First section body.' },
		{
			heading: 'Second section',
			body: 'Second section body.',
			links: [
				{ label: 'Internal link', url: '/power-zones' },
				{ label: 'External link', url: 'https://example.com/source' }
			]
		}
	]
};

describe('GuideArticle', () => {
	it('rendersTheGuideTitleAsH1', () => {
		const { getByRole } = render(GuideArticle, { guide: GUIDE });

		expect(getByRole('heading', { level: 1, name: 'Test Guide Title' })).toBeInTheDocument();
	});

	it('rendersTheIntroParagraph', () => {
		const { getByText } = render(GuideArticle, { guide: GUIDE });

		expect(getByText('This is the intro paragraph.')).toBeInTheDocument();
	});

	it('rendersEverySourceCredited', () => {
		const { getByText } = render(GuideArticle, { guide: GUIDE });

		const credit = getByText(/Sourced from:/);
		expect(credit.textContent).toContain('Riegel formula');
		expect(credit.textContent).toContain('ACSM data');
	});

	it('rendersEverySectionAsAnH2WithItsBody', () => {
		const { getByRole, getByText } = render(GuideArticle, { guide: GUIDE });

		expect(getByRole('heading', { level: 2, name: 'First section' })).toBeInTheDocument();
		expect(getByText('First section body.')).toBeInTheDocument();
		expect(getByRole('heading', { level: 2, name: 'Second section' })).toBeInTheDocument();
		expect(getByText('Second section body.')).toBeInTheDocument();
	});

	it('rendersTwoLinksBackToTheGuidesIndex', () => {
		const { getAllByRole } = render(GuideArticle, { guide: GUIDE });

		const guidesLinks = getAllByRole('link').filter((el) => el.getAttribute('href') === '/guides');
		expect(guidesLinks.length).toBeGreaterThanOrEqual(2);
	});

	it('rendersSectionLinksWhenPresent', () => {
		const { getByRole } = render(GuideArticle, { guide: GUIDE });

		expect(getByRole('link', { name: 'Internal link' })).toHaveAttribute('href', '/power-zones');
		expect(getByRole('link', { name: 'External link' })).toHaveAttribute(
			'href',
			'https://example.com/source'
		);
	});

	it('internalSectionLink_rendersWithoutTargetOrRel', () => {
		const { getByRole } = render(GuideArticle, { guide: GUIDE });

		const link = getByRole('link', { name: 'Internal link' });
		expect(link).not.toHaveAttribute('target');
		expect(link).not.toHaveAttribute('rel');
	});

	it('externalSectionLink_opensInNewTabSafely', () => {
		const { getByRole } = render(GuideArticle, { guide: GUIDE });

		const link = getByRole('link', { name: 'External link' });
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	});
});
