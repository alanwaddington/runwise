import { describe, it, expect } from 'vitest';
import { computeRouteDates, maxDate } from './git-dates';

describe('maxDate', () => {
	it('bothDatesProvided_returnsLaterDate', () => {
		expect(maxDate('2026-01-01', '2026-06-15')).toBe('2026-06-15');
		expect(maxDate('2026-06-15', '2026-01-01')).toBe('2026-06-15');
	});

	it('onlyFirstDateProvided_returnsFirstDate', () => {
		expect(maxDate('2026-01-01', null)).toBe('2026-01-01');
	});

	it('onlySecondDateProvided_returnsSecondDate', () => {
		expect(maxDate(null, '2026-01-01')).toBe('2026-01-01');
	});

	it('neitherDateProvided_returnsNull', () => {
		expect(maxDate(null, null)).toBeNull();
	});

	it('equalDates_returnsSameDate', () => {
		expect(maxDate('2026-03-10', '2026-03-10')).toBe('2026-03-10');
	});
});

describe('computeRouteDates', () => {
	const toolRoutes = ['/pace', '/vo2max'];

	it('everyToolRoute_hasOwnRouteDate', () => {
		const dates = computeRouteDates(
			toolRoutes,
			{ '/pace': '2026-06-01', '/vo2max': '2026-06-10' },
			null,
			'2026-01-01'
		);
		expect(dates['/pace']).toBe('2026-06-01');
		expect(dates['/vo2max']).toBe('2026-06-10');
	});

	it('sharedPathIsNewerThanRouteOwnDate_usesSharedDate', () => {
		const dates = computeRouteDates(
			toolRoutes,
			{ '/pace': '2026-06-01', '/vo2max': '2026-06-10' },
			'2026-07-01',
			'2026-01-01'
		);
		expect(dates['/pace']).toBe('2026-07-01');
		expect(dates['/vo2max']).toBe('2026-07-01');
	});

	it('routeOwnDateIsNewerThanSharedDate_usesRouteOwnDate', () => {
		const dates = computeRouteDates(
			toolRoutes,
			{ '/pace': '2026-06-01', '/vo2max': '2026-06-10' },
			'2026-05-01',
			'2026-01-01'
		);
		expect(dates['/pace']).toBe('2026-06-01');
		expect(dates['/vo2max']).toBe('2026-06-10');
	});

	it('homePage_equalsMaxDateAcrossAllRoutes', () => {
		const dates = computeRouteDates(
			toolRoutes,
			{ '/pace': '2026-06-01', '/vo2max': '2026-06-10' },
			null,
			'2026-01-01'
		);
		expect(dates['/']).toBe('2026-06-10');
	});

	it('routeDirDateMissing_fallsBackToFallbackDate', () => {
		const dates = computeRouteDates(toolRoutes, { '/pace': null, '/vo2max': null }, null, '2026-01-01');
		expect(dates['/pace']).toBe('2026-01-01');
		expect(dates['/vo2max']).toBe('2026-01-01');
		expect(dates['/']).toBe('2026-01-01');
	});

	it('allDates_areValidIso8601DateStrings', () => {
		const dates = computeRouteDates(
			toolRoutes,
			{ '/pace': '2026-06-01', '/vo2max': null },
			null,
			'2026-01-01'
		);
		for (const date of Object.values(dates)) {
			expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(Number.isNaN(new Date(date).getTime())).toBe(false);
		}
	});
});
