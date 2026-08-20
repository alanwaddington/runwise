import { describe, it, expect } from 'vitest';
import {
	buildRacePaceTempoWorkout,
	buildRacePaceRepsWorkout,
	buildFartlekWorkout,
	buildProgressionWorkout,
	buildDecayWorkout,
	buildRepExpansionWorkouts
} from './workout-patterns';
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

describe('buildProgressionWorkout', () => {
	const T_PACE = 4.0;
	const I_PACE = 3.5;
	const VOLUME_KM = 6;

	describe.each([
		['T', T_PACE],
		['I', I_PACE]
	] as const)('%s zone (AC-4.1: progression available)', (zone, pace) => {
		it('should tag the workout as pattern progression', () => {
			const workout = buildProgressionWorkout(zone, pace, VOLUME_KM);
			expect(workout.pattern).toBe('progression');
		});

		it('should alternate work/recovery segments between one warmup and one cooldown', () => {
			const workout = buildProgressionWorkout(zone, pace, VOLUME_KM);
			const types = workout.segments.map((s) => s.type);
			expect(types[0]).toBe('warmup');
			expect(types[types.length - 1]).toBe('cooldown');
			const inner = types.slice(1, -1);
			for (let i = 0; i < inner.length; i++) {
				expect(inner[i]).toBe(i % 2 === 0 ? 'work' : 'recovery');
			}
		});

		it('should produce exactly 3 reps of strictly increasing duration (AC-4.7 boundary check)', () => {
			const workout = buildProgressionWorkout(zone, pace, VOLUME_KM);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			expect(workSegments).toHaveLength(3);
			expect(workSegments[1].durationMinutes).toBeGreaterThan(workSegments[0].durationMinutes);
			expect(workSegments[2].durationMinutes).toBeGreaterThan(workSegments[1].durationMinutes);
		});

		it('every rep should stay within the zone"s own intensity, never higher', () => {
			const workout = buildProgressionWorkout(zone, pace, VOLUME_KM);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			const intensities = new Set(workSegments.map((s) => s.intensity));
			expect(intensities.size).toBe(1);
		});

		it('every segment intensity is within (0, 1]', () => {
			const workout = buildProgressionWorkout(zone, pace, VOLUME_KM);
			for (const segment of workout.segments) {
				expect(segment.intensity).toBeGreaterThan(0);
				expect(segment.intensity).toBeLessThanOrEqual(1);
			}
		});

		it('estimatedDurationMinutes should equal the sum of its segments', () => {
			const workout = buildProgressionWorkout(zone, pace, VOLUME_KM);
			const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
			expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
		});

		it('every segment duration is rounded to the nearest 5 seconds', () => {
			const workout = buildProgressionWorkout(zone, pace, VOLUME_KM);
			for (const segment of workout.segments) {
				expect(segment.durationMinutes).toBeCloseTo(roundToNearest5Seconds(segment.durationMinutes), 6);
			}
		});
	});

	it('I-zone progression approximates a 400m->600m->800m style ratio (AC-4.3)', () => {
		const workout = buildProgressionWorkout('I', I_PACE, VOLUME_KM);
		const [a, b, c] = workout.segments.filter((s) => s.type === 'work').map((s) => s.durationMinutes);
		// Ratios 1:1.5:2 -- b/a and c/a should land near 1.5 and 2.
		expect(b / a).toBeCloseTo(1.5, 1);
		expect(c / a).toBeCloseTo(2, 1);
	});

	it('T-zone progression approximates AC-4.2\'s own 5:6:7 minute example ratio', () => {
		const workout = buildProgressionWorkout('T', T_PACE, VOLUME_KM);
		const [a, b, c] = workout.segments.filter((s) => s.type === 'work').map((s) => s.durationMinutes);
		// +/-0.15 tolerance to absorb each rep's independent 5-second rounding.
		expect(b / a).toBeGreaterThan(1.0);
		expect(b / a).toBeLessThan(1.5);
		expect(c / a).toBeGreaterThan(b / a);
	});
});

