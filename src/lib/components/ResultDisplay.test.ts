import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/svelte';
import ResultDisplay from './ResultDisplay.svelte';

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe('ResultDisplay', () => {
	it('renders the value in a mono accent display', () => {
		render(ResultDisplay, { props: { value: '4:32 /km', label: 'Pace' } });
		expect(screen.getByText('4:32 /km')).toBeInTheDocument();
	});

	it('renders the label', () => {
		render(ResultDisplay, { props: { value: '4:32 /km', label: 'Pace' } });
		expect(screen.getByText('Pace')).toBeInTheDocument();
	});

	it('copies the value to the clipboard when the copy button is clicked', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });

		render(ResultDisplay, { props: { value: '4:32 /km', label: 'Pace' } });
		const button = screen.getByRole('button', { name: /copy/i });
		await fireEvent.click(button);

		expect(writeText).toHaveBeenCalledWith('4:32 /km');
	});

	it('swaps to a checkmark after copying and reverts after 1.5s', async () => {
		vi.useFakeTimers();
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });

		render(ResultDisplay, { props: { value: '4:32 /km', label: 'Pace' } });
		const button = screen.getByRole('button', { name: /copy/i });

		await fireEvent.click(button);
		expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();

		await vi.advanceTimersByTimeAsync(1500);
		expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
	});

	it('hides the copy button when the clipboard API is unavailable', () => {
		Object.assign(navigator, { clipboard: undefined });
		render(ResultDisplay, { props: { value: '4:32 /km', label: 'Pace' } });
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});
});
