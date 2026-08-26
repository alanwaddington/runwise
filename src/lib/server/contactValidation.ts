const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 5000;

export interface ContactSubmissionData {
	name: string;
	email: string;
	message: string;
}

export type ContactValidationResult =
	| { valid: true; isHoneypotTriggered: true }
	| { valid: true; isHoneypotTriggered: false; data: ContactSubmissionData }
	| { valid: false; error: string };

function asTrimmedString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

export function validateContactSubmission(body: unknown): ContactValidationResult {
	if (typeof body !== 'object' || body === null) {
		return { valid: false, error: 'Invalid request body.' };
	}

	const { name, email, message, honeypot } = body as Record<string, unknown>;

	if (asTrimmedString(honeypot) !== '') {
		return { valid: true, isHoneypotTriggered: true };
	}

	const trimmedName = asTrimmedString(name);
	if (trimmedName === '') {
		return { valid: false, error: 'Name is required.' };
	}

	const trimmedEmail = asTrimmedString(email);
	if (trimmedEmail === '' || !EMAIL_PATTERN.test(trimmedEmail)) {
		return { valid: false, error: 'A valid email address is required.' };
	}

	const trimmedMessage = asTrimmedString(message);
	if (trimmedMessage === '') {
		return { valid: false, error: 'Message is required.' };
	}
	if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
		return { valid: false, error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` };
	}

	return {
		valid: true,
		isHoneypotTriggered: false,
		data: { name: trimmedName, email: trimmedEmail, message: trimmedMessage }
	};
}
