import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateContactSubmission } from '$lib/server/contactValidation';
import { sendContactEmail } from '$lib/server/mailer';
import { createRateLimiter } from '$lib/server/rateLimiter';

const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const rateLimiter = createRateLimiter({
	maxRequests: RATE_LIMIT_MAX_REQUESTS,
	windowMs: RATE_LIMIT_WINDOW_MS
});

export const POST: RequestHandler = async (event) => {
	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	const result = validateContactSubmission(body);

	if (!result.valid) {
		return json({ error: result.error }, { status: 400 });
	}

	if (result.isHoneypotTriggered) {
		return json({ ok: true });
	}

	if (!rateLimiter.isAllowed(event.getClientAddress(), Date.now())) {
		return json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
	}

	const sendResult = await sendContactEmail(result.data);

	if (!sendResult.success) {
		console.error('Failed to send contact form email:', sendResult.error);
		return json({ error: 'Failed to send message. Please try again later.' }, { status: 502 });
	}

	return json({ ok: true });
};
