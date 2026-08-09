import { describe, it, expect } from 'vitest';
import {
	estimatePaceFromPower,
	computePowerZoneVolumeDurationMinutes,
	computePowerRepDurationMinutes,
	buildPowerRepsWorkout,
	buildPowerContinuousWorkout,
	buildPowerZoneWorkouts,
	buildPowerWorkoutsResult,
	mapPowerZoneToTrainingZone
} from './power-workouts';
import { calculatePowerZones, type PowerMeterDevice } from './power-zones';
import { computeZoneVolumeKm, computeWarmupMinutes, computeCooldownMinutes } from './workouts';
import { parsePace } from './pace';

describe('estimatePaceFromPower', () => {
	it('should return plausible pace for typical power values', () => {
		// Stryd/Garmin users: 250W → ~4:15 pace (rough estimate)
		const pace250 = estimatePaceFromPower(250, 'stryd');
		expect(pace250).toBeGreaterThan(3.5); // faster than 3:30
		expect(pace250).toBeLessThan(5); // slower than 5:00
	});

	it('should scale pace with power', () => {
		const pace200 = estimatePaceFromPower(200, 'stryd');
		const pace250 = estimatePaceFromPower(250, 'stryd');
		const pace300 = estimatePaceFromPower(300, 'stryd');

		expect(pace200).toBeGreaterThan(pace250);
		expect(pace250).toBeGreaterThan(pace300);
	});

	it('should handle edge cases', () => {
		// Very low power
		const paceLow = estimatePaceFromPower(50, 'stryd');
		expect(paceLow).toBeGreaterThan(0);

		// Very high power
		const paceHigh = estimatePaceFromPower(700, 'stryd');
		expect(paceHigh).toBeGreaterThan(0);
	});
});

describe('computePowerZoneVolumeDurationMinutes', () => {
	it('should return valid duration for E zone', () => {
		const duration = computePowerZoneVolumeDurationMinutes('E', 60, 4.25);
		expect(duration).toBeGreaterThan(0);
		expect(duration).toBeGreaterThan(30); // E duration min
		expect(duration).toBeLessThan(150); // E duration max
	});

	it('should produce similar duration to pace-mode for same mileage', () => {
		// Use a known pace: 4:15 min/km
		const weeklyMileage = 60;
		const ePace = parsePace('4:15')!;

		// Pace mode: compute volume in km, convert to minutes
		const paceVolume = computeZoneVolumeKm('E', weeklyMileage, ePace);
		const paceDuration = paceVolume * ePace;

		// Power mode: should produce similar duration
		const powerDuration = computePowerZoneVolumeDurationMinutes('E', weeklyMileage, ePace);

		// Allow 5% variance
		const variance = Math.abs(powerDuration - paceDuration) / paceDuration;
		expect(variance).toBeLessThan(0.05);
	});

	it('should scale with weekly mileage', () => {
		const pace = 4.25;
		const dur60 = computePowerZoneVolumeDurationMinutes('M', 60, pace);
		const dur80 = computePowerZoneVolumeDurationMinutes('M', 80, pace);

		expect(dur80).toBeGreaterThan(dur60);
	});

	it('should respect duration caps for E zone', () => {
		const pace = 4.25;
		// Very low mileage
		const durLow = computePowerZoneVolumeDurationMinutes('E', 10, pace);
		expect(durLow).toBeGreaterThanOrEqual(30); // E_DURATION_MIN_MINUTES

		// Very high mileage
		const durHigh = computePowerZoneVolumeDurationMinutes('E', 150, pace);
		expect(durHigh).toBeLessThanOrEqual(150); // E_DURATION_MAX_MINUTES
	});

	it('should work for all zones', () => {
		const zones = ['E', 'M', 'T', 'I', 'R'] as const;
		const pace = 4.25;

		zones.forEach((zone) => {
			const duration = computePowerZoneVolumeDurationMinutes(zone, 60, pace);
			expect(duration).toBeGreaterThan(0);
		});
	});
});

describe('computePowerRepDurationMinutes', () => {
	it('should return valid rep duration for I zone', () => {
		const duration = computePowerRepDurationMinutes('I', 250, 60);
		expect(duration).toBeGreaterThan(0);
		expect(duration).toBeLessThan(10); // I reps typically 3-8 min
	});

	it('should return valid rep duration for R zone', () => {
		const duration = computePowerRepDurationMinutes('R', 250, 60);
		expect(duration).toBeGreaterThan(0);
		expect(duration).toBeLessThan(2); // R reps typically 30-90 sec
	});

	it('should scale with power', () => {
		const dur200 = computePowerRepDurationMinutes('I', 200, 60);
		const dur250 = computePowerRepDurationMinutes('I', 250, 60);

		// Higher power = shorter duration for same distance
		expect(dur250).toBeLessThan(dur200);
	});

	it('should scale with mileage', () => {
		const dur60 = computePowerRepDurationMinutes('I', 250, 60);
		const dur80 = computePowerRepDurationMinutes('I', 250, 80);

		// Higher mileage = more volume = longer (or more) reps
		expect(dur80).toBeGreaterThanOrEqual(dur60);
	});
});

