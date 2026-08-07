import { parsePace } from './pace';
import {
	buildTrainingPaceResult,
	ZONE_META,
	type ZoneKey,
	type TrainingZone
} from './training-paces';

export type WorkoutSegmentType = 'warmup' | 'work' | 'recovery' | 'cooldown';

export interface WorkoutSegment {
	type: WorkoutSegmentType;
	durationMinutes: number;
	/** Relative intensity for chart display only, 0-1 — not a physiological unit. */
	intensity: number;
}

export interface Workout {
	/** e.g. "1000m reps", "Continuous tempo", "Long run" */
	label: string;
	/** e.g. "5 x 1000m at I pace, jog 2:30 recovery" */
	description: string;
	/** Total quality km this session (continuous zones: full distance; reps: repCount x repKm) */
	totalVolumeKm: number;
	/** Recovery guidance, e.g. "None (continuous)" or "2:30 jog between reps" */
	recovery: string;
	/** warm-up + quality time + recovery time + cool-down */
	estimatedDurationMinutes: number;
	/** Chronological warm-up/work/recovery/cool-down timeline, for the profile chart. Durations sum to estimatedDurationMinutes. */
	segments: WorkoutSegment[];
}

export interface WorkoutZone {
	zone: ZoneKey;
	name: string;
	paceMinKmLow: string;
	paceMinKmHigh: string;
	paceMinMileLow: string;
	paceMinMileHigh: string;
	workouts: [Workout, Workout];
}

export interface WorkoutsResult {
	vdot: number;
	zones: WorkoutZone[];
}

/**
 * Per-zone warm-up/cool-down band (minutes, applied symmetrically — warm-up duration always
 * equals cool-down duration for a given workout) and the reference curve used to interpolate a
 * specific workout's value within its zone's band, based on that workout's own quality-session
 * duration (its pre-warm-up/cool-down time).
 *
 * This is an ordinary product convention, not a Daniels citation — unlike the volume/session-shape
 * rules below, there is no external source for warm-up/cool-down duration. I/R bands are longer
 * than E/M/T's, matching common coaching practice that harder, faster efforts need a more gradual
 * physiological build-up (often including strides/drills) before going near-max effort, whereas an
 * Easy run starts easy by definition and needs little formal warm-up.
 *
 * One shared 0-60 min reference curve is used for every zone (rather than a separate reference
 * range per zone) since only E (30-150 min, via E_DURATION_MIN/MAX_MINUTES) and M (110 min, via
 * M_DURATION_CAP_MINUTES) have an existing duration constant to anchor a per-zone range to; T/I/R
 * would each need a newly-invented range with no more justification than the shared curve.
 */
export const WARMUP_COOLDOWN_BAND: Record<ZoneKey, { min: number; max: number }> = {
	E: { min: 5, max: 10 },
	M: { min: 8, max: 12 },
	T: { min: 10, max: 14 },
	I: { min: 12, max: 16 },
	R: { min: 12, max: 16 }
};
const WARMUP_COOLDOWN_REFERENCE_MAX_MINUTES = 60;

/**
 * A workout's warm-up/cool-down duration (each side), interpolated within its zone's band based
 * on its quality-session duration: 0 minutes of quality time lands at the band minimum, 60+
 * minutes lands at the band maximum, linear in between, rounded to the nearest whole minute.
 */
export function computeWarmupCooldownMinutes(zone: ZoneKey, qualityMinutes: number): number {
	const { min, max } = WARMUP_COOLDOWN_BAND[zone];
	const t =
		Math.min(Math.max(qualityMinutes, 0), WARMUP_COOLDOWN_REFERENCE_MAX_MINUTES) /
		WARMUP_COOLDOWN_REFERENCE_MAX_MINUTES;
	return Math.round(min + t * (max - min));
}

/**
 * Per-zone weekly-mileage-share and absolute-cap rules for quality-session volume.
 *
 * Source/confidence: corroborated across three independently-authored secondary summaries of
 * Jack Daniels' "Running Formula" (the book itself isn't fetchable, so this is not a direct
 * page-number quote). The Repetition-zone cap was additionally cross-confirmed via two different
 * unit systems (5% of weekly miles vs. an 8km/5-mile cap converging on the same value). This is a
 * "corroborated secondary-source consensus" confidence tier — stronger than an unverified single
 * source, one tier below verification against a vendor's own primary documentation.
 */
