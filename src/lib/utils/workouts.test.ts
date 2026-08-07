import { describe, it, expect } from 'vitest';
import {
	computeZoneVolumeKm,
	computeELongRunVolumeKm,
	buildZoneWorkouts,
	buildWorkoutsResult,
	computeWarmupCooldownMinutes,
	WARMUP_COOLDOWN_BAND
} from './workouts';
import { getTrainingPaces } from './training-paces';

const VDOT_40_ZONES = getTrainingPaces(40);

describe('computeZoneVolumeKm', () => {
	it('computeZoneVolumeKm_EZone_UsesPercentageShare', () => {
		const zones = getTrainingPaces(40);
		const ePace = parsePace(zones[0]);
		const km = computeZoneVolumeKm('E', 100, ePace);
		// 100 * 0.275 = 27.5km, unless duration clamp kicks in
		const duration = km * ePace;
		expect(duration).toBeGreaterThanOrEqual(30);
		expect(duration).toBeLessThanOrEqual(150);
	});

	it('computeZoneVolumeKm_EZone_ClampsDurationTo150MinAtHighMileage', () => {
		const zones = getTrainingPaces(40);
		const ePace = parsePace(zones[0]);
		const km = computeZoneVolumeKm('E', 300, ePace);
		const duration = km * ePace;
		expect(duration).toBeCloseTo(150, 1);
	});

	it('computeZoneVolumeKm_EZone_ClampsDurationTo30MinAtLowMileage', () => {
		const zones = getTrainingPaces(40);
		const ePace = parsePace(zones[0]);
		const km = computeZoneVolumeKm('E', 5, ePace);
		const duration = km * ePace;
		expect(duration).toBeCloseTo(30, 1);
	});

	it('computeZoneVolumeKm_MZone_UsesPercentageShareBelowCap', () => {
		const zones = getTrainingPaces(40);
		const mPace = parsePace(zones[1]);
		const km = computeZoneVolumeKm('M', 100, mPace);
		expect(km).toBeCloseTo(100 * 0.175, 5);
	});

	it('computeZoneVolumeKm_MZone_CapsAt29kmForHighMileage', () => {
		const zones = getTrainingPaces(40);
		const mPace = parsePace(zones[1]);
		const km = computeZoneVolumeKm('M', 1000, mPace);
		// 1000 * 0.175 = 175km, way above the 29km / 110min caps
		expect(km).toBeLessThanOrEqual(29);
	});

	it('computeZoneVolumeKm_TZone_UsesPercentageShareUncapped', () => {
		const zones = getTrainingPaces(40);
		const tPace = parsePace(zones[2]);
		const km = computeZoneVolumeKm('T', 80, tPace);
		expect(km).toBeCloseTo(80 * 0.1, 5);
	});

	it('computeZoneVolumeKm_IZone_UsesPercentageShareBelowCap', () => {
		const zones = getTrainingPaces(40);
		const iPace = parsePace(zones[3]);
		const km = computeZoneVolumeKm('I', 60, iPace);
		expect(km).toBeCloseTo(60 * 0.08, 5);
	});

	it('computeZoneVolumeKm_IZone_CapsAt10kmForHighMileage', () => {
		const zones = getTrainingPaces(40);
		const iPace = parsePace(zones[3]);
		const km = computeZoneVolumeKm('I', 300, iPace);
		expect(km).toBe(10);
	});

	it('computeZoneVolumeKm_RZone_UsesPercentageShareBelowCap', () => {
		const zones = getTrainingPaces(40);
		const rPace = parsePace(zones[4]);
		const km = computeZoneVolumeKm('R', 60, rPace);
		expect(km).toBeCloseTo(60 * 0.05, 5);
	});

	it('computeZoneVolumeKm_RZone_CapsAt8kmForHighMileage', () => {
		const zones = getTrainingPaces(40);
		const rPace = parsePace(zones[4]);
		const km = computeZoneVolumeKm('R', 300, rPace);
		expect(km).toBe(8);
	});
});

