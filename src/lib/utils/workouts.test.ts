import { describe, it, expect } from 'vitest';
import {
	computeZoneVolumeKm,
	computeELongRunVolumeKm,
	buildZoneWorkouts,
	buildWorkoutsResult,
	WARMUP_COOLDOWN_MINUTES
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

	it('buildZoneWorkouts_EveryWorkout_IncludesWarmupCooldownInDuration', () => {
		for (const zone of ['E', 'M', 'T', 'I', 'R'] as const) {
			const workouts = buildZoneWorkouts(zone, VDOT_40_ZONES, 80);
			for (const w of workouts) {
				expect(w.estimatedDurationMinutes).toBeGreaterThanOrEqual(WARMUP_COOLDOWN_MINUTES);
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
