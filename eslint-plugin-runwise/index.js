/**
 * eslint-plugin-runwise
 *
 * Custom ESLint plugin for Runwise project-specific rules.
 */

import requireFocusVisible from './rules/require-focus-visible.js';

export default {
	rules: {
		'require-focus-visible': requireFocusVisible
	},
	configs: {
		recommended: {
			plugins: ['runwise'],
			rules: {
				'runwise/require-focus-visible': 'error'
			}
		}
	}
};
