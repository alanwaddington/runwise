import type { ZoneKey } from './workouts';

/** Lowercase, collapse non-alphanumeric runs to a single hyphen, trim leading/trailing hyphens. */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Filename convention: runwise-<slugified label>-<zone>-<pace|power>.fit */
export function buildFitFilename(label: string, zone: ZoneKey, kind: 'pace' | 'power'): string {
	return `runwise-${slugify(label)}-${zone}-${kind}.fit`;
}
