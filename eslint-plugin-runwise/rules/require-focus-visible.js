/**
 * ESLint rule: require-focus-visible
 *
 * Enforces that interactive elements (<button> and <a>) have the required focus-visible
 * Tailwind CSS classes for keyboard accessibility (WCAG 2.1 SC 2.4.7).
 *
 * Required pattern: focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-*
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
			'SvelteStartTag[name.name="button"]'(node) {
				checkFocusVisible(node, 'button');
			},
			'SvelteStartTag[name.name="a"]'(node) {
				checkFocusVisible(node, 'a');
			}
		};

		function checkFocusVisible(node, element) {
			// Find the class attribute
			const classAttr = node.attributes.find((attr) => {
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
				// Svelte template expression or text nodes
				classString = classAttr.value
					.filter((v) => v.type === 'Text')
					.map((v) => v.data)
					.join(' ');
			} else if (classAttr.value && classAttr.value.data) {
				classString = classAttr.value.data;
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
