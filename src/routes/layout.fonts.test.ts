import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Layout from './+layout.svelte';

const emptySnippet = createRawSnippet(() => ({
	render: () => '<div></div>'
}));

afterEach(() => {
	cleanup();
	document.head.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach((el) => el.remove());
});

describe('+layout.svelte font loading', () => {
	it('loads Manrope and IBM Plex Mono from Google Fonts', () => {
		render(Layout, { props: { children: emptySnippet } });

		const fontLink = document.head.querySelector('link[href*="fonts.googleapis.com/css2"]');
		expect(fontLink).not.toBeNull();
		expect(fontLink?.getAttribute('href')).toMatch(/Manrope/);
		expect(fontLink?.getAttribute('href')).toMatch(/IBM\+Plex\+Mono/);
	});

	it('requests Manrope as a variable-font weight range, not a static weight list', () => {
		render(Layout, { props: { children: emptySnippet } });

		const fontLink = document.head.querySelector('link[href*="fonts.googleapis.com/css2"]');
		expect(fontLink?.getAttribute('href')).toMatch(/Manrope:wght@400\.\.700/);
		expect(fontLink?.getAttribute('href')).not.toMatch(/Manrope:wght@400;500;600;700/);
	});

	it('requests IBM Plex Mono at exactly the weights used in the codebase (400, 500, 700)', () => {
		render(Layout, { props: { children: emptySnippet } });

		const fontLink = document.head.querySelector('link[href*="fonts.googleapis.com/css2"]');
		expect(fontLink?.getAttribute('href')).toMatch(/IBM\+Plex\+Mono:wght@400;500;700/);
		expect(fontLink?.getAttribute('href')).not.toMatch(/IBM\+Plex\+Mono:wght@500;600/);
	});
});
