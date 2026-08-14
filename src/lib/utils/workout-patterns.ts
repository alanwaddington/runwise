import {
	computeWarmupMinutes,
	computeCooldownMinutes,
	roundToNearest5Seconds,
	sumSegmentMinutes,
	type Workout,
	type WorkoutSegment
} from './workouts';

/** Segment helpers (copied from workouts.ts/power-workouts.ts for consistency) */
const WARMUP_INTENSITY = 0.25;
const COOLDOWN_INTENSITY = 0.25;
const RECOVERY_INTENSITY = 0.2;
/** Race pace sits near T/I depending on distance; used for chart display only. */
const RACE_PACE_INTENSITY = 0.75;

function warmupSegment(minutes: number): WorkoutSegment {
	return { type: 'warmup', durationMinutes: roundToNearest5Seconds(minutes), intensity: WARMUP_INTENSITY };
}

function cooldownSegment(minutes: number): WorkoutSegment {
	return { type: 'cooldown', durationMinutes: roundToNearest5Seconds(minutes), intensity: COOLDOWN_INTENSITY };
}

function round1(n: number): number {
	return Math.round(n * 10) / 10;
}

function formatMinutes(minutes: number): string {
	const whole = Math.floor(minutes);
	const seconds = Math.round((minutes - whole) * 60);
	if (seconds === 0) return `${whole}`;
	return `${whole}:${seconds.toString().padStart(2, '0')}`;
}

const RACE_PACE_TEMPO_MIN_KM = 3;
const RACE_PACE_TEMPO_MAX_KM = 8;
const RACE_PACE_TEMPO_MILEAGE_SHARE = 0.12;

/**
 * Sustained effort at goal race pace — race-prep Build/Strength phase variant (Decision 3).
 * Quality distance scales with weekly mileage, clamped to a sensible 3-8km band.
 */
export function buildRacePaceTempoWorkout(goalPaceMinKm: number, weeklyMileageKm: number): Workout {
	const qualityKm = Math.min(
		RACE_PACE_TEMPO_MAX_KM,
		Math.max(RACE_PACE_TEMPO_MIN_KM, weeklyMileageKm * RACE_PACE_TEMPO_MILEAGE_SHARE)
	);
	const qualityMinutes = qualityKm * goalPaceMinKm;
	const warmupMinutes = computeWarmupMinutes('T', qualityMinutes);
	const cooldownMinutes = computeCooldownMinutes('T', qualityMinutes);

	const segments: WorkoutSegment[] = [
		warmupSegment(warmupMinutes),
		{ type: 'work', durationMinutes: roundToNearest5Seconds(qualityMinutes), intensity: RACE_PACE_INTENSITY },
		cooldownSegment(cooldownMinutes)
	];

	return {
		label: 'Race-pace tempo',
		description: `${round1(qualityKm)}km continuous run at goal race pace (${formatMinutes(goalPaceMinKm)}/km)`,
		totalVolumeKm: round1(qualityKm),
		recovery: 'None (continuous)',
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'race-prep'
	};
}

const RACE_PACE_REPS_KM = 1;
const RACE_PACE_REPS_MIN_COUNT = 3;
const RACE_PACE_REPS_MAX_COUNT = 6;
const RACE_PACE_REPS_MILEAGE_SHARE = 0.06;
const RACE_PACE_REPS_RECOVERY_FRACTION = 0.5;

/**
 * Shorter reps at goal race pace — race-prep Peak VO2 Max phase variant (Decision 3).
 * Rep count scales with weekly mileage, clamped to a sensible 3-6 rep band.
 */
export function buildRacePaceRepsWorkout(goalPaceMinKm: number, weeklyMileageKm: number): Workout {
	const reps = Math.max(
		RACE_PACE_REPS_MIN_COUNT,
		Math.min(RACE_PACE_REPS_MAX_COUNT, Math.round(weeklyMileageKm * RACE_PACE_REPS_MILEAGE_SHARE))
	);
	const repMinutes = RACE_PACE_REPS_KM * goalPaceMinKm;
	const recoveryMinutes = roundToNearest5Seconds(repMinutes * RACE_PACE_REPS_RECOVERY_FRACTION);

	const segments: WorkoutSegment[] = [];
	for (let i = 0; i < reps; i++) {
		segments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(repMinutes), intensity: RACE_PACE_INTENSITY });
		if (i < reps - 1) {
			segments.push({ type: 'recovery', durationMinutes: recoveryMinutes, intensity: RECOVERY_INTENSITY });
		}
	}

	const qualityTime = sumSegmentMinutes(segments);
	const warmupMinutes = computeWarmupMinutes('T', qualityTime);
	const cooldownMinutes = computeCooldownMinutes('T', qualityTime);
	segments.unshift(warmupSegment(warmupMinutes));
	segments.push(cooldownSegment(cooldownMinutes));

	return {
		label: 'Race-pace reps',
		description: `${reps} × ${RACE_PACE_REPS_KM}km at goal race pace (${formatMinutes(goalPaceMinKm)}/km), ${formatMinutes(recoveryMinutes)} min jog recovery`,
		totalVolumeKm: round1(reps * RACE_PACE_REPS_KM),
		recovery: `${formatMinutes(recoveryMinutes)} min jog between reps`,
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'race-prep'
	};
}
