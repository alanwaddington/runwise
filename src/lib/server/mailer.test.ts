import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock('resend', () => ({
	// Mirrors the real Resend SDK's constructor, which throws synchronously when no API
	// key is available (node_modules/resend/dist/index.cjs) -- needed to test that a
	// missing/invalid key is handled gracefully rather than crashing the caller.
	Resend: vi.fn().mockImplementation(function MockResend(key) {
		if (!key) {
			throw new Error('Missing API key. Pass it to the constructor `new Resend("re_123")`');
		}
		return { emails: { send: mockSend } };
	})
}));

const mockEnv: Record<string, string> = {};

vi.mock('$env/dynamic/private', () => ({
	env: mockEnv
}));

const SUBMISSION = {
	name: 'Jamie Runner',
	email: 'jamie@example.com',
	message: 'I love the pace calculator, thanks!'
};

describe('sendContactEmail', () => {
	beforeEach(() => {
		mockSend.mockReset();
		mockSend.mockResolvedValue({ data: { id: 'email_123' }, error: null });
		mockEnv.RESEND_API_KEY = 're_test_key';
		mockEnv.RESEND_EMAIL_DOMAIN = 'runwise.app';
		mockEnv.CONTACT_EMAIL = 'contact-inbox@example.com';
	});

	it('validSubmission_sendsToConfiguredContactEmail', async () => {
		const { sendContactEmail } = await import('./mailer');

		await sendContactEmail(SUBMISSION);

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				to: ['contact-inbox@example.com'],
				replyTo: 'jamie@example.com'
			})
		);
	});

	it('validSubmission_sendsFromConfiguredResendDomain', async () => {
		const { sendContactEmail } = await import('./mailer');

		await sendContactEmail(SUBMISSION);

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({ from: expect.stringContaining('@runwise.app') })
		);
	});

	it('validSubmission_includesNameAndMessageInBody', async () => {
		const { sendContactEmail } = await import('./mailer');

		await sendContactEmail(SUBMISSION);

		const call = mockSend.mock.calls[0][0];
		expect(call.text).toContain(SUBMISSION.name);
		expect(call.text).toContain(SUBMISSION.message);
		expect(call.text).toContain(SUBMISSION.email);
	});

	it('resendSucceeds_returnsSuccessTrue', async () => {
		const { sendContactEmail } = await import('./mailer');

		const result = await sendContactEmail(SUBMISSION);

		expect(result).toEqual({ success: true });
	});

	it('resendReturnsError_returnsSuccessFalseWithError', async () => {
		mockSend.mockResolvedValue({ data: null, error: { message: 'invalid domain' } });
		const { sendContactEmail } = await import('./mailer');

		const result = await sendContactEmail(SUBMISSION);

		expect(result).toEqual({ success: false, error: 'invalid domain' });
	});

	it('resendThrows_returnsSuccessFalseWithError', async () => {
		mockSend.mockRejectedValue(new Error('network down'));
		const { sendContactEmail } = await import('./mailer');

		const result = await sendContactEmail(SUBMISSION);

		expect(result).toEqual({ success: false, error: 'network down' });
	});

	it('missingApiKey_returnsSuccessFalseWithErrorInsteadOfThrowing', async () => {
		delete mockEnv.RESEND_API_KEY;
		const { sendContactEmail } = await import('./mailer');

		const result = await sendContactEmail(SUBMISSION);

		expect(result).toEqual({
			success: false,
			error: 'Missing API key. Pass it to the constructor `new Resend("re_123")`'
		});
		expect(mockSend).not.toHaveBeenCalled();
	});
});