const E_REGULAR_SHARE = 0.275; // midpoint of 25-30% of weekly mileage
const E_LONG_SHARE_UNDER_64KM = 0.3;
const E_LONG_SHARE_AT_OR_OVER_64KM = 0.25;
const E_LONG_MILEAGE_THRESHOLD_KM = 64;
const E_DURATION_MIN_MINUTES = 30;
const E_DURATION_MAX_MINUTES = 150;
const M_SHARE = 0.175; // midpoint of 15-20%
const M_DURATION_CAP_MINUTES = 110;
const M_DISTANCE_CAP_KM = 29;
const T_SHARE = 0.1;
const I_SHARE = 0.08;
const I_DISTANCE_CAP_KM = 10;
const R_SHARE = 0.05;
const R_DISTANCE_CAP_KM = 8;

/** Rep-distance conventions (session-shape source table, same confidence tier as above). */
const I_REP_DISTANCES_M = [1000, 1200];
const R_REP_DISTANCES_M = [200, 400];
const MIN_REPS = 3;

/**
 * Relative intensity values used only for the workout profile chart's y-axis — a visual
 * ordering (E < M < T < I < R, with warm-up/cool-down/recovery lowest), not a physiological
 * unit or a claim about actual %VO2max.
 */
const WARMUP_INTENSITY = 0.25;
const COOLDOWN_INTENSITY = 0.25;
const RECOVERY_INTENSITY = 0.2;
const ZONE_INTENSITY: Record<ZoneKey, number> = { E: 0.35, M: 0.55, T: 0.7, I: 0.85, R: 1 };

function warmupSegment(zone: ZoneKey, qualityMinutes: number): WorkoutSegment {
	return {
		type: 'warmup',
		durationMinutes: computeWarmupCooldownMinutes(zone, qualityMinutes),
		intensity: WARMUP_INTENSITY
	};
}

function cooldownSegment(zone: ZoneKey, qualityMinutes: number): WorkoutSegment {
	return {
		type: 'cooldown',
		durationMinutes: computeWarmupCooldownMinutes(zone, qualityMinutes),
		intensity: COOLDOWN_INTENSITY
	};
}

/** Parse a zone's low/high formatted paces to the midpoint decimal min/km. */
function midpointPaceMinKm(zone: TrainingZone): number {
	const low = parsePace(zone.paceMinKmLow)!;
	const high = parsePace(zone.paceMinKmHigh)!;
	return (low + high) / 2;
}

function round1(n: number): number {
	return Math.round(n * 10) / 10;
}

/**
 * Compute this zone's quality-session volume (km) from weekly mileage, applying the sourced
 * percentage-of-weekly-mileage rule and its absolute cap. For E, returns the *regular* easy-day
 * volume; use computeELongRunVolumeKm for the long-run variant.
 */
export function computeZoneVolumeKm(zone: ZoneKey, weeklyMileageKm: number, pace: number): number {
	switch (zone) {
		case 'E': {
			const raw = weeklyMileageKm * E_REGULAR_SHARE;
			const rawDuration = raw * pace;
			const clampedDuration = Math.min(
				E_DURATION_MAX_MINUTES,
				Math.max(E_DURATION_MIN_MINUTES, rawDuration)
			);
			return clampedDuration / pace;
		}
		case 'M': {
			const raw = weeklyMileageKm * M_SHARE;
			const cap = Math.min(M_DISTANCE_CAP_KM, M_DURATION_CAP_MINUTES / pace);
			return Math.min(raw, cap);
		}
		case 'T':
			return weeklyMileageKm * T_SHARE;
		case 'I':
			return Math.min(weeklyMileageKm * I_SHARE, I_DISTANCE_CAP_KM);
		case 'R':
			return Math.min(weeklyMileageKm * R_SHARE, R_DISTANCE_CAP_KM);
	}
}

