import { describe, it, expect } from 'vitest';
import { GUIDES, GUIDE_MIN_WORD_COUNT } from './guides';

const METHODOLOGY_NAMES = ['Riegel', "Daniels' VDOT", 'VDOT', 'ACSM', 'WMA'];

function wordCount(guide: (typeof GUIDES)[number]): number {
	const text = [guide.intro, ...guide.sections.map((s) => `${s.heading} ${s.body}`)].join(' ');
	return text.split(/\s+/).filter(Boolean).length;
}

describe('GUIDES content', () => {
	it('containsExactlyFourGuides', () => {
		expect(GUIDES).toHaveLength(4);
	});

	it('everyGuide_hasAUniqueSlug', () => {
		const slugs = GUIDES.map((g) => g.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('everyGuide_hasARouteMatchingItsSlug', () => {
		for (const guide of GUIDES) {
			expect(guide.route).toBe(`/guides/${guide.slug}`);
		}
	});

	it('everyGuide_meetsTheMinimumWordCount', () => {
		for (const guide of GUIDES) {
			expect(wordCount(guide)).toBeGreaterThanOrEqual(GUIDE_MIN_WORD_COUNT);
		}
	});

	it('everyGuide_hasATitleExcerptAndAtLeastTwoSections', () => {
		for (const guide of GUIDES) {
			expect(guide.title.length).toBeGreaterThan(0);
			expect(guide.excerpt.length).toBeGreaterThan(0);
			expect(guide.sections.length).toBeGreaterThanOrEqual(2);
		}
	});

	it('everyGuide_hasAtLeastOneCreditedSource', () => {
		for (const guide of GUIDES) {
			expect(guide.sourcesCredited.length).toBeGreaterThanOrEqual(1);
		}
	});

	it('atLeastOneGuide_explicitlyNamesItsSourceMethodologyInBody', () => {
		const anyGuideNamesASource = GUIDES.some((guide) => {
			const text = [guide.intro, ...guide.sections.map((s) => s.body)].join(' ');
			return METHODOLOGY_NAMES.some((name) => text.includes(name));
		});

		expect(anyGuideNamesASource).toBe(true);
	});
});
