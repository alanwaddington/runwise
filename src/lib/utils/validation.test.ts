import { describe, it, expect } from 'vitest';
import {
	validatePositive,
	validateRange,
	validateMinimum,
	validateMaximum,
	validateRequired
} from './validation';

describe('validation utilities', () => {
	describe('validatePositive', () => {
		it('validatePositive_withPositiveNumber_returnsValid', () => {
			const result = validatePositive(5);
			expect(result.type).toBe('valid');
			expect(result.type === 'valid' && result.value).toBe(5);
		});

		it('validatePositive_withZero_returnsInvalid', () => {
			const result = validatePositive(0);
			expect(result.type).toBe('invalid');
			expect(result.type === 'invalid' && result.error).toContain('greater than 0');
		});

		it('validatePositive_withNegativeNumber_returnsInvalid', () => {
			const result = validatePositive(-5);
			expect(result.type).toBe('invalid');
			expect(result.type === 'invalid' && result.error).toContain('greater than 0');
		});

		it('validatePositive_withNull_returnsEmpty', () => {
			const result = validatePositive(null);
			expect(result.type).toBe('empty');
		});

		it('validatePositive_withUndefined_returnsEmpty', () => {
			const result = validatePositive(undefined);
			expect(result.type).toBe('empty');
		});

		it('validatePositive_withSmallDecimal_returnsValid', () => {
			const result = validatePositive(0.1);
			expect(result.type).toBe('valid');
		});
	});

	describe('validateRange', () => {
		it('validateRange_withValueInRange_returnsValid', () => {
			const result = validateRange(50, 10, 100);
			expect(result.type).toBe('valid');
			expect(result.type === 'valid' && result.value).toBe(50);
		});

		it('validateRange_withValueEqualToMin_returnsValid', () => {
			const result = validateRange(10, 10, 100);
			expect(result.type).toBe('valid');
		});

		it('validateRange_withValueEqualToMax_returnsValid', () => {
			const result = validateRange(100, 10, 100);
			expect(result.type).toBe('valid');
		});

		it('validateRange_withValueBelowMin_returnsInvalid', () => {
			const result = validateRange(5, 10, 100);
			expect(result.type).toBe('invalid');
			expect(result.type === 'invalid' && result.error).toContain('10');
			expect(result.type === 'invalid' && result.error).toContain('100');
		});

		it('validateRange_withValueAboveMax_returnsInvalid', () => {
			const result = validateRange(150, 10, 100);
			expect(result.type).toBe('invalid');
			expect(result.type === 'invalid' && result.error).toContain('10');
			expect(result.type === 'invalid' && result.error).toContain('100');
		});

		it('validateRange_withNull_returnsEmpty', () => {
			const result = validateRange(null, 10, 100);
			expect(result.type).toBe('empty');
		});
	});

	describe('validateMinimum', () => {
		it('validateMinimum_withValueGreaterThanMin_returnsValid', () => {
			const result = validateMinimum(20, 10);
			expect(result.type).toBe('valid');
		});

		it('validateMinimum_withValueEqualToMin_returnsValid', () => {
			const result = validateMinimum(10, 10);
			expect(result.type).toBe('valid');
		});

		it('validateMinimum_withValueLessThanMin_returnsInvalid', () => {
			const result = validateMinimum(5, 10);
			expect(result.type).toBe('invalid');
			expect(result.type === 'invalid' && result.error).toContain('10');
		});

		it('validateMinimum_withNull_returnsEmpty', () => {
			const result = validateMinimum(null, 10);
			expect(result.type).toBe('empty');
		});
	});

	describe('validateMaximum', () => {
		it('validateMaximum_withValueLessThanMax_returnsValid', () => {
			const result = validateMaximum(80, 100);
			expect(result.type).toBe('valid');
		});

		it('validateMaximum_withValueEqualToMax_returnsValid', () => {
			const result = validateMaximum(100, 100);
			expect(result.type).toBe('valid');
		});

		it('validateMaximum_withValueGreaterThanMax_returnsInvalid', () => {
			const result = validateMaximum(150, 100);
			expect(result.type).toBe('invalid');
			expect(result.type === 'invalid' && result.error).toContain('100');
		});

		it('validateMaximum_withNull_returnsEmpty', () => {
			const result = validateMaximum(null, 100);
			expect(result.type).toBe('empty');
		});
	});

	describe('validateRequired', () => {
		it('validateRequired_withString_returnsValid', () => {
			const result = validateRequired('hello');
			expect(result.type).toBe('valid');
		});

		it('validateRequired_withNumber_returnsValid', () => {
			const result = validateRequired(123);
			expect(result.type).toBe('valid');
		});

		it('validateRequired_withEmptyString_returnsInvalid', () => {
			const result = validateRequired('');
			expect(result.type).toBe('invalid');
		});

		it('validateRequired_withNull_returnsInvalid', () => {
			const result = validateRequired(null);
			expect(result.type).toBe('invalid');
		});

		it('validateRequired_withUndefined_returnsInvalid', () => {
			const result = validateRequired(undefined);
			expect(result.type).toBe('invalid');
		});

		it('validateRequired_withZero_returnsValid', () => {
			const result = validateRequired(0);
			expect(result.type).toBe('valid');
		});
	});
});