/**
 * E zone's long-run volume (km) — distinct share and cap from the regular easy day, but shares
 * the same E_DURATION_MIN_MINUTES floor: a long run should never be prescribed less running than
 * a regular easy day. Without this floor, very low weekly mileage could push the long run's raw
 * duration below the regular run's own 30-min floor, producing a "Long run" shorter than the
 * "Regular easy run" beside it.
 */
export function computeELongRunVolumeKm(weeklyMileageKm: number, ePace: number): number {
	const share =
		weeklyMileageKm < E_LONG_MILEAGE_THRESHOLD_KM
			? E_LONG_SHARE_UNDER_64KM
			: E_LONG_SHARE_AT_OR_OVER_64KM;
	const raw = weeklyMileageKm * share;
	const rawDuration = raw * ePace;
	let clampedDuration = Math.max(E_DURATION_MIN_MINUTES, rawDuration);
	if (weeklyMileageKm >= E_LONG_MILEAGE_THRESHOLD_KM) {
		clampedDuration = Math.min(E_DURATION_MAX_MINUTES, clampedDuration);
	}
	return clampedDuration / ePace;
}

function continuousWorkout(
	label: string,
	description: string,
	volumeKm: number,
	pace: number,
	zone: ZoneKey
): Workout {
	const qualityMinutes = volumeKm * pace;
	const warmupCooldownMinutes = computeWarmupCooldownMinutes(zone, qualityMinutes);
	return {
		label,
		description,
		totalVolumeKm: round1(volumeKm),
		recovery: 'None (continuous)',
		estimatedDurationMinutes: Math.round(qualityMinutes + 2 * warmupCooldownMinutes),
		segments: [
			warmupSegment(zone, qualityMinutes),
			{ type: 'work', durationMinutes: qualityMinutes, intensity: ZONE_INTENSITY[zone] },
			cooldownSegment(zone, qualityMinutes)
		]
	};
}

function formatMinutes(minutes: number): string {
	return `${Math.round(minutes)} min`;
}

function buildEWorkouts(volumeKm: number, longRunVolumeKm: number, pace: number): [Workout, Workout] {
	const regular = continuousWorkout(
		'Regular easy run',
		`${formatMinutes(volumeKm * pace)} continuous easy run at E pace`,
		volumeKm,
		pace,
		'E'
	);
	const long = continuousWorkout(
		'Long run',
		`${formatMinutes(longRunVolumeKm * pace)} continuous long run at the easier end of E pace`,
		longRunVolumeKm,
		pace,
		'E'
	);
	return [regular, long];
}

function buildMWorkouts(volumeKm: number, mPace: number, ePace: number): [Workout, Workout] {
	const continuous = continuousWorkout(
		'Continuous marathon-pace run',
		`${round1(volumeKm)}km (${formatMinutes(volumeKm * mPace)}) continuous at M pace`,
		volumeKm,
		mPace,
		'M'
	);
	const segmentKm = round1(volumeKm / 2);
	const jogKm = 1.5;
	const jogMinutes = jogKm * ePace;
	const segmentMinutes = (volumeKm / 2) * mPace;
	const segmentedQualityMinutes = volumeKm * mPace + jogMinutes;
	const segmentedWarmupCooldownMinutes = computeWarmupCooldownMinutes('M', segmentedQualityMinutes);
	const segmented: Workout = {
		label: 'Marathon-pace segments',
		description: `2 x ${segmentKm}km at M pace, ${jogKm}km easy jog recovery between`,
		totalVolumeKm: round1(volumeKm),
		recovery: `${jogKm}km easy jog between segments`,
		estimatedDurationMinutes: Math.round(
			segmentedQualityMinutes + 2 * segmentedWarmupCooldownMinutes
		),
		segments: [
			warmupSegment('M', segmentedQualityMinutes),
			{ type: 'work', durationMinutes: segmentMinutes, intensity: ZONE_INTENSITY.M },
			{ type: 'recovery', durationMinutes: jogMinutes, intensity: RECOVERY_INTENSITY },
			{ type: 'work', durationMinutes: segmentMinutes, intensity: ZONE_INTENSITY.M },
			cooldownSegment('M', segmentedQualityMinutes)
		]
	};
	return [continuous, segmented];
}

