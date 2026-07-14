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

const TARGET_PACKAGES = [
	'@emnapi/core',
	'@emnapi/runtime',
	'@emnapi/wasi-threads',
	'@napi-rs/wasm-runtime',
	'@tybys/wasm-util'
];

let removedCount = 0;

for (const name of TARGET_PACKAGES) {
	const packagePath = join(ROOT, 'node_modules', ...name.split('/'));

	if (existsSync(packagePath)) {
		rmSync(packagePath, { recursive: true, force: true });
		console.log(`removed ${name}`);
		removedCount++;
	} else {
		console.log(`already absent: ${name}`);
	}
}

console.log(`\n${removedCount} of ${TARGET_PACKAGES.length} packages removed.`);
