import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import Home from './+page.svelte';

afterEach(() => {
	cleanup();
});

describe('Home page', () => {
	it('renders the Runwise heading', () => {
		render(Home);
		expect(screen.getByRole('heading', { level: 1, name: 'Runwise' })).toBeInTheDocument();
	});

	it('uses the text-ink design token instead of a raw gray class', () => {
		render(Home);
		const heading = screen.getByRole('heading', { level: 1, name: 'Runwise' });
		expect(heading.className).toMatch(/text-ink/);
		expect(heading.className).not.toMatch(/text-gray-900/);
	});
});
