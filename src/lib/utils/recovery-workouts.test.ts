import { describe, it, expect } from 'vitest';
import { buildRecoveryWorkouts } from './recovery-workouts';
import { roundToNearest5Seconds } from './workouts';

describe('buildRecoveryWorkouts', () => {
	it('should return exactly 3 workouts (AC-7.4: at least 3 recovery-focused types)', () => {
		const workouts = buildRecoveryWorkouts();
		expect(workouts).toHaveLength(3);
	});

	it('should return Easy float, Recovery striders, and Shakeout run', () => {
		const workouts = buildRecoveryWorkouts();
		expect(workouts.map((w) => w.label)).toEqual(['Easy float', 'Recovery striders', 'Shakeout run']);
	});

	it('every recovery workout is tagged pattern recovery', () => {
		for (const workout of buildRecoveryWorkouts()) {
			expect(workout.pattern).toBe('recovery');
		}
	});

	it('every recovery workout has a clear purpose statement in its description (AC-7.5)', () => {
		for (const workout of buildRecoveryWorkouts()) {
			expect(workout.description.toLowerCase()).toMatch(/promote blood flow/);
		}
	});

	it('takes no arguments -- available unconditionally, regardless of mode or mileage (AC-7.6)', () => {
		expect(buildRecoveryWorkouts.length).toBe(0);
	});

	describe('Easy float (AC-7.1: very low intensity, flexible 20-45min)', () => {
		it('should be a single continuous work segment between warmup and cooldown', () => {
			const [float] = buildRecoveryWorkouts();
			const types = float.segments.map((s) => s.type);
			expect(types).toEqual(['warmup', 'work', 'cooldown']);
		});

		it('its duration should fall within the 20-45 minute band', () => {
			const [float] = buildRecoveryWorkouts();
			const work = float.segments.find((s) => s.type === 'work')!;
			expect(work.durationMinutes).toBeGreaterThanOrEqual(20);
			expect(work.durationMinutes).toBeLessThanOrEqual(45);
		});

		it('its intensity should be lower than a standard E-zone workout (AC-7.4: distinct from E)', () => {
			const [float] = buildRecoveryWorkouts();
			const work = float.segments.find((s) => s.type === 'work')!;
			expect(work.intensity).toBeLessThan(0.35); // workouts.ts's own ZONE_INTENSITY.E
		});
	});

	describe('Recovery striders (AC-7.2: easy run + 4-6 short accelerations)', () => {
		it('should include exactly 5 stride work segments (within AC-7.2\'s 4-6 band) plus the base run', () => {
			const [, striders] = buildRecoveryWorkouts();
			const workSegments = striders.segments.filter((s) => s.type === 'work');
			// 1 base easy-run segment + N strides
			expect(workSegments.length - 1).toBeGreaterThanOrEqual(4);
			expect(workSegments.length - 1).toBeLessThanOrEqual(6);
		});

		it('each stride should last 20-30 seconds', () => {
			const [, striders] = buildRecoveryWorkouts();
			const workSegments = striders.segments.filter((s) => s.type === 'work');
			const strideSegments = workSegments.slice(1); // first work segment is the easy-run base
			for (const seg of strideSegments) {
				expect(seg.durationMinutes * 60).toBeGreaterThanOrEqual(20);
				expect(seg.durationMinutes * 60).toBeLessThanOrEqual(30);
			}
		});

		it('recovery between strides should be 90 seconds', () => {
			const [, striders] = buildRecoveryWorkouts();
			const recoverySegments = striders.segments.filter((s) => s.type === 'recovery');
			expect(recoverySegments.length).toBeGreaterThan(0);
			for (const seg of recoverySegments) {
				expect(seg.durationMinutes * 60).toBeCloseTo(90, 0);
			}
		});

		it('strides should be strictly faster (higher intensity) than the easy-run base', () => {
			const [, striders] = buildRecoveryWorkouts();
			const workSegments = striders.segments.filter((s) => s.type === 'work');
			const [base, ...strides] = workSegments;
			for (const stride of strides) {
				expect(stride.intensity).toBeGreaterThan(base.intensity);
			}
		});

		it('the base easy-run portion should last 20-30 minutes', () => {
			const [, striders] = buildRecoveryWorkouts();
			const base = striders.segments.filter((s) => s.type === 'work')[0];
			expect(base.durationMinutes).toBeGreaterThanOrEqual(20);
			expect(base.durationMinutes).toBeLessThanOrEqual(30);
		});
	});

	describe('Shakeout run (AC-7.3: short, easy, minimal structure)', () => {
		it('should be a single continuous work segment between warmup and cooldown', () => {
			const [, , shakeout] = buildRecoveryWorkouts();
			const types = shakeout.segments.map((s) => s.type);
			expect(types).toEqual(['warmup', 'work', 'cooldown']);
		});

		it('its duration should fall within the 10-20 minute band', () => {
			const [, , shakeout] = buildRecoveryWorkouts();
			const work = shakeout.segments.find((s) => s.type === 'work')!;
			expect(work.durationMinutes).toBeGreaterThanOrEqual(10);
			expect(work.durationMinutes).toBeLessThanOrEqual(20);
		});

		it('should be the shortest of the three recovery options', () => {
			const [float, striders, shakeout] = buildRecoveryWorkouts();
			expect(shakeout.estimatedDurationMinutes).toBeLessThan(float.estimatedDurationMinutes);
			expect(shakeout.estimatedDurationMinutes).toBeLessThan(striders.estimatedDurationMinutes);
		});
	});

	it('estimatedDurationMinutes should equal the sum of segments, for every recovery workout', () => {
		for (const workout of buildRecoveryWorkouts()) {
			const segSum = workout.segments.reduce((s, seg) => s + seg.durationMinutes, 0);
			expect(Math.abs(workout.estimatedDurationMinutes - segSum)).toBeLessThanOrEqual(0.6);
		}
	});

	it('every segment duration is rounded to the nearest 5 seconds, for every recovery workout', () => {
		for (const workout of buildRecoveryWorkouts()) {
			for (const segment of workout.segments) {
				expect(segment.durationMinutes).toBeCloseTo(roundToNearest5Seconds(segment.durationMinutes), 6);
			}
		}
	});

	it('every segment intensity is within (0, 1], for every recovery workout', () => {
		for (const workout of buildRecoveryWorkouts()) {
			for (const segment of workout.segments) {
				expect(segment.intensity).toBeGreaterThan(0);
				expect(segment.intensity).toBeLessThanOrEqual(1);
			}
		}
	});

	it('every segment starts with warmup and ends with cooldown', () => {
		for (const workout of buildRecoveryWorkouts()) {
			expect(workout.segments[0].type).toBe('warmup');
			expect(workout.segments[workout.segments.length - 1].type).toBe('cooldown');
		}
	});

	it('calling it twice produces identical output -- deterministic, no hidden randomness or state', () => {
		expect(buildRecoveryWorkouts()).toEqual(buildRecoveryWorkouts());
	});
});
