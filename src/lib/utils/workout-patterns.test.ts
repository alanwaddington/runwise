import { describe, it, expect } from 'vitest';
import { buildRacePaceTempoWorkout, buildRacePaceRepsWorkout } from './workout-patterns';
import { roundToNearest5Seconds } from './workouts';

describe('buildRacePaceTempoWorkout', () => {
	it('should tag the workout as pattern race-prep', () => {
		const workout = buildRacePaceTempoWorkout(4.5, 60);
		expect(workout.pattern).toBe('race-prep');
	});

	it('should include a single continuous work segment plus warmup/cooldown', () => {
		const workout = buildRacePaceTempoWorkout(4.5, 60);
		const types = workout.segments.map((s) => s.type);
		expect(types).toEqual(['warmup', 'work', 'cooldown']);
	});

	it('estimatedDurationMinutes should equal the sum of its segments', () => {
		const workout = buildRacePaceTempoWorkout(4.5, 60);
		const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
		expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
	});

	it('should scale quality distance with weekly mileage but stay within 3-8km bounds', () => {
		const low = buildRacePaceTempoWorkout(4.5, 10);
		const high = buildRacePaceTempoWorkout(4.5, 200);
		expect(low.totalVolumeKm).toBeGreaterThanOrEqual(3);
		expect(high.totalVolumeKm).toBeLessThanOrEqual(8);
	});

	it('should describe the goal race pace in the description', () => {
		const workout = buildRacePaceTempoWorkout(4.5, 60);
		expect(workout.description).toMatch(/race pace/i);
	});

	it('every segment duration is rounded to the nearest 5 seconds', () => {
		for (const mileage of [10, 40, 80, 150]) {
			const workout = buildRacePaceTempoWorkout(4.5, mileage);
			for (const segment of workout.segments) {
				expect(segment.durationMinutes).toBeCloseTo(roundToNearest5Seconds(segment.durationMinutes), 6);
			}
		}
	});
});

describe('buildRacePaceRepsWorkout', () => {
	it('should tag the workout as pattern race-prep', () => {
		const workout = buildRacePaceRepsWorkout(4.5, 60);
		expect(workout.pattern).toBe('race-prep');
	});

	it('should produce a rep-based description', () => {
		const workout = buildRacePaceRepsWorkout(4.5, 60);
		expect(workout.description).toMatch(/\d+\s*[x×]/);
	});

	it('should produce between 3 and 6 reps', () => {
		const low = buildRacePaceRepsWorkout(4.5, 10);
		const high = buildRacePaceRepsWorkout(4.5, 200);
		expect(low.description).toMatch(/^[3-6]\s*[x×]/);
		expect(high.description).toMatch(/^[3-6]\s*[x×]/);
	});

	it('estimatedDurationMinutes should equal the sum of its segments', () => {
		const workout = buildRacePaceRepsWorkout(4.5, 60);
		const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
		expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
	});

	it('should alternate work/recovery segments between one warmup and one cooldown', () => {
		const workout = buildRacePaceRepsWorkout(4.5, 60);
		const types = workout.segments.map((s) => s.type);
		expect(types[0]).toBe('warmup');
		expect(types[types.length - 1]).toBe('cooldown');
		const inner = types.slice(1, -1);
		for (let i = 0; i < inner.length; i++) {
			expect(inner[i]).toBe(i % 2 === 0 ? 'work' : 'recovery');
		}
	});

	it('every segment duration is rounded to the nearest 5 seconds', () => {
		for (const mileage of [10, 40, 80, 150]) {
			const workout = buildRacePaceRepsWorkout(4.5, mileage);
			for (const segment of workout.segments) {
				expect(segment.durationMinutes).toBeCloseTo(roundToNearest5Seconds(segment.durationMinutes), 6);
			}
		}
	});
});
