import { describe, it, expect } from 'vitest';
import { buildHrWorkoutsResult } from './hr-workouts';
import { getTrainingPaces } from './training-paces';
import { roundToNearest5Seconds } from './workouts';

describe('buildHrWorkoutsResult', () => {
	it('should return null for missing inputs', () => {
		expect(buildHrWorkoutsResult(null, 60)).toBeNull();
		expect(buildHrWorkoutsResult(170, null)).toBeNull();
	});

	it('should return out-of-range for invalid LTHR', () => {
		expect(buildHrWorkoutsResult(99, 60)).toBe('out-of-range');
		expect(buildHrWorkoutsResult(201, 60)).toBe('out-of-range');
	});

	it('should return out-of-range for invalid mileage', () => {
		expect(buildHrWorkoutsResult(170, 0)).toBe('out-of-range');
		expect(buildHrWorkoutsResult(170, -10)).toBe('out-of-range');
	});

	it('should produce a result for valid inputs without trainingZones', () => {
		const result = buildHrWorkoutsResult(170, 60);
		expect(result).not.toBeNull();
		expect(result).not.toBe('out-of-range');
	});

	it('should set usedFallbackPace true when trainingZones is omitted', () => {
		const result = buildHrWorkoutsResult(170, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		expect(result.usedFallbackPace).toBe(true);
	});

	it('should set usedFallbackPace false when trainingZones is supplied', () => {
		const trainingZones = getTrainingPaces(50);
		const result = buildHrWorkoutsResult(170, 60, trainingZones);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		expect(result.usedFallbackPace).toBe(false);
	});

	it('should return zones in E/M/T/I/R order with confidence tiers from calculateDanielsLthrZones', () => {
		const result = buildHrWorkoutsResult(170, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		expect(result.zones.map((z) => z.zone)).toEqual(['E', 'M', 'T', 'I', 'R']);
		expect(result.zones[0].confidence).toBe('high'); // E
		expect(result.zones[2].confidence).toBe('medium'); // T
		expect(result.zones[3].confidence).toBe('low'); // I
	});

	it('should omit informational pace fields when trainingZones is not supplied', () => {
		const result = buildHrWorkoutsResult(170, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		for (const zone of result.zones) {
			expect(zone.informationalPaceLow).toBeUndefined();
			expect(zone.informationalPaceHigh).toBeUndefined();
		}
	});

	it('should populate informational pace fields when trainingZones is supplied', () => {
		const trainingZones = getTrainingPaces(50);
		const result = buildHrWorkoutsResult(170, 60, trainingZones);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		for (const zone of result.zones) {
			expect(zone.informationalPaceLow).toBeTruthy();
			expect(zone.informationalPaceHigh).toBeTruthy();
		}
	});

	it('should produce 15-17 total workouts across all zones, mirroring pace/power count', () => {
		const result = buildHrWorkoutsResult(170, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		const total = result.zones.reduce((sum, z) => sum + z.workouts.length, 0);
		expect(total).toBeGreaterThanOrEqual(15);
		expect(total).toBeLessThanOrEqual(17);
	});

	it('should produce at least 2 workouts for every zone', () => {
		const result = buildHrWorkoutsResult(170, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		for (const zone of result.zones) {
			expect(zone.workouts.length).toBeGreaterThanOrEqual(2);
		}
	});

	it('should produce rep-based workouts for I and R zones', () => {
		const result = buildHrWorkoutsResult(170, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		const iZone = result.zones.find((z) => z.zone === 'I')!;
		const rZone = result.zones.find((z) => z.zone === 'R')!;
		expect(iZone.workouts[0].description).toMatch(/\d+\s*[x×]/);
		expect(rZone.workouts[0].description).toMatch(/\d+\s*[x×]/);
	});

	it('should describe I/R zone workouts as HR-prescribed with pace informational only', () => {
		const trainingZones = getTrainingPaces(50);
		const result = buildHrWorkoutsResult(170, 60, trainingZones);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		const iZone = result.zones.find((z) => z.zone === 'I')!;
		const rZone = result.zones.find((z) => z.zone === 'R')!;
		// HR primary: description should reference bpm, not pace
		for (const zone of [iZone, rZone]) {
			for (const workout of zone.workouts) {
				expect(workout.description).toMatch(/bpm/);
			}
			// Pace is informational at the zone level only, not baked into the prescription
			expect(zone.informationalPaceLow).toBeTruthy();
		}
	});

	it('every workout estimatedDurationMinutes equals the sum of its segments', () => {
		const trainingZones = getTrainingPaces(50);
		for (const zones of [undefined, trainingZones]) {
			const result = buildHrWorkoutsResult(170, 60, zones);
			if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
			for (const zone of result.zones) {
				for (const workout of zone.workouts) {
					const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
					// Segments are individually rounded to the nearest 5s after estimatedDurationMinutes
					// is computed from their pre-rounding sum, so allow for that rounding drift.
					expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
				}
			}
		}
	});

	it('every segment duration is rounded to the nearest 5 seconds', () => {
		const trainingZones = getTrainingPaces(50);
		for (const zones of [undefined, trainingZones]) {
			for (const mileage of [10, 40, 80, 150]) {
				const result = buildHrWorkoutsResult(170, mileage, zones);
				if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
				for (const zone of result.zones) {
					for (const workout of zone.workouts) {
						for (const segment of workout.segments) {
							expect(segment.durationMinutes).toBeCloseTo(
								roundToNearest5Seconds(segment.durationMinutes),
								6
							);
						}
					}
				}
			}
		}
	});

	it('should include the zone bpm range in each zone workout description', () => {
		const result = buildHrWorkoutsResult(170, 60);
		if (result === null || result === 'out-of-range') throw new Error('unexpected sentinel');
		for (const zone of result.zones) {
			for (const workout of zone.workouts) {
				expect(workout.description).toMatch(/bpm/);
			}
		}
	});
});