describe('computeELongRunVolumeKm', () => {
	it('computeELongRunVolumeKm_Under64kmWeek_Uses30PercentShare', () => {
		const ePace = parsePace(VDOT_40_ZONES[0]);
		const km = computeELongRunVolumeKm(50, ePace);
		expect(km).toBeCloseTo(50 * 0.3, 5);
	});

	it('computeELongRunVolumeKm_AtOrOver64kmWeek_Uses25PercentShare', () => {
		const ePace = parsePace(VDOT_40_ZONES[0]);
		const km = computeELongRunVolumeKm(64, ePace);
		expect(km).toBeCloseTo(64 * 0.25, 5);
	});

	it('computeELongRunVolumeKm_HighMileage_CapsDurationAt150Min', () => {
		const ePace = parsePace(VDOT_40_ZONES[0]);
		const km = computeELongRunVolumeKm(200, ePace);
		const duration = km * ePace;
		expect(duration).toBeCloseTo(150, 1);
	});
});

describe('buildZoneWorkouts', () => {
	it('buildZoneWorkouts_EZone_ReturnsRegularAndLongRun', () => {
		const [regular, long] = buildZoneWorkouts('E', VDOT_40_ZONES, 80);
		expect(regular.label).toMatch(/regular/i);
		expect(long.label).toMatch(/long/i);
	});

	it('buildZoneWorkouts_EveryZone_ReturnsExactly2Workouts', () => {
		for (const zone of ['E', 'M', 'T', 'I', 'R'] as const) {
			const workouts = buildZoneWorkouts(zone, VDOT_40_ZONES, 80);
			expect(workouts).toHaveLength(2);
		}
	});

	it('buildZoneWorkouts_EveryWorkout_IncludesAtLeastItsZonesMinWarmupCooldownInDuration', () => {
		for (const zone of ['E', 'M', 'T', 'I', 'R'] as const) {
			const workouts = buildZoneWorkouts(zone, VDOT_40_ZONES, 80);
			const { min } = WARMUP_COOLDOWN_BAND[zone];
			for (const w of workouts) {
				expect(w.estimatedDurationMinutes).toBeGreaterThanOrEqual(min * 2);
			}
		}
	});

	it('buildZoneWorkouts_IZone_UsesTwoDifferentRepDistances', () => {
		const [a, b] = buildZoneWorkouts('I', VDOT_40_ZONES, 80);
		expect(a.label).not.toBe(b.label);
		expect(a.label).toMatch(/1000m/);
		expect(b.label).toMatch(/1200m/);
	});

	it('buildZoneWorkouts_RZone_UsesTwoDifferentRepDistances', () => {
		const [a, b] = buildZoneWorkouts('R', VDOT_40_ZONES, 80);
		expect(a.label).toMatch(/200m/);
		expect(b.label).toMatch(/400m/);
	});

	it('buildZoneWorkouts_IZone_NeverFewerThan3Reps', () => {
		// Very low mileage → tiny computed volume, should still fall back to >= 3 reps
		const [a, b] = buildZoneWorkouts('I', VDOT_40_ZONES, 5);
		const repsA = parseInt(a.description.split(' x ')[0], 10);
		const repsB = parseInt(b.description.split(' x ')[0], 10);
		expect(repsA).toBeGreaterThanOrEqual(3);
		expect(repsB).toBeGreaterThanOrEqual(3);
	});

	it('buildZoneWorkouts_RZone_NeverFewerThan3Reps', () => {
		const [a, b] = buildZoneWorkouts('R', VDOT_40_ZONES, 5);
		const repsA = parseInt(a.description.split(' x ')[0], 10);
		const repsB = parseInt(b.description.split(' x ')[0], 10);
		expect(repsA).toBeGreaterThanOrEqual(3);
		expect(repsB).toBeGreaterThanOrEqual(3);
	});

	it('buildZoneWorkouts_IZone_LowMileage_StillReturnsTwoDistinctLabels', () => {
		// Regression: at low weekly mileage the computed I volume is too small to reach 3 reps
		// at either 1000m or 1200m, which previously made both workouts fall back to the same
		// (smaller) distance — an identical label/description pair, which crashed the /workouts
		// page's keyed {#each} with a duplicate-key runtime error. 10km/week reproduces it.
		const [a, b] = buildZoneWorkouts('I', VDOT_40_ZONES, 10);
		expect(a.label).not.toBe(b.label);
		expect(a.label + a.description).not.toBe(b.label + b.description);
	});

	it('buildZoneWorkouts_RZone_LowMileage_StillReturnsTwoDistinctLabels', () => {
		const [a, b] = buildZoneWorkouts('R', VDOT_40_ZONES, 10);
		expect(a.label).not.toBe(b.label);
		expect(a.label + a.description).not.toBe(b.label + b.description);
	});

	it('buildZoneWorkouts_MZone_ReturnsContinuousAndSegmented', () => {
		const [continuous, segmented] = buildZoneWorkouts('M', VDOT_40_ZONES, 100);
		expect(continuous.recovery).toBe('None (continuous)');
		expect(segmented.recovery).toMatch(/jog/);
	});

	it('buildZoneWorkouts_TZone_ReturnsContinuousAndCruiseIntervals', () => {
		const [continuous, cruise] = buildZoneWorkouts('T', VDOT_40_ZONES, 80);
		expect(continuous.recovery).toBe('None (continuous)');
		expect(cruise.description).toMatch(/x/);
	});
});

