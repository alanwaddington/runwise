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

// ─── Progression patterns (Task 8, AC-4.1-4.3, AC-4.7, AC-4.8) ─────────────
// M already has one (buildMWorkouts' "Progression run"); this adds T and I. Both build
// increasing-duration reps at a fixed set of ratios (rather than increasing intensity) — matching
// AC-4.2's own example ("3 reps of 5min, 6min, 7min") and, for I, AC-4.3's "400m->600m->800m"
// example, which is a distance/duration increase at constant pace, not an intensity increase.

const T_PROGRESSION_STEP_RATIOS = [0.8, 1, 1.2]; // ~5:6:7 min, AC-4.2's own example
const T_PROGRESSION_RECOVERY_FRACTION = 0.2; // matches Cruise Intervals' ~1:5 work:rest convention

function buildTProgressionWorkout(pace: number, volumeKm: number): Workout {
	const ratioSum = T_PROGRESSION_STEP_RATIOS.reduce((a, b) => a + b, 0);
	const baseMinutes = (volumeKm * pace) / ratioSum;

	const segments: WorkoutSegment[] = [];
	T_PROGRESSION_STEP_RATIOS.forEach((ratio, i) => {
		const repMinutes = roundToNearest5Seconds(baseMinutes * ratio);
		segments.push({ type: 'work', durationMinutes: repMinutes, intensity: ZONE_INTENSITY.T });
		if (i < T_PROGRESSION_STEP_RATIOS.length - 1) {
			segments.push({
				type: 'recovery',
				durationMinutes: roundToNearest5Seconds(repMinutes * T_PROGRESSION_RECOVERY_FRACTION),
				intensity: RECOVERY_INTENSITY
			});
		}
	});

	const qualityTime = sumSegmentMinutes(segments);
	segments.unshift(warmupSegment(computeWarmupMinutes('T', qualityTime)));
	segments.push(cooldownSegment(computeCooldownMinutes('T', qualityTime)));

	const stepMinutesLabel = T_PROGRESSION_STEP_RATIOS.map((r) => formatMinutes(baseMinutes * r)).join(', ');
	return {
		label: 'Threshold progression',
		description: `3 reps of increasing duration at T pace (${stepMinutesLabel} min)`,
		totalVolumeKm: round1(volumeKm),
		recovery: 'Short jog, proportional to each rep’s own duration',
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'progression'
	};
}

const I_PROGRESSION_STEP_RATIOS = [1, 1.5, 2]; // approximates AC-4.3's 400m:600m:800m example
const I_PROGRESSION_RECOVERY_FRACTION = 0.75; // matches buildIWorkouts' own jog-recovery convention

function buildIProgressionWorkout(pace: number, volumeKm: number): Workout {
	const ratioSum = I_PROGRESSION_STEP_RATIOS.reduce((a, b) => a + b, 0);
	const baseMinutes = (volumeKm * pace) / ratioSum;

	const segments: WorkoutSegment[] = [];
	I_PROGRESSION_STEP_RATIOS.forEach((ratio, i) => {
		const repMinutes = roundToNearest5Seconds(baseMinutes * ratio);
		segments.push({ type: 'work', durationMinutes: repMinutes, intensity: ZONE_INTENSITY.I });
		if (i < I_PROGRESSION_STEP_RATIOS.length - 1) {
			segments.push({
				type: 'recovery',
				durationMinutes: roundToNearest5Seconds(repMinutes * I_PROGRESSION_RECOVERY_FRACTION),
				intensity: RECOVERY_INTENSITY
			});
		}
	});

	const qualityTime = sumSegmentMinutes(segments);
	segments.unshift(warmupSegment(computeWarmupMinutes('I', qualityTime)));
	segments.push(cooldownSegment(computeCooldownMinutes('I', qualityTime)));

	const stepMinutesLabel = I_PROGRESSION_STEP_RATIOS.map((r) => formatMinutes(baseMinutes * r)).join(', ');
	return {
		label: 'Interval progression',
		description: `3 reps of increasing duration at I pace (${stepMinutesLabel} min), approximating a 400m→600m→800m progression`,
		totalVolumeKm: round1(volumeKm),
		recovery: 'Jog recovery, proportional to each rep’s own duration',
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'progression'
	};
}

/**
 * Build the progression variant for T or I zone (AC-4.1). M already has its own (buildMWorkouts).
 * Both increase rep duration across 3 reps at a fixed ratio set — see each zone's own AC for why
 * duration (not intensity) is what increases.
 */
export function buildProgressionWorkout(zone: 'T' | 'I', pace: number, volumeKm: number): Workout {
	switch (zone) {
		case 'T':
			return buildTProgressionWorkout(pace, volumeKm);
		case 'I':
			return buildIProgressionWorkout(pace, volumeKm);
	}
}

// ─── Decay patterns (Task 8, AC-4.4-4.7) ───────────────────────────────────
// I: hard reps followed by shorter/easier reps (AC-4.5's "2x800m hard, 2x400m recovery" — the
// second half decays in both duration and intensity, not just duration).
// R: intensity decays rep-by-rep from full R pace down to genuine recovery effort by the final
// rep (AC-4.6) — "not exceeding recovery zone" describes where the *decayed end* bottoms out,
// not a reinterpretation of R itself (Runwise's R is still Daniels' Repetition zone — the
// fastest zone, not a generic low-intensity "Recovery" zone; see hr-zones.ts's own R-zone note).

