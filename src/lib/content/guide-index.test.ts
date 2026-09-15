import { describe, it, expect } from 'vitest';
import { GUIDE_INDEX } from './guide-index';
import { GUIDES } from './guides';

describe('GUIDE_INDEX', () => {
	it('hasExactlyOneEntryPerGuide_inTheSameOrder', () => {
		expect(GUIDE_INDEX.map((g) => g.slug)).toEqual(GUIDES.map((g) => g.slug));
	});

	it('everyEntry_matchesItsFullGuideOnSlugRouteTitleAndExcerpt', () => {
		const bySlug = new Map(GUIDES.map((g) => [g.slug, g]));
		const mismatches = GUIDE_INDEX.filter((entry) => {
			const full = bySlug.get(entry.slug);
			if (!full) return true;
			return (
				entry.route !== full.route || entry.title !== full.title || entry.excerpt !== full.excerpt
			);
		}).map((entry) => entry.slug);

		expect(mismatches).toEqual([]);
	});
});
