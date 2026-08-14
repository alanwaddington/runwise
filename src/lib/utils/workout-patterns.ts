import {
	computeWarmupMinutes,
	computeCooldownMinutes,
	roundToNearest5Seconds,
	sumSegmentMinutes,
	type Workout,
	type WorkoutSegment
} from './workouts';
import type { ZoneKey } from './training-paces';

/** Segment helpers (copied from workouts.ts/power-workouts.ts for consistency) */
const WARMUP_INTENSITY = 0.25;
const COOLDOWN_INTENSITY = 0.25;
const RECOVERY_INTENSITY = 0.2;
/** Race pace sits near T/I depending on distance; used for chart display only. */
const RACE_PACE_INTENSITY = 0.75;
/** Mirrors workouts.ts's own (unexported) ZONE_INTENSITY — chart-display ordering only, not a physiological unit. */
const ZONE_INTENSITY: Record<ZoneKey, number> = { E: 0.35, M: 0.55, T: 0.7, I: 0.85, R: 1 };

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

// ─── Fartlek patterns (Task 7, AC-3.1-3.7) ─────────────────────────────────
// M/T/I each get their own unstructured-surge variant; E already has one (buildEWorkouts).
// All three build from the zone's own quality-volume budget (same input buildZoneWorkouts
// passes its other builders) and stay strictly within their own zone's intensity — none of
// these push into the next zone up, matching AC-3.3's explicit "not exceeding zone" caveat,
// which applies just as much in spirit to M and I even though only T's AC text says it aloud.

const M_FARTLEK_PICKUP_KM = 2.5; // midpoint of AC-3.2's 2-3km band
const M_FARTLEK_RECOVERY_MINUTES = 2; // "steady" (continuous jog, not a full stop) between pickups
const M_FARTLEK_MIN_PICKUPS = 2; // AC-3.2 says "pickups" (plural)

function buildMFartlekWorkout(pace: number, volumeKm: number): Workout {
	const pickupMinutes = roundToNearest5Seconds(M_FARTLEK_PICKUP_KM * pace);
	const qualityMinutesBudget = volumeKm * pace;
	const pickupCount = Math.max(
		M_FARTLEK_MIN_PICKUPS,
		Math.round(qualityMinutesBudget / (pickupMinutes + M_FARTLEK_RECOVERY_MINUTES))
	);

	const segments: WorkoutSegment[] = [];
	for (let i = 0; i < pickupCount; i++) {
		segments.push({ type: 'work', durationMinutes: pickupMinutes, intensity: ZONE_INTENSITY.M });
		if (i < pickupCount - 1) {
			segments.push({
				type: 'recovery',
				durationMinutes: M_FARTLEK_RECOVERY_MINUTES,
				intensity: RECOVERY_INTENSITY
			});
		}
	}

	const qualityTime = sumSegmentMinutes(segments);
	segments.unshift(warmupSegment(computeWarmupMinutes('M', qualityTime)));
	segments.push(cooldownSegment(computeCooldownMinutes('M', qualityTime)));

	return {
		label: 'Marathon-pace fartlek',
		description: `${pickupCount} × ${round1(M_FARTLEK_PICKUP_KM)}km pickups at M pace, ${M_FARTLEK_RECOVERY_MINUTES} min steady jog recovery between`,
		totalVolumeKm: round1(pickupCount * M_FARTLEK_PICKUP_KM),
		recovery: `${M_FARTLEK_RECOVERY_MINUTES} min steady jog between pickups`,
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'fartlek'
	};
}

const T_FARTLEK_PICKUP_MINUTES = 1.5; // midpoint of AC-3.3's 1-2min band
const T_FARTLEK_RECOVERY_FRACTION = 0.5; // shorter than Cruise Intervals' ~1:5 — brief surges, not full reps
const T_FARTLEK_MIN_PICKUPS = 3;

