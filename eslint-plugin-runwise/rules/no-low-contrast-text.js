/**
 * ESLint rule: no-low-contrast-text
 *
 * Bans text-gray-400 and text-gray-500 (in any variant form, e.g. dark:text-gray-400,
 * hover:text-gray-500) in Svelte class attributes. Both fail WCAG AA contrast against
 * the site's light background (~2.8:1 and ~4.2:1 respectively); use the semantic
 * .text-muted utility instead, which is guaranteed >=4.5:1 in both themes (see
 * --color-muted in src/app.css and the regression tests in src/app.css.test.ts).
 *
 * Replaces a previous no-restricted-syntax rule that targeted a plain ESTree
 * `Literal` AST node — Svelte template class attributes are `SvelteAttribute` nodes
 * whose static text content lives in `SvelteLiteral` children (`.value`, not
 * `.data`), so that selector never matched anything in a .svelte file and the rule
 * was a silent no-op (found during the PR #71 review). dark:text-gray-400 used to
 * be exempted here as a workaround for
 * --text-muted's dark-mode contrast failure; now that --color-muted is fixed at the
 * token level (PR #71), that workaround has no legitimate use anywhere in the
 * codebase and is banned outright like the rest.
 */

const BANNED_UTILITIES = new Set(['text-gray-400', 'text-gray-500']);

export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Ban text-gray-400/text-gray-500 (including dark:/hover: variants) in Svelte class attributes; use .text-muted instead',
			category: 'Accessibility',
			recommended: true,
			url: 'https://github.com/alanwaddington/runwise'
		},
		messages: {
			lowContrast:
				'"{{ className }}" fails WCAG AA contrast. Use .text-muted instead (guaranteed >=4.5:1 in both themes via --color-muted).'
		}
	},

	create(context) {
		const filename = context.filename;
		if (!filename.endsWith('.svelte')) {
			return {};
		}

		return {
			SvelteAttribute(node) {
				if (node.key?.name !== 'class') return;

				const classString = extractClassString(node);
				if (!classString) return;

				for (const token of classString.split(/\s+/)) {
					if (!token) continue;
					// Variants (dark:, hover:, sm:, etc.) are colon-separated prefixes;
					// the banned utility itself is whatever comes after the last one.
					const utility = token.slice(token.lastIndexOf(':') + 1);
					if (BANNED_UTILITIES.has(utility)) {
						context.report({
							node,
							messageId: 'lowContrast',
							data: { className: token }
						});
					}
				}
			}
		};

		function extractClassString(attributeNode) {
			if (attributeNode.value === true) {
				// Boolean attribute (shouldn't happen for `class`, but guard anyway).
				return '';
			}
			if (Array.isArray(attributeNode.value)) {
				return attributeNode.value
					.filter((v) => v.type === 'SvelteLiteral')
					.map((v) => v.value)
					.join(' ');
			}
			return attributeNode.value?.value ?? '';
		}
	}
};
