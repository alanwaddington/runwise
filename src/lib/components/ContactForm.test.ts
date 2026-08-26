import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ContactForm from './ContactForm.svelte';

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 500) {
	return {
		ok,
		status,
		json: async () => body
	} as Response;
}

async function fillValidForm() {
	await fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'Jamie Runner' } });
	await fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'jamie@example.com' } });
	await fireEvent.input(screen.getByLabelText(/message/i), {
		target: { value: 'Love the pace calculator!' }
	});
}

describe('ContactForm', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
	});

	it('rendersNameEmailAndMessageFieldsWithLabels', () => {
		render(ContactForm);

		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
	});

	it('rendersNoVisibleEmailAddressAnywhereInTheDom', () => {
		const { container } = render(ContactForm);

		const emailAddressPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
		const visibleText = container.textContent ?? '';
		expect(visibleText).not.toMatch(emailAddressPattern);
	});

	it('messageField_hasMaxlengthMatchingServerLimit', () => {
		render(ContactForm);

		expect(screen.getByLabelText(/message/i)).toHaveAttribute('maxlength', '5000');
	});

	it('honeypotField_isHiddenFromAccessibilityTreeAndTabOrder', () => {
		const { container } = render(ContactForm);

		const honeypot = container.querySelector('input[name="website"]');
		expect(honeypot).not.toBeNull();
		expect(honeypot?.getAttribute('aria-hidden')).toBe('true');
		expect(honeypot?.getAttribute('tabindex')).toBe('-1');
	});

	it('submitWithEmptyFields_showsValidationErrorsWithoutCallingFetch', async () => {
		render(ContactForm);

		await fireEvent.click(screen.getByRole('button', { name: /send message/i }));

		expect(await screen.findByText('Name is required.')).toBeInTheDocument();
		expect(screen.getByText('Email is required.')).toBeInTheDocument();
		expect(screen.getByText('Message is required.')).toBeInTheDocument();
		expect(fetch).not.toHaveBeenCalled();
	});

	it('submitWithInvalidEmail_showsEmailFormatError', async () => {
		render(ContactForm);

		await fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'Jamie' } });
		await fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
		await fireEvent.input(screen.getByLabelText(/message/i), { target: { value: 'Hello' } });
		await fireEvent.click(screen.getByRole('button', { name: /send message/i }));

		expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
		expect(fetch).not.toHaveBeenCalled();
	});

	it('validSubmission_postsJsonToApiContact', async () => {
		vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }));
		render(ContactForm);

		await fillValidForm();
		await fireEvent.click(screen.getByRole('button', { name: /send message/i }));

		await vi.waitFor(() =>
			expect(fetch).toHaveBeenCalledWith(
				'/api/contact',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({
						name: 'Jamie Runner',
						email: 'jamie@example.com',
						message: 'Love the pace calculator!',
						honeypot: ''
					})
				})
			)
		);
	});

	it('validSubmission_showsSuccessMessageAndHidesForm', async () => {
		vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }));
		render(ContactForm);

		await fillValidForm();
		await fireEvent.click(screen.getByRole('button', { name: /send message/i }));

		expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
		expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
	});

	it('serverReturnsError_showsInlineAlertAndKeepsFieldValues', async () => {
		vi.mocked(fetch).mockResolvedValue(
			jsonResponse({ error: 'Too many requests. Please try again later.' }, false, 429)
		);
		render(ContactForm);

		await fillValidForm();
		await fireEvent.click(screen.getByRole('button', { name: /send message/i }));

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent('Too many requests. Please try again later.');
		expect(screen.getByLabelText(/name/i)).toHaveValue('Jamie Runner');
	});

	it('networkFailure_showsGenericInlineAlert', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('network down'));
		render(ContactForm);

		await fillValidForm();
		await fireEvent.click(screen.getByRole('button', { name: /send message/i }));

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent('Something went wrong — please try again.');
	});

	it('whileSending_disablesSubmitButtonAndShowsLoadingLabel', async () => {
		let resolveFetch!: (value: Response) => void;
		vi.mocked(fetch).mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));
		render(ContactForm);

		await fillValidForm();
		await fireEvent.click(screen.getByRole('button', { name: /send message/i }));

		const button = await screen.findByRole('button', { name: /sending/i });
		expect(button).toBeDisabled();

		resolveFetch(jsonResponse({ ok: true }));
	});
});