function buildTFartlekWorkout(pace: number, volumeKm: number): Workout {
	const durationMinutes = volumeKm * pace;
	const recoveryMinutes = roundToNearest5Seconds(T_FARTLEK_PICKUP_MINUTES * T_FARTLEK_RECOVERY_FRACTION);
	const pickupCount = Math.max(
		T_FARTLEK_MIN_PICKUPS,
		Math.round(durationMinutes / (T_FARTLEK_PICKUP_MINUTES + recoveryMinutes))
	);

	const segments: WorkoutSegment[] = [];
	for (let i = 0; i < pickupCount; i++) {
		segments.push({
			type: 'work',
			durationMinutes: roundToNearest5Seconds(T_FARTLEK_PICKUP_MINUTES),
			// Stays at T's own zone intensity (not a higher one) — AC-3.3's pickups are hard
			// *within* the threshold session, not a push into Interval territory.
			intensity: ZONE_INTENSITY.T
		});
		if (i < pickupCount - 1) {
			segments.push({ type: 'recovery', durationMinutes: recoveryMinutes, intensity: RECOVERY_INTENSITY });
		}
	}

	const qualityTime = sumSegmentMinutes(segments);
	segments.unshift(warmupSegment(computeWarmupMinutes('T', qualityTime)));
	segments.push(cooldownSegment(computeCooldownMinutes('T', qualityTime)));

	return {
		label: 'Threshold fartlek',
		description: `${pickupCount} × ${formatMinutes(T_FARTLEK_PICKUP_MINUTES)} min hard pickups at T pace, ${formatMinutes(recoveryMinutes)} min jog recovery between`,
		totalVolumeKm: round1(volumeKm),
		recovery: `${formatMinutes(recoveryMinutes)} min jog between pickups`,
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'fartlek'
	};
}

const I_FARTLEK_BURST_MINUTES = 4; // midpoint of AC-3.4's 3-5min band
const I_FARTLEK_RECOVERY_MINUTES = 1; // fixed, per AC-3.4
const I_FARTLEK_MIN_REPS = 3; // AC-3.4's explicit floor

function buildIFartlekWorkout(pace: number, volumeKm: number): Workout {
	const durationMinutes = volumeKm * pace;
	const repCount = Math.max(
		I_FARTLEK_MIN_REPS,
		Math.round(durationMinutes / (I_FARTLEK_BURST_MINUTES + I_FARTLEK_RECOVERY_MINUTES))
	);

	const segments: WorkoutSegment[] = [];
	for (let i = 0; i < repCount; i++) {
		segments.push({
			type: 'work',
			durationMinutes: roundToNearest5Seconds(I_FARTLEK_BURST_MINUTES),
			intensity: ZONE_INTENSITY.I
		});
		if (i < repCount - 1) {
			segments.push({
				type: 'recovery',
				durationMinutes: I_FARTLEK_RECOVERY_MINUTES,
				intensity: RECOVERY_INTENSITY
			});
		}
	}

	const qualityTime = sumSegmentMinutes(segments);
	segments.unshift(warmupSegment(computeWarmupMinutes('I', qualityTime)));
	segments.push(cooldownSegment(computeCooldownMinutes('I', qualityTime)));

	return {
		label: 'Interval fartlek',
		description: `${repCount} × ${formatMinutes(I_FARTLEK_BURST_MINUTES)} min hard bursts at I pace, ${formatMinutes(I_FARTLEK_RECOVERY_MINUTES)} min recovery between`,
		totalVolumeKm: round1(volumeKm),
		recovery: `${formatMinutes(I_FARTLEK_RECOVERY_MINUTES)} min recovery between bursts`,
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'fartlek'
	};
}

/**
 * Build the fartlek variant for M, T, or I zone (AC-3.1). Each zone's structure is distinct
 * per its own AC (M: 2-3km pickups with steady recovery; T: 1-2min hard pickups that stay
 * within threshold intensity; I: 3-5min hard bursts with a fixed 1min recovery, >=3 reps) —
 * dispatched here rather than exposing three separately-named exports, so buildZoneWorkouts
 * (workouts.ts) can wire it in with one call per applicable zone.
 */
export function buildFartlekWorkout(zone: 'M' | 'T' | 'I', pace: number, volumeKm: number): Workout {
	switch (zone) {
		case 'M':
			return buildMFartlekWorkout(pace, volumeKm);
		case 'T':
			return buildTFartlekWorkout(pace, volumeKm);
		case 'I':
			return buildIFartlekWorkout(pace, volumeKm);
	}
}
