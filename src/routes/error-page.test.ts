import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';

const mockPage: { status: number; error: { message: string } | null } = {
	status: 404,
	error: null
};

vi.mock('$app/state', () => ({
	page: mockPage
}));

afterEach(() => {
	cleanup();
	mockPage.status = 404;
	mockPage.error = null;
});

describe('Error page', () => {
	it('sets the document title to the status code', async () => {
		mockPage.status = 404;
		const { default: ErrorPage } = await import('./+error.svelte');
		render(ErrorPage);
		expect(document.title).toBe('404 | Runwise');
	});

	it('renders the status code as a heading', async () => {
		mockPage.status = 404;
		const { default: ErrorPage } = await import('./+error.svelte');
		render(ErrorPage);
		expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
	});

	it('shows a not-found message for a 404', async () => {
		mockPage.status = 404;
		const { default: ErrorPage } = await import('./+error.svelte');
		render(ErrorPage);
		expect(screen.getByText(/page doesn.t exist/i)).toBeInTheDocument();
	});

	it('shows the server error message for non-404 statuses', async () => {
		mockPage.status = 500;
		mockPage.error = { message: 'Internal Server Error' };
		const { default: ErrorPage } = await import('./+error.svelte');
		render(ErrorPage);
		expect(screen.getByRole('heading', { level: 1, name: '500' })).toBeInTheDocument();
		expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
		expect(document.title).toBe('500 | Runwise');
	});

	it('renders a back-to-home link', async () => {
		mockPage.status = 404;
		const { default: ErrorPage } = await import('./+error.svelte');
		render(ErrorPage);
		const back = screen.getByRole('link', { name: /all tools/i });
		expect(back).toHaveAttribute('href', '/');
	});

	it('message_hasNoRedundantDarkTextOverride', async () => {
		mockPage.status = 404;
		const { default: ErrorPage } = await import('./+error.svelte');
		render(ErrorPage);
		const message = screen.getByText(/page doesn.t exist/i);
		expect(message.className).not.toContain('dark:text-gray-400');
	});
});
