import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { GUIDES } from '$lib/content/guides';

const mockEnv: Record<string, string> = {};
vi.mock('$env/dynamic/public', () => ({ env: mockEnv }));

afterEach(() => cleanup());

describe('guide article routes', () => {
	for (const guide of GUIDES) {
		it(`${guide.route}_rendersItsOwnGuideContent`, async () => {
			const { default: GuidePage } = await import(`./${guide.slug}/+page.svelte`);
			const { getByRole } = render(GuidePage);

			expect(getByRole('heading', { level: 1, name: guide.title })).toBeInTheDocument();
		});
	}
});
