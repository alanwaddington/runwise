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
});
