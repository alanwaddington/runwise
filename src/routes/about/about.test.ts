import { describe, it, expect, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

const mockEnv: Record<string, string> = {};
vi.mock('$env/dynamic/public', () => ({ env: mockEnv }));

afterEach(() => cleanup());

describe('/about page', () => {
	it('rendersWithoutError', async () => {
		const { default: AboutPage } = await import('./+page.svelte');
		expect(() => render(AboutPage)).not.toThrow();
	});

	it('doesNotNameTheSiteOwnerAsAnIndividual', async () => {
		// "Alan Jones" (the WMA age-grading researcher) is a legitimate methodology
		// citation, matching the wording already used in explainers.ts — this checks
		// specifically that the site's own owner isn't named as its public face.
		const { default: AboutPage } = await import('./+page.svelte');
		const { container } = render(AboutPage);

		expect(container.textContent).not.toMatch(/waddington/i);
	});

	it('referencesAllFourSourcedMethodologies', async () => {
		const { default: AboutPage } = await import('./+page.svelte');
		const { container } = render(AboutPage);
		const text = container.textContent ?? '';

		expect(text).toContain('Riegel');
		expect(text).toContain("Jack Daniels' VDOT method");
		expect(text).toContain('ACSM');
		expect(text).toContain('WMA');
	});

	it('linksToTheGuidesIndexPage', async () => {
		const { default: AboutPage } = await import('./+page.svelte');
		const { container } = render(AboutPage);

		const guidesLink = container.querySelector('a[href="/guides"]');
		expect(guidesLink).not.toBeNull();
	});

	it('rendersNoVisibleEmailAddressAnywhereInTheDom', async () => {
		const { default: AboutPage } = await import('./+page.svelte');
		const { container } = render(AboutPage);

		const emailAddressPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
		expect(container.textContent ?? '').not.toMatch(emailAddressPattern);
		expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
	});

	it('includesTheContactForm', async () => {
		const { default: AboutPage } = await import('./+page.svelte');
		const { getByRole } = render(AboutPage);

		expect(getByRole('button', { name: /send message/i })).toBeInTheDocument();
	});
});