describe('computeWarmupCooldownMinutes', () => {
	it.each(['E', 'M', 'T', 'I', 'R'] as const)(
		'%sZone_AtZeroQualityMinutes_ReturnsBandMin',
		(zone) => {
			expect(computeWarmupCooldownMinutes(zone, 0)).toBe(WARMUP_COOLDOWN_BAND[zone].min);
		}
	);

	it.each(['E', 'M', 'T', 'I', 'R'] as const)(
		'%sZone_AtOrAbove60QualityMinutes_ReturnsBandMax',
		(zone) => {
			expect(computeWarmupCooldownMinutes(zone, 60)).toBe(WARMUP_COOLDOWN_BAND[zone].max);
			expect(computeWarmupCooldownMinutes(zone, 200)).toBe(WARMUP_COOLDOWN_BAND[zone].max);
		}
	);

	it.each(['E', 'M', 'T', 'I', 'R'] as const)(
		'%sZone_AtNegativeQualityMinutes_ClampsToBandMin',
		(zone) => {
			expect(computeWarmupCooldownMinutes(zone, -10)).toBe(WARMUP_COOLDOWN_BAND[zone].min);
		}
	);

	it('EZone_At30QualityMinutes_ReturnsMidpointOfBand', () => {
		// t = 30/60 = 0.5 → 5 + 0.5*(10-5) = 7.5 → rounds to 8
		expect(computeWarmupCooldownMinutes('E', 30)).toBe(8);
	});

	it('RZone_At30QualityMinutes_ReturnsMidpointOfBand', () => {
		// t = 30/60 = 0.5 → 12 + 0.5*(16-12) = 14
		expect(computeWarmupCooldownMinutes('R', 30)).toBe(14);
	});

	it('IZone_ReturnsLongerWarmupThanEZone_AtSameQualityMinutes', () => {
		// I/R sessions get a longer warm-up band than E/M, per the design's
		// "harder efforts need more build-up" decision.
		expect(computeWarmupCooldownMinutes('I', 20)).toBeGreaterThan(
			computeWarmupCooldownMinutes('E', 20)
		);
	});
});

