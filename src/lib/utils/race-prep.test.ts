import { describe, it, expect } from 'vitest';
import { computeWeeksUntilRace, isRacePrepEligible, buildRacePrepResult } from './race-prep';

describe('computeWeeksUntilRace', () => {
	it('should return 4 for a race exactly 28 days away', () => {
		expect(computeWeeksUntilRace('2026-03-01', '2026-02-01')).toBe(4);
	});

	it('should return 0 for a race today', () => {
		expect(computeWeeksUntilRace('2026-02-01', '2026-02-01')).toBe(0);
	});

	it('should return a negative number for a race in the past', () => {
		expect(computeWeeksUntilRace('2026-01-01', '2026-02-01')).toBeLessThan(0);
	});
});

describe('isRacePrepEligible', () => {
	it('should be eligible at the 4-week lower boundary', () => {
		expect(isRacePrepEligible(4)).toBe(true);
	});

	it('should be eligible at the 8-week upper boundary', () => {
		expect(isRacePrepEligible(8)).toBe(true);
	});

	it('should be ineligible below 4 weeks', () => {
		expect(isRacePrepEligible(3)).toBe(false);
	});

	it('should be ineligible above 8 weeks', () => {
		expect(isRacePrepEligible(9)).toBe(false);
	});

	it('should be ineligible for a race in the past', () => {
		expect(isRacePrepEligible(-1)).toBe(false);
	});
});

describe('buildRacePrepResult', () => {
	// today + 5 weeks, comfortably inside the 4-8 week eligibility window
	const today = '2026-02-01';
	const raceDate = '2026-03-08';

	it('should return null for missing inputs', () => {
		expect(buildRacePrepResult(null, 1200, raceDate, today, 60)).toBeNull();
		expect(buildRacePrepResult(5, null, raceDate, today, 60)).toBeNull();
		expect(buildRacePrepResult(5, 1200, null, today, 60)).toBeNull();
		expect(buildRacePrepResult(5, 1200, raceDate, today, null)).toBeNull();
	});

	it('should return out-of-range when weekly mileage is invalid', () => {
		expect(buildRacePrepResult(5, 1200, raceDate, today, 0)).toBe('out-of-range');
	});

	it('should return out-of-range when the race is outside the 4-8 week window', () => {
		expect(buildRacePrepResult(5, 1200, '2026-02-10', today, 60)).toBe('out-of-range'); // ~1 week
		expect(buildRacePrepResult(5, 1200, '2026-06-01', today, 60)).toBe('out-of-range'); // ~17 weeks
	});

	it('should return out-of-range for an implausible race performance', () => {
		expect(buildRacePrepResult(5, 1, raceDate, today, 60)).toBe('out-of-range');
	});

	it.each([
		['5K', 5, 1200],
		['10K', 10, 2500],
		['Half-Marathon', 21.0975, 5700],
		['Marathon', 42.195, 12000]
	])('should generate a 4-week plan for %s', (_label, distanceKm, timeSeconds) => {
		const result = buildRacePrepResult(distanceKm, timeSeconds, raceDate, today, 60);
		expect(result).not.toBeNull();
		expect(result).not.toBe('out-of-range');
		if (result === null || result === 'out-of-range') return;
		expect(result.weeks).toHaveLength(4);
		expect(result.raceDistanceKm).toBe(distanceKm);
		expect(result.goalPaceMinKm).toBeGreaterThan(0);
	});

	it('should assign phases in Build -> Strength -> Peak VO2 Max -> Taper order', () => {
		const result = buildRacePrepResult(5, 1200, raceDate, today, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		expect(result.weeks.map((w) => w.phase)).toEqual([
			'Build Aerobic Base',
			'Strength',
			'Peak VO2 Max',
			'Taper'
		]);
		expect(result.weeks.map((w) => w.weekNumber)).toEqual([1, 2, 3, 4]);
	});

	it('should give each week 3-5 workouts', () => {
		const result = buildRacePrepResult(5, 1200, raceDate, today, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		for (const week of result.weeks) {
			expect(week.workouts.length).toBeGreaterThanOrEqual(3);
			expect(week.workouts.length).toBeLessThanOrEqual(5);
		}
	});

	it('should tag every workout in every week as pattern race-prep', () => {
		const result = buildRacePrepResult(5, 1200, raceDate, today, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		for (const week of result.weeks) {
			for (const workout of week.workouts) {
				expect(workout.pattern).toBe('race-prep');
			}
		}
	});

	it('should reduce Taper week volume relative to Build week', () => {
		const result = buildRacePrepResult(5, 1200, raceDate, today, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		const buildVolume = result.weeks[0].workouts.reduce((s, w) => s + w.totalVolumeKm, 0);
		const taperVolume = result.weeks[3].workouts.reduce((s, w) => s + w.totalVolumeKm, 0);
		expect(taperVolume).toBeLessThan(buildVolume);
	});
});
