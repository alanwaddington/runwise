import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import Pace from './pace/+page.svelte';
import RacePredictor from './race-predictor/+page.svelte';
import TrainingPaces from './training-paces/+page.svelte';
import HrZones from './hr-zones/+page.svelte';
import Vo2max from './vo2max/+page.svelte';
import Parkrun from './parkrun/+page.svelte';

afterEach(() => {
	cleanup();
});

const pages = [
	{ component: Pace, title: 'Pace Calculator', description: 'Calculate your running pace, speed, and finish time.' },
	{
		component: RacePredictor,
		title: 'Race Time Predictor',
		description: 'Predict your race finish time based on a recent result.'
	},
	{
		component: TrainingPaces,
		title: 'Training Pace Calculator',
		description: 'Find your optimal training paces from your race performance.'
	},
	{
		component: HrZones,
		title: 'Heart Rate Zone Calculator',
		description: 'Calculate your personalised heart rate training zones.'
	},
	{ component: Vo2max, title: 'VO2 Max Estimator', description: 'Estimate your VO2 max from race times or field tests.' },
	{
		component: Parkrun,
		title: 'Parkrun Predictor',
		description: 'Predict your parkrun time from recent race performances.'
	}
];

describe.each(pages)('$title page', ({ component, title, description }) => {
	it('renders the title via ToolLayout', () => {
		render(component);
		expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
	});

	it('renders the description via ToolLayout', () => {
		render(component);
		expect(screen.getByText(description)).toBeInTheDocument();
	});

	it('renders the back-to-home link from ToolLayout', () => {
		render(component);
		expect(screen.getByRole('link', { name: /all tools/i })).toHaveAttribute('href', '/');
	});
});