describe('buildPowerContinuousWorkout', () => {
	it('should create a continuous workout with valid structure', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const eZone = zones.find((z) => z.zone === 1)!; // Easy

		const workout = buildPowerContinuousWorkout('E', eZone, 60, 250, 'stryd');

		expect(workout.label).toBeDefined();
		expect(workout.description).toContain('continuous');
		expect(workout.estimatedDurationMinutes).toBeGreaterThan(0);
		expect(workout.segments.length).toBeGreaterThan(0);
		expect(workout.recovery).toBe('None (continuous)');
	});

	it('should include warmup and cooldown segments', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const tZone = zones.find((z) => z.zone === 3)!; // Threshold

		const workout = buildPowerContinuousWorkout('T', tZone, 60, 250, 'stryd');

		const warmupCount = workout.segments.filter((s) => s.type === 'warmup').length;
		const cooldownCount = workout.segments.filter((s) => s.type === 'cooldown').length;

		expect(warmupCount).toBe(1);
		expect(cooldownCount).toBe(1);
	});

	it('should include power range in description', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const mZone = zones.find((z) => z.zone === 2)!; // Moderate

		const workout = buildPowerContinuousWorkout('M', mZone, 60, 250, 'stryd');

		expect(workout.description).toMatch(/\d+.*\d+\s*W/); // Power range
	});

	it('should sum segment durations to total', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const eZone = zones.find((z) => z.zone === 1)!;

		const workout = buildPowerContinuousWorkout('E', eZone, 60, 250, 'stryd');

		const sumSegments = workout.segments.reduce((sum, s) => sum + s.durationMinutes, 0);
		expect(Math.abs(sumSegments - workout.estimatedDurationMinutes)).toBeLessThan(1); // rounding tolerance
	});
});

describe('buildPowerRepsWorkout', () => {
	it('should create a reps workout with valid structure', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const iZone = zones.find((z) => z.zone === 4)!; // Interval

		const workout = buildPowerRepsWorkout('I', iZone, 60, 250, 'stryd');

		expect(workout.label).toBeDefined();
		expect(workout.description).toMatch(/\d+\s*[x×]\s*[\d:]/); // "5 × 3:30"
		expect(workout.estimatedDurationMinutes).toBeGreaterThan(0);
		expect(workout.segments.length).toBeGreaterThan(0);
		expect(workout.recovery).toBeDefined();
	});

	it('should include reps and recovery in description', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const rZone = zones.find((z) => z.zone === 5)!; // Repetition

		const workout = buildPowerRepsWorkout('R', rZone, 60, 250, 'stryd');

		expect(workout.description).toMatch(/\d+\s*[x×]/); // rep count
		expect(workout.description).toMatch(/recovery/i);
	});

	it('should handle minimum rep count', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const iZone = zones.find((z) => z.zone === 4)!;

		// Very low mileage should still produce minimum reps
		const workout = buildPowerRepsWorkout('I', iZone, 5, 250, 'stryd');

		expect(workout.description).toMatch(/[3-9]\s*[x×]/); // At least 3 reps
	});

	it('should include warmup and cooldown', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const iZone = zones.find((z) => z.zone === 4)!;

		const workout = buildPowerRepsWorkout('I', iZone, 60, 250, 'stryd');

		const warmupCount = workout.segments.filter((s) => s.type === 'warmup').length;
		const cooldownCount = workout.segments.filter((s) => s.type === 'cooldown').length;

		expect(warmupCount).toBe(1);
		expect(cooldownCount).toBe(1);
	});
});

describe('buildPowerZoneWorkouts', () => {
	it('should create two workout variants per zone', () => {
		const zones = calculatePowerZones(250, 'stryd')!;

		zones.forEach((zone) => {
			const workouts = buildPowerZoneWorkouts('E' as any, zones, 60, 250, 'stryd');
			expect(workouts.length).toBeGreaterThanOrEqual(2);
			expect(workouts[0]).toBeDefined();
		});
	});

	it('should produce continuous workout for E zone', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const workouts = buildPowerZoneWorkouts('E', zones, 60, 250, 'stryd');

		expect(workouts.length).toBeGreaterThanOrEqual(2);
		expect(workouts[0].description).toContain('continuous');
	});

	it('should produce rep-based workouts for I zone', () => {
		const zones = calculatePowerZones(250, 'stryd')!;
		const workouts = buildPowerZoneWorkouts('I', zones, 60, 250, 'stryd');

		expect(workouts.length).toBeGreaterThanOrEqual(3);
		// First 3 should be rep-based (short, medium, long intervals)
		for (let i = 0; i < 3; i++) {
			expect(workouts[i].description).toMatch(/\d+\s*[x×]/);
		}
	});
});

