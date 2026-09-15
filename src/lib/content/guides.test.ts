import { describe, it, expect } from 'vitest';
import { GUIDES, GUIDE_MIN_WORD_COUNT } from './guides';

const METHODOLOGY_NAMES = [
	'Riegel',
	"Daniels' VDOT",
	'VDOT',
	'Daniels',
	'ACSM',
	'WMA',
	'Alan Jones',
	'Friel',
	'Stryd',
	'Garmin',
	'Polar',
	'Critical Power',
	'MAP',
	'Tanaka'
];

function wordCount(guide: (typeof GUIDES)[number]): number {
	const text = [guide.intro, ...guide.sections.map((s) => `${s.heading} ${s.body}`)].join(' ');
	return text.split(/\s+/).filter(Boolean).length;
}

/** Collects every guide that fails `predicate`, so one run names every offender
 *  instead of an `expect()`-in-a-loop stopping at the first failure. */
function failingSlugs(predicate: (guide: (typeof GUIDES)[number]) => boolean): string[] {
	return GUIDES.filter((guide) => !predicate(guide)).map((guide) => guide.slug);
}

describe('GUIDES content', () => {
	it('containsExactlyTenGuides', () => {
		expect(GUIDES).toHaveLength(10);
	});

	it('everyGuide_hasAUniqueSlug', () => {
		const slugs = GUIDES.map((g) => g.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('everyGuide_hasARouteMatchingItsSlug', () => {
		expect(failingSlugs((guide) => guide.route === `/guides/${guide.slug}`)).toEqual([]);
	});

	it('everyGuide_meetsTheMinimumWordCount', () => {
		expect(failingSlugs((guide) => wordCount(guide) >= GUIDE_MIN_WORD_COUNT)).toEqual([]);
	});

	it('everyGuide_hasATitle', () => {
		expect(failingSlugs((guide) => guide.title.length > 0)).toEqual([]);
	});

	it('everyGuide_hasAnExcerpt', () => {
		expect(failingSlugs((guide) => guide.excerpt.length > 0)).toEqual([]);
	});

	it('everyGuide_hasAtLeastTwoSections', () => {
		expect(failingSlugs((guide) => guide.sections.length >= 2)).toEqual([]);
	});

	it('everyGuide_hasAtLeastOneCreditedSource', () => {
		expect(failingSlugs((guide) => guide.sourcesCredited.length >= 1)).toEqual([]);
	});

	it('everyGuide_explicitlyNamesItsSourceMethodologyInBody', () => {
		const namesASource = (guide: (typeof GUIDES)[number]) => {
			const text = [guide.intro, ...guide.sections.map((s) => s.body)].join(' ');
			return METHODOLOGY_NAMES.some((name) => text.includes(name));
		};

		expect(failingSlugs(namesASource)).toEqual([]);
	});
});
