/**
 * eslint-plugin-runwise
 *
 * Custom ESLint plugin for Runwise project-specific rules.
 */

import requireFocusVisible from './rules/require-focus-visible.js';
import noLowContrastText from './rules/no-low-contrast-text.js';

export default {
	rules: {
		'require-focus-visible': requireFocusVisible,
		'no-low-contrast-text': noLowContrastText
	},
	configs: {
		recommended: {
			plugins: ['runwise'],
			rules: {
				'runwise/require-focus-visible': 'error',
				'runwise/no-low-contrast-text': 'error'
			}
		}
	}
};