function buildTWorkouts(volumeKm: number, tPace: number): [Workout, Workout] {
	const durationMinutes = volumeKm * tPace;
	const continuous = continuousWorkout(
		'Continuous tempo run',
		`${formatMinutes(durationMinutes)} continuous tempo at T pace`,
		volumeKm,
		tPace,
		'T'
	);
	// Cruise intervals: reps of ~5.5 min (source: 3-15 min range, commonly 5-6 min in worked
	// examples), recovery ~1 min per 5 min of work (~5:1 work:rest).
	const repMinutes = 5.5;
	const repCount = Math.max(2, Math.round(durationMinutes / repMinutes));
	const recoveryPerRep = round1(repMinutes / 5);
	const totalDuration = repCount * repMinutes + (repCount - 1) * recoveryPerRep;
	const cruiseWarmupCooldownMinutes = computeWarmupCooldownMinutes('T', totalDuration);
	const cruiseSegments: WorkoutSegment[] = [warmupSegment('T', totalDuration)];
	for (let i = 0; i < repCount; i++) {
		cruiseSegments.push({ type: 'work', durationMinutes: repMinutes, intensity: ZONE_INTENSITY.T });
		if (i < repCount - 1) {
			cruiseSegments.push({
				type: 'recovery',
				durationMinutes: recoveryPerRep,
				intensity: RECOVERY_INTENSITY
			});
		}
	}
	cruiseSegments.push(cooldownSegment('T', totalDuration));
	const cruise: Workout = {
		label: 'Cruise intervals',
		description: `${repCount} x ${repMinutes} min at T pace, ${recoveryPerRep} min jog recovery between reps`,
		totalVolumeKm: round1(volumeKm),
		recovery: `${recoveryPerRep} min jog between reps`,
		estimatedDurationMinutes: Math.round(totalDuration + 2 * cruiseWarmupCooldownMinutes),
		segments: cruiseSegments
	};
	return [continuous, cruise];
}

/**
 * Build a single reps-based workout (I or R zone) at a fixed rep distance, flooring the rep
 * count at MIN_REPS rather than showing an unrealistically low count when the computed volume
 * is too small. Each of the two standard distances for a zone is always built independently at
 * its own fixed distance (never falling back to the other) so the two workout variants can never
 * collapse onto the same distance/label — Svelte's keyed {#each} over the two workouts requires
 * distinct keys, and low-mileage inputs previously caused both to fall back to the same smaller
 * distance, crashing the results section entirely.
 */
function buildRepsWorkout(
	zone: 'I' | 'R',
	repDistanceM: number,
	volumeKm: number,
	pace: number,
	recoveryFraction: (repMinutes: number) => number,
	recoveryDescription: (repDistanceM: number, recoveryMinutes: number) => string
): Workout {
	const volumeM = volumeKm * 1000;
	const reps = Math.max(MIN_REPS, Math.round(volumeM / repDistanceM));

	const repKm = repDistanceM / 1000;
	const repMinutes = repKm * pace;
	const recoveryMinutes = round1(repMinutes * recoveryFraction(repMinutes));
	const totalVolumeKm = round1(reps * repKm);
	const totalDuration = reps * repMinutes + (reps - 1) * recoveryMinutes;
	const warmupCooldownMinutes = computeWarmupCooldownMinutes(zone, totalDuration);

	const segments: WorkoutSegment[] = [warmupSegment(zone, totalDuration)];
	for (let i = 0; i < reps; i++) {
		segments.push({ type: 'work', durationMinutes: repMinutes, intensity: ZONE_INTENSITY[zone] });
		if (i < reps - 1) {
			segments.push({ type: 'recovery', durationMinutes: recoveryMinutes, intensity: RECOVERY_INTENSITY });
		}
	}
	segments.push(cooldownSegment(zone, totalDuration));

	return {
		label: `${repDistanceM}m reps`,
		description: `${reps} x ${repDistanceM}m at ${zone} pace, ${recoveryDescription(repDistanceM, recoveryMinutes)}`,
		totalVolumeKm,
		recovery: recoveryDescription(repDistanceM, recoveryMinutes),
		estimatedDurationMinutes: Math.round(totalDuration + 2 * warmupCooldownMinutes),
		segments
	};
}

