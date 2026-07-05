import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		// Prevent reintroduction of low-contrast text classes (WCAG AA violations)
		// text-gray-400 (~2.8:1) and text-gray-500 (~4.2:1) fail against bg #fafaf8
		// Use text-gray-600 (~6.4:1) instead. dark:text-gray-400 is exempt (~6.3:1 on dark bg).
		files: ['**/*.svelte'],
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: 'Literal[value=/(?<![\\w-])text-gray-400(?![\\w-])/]',
					message: 'text-gray-400 fails WCAG AA contrast (2.8:1). Use text-gray-600 instead.'
				},
				{
					selector: 'Literal[value=/(?<![\\w-])text-gray-500(?![\\w-])/]',
					message: 'text-gray-500 fails WCAG AA contrast (4.2:1). Use text-gray-600 instead.'
				}
			]
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/', '.vercel/']
	}
);
