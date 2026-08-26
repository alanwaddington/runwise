import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from './$types';

const { mockIsAllowed } = vi.hoisted(() => ({ mockIsAllowed: vi.fn(() => true) }));
vi.mock('$lib/server/rateLimiter', () => ({
	createRateLimiter: () => ({ isAllowed: mockIsAllowed })
}));

const { mockSendContactEmail } = vi.hoisted(() => ({ mockSendContactEmail: vi.fn() }));
vi.mock('$lib/server/mailer', () => ({ sendContactEmail: mockSendContactEmail }));

import { POST } from './+server';

const VALID_BODY = {
	name: 'Jamie Runner',
	email: 'jamie@example.com',
	message: 'I love the pace calculator, thanks!',
	honeypot: ''
};

function makeEvent(body: unknown, clientAddress = '1.2.3.4'): RequestEvent {
	return {
		request: new Request('http://localhost/api/contact', {
			method: 'POST',
			body: JSON.stringify(body)
		}),
		getClientAddress: () => clientAddress
	} as unknown as RequestEvent;
}

describe('POST /api/contact', () => {
	beforeEach(() => {
		mockIsAllowed.mockReset().mockReturnValue(true);
		mockSendContactEmail.mockReset().mockResolvedValue({ success: true });
	});

	it('validSubmission_sendsEmailAndReturns200', async () => {
		const response = await POST(makeEvent(VALID_BODY));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
		expect(mockSendContactEmail).toHaveBeenCalledWith({
			name: VALID_BODY.name,
			email: VALID_BODY.email,
			message: VALID_BODY.message
		});
	});

	it('honeypotFilled_returns200WithoutSendingEmail', async () => {
		const response = await POST(makeEvent({ ...VALID_BODY, honeypot: 'http://spam.example' }));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
		expect(mockSendContactEmail).not.toHaveBeenCalled();
	});

	it('invalidSubmission_returns400AndDoesNotSendEmail', async () => {
		const response = await POST(makeEvent({ ...VALID_BODY, email: 'not-an-email' }));

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: 'A valid email address is required.' });
		expect(mockSendContactEmail).not.toHaveBeenCalled();
	});

	it('malformedJsonBody_returns400', async () => {
		const event = {
			request: new Request('http://localhost/api/contact', { method: 'POST', body: 'not json' }),
			getClientAddress: () => '1.2.3.4'
		} as unknown as RequestEvent;

		const response = await POST(event);

		expect(response.status).toBe(400);
		expect(mockSendContactEmail).not.toHaveBeenCalled();
	});

	it('rateLimitExceeded_returns429AndDoesNotSendEmail', async () => {
		mockIsAllowed.mockReturnValue(false);

		const response = await POST(makeEvent(VALID_BODY));

		expect(response.status).toBe(429);
		expect(await response.json()).toEqual({ error: 'Too many requests. Please try again later.' });
		expect(mockSendContactEmail).not.toHaveBeenCalled();
	});

	it('rateLimit_isKeyedByClientAddress', async () => {
		await POST(makeEvent(VALID_BODY, '9.9.9.9'));

		expect(mockIsAllowed).toHaveBeenCalledWith('9.9.9.9', expect.any(Number));
	});

	it('mailerFails_returns502WithGenericError', async () => {
		mockSendContactEmail.mockResolvedValue({ success: false, error: 'invalid domain' });
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const response = await POST(makeEvent(VALID_BODY));

		expect(response.status).toBe(502);
		expect(await response.json()).toEqual({ error: 'Failed to send message. Please try again later.' });
		expect(consoleErrorSpy).toHaveBeenCalled();

		consoleErrorSpy.mockRestore();
	});

	it('honeypotFilled_doesNotConsumeRateLimit', async () => {
		await POST(makeEvent({ ...VALID_BODY, honeypot: 'spam' }));

		expect(mockIsAllowed).not.toHaveBeenCalled();
	});
});
