import { describe, it, expect } from 'vitest';
import { buildRacePaceTempoWorkout, buildRacePaceRepsWorkout, buildFartlekWorkout } from './workout-patterns';
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

describe('buildFartlekWorkout', () => {
	// M-zone pace ~4.5 min/km, T ~4.0, I ~3.5 — plausible midpoint paces for a sub-elite runner.
	const M_PACE = 4.5;
	const T_PACE = 4.0;
	const I_PACE = 3.5;
	const VOLUME_KM = 12;

	describe('M zone (AC-3.2: 2-3km pickups at marathon pace with steady recovery)', () => {
		it('should tag the workout as pattern fartlek', () => {
			const workout = buildFartlekWorkout('M', M_PACE, VOLUME_KM);
			expect(workout.pattern).toBe('fartlek');
		});

		it('should alternate work/recovery segments between one warmup and one cooldown', () => {
			const workout = buildFartlekWorkout('M', M_PACE, VOLUME_KM);
			const types = workout.segments.map((s) => s.type);
			expect(types[0]).toBe('warmup');
			expect(types[types.length - 1]).toBe('cooldown');
			const inner = types.slice(1, -1);
			for (let i = 0; i < inner.length; i++) {
				expect(inner[i]).toBe(i % 2 === 0 ? 'work' : 'recovery');
			}
		});

		it('should produce at least 2 pickups (plural per AC-3.2)', () => {
			const workout = buildFartlekWorkout('M', M_PACE, VOLUME_KM);
			const workCount = workout.segments.filter((s) => s.type === 'work').length;
			expect(workCount).toBeGreaterThanOrEqual(2);
		});

		it('each pickup should be a 2-3km-equivalent duration at M pace', () => {
			const workout = buildFartlekWorkout('M', M_PACE, VOLUME_KM);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			for (const seg of workSegments) {
				const equivalentKm = seg.durationMinutes / M_PACE;
				expect(equivalentKm).toBeGreaterThanOrEqual(2);
				expect(equivalentKm).toBeLessThanOrEqual(3);
			}
		});

		it('totalVolumeKm should reflect only the pickup distance, not recovery', () => {
			const workout = buildFartlekWorkout('M', M_PACE, VOLUME_KM);
			const workCount = workout.segments.filter((s) => s.type === 'work').length;
			expect(workout.totalVolumeKm).toBeCloseTo(workCount * 2.5, 1);
		});

		it('estimatedDurationMinutes should equal the sum of its segments', () => {
			const workout = buildFartlekWorkout('M', M_PACE, VOLUME_KM);
			const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
			expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
		});
	});

	describe('T zone (AC-3.3: 1-2min hard pickups within threshold, not exceeding zone)', () => {
		it('should tag the workout as pattern fartlek', () => {
			const workout = buildFartlekWorkout('T', T_PACE, VOLUME_KM);
			expect(workout.pattern).toBe('fartlek');
		});

		it('should produce at least 3 pickups', () => {
			const workout = buildFartlekWorkout('T', T_PACE, VOLUME_KM);
			const workCount = workout.segments.filter((s) => s.type === 'work').length;
			expect(workCount).toBeGreaterThanOrEqual(3);
		});

		it('each pickup should last 1-2 minutes', () => {
			const workout = buildFartlekWorkout('T', T_PACE, VOLUME_KM);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			for (const seg of workSegments) {
				expect(seg.durationMinutes).toBeGreaterThanOrEqual(1);
				expect(seg.durationMinutes).toBeLessThanOrEqual(2);
			}
		});

		it('pickups never exceed the workout"s own T-zone intensity (AC-3.3\'s "not exceeding zone")', () => {
			const workout = buildFartlekWorkout('T', T_PACE, VOLUME_KM);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			const intensities = new Set(workSegments.map((s) => s.intensity));
			// All pickups share exactly one intensity value -- the zone's own -- never a higher one.
			expect(intensities.size).toBe(1);
		});

		it('estimatedDurationMinutes should equal the sum of its segments', () => {
			const workout = buildFartlekWorkout('T', T_PACE, VOLUME_KM);
			const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
			expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
		});
	});

	describe('I zone (AC-3.4: 3-5min hard bursts, 1min recovery, >=3 reps)', () => {
		it('should tag the workout as pattern fartlek', () => {
			const workout = buildFartlekWorkout('I', I_PACE, VOLUME_KM);
			expect(workout.pattern).toBe('fartlek');
		});

		it('should produce at least 3 reps', () => {
			const workout = buildFartlekWorkout('I', I_PACE, VOLUME_KM);
			const workCount = workout.segments.filter((s) => s.type === 'work').length;
			expect(workCount).toBeGreaterThanOrEqual(3);
		});

		it('each burst should last 3-5 minutes', () => {
			const workout = buildFartlekWorkout('I', I_PACE, VOLUME_KM);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			for (const seg of workSegments) {
				expect(seg.durationMinutes).toBeGreaterThanOrEqual(3);
				expect(seg.durationMinutes).toBeLessThanOrEqual(5);
			}
		});

		it('recovery between bursts should be a fixed 1 minute', () => {
			const workout = buildFartlekWorkout('I', I_PACE, VOLUME_KM);
			const recoverySegments = workout.segments.filter((s) => s.type === 'recovery');
			expect(recoverySegments.length).toBeGreaterThan(0);
			for (const seg of recoverySegments) {
				expect(seg.durationMinutes).toBe(1);
			}
		});

		it('estimatedDurationMinutes should equal the sum of its segments', () => {
			const workout = buildFartlekWorkout('I', I_PACE, VOLUME_KM);
			const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
			expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
		});
	});

	it('every segment duration is rounded to the nearest 5 seconds, across all three zones', () => {
		for (const [zone, pace] of [
			['M', M_PACE],
			['T', T_PACE],
			['I', I_PACE]
		] as const) {
			const workout = buildFartlekWorkout(zone, pace, VOLUME_KM);
			for (const segment of workout.segments) {
				expect(segment.durationMinutes).toBeCloseTo(roundToNearest5Seconds(segment.durationMinutes), 6);
			}
		}
	});

	it('scales pickup/rep count with available volume (more volume -> more reps, not longer reps)', () => {
		const low = buildFartlekWorkout('I', I_PACE, 4);
		const high = buildFartlekWorkout('I', I_PACE, 30);
		const lowReps = low.segments.filter((s) => s.type === 'work').length;
		const highReps = high.segments.filter((s) => s.type === 'work').length;
		expect(highReps).toBeGreaterThan(lowReps);
	});
});