const I_DECAY_HARD_REPS = 2;
const I_DECAY_EASY_REPS = 2;
const I_DECAY_EASY_DURATION_FRACTION = 0.5; // AC-4.5's 800m -> 400m halving
const I_DECAY_EASY_INTENSITY_FRACTION = 0.5; // how far toward recovery intensity the easy reps decay
const I_DECAY_RECOVERY_FRACTION = 0.75; // matches buildIWorkouts' own jog-recovery convention

function buildIDecayWorkout(pace: number, volumeKm: number): Workout {
	// hardReps at full duration + easyReps at half duration = (2*1 + 2*0.5) = 3 "duration units".
	const totalUnits = I_DECAY_HARD_REPS + I_DECAY_EASY_REPS * I_DECAY_EASY_DURATION_FRACTION;
	const unitMinutes = (volumeKm * pace) / totalUnits;
	const hardMinutes = roundToNearest5Seconds(unitMinutes);
	const easyMinutes = roundToNearest5Seconds(unitMinutes * I_DECAY_EASY_DURATION_FRACTION);
	const easyIntensity =
		ZONE_INTENSITY.I - I_DECAY_EASY_INTENSITY_FRACTION * (ZONE_INTENSITY.I - RECOVERY_INTENSITY);

	const repPlan: Array<{ minutes: number; intensity: number }> = [
		...Array.from({ length: I_DECAY_HARD_REPS }, () => ({ minutes: hardMinutes, intensity: ZONE_INTENSITY.I })),
		...Array.from({ length: I_DECAY_EASY_REPS }, () => ({ minutes: easyMinutes, intensity: easyIntensity }))
	];

	const segments: WorkoutSegment[] = [];
	repPlan.forEach((rep, i) => {
		segments.push({ type: 'work', durationMinutes: rep.minutes, intensity: rep.intensity });
		if (i < repPlan.length - 1) {
			segments.push({
				type: 'recovery',
				durationMinutes: roundToNearest5Seconds(rep.minutes * I_DECAY_RECOVERY_FRACTION),
				intensity: RECOVERY_INTENSITY
			});
		}
	});

	const qualityTime = sumSegmentMinutes(segments);
	segments.unshift(warmupSegment(computeWarmupMinutes('I', qualityTime)));
	segments.push(cooldownSegment(computeCooldownMinutes('I', qualityTime)));

	return {
		label: 'Hard-to-easy decay',
		description: `${I_DECAY_HARD_REPS} hard reps at I pace (${formatMinutes(hardMinutes)} min) then ${I_DECAY_EASY_REPS} easier reps (${formatMinutes(easyMinutes)} min), jog recovery between`,
		totalVolumeKm: round1(volumeKm),
		recovery: 'Jog recovery, proportional to each rep’s own duration',
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'decay'
	};
}

const R_DECAY_REP_DISTANCE_M = 200; // matches R zone's existing shortest rep-distance convention
const R_DECAY_MIN_REPS = 3;

function buildRDecayWorkout(pace: number, volumeKm: number): Workout {
	const repKm = R_DECAY_REP_DISTANCE_M / 1000;
	const reps = Math.max(R_DECAY_MIN_REPS, Math.round((volumeKm * 1000) / R_DECAY_REP_DISTANCE_M));
	const repMinutes = roundToNearest5Seconds(repKm * pace);

	const segments: WorkoutSegment[] = [];
	for (let i = 0; i < reps; i++) {
		// Linear decay from full R intensity (rep 0) down to exactly RECOVERY_INTENSITY at the
		// final rep — the boundary condition AC-4.7 asks to be tested, and AC-4.6's "not exceeding
		// recovery zone" floor: the decayed end never drops below genuine recovery effort.
		const t = reps === 1 ? 0 : i / (reps - 1);
		const intensity = ZONE_INTENSITY.R - t * (ZONE_INTENSITY.R - RECOVERY_INTENSITY);
		segments.push({ type: 'work', durationMinutes: repMinutes, intensity });
		if (i < reps - 1) {
			segments.push({ type: 'recovery', durationMinutes: repMinutes, intensity: RECOVERY_INTENSITY });
		}
	}

	const qualityTime = sumSegmentMinutes(segments);
	segments.unshift(warmupSegment(computeWarmupMinutes('R', qualityTime)));
	segments.push(cooldownSegment(computeCooldownMinutes('R', qualityTime)));

	return {
		label: 'Repetition decay',
		description: `${reps} x ${R_DECAY_REP_DISTANCE_M}m, intensity decaying from R pace down to easy effort by the final rep`,
		totalVolumeKm: round1(reps * repKm),
		recovery: `${R_DECAY_REP_DISTANCE_M}m jog recovery, easing further each rep`,
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'decay'
	};
}

/** Build the decay variant for I or R zone (AC-4.4). See each zone's own AC for its decay shape. */
export function buildDecayWorkout(zone: 'I' | 'R', pace: number, volumeKm: number): Workout {
	switch (zone) {
		case 'I':
			return buildIDecayWorkout(pace, volumeKm);
		case 'R':
			return buildRDecayWorkout(pace, volumeKm);
	}
}
