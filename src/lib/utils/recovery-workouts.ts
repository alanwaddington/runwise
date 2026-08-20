import {
	computeWarmupMinutes,
	computeCooldownMinutes,
	roundToNearest5Seconds,
	sumSegmentMinutes,
	type Workout,
	type WorkoutSegment
} from './workouts';

/**
 * Recovery-focused prescriptions (Task 10, AC-7.1-7.7) — distinct from a standard E-zone workout
 * (AC-7.4), and not derived from a zone's own weekly-mileage-scaled volume budget the way
 * fartlek/progression/decay/rep-expansion are (Decision: gated separately in buildZoneWorkouts,
 * per Task 10's own file-list note). Each option uses a fixed, flexible duration within its own
 * AC's stated band rather than scaling with weekly mileage — these are meant to be available
 * regardless of training load or mode (AC-7.6), not sized to it.
 */

const WARMUP_INTENSITY = 0.25;
const COOLDOWN_INTENSITY = 0.25;
const RECOVERY_INTENSITY = 0.2;
/** Below E's own chart intensity (0.35 in workouts.ts) -- "very low," genuinely easier than a
 *  standard E-zone run, not just relabeled (AC-7.4). */
const FLOAT_INTENSITY = 0.3;
const E_INTENSITY = 0.35;
/** A brief, controlled acceleration -- faster than E but well short of true I/R effort. */
const STRIDER_INTENSITY = 0.75;

function warmupSegment(minutes: number): WorkoutSegment {
	return { type: 'warmup', durationMinutes: roundToNearest5Seconds(minutes), intensity: WARMUP_INTENSITY };
}

function cooldownSegment(minutes: number): WorkoutSegment {
	return { type: 'cooldown', durationMinutes: roundToNearest5Seconds(minutes), intensity: COOLDOWN_INTENSITY };
}

const EASY_FLOAT_MIN_MINUTES = 20;
const EASY_FLOAT_MAX_MINUTES = 45;
const EASY_FLOAT_DEFAULT_MINUTES = 30; // midpoint of AC-7.1's 20-45min band

/** AC-7.1: very low intensity, flexible 20-45min duration. */
function buildEasyFloatWorkout(): Workout {
	const segments: WorkoutSegment[] = [
		warmupSegment(computeWarmupMinutes('E', EASY_FLOAT_DEFAULT_MINUTES)),
		{ type: 'work', durationMinutes: EASY_FLOAT_DEFAULT_MINUTES, intensity: FLOAT_INTENSITY },
		cooldownSegment(computeCooldownMinutes('E', EASY_FLOAT_DEFAULT_MINUTES))
	];

	return {
		label: 'Easy float',
		description: `Promote blood flow and mobility recovery with a very easy, unstructured ${EASY_FLOAT_MIN_MINUTES}-${EASY_FLOAT_MAX_MINUTES} min float at or below Easy pace — go by feel, not pace`,
		totalVolumeKm: 0, // deliberately not distance-prescribed -- "go by feel," not a target pace/distance
		recovery: 'None (continuous, very easy effort)',
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'recovery'
	};
}

const STRIDER_BASE_MIN_MINUTES = 20;
const STRIDER_BASE_MAX_MINUTES = 30;
const STRIDER_BASE_DEFAULT_MINUTES = 24; // midpoint-ish of AC-7.2's 20-30min band
const STRIDER_COUNT = 5; // midpoint of AC-7.2's 4-6 reps
const STRIDER_SECONDS = 25; // midpoint of AC-7.2's 20-30sec band
const STRIDER_RECOVERY_MINUTES = 1.5; // AC-7.2's 90sec

/** AC-7.2: an easy run base with short controlled accelerations near the end. */
function buildRecoveryStridersWorkout(): Workout {
	const strideMinutes = roundToNearest5Seconds(STRIDER_SECONDS / 60);
	const segments: WorkoutSegment[] = [
		{ type: 'work', durationMinutes: STRIDER_BASE_DEFAULT_MINUTES, intensity: E_INTENSITY }
	];
	for (let i = 0; i < STRIDER_COUNT; i++) {
		segments.push({ type: 'work', durationMinutes: strideMinutes, intensity: STRIDER_INTENSITY });
		segments.push({ type: 'recovery', durationMinutes: STRIDER_RECOVERY_MINUTES, intensity: RECOVERY_INTENSITY });
	}

	const qualityTime = sumSegmentMinutes(segments);
	segments.unshift(warmupSegment(computeWarmupMinutes('E', qualityTime)));
	segments.push(cooldownSegment(computeCooldownMinutes('E', qualityTime)));

	return {
		label: 'Recovery striders',
		description: `Promote blood flow and neuromuscular turnover: a ${STRIDER_BASE_MIN_MINUTES}-${STRIDER_BASE_MAX_MINUTES} min easy run finishing with ${STRIDER_COUNT} x ${STRIDER_SECONDS}sec relaxed, controlled accelerations, ${STRIDER_RECOVERY_MINUTES * 60}sec easy recovery between`,
		totalVolumeKm: 0,
		recovery: `${STRIDER_RECOVERY_MINUTES * 60}sec easy jog/walk between strides`,
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'recovery'
	};
}

const SHAKEOUT_MIN_MINUTES = 10;
const SHAKEOUT_MAX_MINUTES = 20;
const SHAKEOUT_DEFAULT_MINUTES = 15; // midpoint of AC-7.3's 10-20min band

/**
 * AC-7.3: short, easy, minimal structure. Exported separately (not just via
 * buildRecoveryWorkouts) so Race-Prep's Taper phase can offer it standalone as the plan's final,
 * day-before-race workout (AC-7.6) without pulling in Easy float / Recovery striders too.
 */
export function buildShakeoutWorkout(): Workout {
	const segments: WorkoutSegment[] = [
		warmupSegment(computeWarmupMinutes('E', SHAKEOUT_DEFAULT_MINUTES)),
		{ type: 'work', durationMinutes: SHAKEOUT_DEFAULT_MINUTES, intensity: FLOAT_INTENSITY },
		cooldownSegment(computeCooldownMinutes('E', SHAKEOUT_DEFAULT_MINUTES))
	];

	return {
		label: 'Shakeout run',
		description: `Promote blood flow and mobility recovery with a short, minimal-structure ${SHAKEOUT_MIN_MINUTES}-${SHAKEOUT_MAX_MINUTES} min easy jog — just enough to loosen up`,
		totalVolumeKm: 0,
		recovery: 'None (continuous, minimal structure)',
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'recovery'
	};
}

/**
 * Build all recovery-focused prescriptions (AC-7.1-7.3): Easy float, Recovery striders, and
 * Shakeout run — 3 distinct types (AC-7.4), each with a clear purpose statement (AC-7.5) baked
 * into its description. Available unconditionally (AC-7.6) — takes no race result, weekly
 * mileage, or mode as input, so callers can offer it regardless of context.
 */
export function buildRecoveryWorkouts(): Workout[] {
	return [buildEasyFloatWorkout(), buildRecoveryStridersWorkout(), buildShakeoutWorkout()];
}