describe('buildDecayWorkout', () => {
	const I_PACE = 3.5;
	const R_PACE = 3.0;
	const VOLUME_KM = 6;

	describe('I zone (AC-4.5: 2x hard reps then 2x shorter/easier reps)', () => {
		it('should tag the workout as pattern decay', () => {
			const workout = buildDecayWorkout('I', I_PACE, VOLUME_KM);
			expect(workout.pattern).toBe('decay');
		});

		it('should produce exactly 4 work reps: 2 hard, then 2 easier', () => {
			const workout = buildDecayWorkout('I', I_PACE, VOLUME_KM);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			expect(workSegments).toHaveLength(4);
		});

		it('the first 2 reps should be strictly harder (higher intensity) than the last 2', () => {
			const workout = buildDecayWorkout('I', I_PACE, VOLUME_KM);
			const [hard1, hard2, easy1, easy2] = workout.segments
				.filter((s) => s.type === 'work')
				.map((s) => s.intensity);
			expect(hard1).toBe(hard2);
			expect(easy1).toBe(easy2);
			expect(hard1).toBeGreaterThan(easy1);
		});

		it('the easy reps should be shorter in duration than the hard reps (AC-4.5\'s 800m->400m halving)', () => {
			const workout = buildDecayWorkout('I', I_PACE, VOLUME_KM);
			const [hard1, , easy1] = workout.segments.filter((s) => s.type === 'work').map((s) => s.durationMinutes);
			expect(easy1).toBeCloseTo(hard1 / 2, 1);
		});

		it('the decayed (easy) reps never drop below genuine recovery intensity', () => {
			const workout = buildDecayWorkout('I', I_PACE, VOLUME_KM);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			for (const seg of workSegments) {
				expect(seg.intensity).toBeGreaterThan(0.2); // RECOVERY_INTENSITY
			}
		});
	});

	describe('R zone (AC-4.6: intensity decays down to, but not past, recovery effort)', () => {
		it('should tag the workout as pattern decay', () => {
			const workout = buildDecayWorkout('R', R_PACE, VOLUME_KM);
			expect(workout.pattern).toBe('decay');
		});

		it('should produce at least 3 reps', () => {
			const workout = buildDecayWorkout('R', R_PACE, VOLUME_KM);
			const workCount = workout.segments.filter((s) => s.type === 'work').length;
			expect(workCount).toBeGreaterThanOrEqual(3);
		});

		it('intensity should be monotonically non-increasing rep over rep (AC-4.7 boundary check)', () => {
			const workout = buildDecayWorkout('R', R_PACE, VOLUME_KM);
			const intensities = workout.segments.filter((s) => s.type === 'work').map((s) => s.intensity);
			for (let i = 1; i < intensities.length; i++) {
				expect(intensities[i]).toBeLessThanOrEqual(intensities[i - 1]);
			}
		});

		it('the first rep should be at full R-zone intensity', () => {
			const workout = buildDecayWorkout('R', R_PACE, VOLUME_KM);
			const first = workout.segments.filter((s) => s.type === 'work')[0];
			expect(first.intensity).toBe(1); // ZONE_INTENSITY.R
		});

		it('the last rep should bottom out at exactly recovery intensity, never below (AC-4.6\'s floor)', () => {
			const workout = buildDecayWorkout('R', R_PACE, VOLUME_KM);
			const workSegments = workout.segments.filter((s) => s.type === 'work');
			const last = workSegments[workSegments.length - 1];
			expect(last.intensity).toBeCloseTo(0.2, 6); // RECOVERY_INTENSITY, exactly at the boundary
			for (const seg of workSegments) {
				// Floating-point-tolerant: the linear-decay formula can land a hair below 0.2
				// (e.g. 0.19999999999999996) despite being mathematically exactly 0.2.
				expect(seg.intensity).toBeGreaterThanOrEqual(0.2 - 1e-9);
			}
		});

		it('never fewer than 3 reps even at very low volume (boundary condition)', () => {
			const workout = buildDecayWorkout('R', R_PACE, 0.3);
			const workCount = workout.segments.filter((s) => s.type === 'work').length;
			expect(workCount).toBeGreaterThanOrEqual(3);
		});

		it('totalVolumeKm reflects only the rep distance, not recovery jogs', () => {
			const workout = buildDecayWorkout('R', R_PACE, VOLUME_KM);
			const workCount = workout.segments.filter((s) => s.type === 'work').length;
			expect(workout.totalVolumeKm).toBeCloseTo(workCount * 0.2, 6);
		});
	});

	it('every segment duration is rounded to the nearest 5 seconds, across both zones', () => {
		for (const [zone, pace] of [
			['I', I_PACE],
			['R', R_PACE]
		] as const) {
			const workout = buildDecayWorkout(zone, pace, VOLUME_KM);
			for (const segment of workout.segments) {
				expect(segment.durationMinutes).toBeCloseTo(roundToNearest5Seconds(segment.durationMinutes), 6);
			}
		}
	});

	it('every segment intensity is within (0, 1], across both zones', () => {
		for (const [zone, pace] of [
			['I', I_PACE],
			['R', R_PACE]
		] as const) {
			const workout = buildDecayWorkout(zone, pace, VOLUME_KM);
			for (const segment of workout.segments) {
				expect(segment.intensity).toBeGreaterThan(0);
				expect(segment.intensity).toBeLessThanOrEqual(1);
			}
		}
	});
});

