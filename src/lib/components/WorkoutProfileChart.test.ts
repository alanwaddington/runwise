import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import WorkoutProfileChart from './WorkoutProfileChart.svelte';
import type { WorkoutSegment } from '$lib/utils/workouts';

afterEach(() => {
	cleanup();
});

const SEGMENTS: WorkoutSegment[] = [
	{ type: 'warmup', durationMinutes: 10, intensity: 0.25 },
	{ type: 'work', durationMinutes: 5, intensity: 0.85 },
	{ type: 'recovery', durationMinutes: 3, intensity: 0.2 },
	{ type: 'work', durationMinutes: 5, intensity: 0.85 },
	{ type: 'cooldown', durationMinutes: 10, intensity: 0.25 }
];

describe('WorkoutProfileChart component', () => {
	it('renders an SVG element', () => {
		const { container } = render(WorkoutProfileChart, { props: { segments: SEGMENTS } });
		expect(container.querySelector('svg')).toBeInTheDocument();
	});

	it('is decorative (aria-hidden)', () => {
		const { container } = render(WorkoutProfileChart, { props: { segments: SEGMENTS } });
		expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
	});

	it('renders one rect per segment', () => {
		const { container } = render(WorkoutProfileChart, { props: { segments: SEGMENTS } });
		expect(container.querySelectorAll('rect')).toHaveLength(SEGMENTS.length);
	});

	it('renders work segments with the accent fill and others with a muted fill', () => {
		const { container } = render(WorkoutProfileChart, { props: { segments: SEGMENTS } });
		const rects = Array.from(container.querySelectorAll('rect'));
		expect(rects[1].getAttribute('class')).toContain('fill-accent');
		expect(rects[0].getAttribute('class')).toContain('fill-gray-300');
	});

	it('gives taller bars to higher-intensity segments', () => {
		const { container } = render(WorkoutProfileChart, { props: { segments: SEGMENTS } });
		const rects = Array.from(container.querySelectorAll('rect'));
		const warmupHeight = parseFloat(rects[0].getAttribute('height')!);
		const workHeight = parseFloat(rects[1].getAttribute('height')!);
		expect(workHeight).toBeGreaterThan(warmupHeight);
	});

	it('scales bar widths proportionally to segment duration', () => {
		const { container } = render(WorkoutProfileChart, { props: { segments: SEGMENTS } });
		const rects = Array.from(container.querySelectorAll('rect'));
		// warmup (10 min) and cooldown (10 min) should be wider than recovery (3 min)
		const warmupWidth = parseFloat(rects[0].getAttribute('width')!);
		const recoveryWidth = parseFloat(rects[2].getAttribute('width')!);
		expect(warmupWidth).toBeGreaterThan(recoveryWidth);
	});

	it('handles an empty segments array without throwing', () => {
		const { container } = render(WorkoutProfileChart, { props: { segments: [] } });
		expect(container.querySelector('svg')).toBeInTheDocument();
		expect(container.querySelectorAll('rect')).toHaveLength(0);
	});
});
