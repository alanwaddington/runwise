import { describe, it, expect } from 'vitest';
import { isValidEmail } from './email';

describe('isValidEmail', () => {
	it('validEmail_returnsTrue', () => {
		expect(isValidEmail('jamie@example.com')).toBe(true);
	});

	it('missingAtSign_returnsFalse', () => {
		expect(isValidEmail('jamie.example.com')).toBe(false);
	});

	it('missingDomainDot_returnsFalse', () => {
		expect(isValidEmail('jamie@example')).toBe(false);
	});

	it('containsWhitespace_returnsFalse', () => {
		expect(isValidEmail('jamie runner@example.com')).toBe(false);
	});

	it('emptyString_returnsFalse', () => {
		expect(isValidEmail('')).toBe(false);
	});
});
