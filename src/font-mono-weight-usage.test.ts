import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

const WEIGHT_CLASSES: Record<string, number> = {
	'font-thin': 100,
	'font-extralight': 200,
	'font-light': 300,
	'font-normal': 400,
	'font-medium': 500,
	'font-semibold': 600,
	'font-bold': 700,
	'font-extrabold': 800,
	'font-black': 900
};

function walkSvelteFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkSvelteFiles(fullPath));
		} else if (entry.name.endsWith('.svelte')) {
			files.push(fullPath);
		}
	}
	return files;
}

/**
 * Scans a .svelte file's static `class="..."` attributes for `font-mono` usage and
 * resolves the weight each one renders at (a Tailwind weight utility if present,
 * otherwise the browser default of 400 — this project sets no other default weight).
 * Only handles static class strings: confirmed via grep that this codebase has no
 * clsx/cn-style dynamic class helpers or `class:font-mono` directives anywhere.
 */
function findFontMonoWeights(fileContents: string): number[] {
	const weights: number[] = [];
	const classAttrRegex = /class="([^"]*)"/g;
	let match: RegExpExecArray | null;
	while ((match = classAttrRegex.exec(fileContents))) {
		const classList = match[1].split(/\s+/);
		if (!classList.includes('font-mono')) continue;
		const weightClass = classList.find((c) => c in WEIGHT_CLASSES);
		weights.push(weightClass ? WEIGHT_CLASSES[weightClass] : 400);
	}
	return weights;
}

describe('font-mono weight usage vs loaded IBM Plex Mono weights', () => {
	it('every weight rendered with font-mono anywhere in src/ is actually requested in +layout.svelte', () => {
		const layoutSource = readFileSync(join(SRC_DIR, 'routes/+layout.svelte'), 'utf-8');
		const hrefMatch = layoutSource.match(/IBM\+Plex\+Mono:wght@([\d;]+)/);
		expect(hrefMatch, 'Could not find an IBM+Plex+Mono weight list in +layout.svelte\'s font link').not.toBeNull();
		const loadedWeights = new Set(hrefMatch![1].split(';').map(Number));

		const usedWeights = new Set<number>();
		const usageByWeight = new Map<number, string[]>();
		for (const file of walkSvelteFiles(SRC_DIR)) {
			const contents = readFileSync(file, 'utf-8');
			for (const weight of findFontMonoWeights(contents)) {
				usedWeights.add(weight);
				const relativePath = file.slice(SRC_DIR.length + 1);
				const files = usageByWeight.get(weight) ?? [];
				if (!files.includes(relativePath)) files.push(relativePath);
				usageByWeight.set(weight, files);
			}
		}

		const missing = [...usedWeights].filter((w) => !loadedWeights.has(w));
		if (missing.length > 0) {
			const detail = missing
				.map((w) => `  weight ${w}, used in: ${usageByWeight.get(w)?.join(', ')}`)
				.join('\n');
			throw new Error(
				`font-mono is used at weight(s) not requested in +layout.svelte's IBM Plex Mono link ` +
					`(loaded: ${[...loadedWeights].join(', ')}). The browser will faux-bold/faux-render these:\n${detail}\n` +
					`Add the missing weight(s) to the IBM+Plex+Mono:wght@... list in src/routes/+layout.svelte.`
			);
		}
	});
});
