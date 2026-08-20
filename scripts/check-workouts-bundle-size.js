#!/usr/bin/env node
// Automated regression check for AC-8.7 (Runwise issue #100 Phase 2): the /workouts route's
// client-side JS bundle must stay under a gzipped size budget. Added during PR #104's
// pr-reviewer follow-up (finding m2) -- AC-8.6/AC-8.7 had previously only ever been verified by a
// one-off manual measurement (a live Playwright + Performance API run, per the Task 12 commit),
// with nothing to catch a future regression. This script makes AC-8.7 self-verifying.
//
// Not a general-purpose bundler analyzer: it resolves exactly the client-side JS graph the
// browser needs to render /workouts on first load, by walking Vite's own build manifest from the
// /workouts route's node entry through its static `imports` (transitively, deduplicated).
// Dynamic imports (e.g. @garmin/fitsdk, lazy-loaded only when a user clicks "Download as .FIT")
// are deliberately excluded -- they're not part of the initial page-load cost this budget exists
// to guard, matching how the PR's own manual measurement described the figure.
//
// Run: node scripts/check-workouts-bundle-size.js
// Or:  npm run check:bundle-size
// Builds the project itself (same as the manual measurement did), so no separate `npm run build`
// step is required first.

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { gzipSync } from 'zlib';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLIENT_OUTPUT_DIR = join(ROOT, '.svelte-kit/output/client');
const MANIFEST_PATH = join(CLIENT_OUTPUT_DIR, '.vite/manifest.json');
const GENERATED_APP_JS_PATH = join(ROOT, '.svelte-kit/generated/client-optimized/app.js');

// AC-8.7's own budget ("< 10 KB gzipped for new generators") was scoped to Phase 2's net-new
// delta on top of Phase 1's already-shipped baseline (measured as a 22.45 -> 24.75 kB route-chunk
// diff via the browser's own Performance API against a running page, per the Task 12 commit) --
// there's no stored Phase-1 baseline artifact to diff against here, and that route-chunk figure
// itself excludes the shared Svelte/SvelteKit runtime every route pays once and then caches.
// This script measures something related but broader on purpose: the full transitive static-
// import graph reachable from the /workouts entry node (verified 72.37 kB gzipped as of PR #104,
// including that shared runtime cost). It exists to catch a *regression* -- most plausibly an
// accidentally-static (rather than dynamic) import of a heavy dependency like @garmin/fitsdk --
// not to reproduce AC-8.7's narrower delta figure exactly. Budget set with real headroom above
// the measured baseline; if it ever needs raising for a genuine, justified reason, do so with a
// comment here explaining why, and re-verify nothing got pulled in by accident first.
const BUDGET_GZIP_BYTES = 100 * 1024;

// The route's node entry index is an integer SvelteKit assigns per-build (not stable across
// builds) -- resolved fresh each run from generated/client-optimized/app.js's own route table
// (`"/workouts": [layoutNodeIndices..., pageNodeIndex]`) rather than hardcoded, so this survives
// new routes being added/removed and the index itself changing.
function findWorkoutsNodeKey() {
	if (!existsSync(GENERATED_APP_JS_PATH)) return null;
	const appJs = readFileSync(GENERATED_APP_JS_PATH, 'utf-8');
	const match = appJs.match(/"\/workouts":\s*\[([^\]]*)\]/);
	if (!match) return null;
	const nodeIndices = match[1].split(',').map((s) => s.trim());
	const pageNodeIndex = nodeIndices[nodeIndices.length - 1]; // last index is the +page.svelte node
	return `.svelte-kit/generated/client-optimized/nodes/${pageNodeIndex}.js`;
}

function collectTransitiveImports(manifest, key, seen) {
	if (seen.has(key)) return;
	seen.add(key);
	const entry = manifest[key];
	if (!entry) return;
	for (const importKey of entry.imports ?? []) {
		collectTransitiveImports(manifest, importKey, seen);
	}
}

function main() {
	if (!existsSync(MANIFEST_PATH)) {
		console.log('No build output found -- running `npm run build` first...');
		execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
	}

	const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
	const workoutsKey = findWorkoutsNodeKey();
	if (!workoutsKey) {
		console.error('Could not find the /workouts route entry in the client build manifest.');
		console.error('This script may need updating if the route or SvelteKit\'s manifest shape changed.');
		process.exit(1);
	}

	const seen = new Set();
	collectTransitiveImports(manifest, workoutsKey, seen);

	let totalGzipBytes = 0;
	const perFile = [];
	for (const key of seen) {
		const entry = manifest[key];
		if (!entry?.file) continue;
		const filePath = join(CLIENT_OUTPUT_DIR, entry.file);
		if (!existsSync(filePath)) continue;
		const raw = readFileSync(filePath);
		const gzipBytes = gzipSync(raw, { level: 9 }).length;
		totalGzipBytes += gzipBytes;
		perFile.push({ file: entry.file, gzipBytes });
	}

	perFile.sort((a, b) => b.gzipBytes - a.gzipBytes);

	const totalKB = (totalGzipBytes / 1024).toFixed(2);
	const budgetKB = (BUDGET_GZIP_BYTES / 1024).toFixed(2);

	console.log(`\n/workouts client bundle: ${totalKB} kB gzipped (budget: ${budgetKB} kB)\n`);
	console.log('Largest chunks:');
	for (const { file, gzipBytes } of perFile.slice(0, 8)) {
		console.log(`  ${(gzipBytes / 1024).toFixed(2).padStart(7)} kB  ${file}`);
	}

	if (totalGzipBytes > BUDGET_GZIP_BYTES) {
		console.error(
			`\nFAIL: /workouts bundle (${totalKB} kB gzipped) exceeds the ${budgetKB} kB budget (AC-8.7).`
		);
		console.error('If this growth is expected and justified, raise BUDGET_GZIP_BYTES in this script');
		console.error('with a comment explaining why -- don\'t silently let it regress unnoticed.');
		process.exit(1);
	}

	console.log('\nPASS: within budget.');
}

main();
