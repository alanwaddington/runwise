import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';

const mockEnv: Record<string, string> = {};
vi.mock('$env/dynamic/public', () => ({ env: mockEnv }));

afterEach(() => cleanup());

describe('/privacy page', () => {
	it('rendersNoVisibleEmailAddressAnywhereInTheDom', async () => {
		const { default: PrivacyPage } = await import('./+page.svelte');
		const { container } = render(PrivacyPage);

		const emailAddressPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
		expect(container.textContent ?? '').not.toMatch(emailAddressPattern);
		expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
	});

	it('contactSectionLinksToTheAboutPageContactForm', async () => {
		const { default: PrivacyPage } = await import('./+page.svelte');
		const { container } = render(PrivacyPage);

		const link = container.querySelector('a[href="/about#contact"]');
		expect(link).not.toBeNull();
	});

	it('mentionsTheContactFormsEmailProcessing', async () => {
		const { default: PrivacyPage } = await import('./+page.svelte');
		const { getByText } = render(PrivacyPage);

		expect(getByText(/Resend/)).toBeInTheDocument();
	});
});
