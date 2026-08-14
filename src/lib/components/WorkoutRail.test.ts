import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import WorkoutRail from './WorkoutRail.svelte';

afterEach(() => {
	cleanup();
});

const childSnippet = createRawSnippet(() => ({
	render: () => '<div data-testid="card">Card</div>'
}));

describe('WorkoutRail keyboard scroll (WAI-ARIA APG scrollable-region pattern)', () => {
	beforeEach(() => {
		// jsdom doesn't implement Element.prototype.scrollBy.
		HTMLElement.prototype.scrollBy = vi.fn();
	});

	it('WorkoutRail_ArrowRightKeydown_ScrollsRight', async () => {
		render(WorkoutRail, { props: { label: 'Easy / Recovery workouts', children: childSnippet } });
		const region = screen.getByRole('region', { name: 'Easy / Recovery workouts' });

		await fireEvent.keyDown(region, { key: 'ArrowRight' });

		expect(region.scrollBy).toHaveBeenCalledWith(
			expect.objectContaining({ behavior: 'smooth', left: expect.any(Number) })
		);
		const call = (region.scrollBy as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(call.left).toBeGreaterThan(0);
	});

	it('WorkoutRail_ArrowLeftKeydown_ScrollsLeft', async () => {
		render(WorkoutRail, { props: { label: 'Easy / Recovery workouts', children: childSnippet } });
		const region = screen.getByRole('region', { name: 'Easy / Recovery workouts' });

		await fireEvent.keyDown(region, { key: 'ArrowLeft' });

		const call = (region.scrollBy as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(call.left).toBeLessThan(0);
	});

	it('WorkoutRail_ArrowKeydown_PreventsDefaultPageScroll', async () => {
		render(WorkoutRail, { props: { label: 'Easy / Recovery workouts', children: childSnippet } });
		const region = screen.getByRole('region', { name: 'Easy / Recovery workouts' });

		const event = await fireEvent.keyDown(region, { key: 'ArrowRight', cancelable: true });
		expect(event).toBe(false); // fireEvent returns false when preventDefault() was called
	});

	it('WorkoutRail_UnrelatedKeydown_DoesNotScroll', async () => {
		render(WorkoutRail, { props: { label: 'Easy / Recovery workouts', children: childSnippet } });
		const region = screen.getByRole('region', { name: 'Easy / Recovery workouts' });

		await fireEvent.keyDown(region, { key: 'Enter' });

		expect(region.scrollBy).not.toHaveBeenCalled();
	});
});
