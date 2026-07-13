import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { gitDatesPlugin } from './src/lib/vite-plugins/git-dates';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), gitDatesPlugin()],
	// Scoped to Vitest only: forcing the 'browser' resolve condition here also strips Vite's
	// automatic 'development'/'production' conditions from the dev server and build, which
	// broke $app/environment's `dev` export (via esm-env) for the whole app — see PR #72 review.
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest-setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// The 'forks' pool (Vitest's default) spawns a child process per worker, each of
		// which redoes module resolution from disk. On a 9p-mounted WSL drive (slow I/O
		// for many small file reads) this caused intermittent
		// "[vitest-pool]: Failed to start forks worker" / "Timeout waiting for worker to
		// respond" failures under concurrent worker startup. The 'threads' pool uses
		// worker_threads, which share the main process's module cache and start up far
		// faster, avoiding the repeated disk I/O that triggered the timeout.
		pool: 'threads'
	}
});
