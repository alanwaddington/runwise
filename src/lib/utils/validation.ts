export type ValidationResult<T> =
	| { type: 'valid'; value: T }
	| { type: 'invalid'; error: string }
	| { type: 'empty' };

export function validatePositive(value: number | null | undefined): ValidationResult<number> {
	if (value === null || value === undefined) {
		return { type: 'empty' };
	}
	if (value <= 0) {
		return { type: 'invalid', error: 'Must be greater than 0' };
	}
	return { type: 'valid', value };
}

export function validateRange(
	value: number | null | undefined,
	min: number,
	max: number
): ValidationResult<number> {
	if (value === null || value === undefined) {
		return { type: 'empty' };
	}
	if (value < min || value > max) {
		return { type: 'invalid', error: `Must be between ${min} and ${max}` };
	}
	return { type: 'valid', value };
}

export function validateMinimum(
	value: number | null | undefined,
	min: number
): ValidationResult<number> {
	if (value === null || value === undefined) {
		return { type: 'empty' };
	}
	if (value < min) {
		return { type: 'invalid', error: `Must be at least ${min}` };
	}
	return { type: 'valid', value };
}

export function validateMaximum(
	value: number | null | undefined,
	max: number
): ValidationResult<number> {
	if (value === null || value === undefined) {
		return { type: 'empty' };
	}
	if (value > max) {
		return { type: 'invalid', error: `Must be no more than ${max}` };
	}
	return { type: 'valid', value };
}

export function validateRequired(
	value: string | number | null | undefined
): ValidationResult<string | number> {
	if (value === null || value === undefined || value === '') {
		return { type: 'invalid', error: 'This field is required' };
	}
	return { type: 'valid', value };
}