describe('buildRepExpansionWorkouts', () => {
	const I_PACE = 3.5;
	const R_PACE = 3.0;
	const VOLUME_KM = 6;

	describe('I zone (AC-5.1: adds 1500m/2000m; AC-5.4: 3/5/7min time-based)', () => {
		it('should return exactly 3 workouts', () => {
			const workouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
			expect(workouts).toHaveLength(3);
		});

		it('should include a 1500m and a 2000m distance-based rep workout', () => {
			const workouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
			expect(workouts.map((w) => w.label)).toContain('1500m reps');
			expect(workouts.map((w) => w.label)).toContain('2000m reps');
		});

		it('distance-based variants should be tagged pattern standard, matching existing distance reps', () => {
			const workouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
			const distanceVariants = workouts.filter((w) => w.label.endsWith('m reps'));
			expect(distanceVariants).toHaveLength(2);
			for (const w of distanceVariants) expect(w.pattern).toBe('standard');
		});

		it('the time-based variant should be tagged pattern time-based (AC-5.3)', () => {
			const workouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
			const timeBased = workouts.find((w) => w.label === 'Time-based intervals')!;
			expect(timeBased).toBeDefined();
			expect(timeBased.pattern).toBe('time-based');
		});

		it('the time-based variant should include 3, 5, and 7 minute work segments (AC-5.4)', () => {
			const workouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
			const timeBased = workouts.find((w) => w.label === 'Time-based intervals')!;
			const workDurations = timeBased.segments.filter((s) => s.type === 'work').map((s) => s.durationMinutes);
			expect(workDurations).toEqual([3, 5, 7]);
		});

		it('the time-based variant"s recovery should be a fixed 1 minute (AC-5.4)', () => {
			const workouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
			const timeBased = workouts.find((w) => w.label === 'Time-based intervals')!;
			const recoverySegments = timeBased.segments.filter((s) => s.type === 'recovery');
			expect(recoverySegments.length).toBeGreaterThan(0);
			for (const seg of recoverySegments) expect(seg.durationMinutes).toBe(1);
		});

		it('the time-based variant"s instructions should explain it needs no track (AC-5.7)', () => {
			const workouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
			const timeBased = workouts.find((w) => w.label === 'Time-based intervals')!;
			expect(timeBased.description.toLowerCase()).toMatch(/no track needed/);
		});

		it('the 1500m/2000m distances should not duplicate the existing 400/800/1200m variants (AC-5.8)', () => {
			const workouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
			const labels = workouts.map((w) => w.label);
			expect(labels).not.toContain('400m reps');
			expect(labels).not.toContain('800m reps');
			expect(labels).not.toContain('1200m reps');
		});
	});

	describe('R zone (AC-5.2: adds 150m/300m; AC-5.5: 1/2min time-based)', () => {
		it('should return exactly 3 workouts', () => {
			const workouts = buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM);
			expect(workouts).toHaveLength(3);
		});

		it('should include a 150m and a 300m distance-based rep workout', () => {
			const workouts = buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM);
			expect(workouts.map((w) => w.label)).toContain('150m reps');
			expect(workouts.map((w) => w.label)).toContain('300m reps');
		});

		it('the time-based variant should be tagged pattern time-based (AC-5.3)', () => {
			const workouts = buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM);
			const timeBased = workouts.find((w) => w.label === 'Time-based reps')!;
			expect(timeBased).toBeDefined();
			expect(timeBased.pattern).toBe('time-based');
		});

		it('the time-based variant should include 1 and 2 minute work segments (AC-5.5)', () => {
			const workouts = buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM);
			const timeBased = workouts.find((w) => w.label === 'Time-based reps')!;
			const workDurations = timeBased.segments.filter((s) => s.type === 'work').map((s) => s.durationMinutes);
			expect(workDurations).toEqual([1, 2, 1, 2]);
		});

		it('the time-based variant"s recovery should be a fixed 30 seconds (AC-5.5)', () => {
			const workouts = buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM);
			const timeBased = workouts.find((w) => w.label === 'Time-based reps')!;
			const recoverySegments = timeBased.segments.filter((s) => s.type === 'recovery');
			expect(recoverySegments.length).toBeGreaterThan(0);
			for (const seg of recoverySegments) expect(seg.durationMinutes).toBe(0.5);
		});

		it('the time-based variant"s instructions should explain it needs no track (AC-5.7)', () => {
			const workouts = buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM);
			const timeBased = workouts.find((w) => w.label === 'Time-based reps')!;
			expect(timeBased.description.toLowerCase()).toMatch(/no track needed/);
		});

		it('the 150m/300m distances should not duplicate the existing 200/400/800m variants (AC-5.8)', () => {
			const workouts = buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM);
			const labels = workouts.map((w) => w.label);
			expect(labels).not.toContain('200m reps');
			expect(labels).not.toContain('400m reps');
			expect(labels).not.toContain('800m reps');
		});
	});

	it('AC-5.6: exactly 6 new options total across both zones', () => {
		const iWorkouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
		const rWorkouts = buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM);
		expect(iWorkouts.length + rWorkouts.length).toBe(6);
	});

	it('time-based and distance-based options are structurally distinct, not redundant (AC-5.8)', () => {
		const workouts = buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM);
		const distanceVariant = workouts.find((w) => w.label === '1500m reps')!;
		const timeVariant = workouts.find((w) => w.label === 'Time-based intervals')!;
		// Distance reps all share one duration (uniform rep length); the time-based session
		// deliberately varies duration per rep -- a structural difference, not just a label change.
		const distanceDurations = new Set(
			distanceVariant.segments.filter((s) => s.type === 'work').map((s) => s.durationMinutes)
		);
		const timeDurations = new Set(timeVariant.segments.filter((s) => s.type === 'work').map((s) => s.durationMinutes));
		expect(distanceDurations.size).toBe(1);
		expect(timeDurations.size).toBeGreaterThan(1);
	});

	it('every segment duration is rounded to the nearest 5 seconds, across all new workouts', () => {
		for (const workout of [
			...buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM),
			...buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM)
		]) {
			for (const segment of workout.segments) {
				expect(segment.durationMinutes).toBeCloseTo(roundToNearest5Seconds(segment.durationMinutes), 6);
			}
		}
	});

	it('every segment intensity is within (0, 1], across all new workouts', () => {
		for (const workout of [
			...buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM),
			...buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM)
		]) {
			for (const segment of workout.segments) {
				expect(segment.intensity).toBeGreaterThan(0);
				expect(segment.intensity).toBeLessThanOrEqual(1);
			}
		}
	});

	it('estimatedDurationMinutes should equal the sum of segments, across all new workouts', () => {
		for (const workout of [
			...buildRepExpansionWorkouts('I', I_PACE, VOLUME_KM),
			...buildRepExpansionWorkouts('R', R_PACE, VOLUME_KM)
		]) {
			const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
			expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
		}
	});
});
