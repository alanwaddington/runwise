import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { tick } from 'svelte';
import { render, screen, cleanup } from '@testing-library/svelte';
import Toast from './Toast.svelte';
import { toast, showToast, dismissToast } from '$lib/stores/toast';

beforeEach(() => {
	vi.useFakeTimers();
	toast.set(null);
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe('Toast component', () => {
	it('Toast_NoToastShown_RendersNothing', () => {
		const { container } = render(Toast);
		expect(container.querySelector('[role="status"]')).toBeNull();
		expect(container.querySelector('[role="alert"]')).toBeNull();
	});

	it('Toast_ShowToastSuccess_RendersMessageWithStatusRole', async () => {
		render(Toast);
		showToast('Downloaded runwise-workout.fit', 'success');
		await tick();
		const el = screen.getByRole('status');
		expect(el).toHaveTextContent('Downloaded runwise-workout.fit');
		expect(el).toHaveAttribute('aria-live', 'polite');
	});

	it('Toast_ShowToastError_RendersMessageWithAlertRole', async () => {
		render(Toast);
		showToast("Couldn't create the file. Try again.", 'error');
		await tick();
		const el = screen.getByRole('alert');
		expect(el).toHaveTextContent("Couldn't create the file. Try again.");
		expect(el).toHaveAttribute('aria-live', 'assertive');
	});

	it('Toast_SuccessAutoDismiss_HidesAfter5Seconds', async () => {
		render(Toast);
		showToast('Downloaded file.fit', 'success');
		await tick();
		expect(screen.getByRole('status')).toBeInTheDocument();

		vi.advanceTimersByTime(4999);
		await tick();
		expect(screen.getByRole('status')).toBeInTheDocument();

		vi.advanceTimersByTime(1);
		await tick();
		expect(screen.queryByRole('status')).toBeNull();
	});

	it('Toast_ErrorAutoDismiss_HidesAfter7Seconds', async () => {
		render(Toast);
		showToast('Encoding failed.', 'error');
		await tick();
		expect(screen.getByRole('alert')).toBeInTheDocument();

		vi.advanceTimersByTime(6999);
		await tick();
		expect(screen.getByRole('alert')).toBeInTheDocument();

		vi.advanceTimersByTime(1);
		await tick();
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('Toast_DismissButtonClicked_HidesImmediately', async () => {
		render(Toast);
		showToast('Downloaded file.fit', 'success');
		await tick();
		const dismissButton = screen.getByRole('button', { name: 'Dismiss notification' });

		dismissButton.click();
		await tick();

		expect(screen.queryByRole('status')).toBeNull();
	});

	it('Toast_NewToastWhileOneShowing_ReplacesPreviousToast', async () => {
		render(Toast);
		showToast('First message', 'success');
		await tick();
		showToast('Second message', 'error');
		await tick();

		expect(screen.queryByRole('status')).toBeNull();
		const el = screen.getByRole('alert');
		expect(el).toHaveTextContent('Second message');
	});

	it('dismissToast_CalledDirectly_ClearsToastState', async () => {
		render(Toast);
		showToast('Downloaded file.fit', 'success');
		await tick();

		dismissToast();
		await tick();

		expect(screen.queryByRole('status')).toBeNull();
	});
});