describe('workout segments', () => {
	it('everyWorkout_segments_startWithWarmupAndEndWithCooldown', () => {
		for (const zone of ['E', 'M', 'T', 'I', 'R'] as const) {
			for (const workout of buildZoneWorkouts(zone, VDOT_40_ZONES, 80)) {
				expect(workout.segments[0].type).toBe('warmup');
				expect(workout.segments[workout.segments.length - 1].type).toBe('cooldown');
			}
		}
	});

	it('everyWorkout_segmentDurations_sumToEstimatedDuration', () => {
		for (const zone of ['E', 'M', 'T', 'I', 'R'] as const) {
			for (const workout of buildZoneWorkouts(zone, VDOT_40_ZONES, 80)) {
				const total = workout.segments.reduce((sum, s) => sum + s.durationMinutes, 0);
				expect(total).toBeCloseTo(workout.estimatedDurationMinutes, 0);
			}
		}
	});

	it('everyWorkout_segments_haveIntensityBetween0And1', () => {
		for (const zone of ['E', 'M', 'T', 'I', 'R'] as const) {
			for (const workout of buildZoneWorkouts(zone, VDOT_40_ZONES, 80)) {
				for (const segment of workout.segments) {
					expect(segment.intensity).toBeGreaterThan(0);
					expect(segment.intensity).toBeLessThanOrEqual(1);
				}
			}
		}
	});

	it('continuousWorkouts_haveExactlyOneWorkSegment', () => {
		const [eRegular] = buildZoneWorkouts('E', VDOT_40_ZONES, 80);
		expect(eRegular.segments.filter((s) => s.type === 'work')).toHaveLength(1);

		const [mContinuous] = buildZoneWorkouts('M', VDOT_40_ZONES, 80);
		expect(mContinuous.segments.filter((s) => s.type === 'work')).toHaveLength(1);

		const [tContinuous] = buildZoneWorkouts('T', VDOT_40_ZONES, 80);
		expect(tContinuous.segments.filter((s) => s.type === 'work')).toHaveLength(1);
	});

	it('mSegmentedWorkout_hasTwoWorkSegmentsAndOneRecovery', () => {
		const [, segmented] = buildZoneWorkouts('M', VDOT_40_ZONES, 80);
		expect(segmented.segments.filter((s) => s.type === 'work')).toHaveLength(2);
		expect(segmented.segments.filter((s) => s.type === 'recovery')).toHaveLength(1);
	});

	it('repsWorkout_workSegmentCount_matchesRepsInDescription', () => {
		const [a] = buildZoneWorkouts('I', VDOT_40_ZONES, 80);
		const reps = parseInt(a.description.split(' x ')[0], 10);
		const workSegments = a.segments.filter((s) => s.type === 'work');
		const recoverySegments = a.segments.filter((s) => s.type === 'recovery');
		expect(workSegments).toHaveLength(reps);
		expect(recoverySegments).toHaveLength(reps - 1);
	});

	it('rZoneWorkSegments_haveHigherIntensityThanEZoneWorkSegments', () => {
		const [eRegular] = buildZoneWorkouts('E', VDOT_40_ZONES, 80);
		const [rA] = buildZoneWorkouts('R', VDOT_40_ZONES, 80);
		const eWork = eRegular.segments.find((s) => s.type === 'work')!;
		const rWork = rA.segments.find((s) => s.type === 'work')!;
		expect(rWork.intensity).toBeGreaterThan(eWork.intensity);
	});

	it('everyWorkout_warmupDuration_equalsCooldownDuration', () => {
		for (const zone of ['E', 'M', 'T', 'I', 'R'] as const) {
			for (const workout of buildZoneWorkouts(zone, VDOT_40_ZONES, 80)) {
				const warmup = workout.segments[0];
				const cooldown = workout.segments[workout.segments.length - 1];
				expect(warmup.durationMinutes).toBe(cooldown.durationMinutes);
			}
		}
	});

	it('shortRZoneWorkout_atLowMileage_fitsUnderThirtyMinutesTotal', () => {
		// Regression target from the PR #90 review: under the old flat +20min rule, every zone
		// showed "none fit" for the "Under 30 min" filter at realistic mileage. A short R-zone
		// session's own warm-up/cool-down should now be small enough (near its zone's band
		// minimum) that a genuinely short session can fit under 30 minutes total.
		const [rA] = buildZoneWorkouts('R', VDOT_40_ZONES, 10);
		expect(rA.estimatedDurationMinutes).toBeLessThan(30);
	});
});

