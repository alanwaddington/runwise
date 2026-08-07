import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import Home from './+page.svelte';
import { PAGES } from '$lib/seo';

// Derived from PAGES rather than hardcoded so every new tool route automatically counts
// towards this assertion without needing a matching edit here — mirrors seo.test.ts's
// TOOL_ROUTES derivation. Catches a card being silently dropped from the homepage grid even
// if nobody remembers to add its own named assertion below.
const TOOL_ROUTES = Object.keys(PAGES).filter((route) => route !== '/' && route !== '/privacy');

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

	it('renders all 8 tool card links', () => {
		render(Home);
		const expectedLinks = [
			'Go to Pace Calculator',
			'Go to Race Time Predictor',
			'Go to Training Paces',
			'Go to HR Zone Calculator',
			'Go to VO2 Max Estimator',
			'Go to Parkrun Predictor',
			'Go to Power Zones Calculator',
			'Go to Workout Suggestions'
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
			['Go to Parkrun Predictor', '/parkrun'],
			['Go to Power Zones Calculator', '/power-zones'],
			['Go to Workout Suggestions', '/workouts']
		];
		for (const [label, href] of routes) {
			expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
		}
	});

	it('renders exactly one tool card per PAGES tool route (no drift)', () => {
		render(Home);
		const cardLinks = screen.getAllByRole('link', { name: /^go to /i });
		expect(cardLinks).toHaveLength(TOOL_ROUTES.length);
	});
});
