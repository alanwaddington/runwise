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
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
