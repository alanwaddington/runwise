#!/usr/bin/env node
// Removes the 5 known-extraneous WASM32-WASI fallback packages that npm
// installs alongside @tailwindcss/oxide and @rolldown/binding but never
// prunes (neither `npm ci` nor `npm prune` remove them — see issue #60).
// These are dev-only, unreferenced in source, and have zero footprint in
// the deployed Vercel build; this script is purely a local convenience for
// developers who want a leaner node_modules. It must be re-run after every
// fresh install if that's wanted, since node_modules is not version controlled.
// Run: node scripts/clean-wasm-fallbacks.js
// Or:  npm run clean:wasm

import { existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Hardcoded rather than derived from `npm ls --json` at runtime, so the script can never
// touch anything beyond this explicit list. If @tailwindcss/oxide or @rolldown/binding
// ever rename/restructure their WASM32-WASI fallback bundle, this list will need updating.
const TARGET_PACKAGES = [
	'@emnapi/core',
	'@emnapi/runtime',
	'@emnapi/wasi-threads',
	'@napi-rs/wasm-runtime',
	'@tybys/wasm-util'
];

let removedCount = 0;
let failedCount = 0;

for (const name of TARGET_PACKAGES) {
	const packagePath = join(ROOT, 'node_modules', ...name.split('/'));

	if (!existsSync(packagePath)) {
		console.log(`already absent: ${name}`);
		continue;
	}

	try {
		rmSync(packagePath, { recursive: true, force: true });
		console.log(`removed ${name}`);
		removedCount++;
	} catch (error) {
		console.error(`failed to remove ${name}: ${error.message}`);
		failedCount++;
	}
}

console.log(`\n${removedCount} of ${TARGET_PACKAGES.length} packages removed.`);

if (failedCount > 0) {
	console.error(`${failedCount} package(s) could not be removed — see errors above.`);
	process.exit(1);
}
