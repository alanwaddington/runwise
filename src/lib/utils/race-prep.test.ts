import { describe, it, expect } from 'vitest';
import {
	computeWeeksUntilRace,
	isRacePrepEligible,
	buildRacePrepResult,
	type RacePrepModalityInput
} from './race-prep';

const PACE: RacePrepModalityInput = { modality: 'pace' };
const POWER: RacePrepModalityInput = { modality: 'power', power: 250, device: 'stryd' };
const HR: RacePrepModalityInput = { modality: 'hr', lthr: 170 };

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
	// today + 4 weeks, at the eligibility window's lower boundary
	const today = '2026-02-01';
	const raceDate = '2026-03-01';

	it('should return null for missing inputs', () => {
		expect(buildRacePrepResult(null, 1200, raceDate, today, 60, PACE)).toBeNull();
		expect(buildRacePrepResult(5, null, raceDate, today, 60, PACE)).toBeNull();
		expect(buildRacePrepResult(5, 1200, null, today, 60, PACE)).toBeNull();
		expect(buildRacePrepResult(5, 1200, raceDate, today, null, PACE)).toBeNull();
	});

	it('should return out-of-range when weekly mileage is invalid', () => {
		expect(buildRacePrepResult(5, 1200, raceDate, today, 0, PACE)).toBe('out-of-range');
	});

	it('should return out-of-range when the race is outside the 4-8 week window', () => {
		expect(buildRacePrepResult(5, 1200, '2026-02-10', today, 60, PACE)).toBe('out-of-range'); // ~1 week
		expect(buildRacePrepResult(5, 1200, '2026-06-01', today, 60, PACE)).toBe('out-of-range'); // ~17 weeks
	});

	it('should return out-of-range for an implausible race performance', () => {
		expect(buildRacePrepResult(5, 1, raceDate, today, 60, PACE)).toBe('out-of-range');
	});

	it.each([
		['5K', 5, 1200],
		['10K', 10, 2500],
		['Half-Marathon', 21.0975, 5700],
		['Marathon', 42.195, 12000]
	])('should generate a 4-week plan for %s', (_label, distanceKm, timeSeconds) => {
		const result = buildRacePrepResult(distanceKm, timeSeconds, raceDate, today, 60, PACE);
		expect(result).not.toBeNull();
		expect(result).not.toBe('out-of-range');
		if (result === null || result === 'out-of-range') return;
		expect(result.weeks).toHaveLength(4);
		expect(result.raceDistanceKm).toBe(distanceKm);
		expect(result.goalPaceMinKm).toBeGreaterThan(0);
	});

	it('should assign phases in Build -> Strength -> Peak VO2 Max -> Taper order', () => {
		const result = buildRacePrepResult(5, 1200, raceDate, today, 60, PACE);
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
		const result = buildRacePrepResult(5, 1200, raceDate, today, 60, PACE);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		for (const week of result.weeks) {
			expect(week.workouts.length).toBeGreaterThanOrEqual(3);
			expect(week.workouts.length).toBeLessThanOrEqual(5);
		}
	});

	it('should tag every workout in every week as pattern race-prep', () => {
		const result = buildRacePrepResult(5, 1200, raceDate, today, 60, PACE);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		for (const week of result.weeks) {
			for (const workout of week.workouts) {
				expect(workout.pattern).toBe('race-prep');
			}
		}
	});

	it('should reduce Taper week volume relative to Build week', () => {
		const result = buildRacePrepResult(5, 1200, raceDate, today, 60, PACE);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		const buildVolume = result.weeks[0].workouts.reduce((s, w) => s + w.totalVolumeKm, 0);
		const taperVolume = result.weeks[3].workouts.reduce((s, w) => s + w.totalVolumeKm, 0);
		expect(taperVolume).toBeLessThan(buildVolume);
	});

	describe('Taper week shakeout run (AC-7.6)', () => {
		it.each([
			['pace', PACE, 'km$'],
			['power', POWER, 'W$'],
			['hr', HR, 'bpm$']
		])('appends a Shakeout run as the Taper week\'s final workout, in %s modality', (_label, modalityInput, bandSuffixPattern) => {
			const result = buildRacePrepResult(5, 1200, raceDate, today, 60, modalityInput);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			const taperWeek = result.weeks[result.weeks.length - 1];
			expect(taperWeek.phase).toBe('Taper');
			const lastWorkout = taperWeek.workouts[taperWeek.workouts.length - 1];
			expect(lastWorkout.label).toBe('Shakeout run');
			expect(lastWorkout.pattern).toBe('race-prep');
			// Zone-tagged 'E' (not left undefined, not the modality's harder zones) so it resolves
			// to the Easy pace/power/HR band, not a faster zone's -- same reasoning as the R-zone
			// Recovery Options fix elsewhere in the workouts module.
			expect(lastWorkout.zone).toBe('E');
			const band = result.zoneBands.find((b) => b.zone === 'E');
			expect(band).toBeDefined();
			expect(band!.rangeLabel).toMatch(new RegExp(bandSuffixPattern));
		});

		it('keeps the shakeout distinct from Taper\'s existing reduced-volume E/T/M trio', () => {
			const result = buildRacePrepResult(5, 1200, raceDate, today, 60, PACE);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			const taperWeek = result.weeks[result.weeks.length - 1];
			expect(taperWeek.workouts).toHaveLength(4);
			expect(taperWeek.workouts.slice(0, 3).map((w) => w.label)).not.toContain('Shakeout run');
		});

		it('the shakeout has zero totalVolumeKm (not distance-prescribed) but a nonzero duration', () => {
			const result = buildRacePrepResult(5, 1200, raceDate, today, 60, PACE);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			const taperWeek = result.weeks[result.weeks.length - 1];
			const shakeout = taperWeek.workouts[taperWeek.workouts.length - 1];
			expect(shakeout.totalVolumeKm).toBe(0);
			expect(shakeout.estimatedDurationMinutes).toBeGreaterThan(0);
		});

		it('does not affect Build/Strength/Peak week workout counts', () => {
			const result = buildRacePrepResult(5, 1200, raceDate, today, 60, PACE);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			expect(result.weeks[0].workouts).toHaveLength(4); // Build (unaffected)
			expect(result.weeks[1].workouts).toHaveLength(3); // Strength (unaffected)
			expect(result.weeks[2].workouts).toHaveLength(3); // Peak VO2 Max (unaffected)
		});
	});

	describe('plan length scales with weeksUntilRace', () => {
		it.each([
			['2026-03-01', 4, ['Build Aerobic Base', 'Strength', 'Peak VO2 Max', 'Taper']],
			[
				'2026-03-08',
				5,
				['Build Aerobic Base', 'Build Aerobic Base', 'Strength', 'Peak VO2 Max', 'Taper']
			],
			[
				'2026-03-15',
				6,
				[
					'Build Aerobic Base',
					'Build Aerobic Base',
					'Strength',
					'Strength',
					'Peak VO2 Max',
					'Taper'
				]
			],
			[
				'2026-03-22',
				7,
				[
					'Build Aerobic Base',
					'Build Aerobic Base',
					'Build Aerobic Base',
					'Strength',
					'Strength',
					'Peak VO2 Max',
					'Taper'
				]
			],
			[
				'2026-03-29',
				8,
				[
					'Build Aerobic Base',
					'Build Aerobic Base',
					'Build Aerobic Base',
					'Strength',
					'Strength',
					'Peak VO2 Max',
					'Peak VO2 Max',
					'Taper'
				]
			]
		])('generates a %i-week plan (%s -> %i weeks out)', (raceDateISO, weekCount, expectedPhases) => {
			const result = buildRacePrepResult(5, 1200, raceDateISO, today, 60, PACE);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			expect(result.weeksUntilRace).toBe(weekCount);
			expect(result.weeks).toHaveLength(weekCount);
			expect(result.weeks.map((w) => w.phase)).toEqual(expectedPhases);
			expect(result.weeks.map((w) => w.weekNumber)).toEqual(
				Array.from({ length: weekCount }, (_, i) => i + 1)
			);
			// Taper is always exactly the last, single week regardless of total plan length.
			expect(result.weeks[result.weeks.length - 1].phase).toBe('Taper');
			expect(result.weeks.filter((w) => w.phase === 'Taper')).toHaveLength(1);
		});

		it('repeats the same workout set across repeated weeks of one phase', () => {
			const result = buildRacePrepResult(5, 1200, '2026-03-08', today, 60, PACE); // 5 weeks out
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			expect(result.weeks[0].phase).toBe('Build Aerobic Base');
			expect(result.weeks[1].phase).toBe('Build Aerobic Base');
			expect(result.weeks[0].workouts.map((w) => w.label)).toEqual(
				result.weeks[1].workouts.map((w) => w.label)
			);
		});
	});

	describe('pace modality', () => {
		it('tags Build/Strength/Peak workouts with their source zone', () => {
			const result = buildRacePrepResult(5, 1200, raceDate, today, 60, PACE);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			const buildZones = result.weeks[0].workouts.map((w) => w.zone);
			expect(buildZones).toContain('E');
			expect(buildZones).toContain('M');
		});

		it('returns pace zone bands usable for every zone-tagged workout', () => {
			const result = buildRacePrepResult(5, 1200, raceDate, today, 60, PACE);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			expect(result.modality).toBe('pace');
			for (const week of result.weeks) {
				for (const workout of week.workouts) {
					if (!workout.zone) continue; // race-pace tempo/reps aren't tagged to one zone
					const band = result.zoneBands.find((b) => b.zone === workout.zone);
					expect(band).toBeDefined();
					expect(band!.rangeLabel).toMatch(/\/km$/);
				}
			}
		});
	});

	describe('power modality', () => {
		it('returns out-of-range for an implausible power value', () => {
			expect(
				buildRacePrepResult(5, 1200, raceDate, today, 60, {
					modality: 'power',
					power: 10,
					device: 'stryd'
				})
			).toBe('out-of-range');
		});

		it('generates a plan with power zone bands and every workout tagged with its zone', () => {
			const result = buildRacePrepResult(5, 1200, raceDate, today, 60, POWER);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			expect(result.modality).toBe('power');
			expect(result.weeks).toHaveLength(4);
			for (const week of result.weeks) {
				expect(week.workouts.length).toBeGreaterThanOrEqual(3);
				for (const workout of week.workouts) {
					expect(workout.pattern).toBe('race-prep');
					expect(workout.zone).toBeDefined();
					const band = result.zoneBands.find((b) => b.zone === workout.zone);
					expect(band).toBeDefined();
					expect(band!.rangeLabel).toMatch(/W$/);
				}
			}
		});

		it('does not include a race-pace-tempo/reps slot (no pace->power conversion exists)', () => {
			const result = buildRacePrepResult(5, 1200, raceDate, today, 60, POWER);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			const allLabels = result.weeks.flatMap((w) => w.workouts.map((wk) => wk.label));
			expect(allLabels.some((l) => /race.?pace/i.test(l))).toBe(false);
		});
	});

	describe('hr modality', () => {
		it('returns out-of-range for an implausible LTHR value', () => {
			expect(
				buildRacePrepResult(5, 1200, raceDate, today, 60, { modality: 'hr', lthr: 1000 })
			).toBe('out-of-range');
		});

		it('generates a plan with HR zone bands and every workout tagged with its zone', () => {
			const result = buildRacePrepResult(5, 1200, raceDate, today, 60, HR);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			expect(result.modality).toBe('hr');
			expect(result.weeks).toHaveLength(4);
			for (const week of result.weeks) {
				expect(week.workouts.length).toBeGreaterThanOrEqual(3);
				for (const workout of week.workouts) {
					expect(workout.pattern).toBe('race-prep');
					expect(workout.zone).toBeDefined();
					const band = result.zoneBands.find((b) => b.zone === workout.zone);
					expect(band).toBeDefined();
					expect(band!.rangeLabel).toMatch(/bpm$/);
				}
			}
		});
	});
});
