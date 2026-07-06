/**
 * ESLint rule: require-focus-visible
 *
 * Enforces that interactive elements (<button> and <a>) have the required focus-visible
 * Tailwind CSS classes for keyboard accessibility (WCAG 2.1 SC 2.4.7).
 *
 * Required pattern: focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-*
 *
 * Found broken during the PR #71 review (while fixing a sibling rule with the same
 * class of bug): the original selector `SvelteStartTag[name.name="button"]` never
 * matched anything, because `SvelteStartTag` has no `.name` property at all in this
 * parser version — the tag name lives on the parent `SvelteElement.name.name`, and
 * its attributes live on `SvelteElement.startTag.attributes`, not directly on the
 * start tag node. The class-string extraction also assumed `Text`/`.data` nodes;
 * static class text is actually `SvelteLiteral`/`.value`. Both bugs combined meant
 * this rule had never once fired since its introduction in PR #66 — confirmed
 * empirically: a <button> with zero classes produced no lint error at all.
 */

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce focus-visible styles on interactive elements for WCAG 2.1 AA compliance',
			category: 'Accessibility',
			recommended: true,
			url: 'https://github.com/alanwaddington/runwise'
		},
		messages: {
			missingFocusVisible:
				'Interactive <{{ element }}> must have focus-visible classes: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-*"',
			missingOutlineNone:
				'Interactive <{{ element }}> is missing "focus-visible:outline-none"',
			missingRingClasses:
				'Interactive <{{ element }}> is missing "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-*"'
		}
	},

	create(context) {
		// Only check Svelte files
		const filename = context.filename;
		if (!filename.endsWith('.svelte')) {
			return {};
		}

		return {
			'SvelteElement[name.name="button"]'(node) {
				checkFocusVisible(node, 'button');
			},
			'SvelteElement[name.name="a"]'(node) {
				checkFocusVisible(node, 'a');
			}
		};

		function checkFocusVisible(node, element) {
			// Find the class attribute (attributes live on the element's start tag)
			const classAttr = node.startTag.attributes.find((attr) => {
				if (attr.type === 'SvelteAttribute' && attr.key.name === 'class') {
					return true;
				}
				return false;
			});

			if (!classAttr) {
				// No class attribute at all
				context.report({
					node,
					messageId: 'missingFocusVisible',
					data: { element }
				});
				return;
			}

			// Extract class string from attribute value
			let classString = '';
			if (classAttr.value === true) {
				// Boolean attribute (class={someVar} or similar)
				return; // Skip dynamic classes
			}

			if (Array.isArray(classAttr.value)) {
				// Static class text is SvelteLiteral; SvelteMustacheTag (a `{...}`
				// expression) is skipped since a dynamic class can't be checked statically.
				classString = classAttr.value
					.filter((v) => v.type === 'SvelteLiteral')
					.map((v) => v.value)
					.join(' ');
			} else if (classAttr.value && classAttr.value.value) {
				classString = classAttr.value.value;
			}

			if (!classString) {
				return; // Skip dynamic classes
			}

			const hasOutlineNone = classString.includes('focus-visible:outline-none');
			const hasRing2 = classString.includes('focus-visible:ring-2');
			const hasRingAccent = classString.includes('focus-visible:ring-accent');
			const hasRingOffset = /focus-visible:ring-offset-\d+/.test(classString);

			const allPresent = hasOutlineNone && hasRing2 && hasRingAccent && hasRingOffset;

			if (!allPresent) {
				if (!hasOutlineNone && (!hasRing2 || !hasRingAccent || !hasRingOffset)) {
					context.report({
						node,
						messageId: 'missingFocusVisible',
						data: { element }
					});
				} else if (!hasOutlineNone) {
					context.report({
						node,
						messageId: 'missingOutlineNone',
						data: { element }
					});
				} else if (!hasRing2 || !hasRingAccent || !hasRingOffset) {
					context.report({
						node,
						messageId: 'missingRingClasses',
						data: { element }
					});
				}
			}
		}
	}
};