function buildIWorkouts(volumeKm: number, iPace: number): [Workout, Workout] {
	// Recovery: jogged, ~50-100% of the rep's work duration; midpoint (75%) used.
	const recoveryFraction = () => 0.75;
	const recoveryDescription = (repDistanceM: number, recoveryMinutes: number) =>
		`jog ${formatMinutes(recoveryMinutes)} recovery`;
	const a = buildRepsWorkout(
		'I',
		I_REP_DISTANCES_M[0],
		volumeKm,
		iPace,
		recoveryFraction,
		recoveryDescription
	);
	const b = buildRepsWorkout(
		'I',
		I_REP_DISTANCES_M[1],
		volumeKm,
		iPace,
		recoveryFraction,
		recoveryDescription
	);
	return [a, b];
}

function buildRWorkouts(volumeKm: number, rPace: number): [Workout, Workout] {
	// Recovery: equal distance jogged (the more commonly cited practical rule).
	const recoveryFraction = () => 1;
	const recoveryDescription = (repDistanceM: number) => `${repDistanceM}m jog recovery`;
	const a = buildRepsWorkout(
		'R',
		R_REP_DISTANCES_M[0],
		volumeKm,
		rPace,
		recoveryFraction,
		recoveryDescription
	);
	const b = buildRepsWorkout(
		'R',
		R_REP_DISTANCES_M[1],
		volumeKm,
		rPace,
		recoveryFraction,
		recoveryDescription
	);
	return [a, b];
}

export function buildZoneWorkouts(
	zone: ZoneKey,
	trainingZones: TrainingZone[],
	weeklyMileageKm: number
): [Workout, Workout] {
	const paceByZone = new Map(trainingZones.map((z) => [z.zone, midpointPaceMinKm(z)]));
	const pace = paceByZone.get(zone)!;

	switch (zone) {
		case 'E': {
			const ePace = paceByZone.get('E')!;
			const regularVolume = computeZoneVolumeKm('E', weeklyMileageKm, ePace);
			const longVolume = computeELongRunVolumeKm(weeklyMileageKm, ePace);
			return buildEWorkouts(regularVolume, longVolume, ePace);
		}
		case 'M':
			return buildMWorkouts(
				computeZoneVolumeKm('M', weeklyMileageKm, pace),
				pace,
				paceByZone.get('E')!
			);
		case 'T':
			return buildTWorkouts(computeZoneVolumeKm('T', weeklyMileageKm, pace), pace);
		case 'I':
			return buildIWorkouts(computeZoneVolumeKm('I', weeklyMileageKm, pace), pace);
		case 'R':
			return buildRWorkouts(computeZoneVolumeKm('R', weeklyMileageKm, pace), pace);
	}
}

/**
 * Given a race result and weekly training mileage, return per-zone workout prescriptions or a
 * sentinel for invalid/out-of-range input. Mirrors training-paces.ts's buildTrainingPaceResult
 * sentinel pattern exactly.
 */
export function buildWorkoutsResult(
	distanceKm: number,
	timeSeconds: number,
	weeklyMileageKm: number
): WorkoutsResult | 'out-of-range' | null {
	if (weeklyMileageKm <= 0) return null;
	const paceResult = buildTrainingPaceResult(distanceKm, timeSeconds);
	if (paceResult === null || paceResult === 'out-of-range') return paceResult;

	const trainingZones = paceResult.zones;
	const zones: WorkoutZone[] = trainingZones.map((tz) => ({
		zone: tz.zone,
		name: ZONE_META[tz.zone].name,
		paceMinKmLow: tz.paceMinKmLow,
		paceMinKmHigh: tz.paceMinKmHigh,
		paceMinMileLow: tz.paceMinMileLow,
		paceMinMileHigh: tz.paceMinMileHigh,
		workouts: buildZoneWorkouts(tz.zone, trainingZones, weeklyMileageKm)
	}));

	return { vdot: paceResult.vdot, zones };
}
