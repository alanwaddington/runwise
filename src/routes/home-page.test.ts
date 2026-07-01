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

	it('sets the document title', () => {
		render(Home);
		expect(document.title).toBe('Runwise');
	});

	it('sets the meta description', () => {
		render(Home);
		const meta = document.querySelector('meta[name="description"]');
		expect(meta).not.toBeNull();
		expect(meta?.getAttribute('content')).toBeTruthy();
	});

	it('renders all 6 tool card links', () => {
		render(Home);
		const expectedLinks = [
			'Go to Pace Calculator',
			'Go to Race Time Predictor',
			'Go to Training Paces',
			'Go to HR Zone Calculator',
			'Go to VO2 Max Estimator',
			'Go to Parkrun Predictor'
		];
		for (const label of expectedLinks) {
			expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
		}
	});

	it('links each card to the correct route', () => {
		render(Home);
		const routes: [string, string][] = [
			['Go to Pace Calculator', '/pace'],
			['Go to Race Time Predictor', '/race-predictor'],
			['Go to Training Paces', '/training-paces'],
			['Go to HR Zone Calculator', '/hr-zones'],
			['Go to VO2 Max Estimator', '/vo2max'],
			['Go to Parkrun Predictor', '/parkrun']
		];
		for (const [label, href] of routes) {
			expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
		}
	});
});