describe('buildPowerWorkoutsResult', () => {
	it('should return null for missing inputs', () => {
		const result = buildPowerWorkoutsResult(null, 'stryd', null);
		expect(result).toBeNull();
	});

	it('should return out-of-range for invalid power', () => {
		const result = buildPowerWorkoutsResult(49, 'stryd', 60);
		expect(result).toBe('out-of-range');

		const result2 = buildPowerWorkoutsResult(701, 'stryd', 60);
		expect(result2).toBe('out-of-range');
	});

	it('should return out-of-range for invalid mileage', () => {
		const result = buildPowerWorkoutsResult(250, 'stryd', 0);
		expect(result).toBe('out-of-range');

		const result2 = buildPowerWorkoutsResult(250, 'stryd', -10);
		expect(result2).toBe('out-of-range');
	});

	it('should produce PowerWorkoutsResult for valid inputs', () => {
		const result = buildPowerWorkoutsResult(250, 'stryd', 60);

		expect(result).not.toBeNull();
		expect(result).not.toBe('out-of-range');
		if (result && result !== 'out-of-range' && result !== null) {
			expect(result.power).toBe(250);
			expect(result.device).toBe('stryd');
			expect(result.zones).toHaveLength(5);
		}
	});

	it('should include all 5 zones for Stryd', () => {
		const result = buildPowerWorkoutsResult(250, 'stryd', 60);

		if (result && result !== 'out-of-range' && result !== null) {
			const zoneLetters = result.zones.map((z) => z.zone).sort();
			expect(zoneLetters).toEqual(['E', 'I', 'M', 'R', 'T']); // sorted order
		}
	});

	it('should include multiple workouts per zone', () => {
		const result = buildPowerWorkoutsResult(250, 'stryd', 60);

		if (result && result !== 'out-of-range' && result !== null) {
			result.zones.forEach((zone) => {
				expect(zone.workouts.length).toBeGreaterThanOrEqual(2);
				// I and R zones should have 4, others should have 3
				if (zone.zone === 'I' || zone.zone === 'R') {
					expect(zone.workouts.length).toBe(4);
				} else {
					expect(zone.workouts.length).toBe(3);
				}
			});
		}
	});

	it('should work for different devices', () => {
		const devices: PowerMeterDevice[] = ['stryd', 'garmin', 'coros'];

		devices.forEach((device) => {
			const result = buildPowerWorkoutsResult(250, device, 60);
			expect(result).not.toBeNull();
			expect(result).not.toBe('out-of-range');
		});
	});
});

describe('mapPowerZoneToTrainingZone', () => {
	it('should map Stryd zones correctly', () => {
		expect(mapPowerZoneToTrainingZone(1, 'stryd')).toBe('E');
		expect(mapPowerZoneToTrainingZone(2, 'stryd')).toBe('M');
		expect(mapPowerZoneToTrainingZone(3, 'stryd')).toBe('T');
		expect(mapPowerZoneToTrainingZone(4, 'stryd')).toBe('I');
		expect(mapPowerZoneToTrainingZone(5, 'stryd')).toBe('R');
	});

	it('should map Garmin zones correctly', () => {
		expect(mapPowerZoneToTrainingZone(1, 'garmin')).toBe('E');
		expect(mapPowerZoneToTrainingZone(2, 'garmin')).toBe('M');
		expect(mapPowerZoneToTrainingZone(3, 'garmin')).toBe('T');
		expect(mapPowerZoneToTrainingZone(4, 'garmin')).toBe('I');
		expect(mapPowerZoneToTrainingZone(5, 'garmin')).toBe('R');
	});

	it('should map COROS zones correctly (7-zone compression)', () => {
		expect(mapPowerZoneToTrainingZone(1, 'coros')).toBe('E');
		expect(mapPowerZoneToTrainingZone(2, 'coros')).toBe('E');
		expect(mapPowerZoneToTrainingZone(3, 'coros')).toBe('M');
		expect(mapPowerZoneToTrainingZone(4, 'coros')).toBe('T');
		expect(mapPowerZoneToTrainingZone(5, 'coros')).toBe('I');
		expect(mapPowerZoneToTrainingZone(6, 'coros')).toBe('I');
		expect(mapPowerZoneToTrainingZone(7, 'coros')).toBe('R');
	});

	it('should map Polar zones correctly', () => {
		expect(mapPowerZoneToTrainingZone(1, 'polar')).toBe('E');
		expect(mapPowerZoneToTrainingZone(2, 'polar')).toBe('M');
		expect(mapPowerZoneToTrainingZone(3, 'polar')).toBe('T');
		expect(mapPowerZoneToTrainingZone(4, 'polar')).toBe('I');
		expect(mapPowerZoneToTrainingZone(5, 'polar')).toBe('R');
	});
});
