import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import runwise from './eslint-plugin-runwise/index.js';

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
		},
		plugins: {
			runwise
		}
	},
	{
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		// Prevent reintroduction of low-contrast text classes (WCAG AA violations).
		// text-gray-400 (~2.8:1) and text-gray-500 (~4.2:1) fail against bg #fafaf8.
		// Use text-muted instead — guaranteed >=4.5:1 in both themes via --color-muted
		// (see src/app.css and its regression tests in src/app.css.test.ts). This used
		// to be enforced by a no-restricted-syntax rule targeting a plain `Literal` AST
		// node, which never matched anything in a .svelte file (Svelte class attributes
		// are SvelteAttribute/Text nodes, not ESTree Literals) — replaced with
		// runwise/no-low-contrast-text, which inspects Svelte class attributes directly.
		files: ['**/*.svelte'],
		rules: {
			'runwise/require-focus-visible': 'error',
			'runwise/no-low-contrast-text': 'error'
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/', '.vercel/']
	}
);