describe('buildWorkoutsResult', () => {
	it('buildWorkoutsResult_ValidInput_ReturnsResult', () => {
		const result = buildWorkoutsResult(5, 1500, 80);
		expect(result).not.toBeNull();
		expect(result).not.toBe('out-of-range');
	});

	it('buildWorkoutsResult_ValidInput_Returns5ZonesWith2WorkoutsEach', () => {
		const result = buildWorkoutsResult(5, 1500, 80) as { zones: { workouts: unknown[] }[] };
		expect(result.zones).toHaveLength(5);
		for (const zone of result.zones) {
			expect(zone.workouts).toHaveLength(2);
		}
	});

	it('buildWorkoutsResult_ZeroDistance_ReturnsNull', () => {
		expect(buildWorkoutsResult(0, 1500, 80)).toBeNull();
	});

	it('buildWorkoutsResult_ZeroTime_ReturnsNull', () => {
		expect(buildWorkoutsResult(5, 0, 80)).toBeNull();
	});

	it('buildWorkoutsResult_ZeroWeeklyMileage_ReturnsNull', () => {
		expect(buildWorkoutsResult(5, 1500, 0)).toBeNull();
	});

	it('buildWorkoutsResult_NegativeWeeklyMileage_ReturnsNull', () => {
		expect(buildWorkoutsResult(5, 1500, -10)).toBeNull();
	});

	it('buildWorkoutsResult_VerySlowTime_ReturnsOutOfRange', () => {
		expect(buildWorkoutsResult(5, 80 * 60, 80)).toBe('out-of-range');
	});

	it('buildWorkoutsResult_VeryFastTime_ReturnsOutOfRange', () => {
		expect(buildWorkoutsResult(5, 600, 80)).toBe('out-of-range');
	});

	it('buildWorkoutsResult_EZoneWorkouts_LabelledRegularAndLongRun', () => {
		const result = buildWorkoutsResult(5, 1500, 80) as {
			zones: { zone: string; workouts: { label: string }[] }[];
		};
		const eZone = result.zones.find((z) => z.zone === 'E')!;
		expect(eZone.workouts[0].label).toMatch(/regular/i);
		expect(eZone.workouts[1].label).toMatch(/long/i);
	});

	it('buildWorkoutsResult_EZonePace_MatchesFullRangeFromTrainingPaces', () => {
		const result = buildWorkoutsResult(5, 1500, 80) as {
			vdot: number;
			zones: { zone: string; paceMinKmLow: string; paceMinKmHigh: string }[];
		};
		const eZone = result.zones.find((z) => z.zone === 'E')!;
		const trainingPacesZones = getTrainingPaces(result.vdot);
		const expectedE = trainingPacesZones.find((z) => z.zone === 'E')!;
		expect(eZone.paceMinKmLow).toBe(expectedE.paceMinKmLow);
		expect(eZone.paceMinKmHigh).toBe(expectedE.paceMinKmHigh);
	});
});

/** Helper: parse a zone's midpoint pace decimal min/km from its formatted low/high strings. */
function parsePace(zone: { paceMinKmLow: string; paceMinKmHigh: string }): number {
	const toDecimal = (formatted: string) => {
		const [min, sec] = formatted.split(':').map(Number);
		return min + sec / 60;
	};
	return (toDecimal(zone.paceMinKmLow) + toDecimal(zone.paceMinKmHigh)) / 2;
}
