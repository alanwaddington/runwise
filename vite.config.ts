import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { gitDatesPlugin } from './src/lib/vite-plugins/git-dates';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), gitDatesPlugin()],
	resolve: {
		conditions: ['browser']
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest-setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
