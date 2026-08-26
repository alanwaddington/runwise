import { describe, it, expect } from 'vitest';
import { validateContactSubmission } from './contactValidation';

const VALID_SUBMISSION = {
	name: 'Jamie Runner',
	email: 'jamie@example.com',
	message: 'I love the pace calculator, thanks!',
	honeypot: ''
};

describe('validateContactSubmission', () => {
	it('validSubmission_returnsValidWithTrimmedData', () => {
		const result = validateContactSubmission({
			...VALID_SUBMISSION,
			name: '  Jamie Runner  ',
			message: '  I love the pace calculator, thanks!  '
		});

		expect(result).toEqual({
			valid: true,
			isHoneypotTriggered: false,
			data: {
				name: 'Jamie Runner',
				email: 'jamie@example.com',
				message: 'I love the pace calculator, thanks!'
			}
		});
	});

	it('honeypotFieldFilled_returnsValidWithHoneypotTriggered', () => {
		const result = validateContactSubmission({ ...VALID_SUBMISSION, honeypot: 'http://spam.example' });

		expect(result).toEqual({ valid: true, isHoneypotTriggered: true });
	});

	it('missingName_returnsInvalid', () => {
		const result = validateContactSubmission({ ...VALID_SUBMISSION, name: '' });

		expect(result).toEqual({ valid: false, error: 'Name is required.' });
	});

	it('missingMessage_returnsInvalid', () => {
		const result = validateContactSubmission({ ...VALID_SUBMISSION, message: '   ' });

		expect(result).toEqual({ valid: false, error: 'Message is required.' });
	});

	it('missingEmail_returnsInvalid', () => {
		const result = validateContactSubmission({ ...VALID_SUBMISSION, email: '' });

		expect(result).toEqual({ valid: false, error: 'A valid email address is required.' });
	});

	it('malformedEmail_returnsInvalid', () => {
		const result = validateContactSubmission({ ...VALID_SUBMISSION, email: 'not-an-email' });

		expect(result).toEqual({ valid: false, error: 'A valid email address is required.' });
	});

	it('messageOverMaxLength_returnsInvalid', () => {
		const result = validateContactSubmission({ ...VALID_SUBMISSION, message: 'a'.repeat(5001) });

		expect(result).toEqual({ valid: false, error: 'Message is too long (max 5000 characters).' });
	});

	it('nonObjectBody_returnsInvalid', () => {
		expect(validateContactSubmission(null)).toEqual({ valid: false, error: 'Invalid request body.' });
		expect(validateContactSubmission('a string')).toEqual({ valid: false, error: 'Invalid request body.' });
	});

	it('nonStringFields_returnInvalid', () => {
		const result = validateContactSubmission({ ...VALID_SUBMISSION, name: 42 });

		expect(result).toEqual({ valid: false, error: 'Name is required.' });
	});
});
