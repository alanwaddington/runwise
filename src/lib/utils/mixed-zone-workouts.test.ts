import { describe, it, expect } from 'vitest';
import { buildMixedZoneWorkouts, type MixedZonePairKey } from './mixed-zone-workouts';
import { getTrainingPaces } from './training-paces';
import { roundToNearest5Seconds } from './workouts';

const trainingZones = getTrainingPaces(50);
const PAIR_KEYS: MixedZonePairKey[] = ['E+M', 'M+T', 'T+I'];

describe('buildMixedZoneWorkouts', () => {
	it('should support at least 3 mixed-zone combinations', () => {
		expect(PAIR_KEYS.length).toBeGreaterThanOrEqual(3);
		for (const pairKey of PAIR_KEYS) {
			const workouts = buildMixedZoneWorkouts(pairKey, trainingZones, 60);
			expect(workouts.length).toBeGreaterThanOrEqual(1);
		}
	});

	it('should tag every workout as pattern mixed-zone', () => {
		for (const pairKey of PAIR_KEYS) {
			const workouts = buildMixedZoneWorkouts(pairKey, trainingZones, 60);
			for (const workout of workouts) {
				expect(workout.pattern).toBe('mixed-zone');
			}
		}
	});

	it('should label each pair clearly with both zones', () => {
		const [em] = buildMixedZoneWorkouts('E+M', trainingZones, 60);
		const [mt] = buildMixedZoneWorkouts('M+T', trainingZones, 60);
		const [ti] = buildMixedZoneWorkouts('T+I', trainingZones, 60);
		expect(em.label).toMatch(/E\+M/);
		expect(mt.label).toMatch(/M\+T/);
		expect(ti.label).toMatch(/T\+I/);
	});

	it('should explain purpose and intensity transition in the description', () => {
		for (const pairKey of PAIR_KEYS) {
			const [workout] = buildMixedZoneWorkouts(pairKey, trainingZones, 60);
			expect(workout.description.length).toBeGreaterThan(20);
		}
	});

	it('AC-6.1: E+M has an easy base (25-40min) with 2-3 marathon-pace bridges of 2-3km each', () => {
		const [workout] = buildMixedZoneWorkouts('E+M', trainingZones, 60);
		const workSegments = workout.segments.filter((s) => s.type === 'work');
		// base + bridge segments are all typed 'work' but distinguished by intensity
		const baseSegments = workSegments.filter((s) => s.intensity < 0.5);
		const bridgeSegments = workSegments.filter((s) => s.intensity >= 0.5);
		expect(bridgeSegments.length).toBeGreaterThanOrEqual(2);
		expect(bridgeSegments.length).toBeLessThanOrEqual(3);
		const baseTotalMinutes = baseSegments.reduce((s, seg) => s + seg.durationMinutes, 0);
		expect(baseTotalMinutes).toBeGreaterThanOrEqual(24);
		expect(baseTotalMinutes).toBeLessThanOrEqual(41);
	});

	it('AC-6.2: M+T has 2-3 threshold surges of 5-8min each', () => {
		const [workout] = buildMixedZoneWorkouts('M+T', trainingZones, 60);
		const surges = workout.segments.filter((s) => s.type === 'work' && s.intensity >= 0.65);
		expect(surges.length).toBeGreaterThanOrEqual(2);
		expect(surges.length).toBeLessThanOrEqual(3);
		for (const surge of surges) {
			expect(surge.durationMinutes).toBeGreaterThanOrEqual(5);
			expect(surge.durationMinutes).toBeLessThanOrEqual(8);
		}
	});

	it('AC-6.3: T+I has 2-3 threshold blocks of 8min with fast pickups of 30sec-1min', () => {
		const [workout] = buildMixedZoneWorkouts('T+I', trainingZones, 60);
		const blocks = workout.segments.filter((s) => s.type === 'work' && s.intensity < 0.8);
		const pickups = workout.segments.filter((s) => s.type === 'work' && s.intensity >= 0.8);
		expect(blocks.length).toBeGreaterThanOrEqual(2);
		expect(blocks.length).toBeLessThanOrEqual(3);
		for (const block of blocks) {
			expect(block.durationMinutes).toBeCloseTo(8, 0);
		}
		expect(pickups.length).toBeGreaterThanOrEqual(2);
		for (const pickup of pickups) {
			expect(pickup.durationMinutes).toBeGreaterThanOrEqual(0.5);
			expect(pickup.durationMinutes).toBeLessThanOrEqual(1);
		}
	});

	it('AC-6.4: intensity mapping is valid — surge/pickup work segments are always higher intensity than the base', () => {
		for (const pairKey of PAIR_KEYS) {
			const [workout] = buildMixedZoneWorkouts(pairKey, trainingZones, 60);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			const intensities = [...new Set(workSegments.map((s) => s.intensity))].sort((a, b) => a - b);
			// exactly two distinct work intensities (base, surge) and base < surge — no inversion
			expect(intensities.length).toBe(2);
			expect(intensities[0]).toBeLessThan(intensities[1]);
		}
	});

	it('estimatedDurationMinutes should equal the sum of segments for every pair', () => {
		for (const pairKey of PAIR_KEYS) {
			const [workout] = buildMixedZoneWorkouts(pairKey, trainingZones, 60);
			const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
			expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
		}
	});

	it('every segment duration is rounded to the nearest 5 seconds', () => {
		for (const pairKey of PAIR_KEYS) {
			for (const mileage of [10, 40, 80, 150]) {
				const [workout] = buildMixedZoneWorkouts(pairKey, trainingZones, mileage);
				for (const segment of workout.segments) {
					expect(segment.durationMinutes).toBeCloseTo(roundToNearest5Seconds(segment.durationMinutes), 6);
				}
			}
		}
	});

	it('every workout starts with a warmup segment and ends with a cooldown segment', () => {
		for (const pairKey of PAIR_KEYS) {
			const [workout] = buildMixedZoneWorkouts(pairKey, trainingZones, 60);
			expect(workout.segments[0].type).toBe('warmup');
			expect(workout.segments[workout.segments.length - 1].type).toBe('cooldown');
		}
	});
});
