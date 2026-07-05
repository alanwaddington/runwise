/**
 * Centralized validation rules for all tool inputs.
 * Tool pages can import these rules and override as needed.
 */

export const VALIDATION_RULES = {
	pace: {
		pattern: /^(\d+):(\d{2})$/,
		errorMessage: 'Enter pace as M:SS (e.g., 5:30)',
		required: true,
		requiredMessage: 'Pace is required'
	},
	positive: {
		required: true,
		requiredMessage: 'This field is required',
		error: 'Must be greater than 0'
	},
	range: {
		required: true,
		requiredMessage: 'This field is required',
		// min and max are tool-specific and should be provided at validation time
		error: (min: number, max: number) => `Must be between ${min} and ${max}`
	}
} as const;
