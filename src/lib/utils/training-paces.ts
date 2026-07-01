import { formatPace, minPerKmToMinPerMile } from './pace';

export type ZoneKey = 'E' | 'M' | 'T' | 'I' | 'R';

export interface TrainingZone {
	zone: ZoneKey;
	name: string;
	description: string;
	/** Slow boundary — higher min/km value (lower effort) */
	paceMinKmLow: string;
	/** Fast boundary — lower min/km value (higher effort) */
	paceMinKmHigh: string;
	paceMinMileLow: string;
	paceMinMileHigh: string;
}

export interface TrainingPaceResult {
	vdot: number;
	zones: TrainingZone[];
}

export const ZONE_META: Record<ZoneKey, { name: string; description: string }> = {
	E: {
		name: 'Easy / Recovery',
		description:
			'Comfortable aerobic running. Use for easy days, long runs, and warm-ups. Should feel conversational.'
	},
	M: {
		name: 'Marathon',
		description: 'Steady-state effort suitable for marathon-pace training runs.'
	},
	T: {
		name: 'Threshold / Tempo',
		description:
			'Comfortably hard pace you could sustain for about an hour. Use for tempo runs and cruise intervals.'
	},
	I: {
		name: 'Interval',
		description:
			'Hard, close to VO2 max effort. Used in interval sessions of 3–8 minutes per rep to develop aerobic capacity.'
	},
	R: {
		name: 'Repetition',
		description:
			'Fast, short repetitions for developing speed and running economy. Reps last 30–90 seconds.'
	}
};

/**
 * Zone intensity boundaries as a fraction of VDOT (VO2max).
 * slow = lower effort = slower pace = higher min/km value
 * fast = higher effort = faster pace = lower min/km value
 *
 * Fractions derived from Jack Daniels' "Running Formula" intensity zones,
 * calibrated to produce the expected pace ranges for known VDOT values.
 */
const ZONE_FRACTIONS: Record<ZoneKey, { slow: number; fast: number }> = {
	E: { slow: 0.65, fast: 0.72 },
	M: { slow: 0.78, fast: 0.83 },
	T: { slow: 0.88, fast: 0.91 },
	I: { slow: 0.975, fast: 1.0 },
	R: { slow: 1.05, fast: 1.12 }
};

/** Compute VO2 demand for a velocity in m/min (Daniels' formula). */
function velocityToVo2(velocity: number): number {
	return -4.6 + 0.182258 * velocity + 0.000104 * velocity * velocity;
}

/** Solve for velocity (m/min) given a VO2 target using the Daniels' formula. */
function vo2ToVelocity(vo2: number): number {
	const a = 0.000104;
	const b = 0.182258;
	const c = -(vo2 + 4.6);
	return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}

/**
 * Fraction of VO2max utilised during a race of given duration (minutes).
 * Based on the Daniels–Gilbert utilisation curve.
 */
function vo2MaxFraction(durationMinutes: number): number {
	return (
		0.8 +
		0.1894393 * Math.exp(-0.012778 * durationMinutes) +
		0.2989558 * Math.exp(-0.1932605 * durationMinutes)
	);
}

/** Compute raw VDOT without range clamping. Returns null for invalid inputs. */
function computeRawVdot(distanceKm: number, timeSeconds: number): number | null {
	if (distanceKm <= 0 || timeSeconds <= 0) return null;
	const durationMinutes = timeSeconds / 60;
	const velocityMpm = (distanceKm * 1000) / durationMinutes;
	const vo2Race = velocityToVo2(velocityMpm);
	const fraction = vo2MaxFraction(durationMinutes);
	return vo2Race / fraction;
}

/**
 * Calculate a runner's VDOT from a race performance.
 * Returns null for invalid input or if VDOT is outside the supported range (20–85).
 */
export function calculateVdot(distanceKm: number, timeSeconds: number): number | null {
	const vdot = computeRawVdot(distanceKm, timeSeconds);
	if (vdot === null || vdot < 20 || vdot > 85) return null;
	return vdot;
}

/**
 * Derive training pace ranges for all 5 zones from a VDOT value.
 * Uses the Daniels intensity fractions to compute velocities for each zone boundary.
 */
export function getTrainingPaces(vdot: number): TrainingZone[] {
	const zones: ZoneKey[] = ['E', 'M', 'T', 'I', 'R'];
	return zones.map((zone) => {
		const { slow, fast } = ZONE_FRACTIONS[zone];
		const vSlow = vo2ToVelocity(vdot * slow); // m/min (slower velocity)
		const vFast = vo2ToVelocity(vdot * fast); // m/min (faster velocity)
		const paceSlowMinKm = 1000 / vSlow; // higher min/km value = slow boundary
		const paceFastMinKm = 1000 / vFast; // lower min/km value = fast boundary
		return {
			zone,
			name: ZONE_META[zone].name,
			description: ZONE_META[zone].description,
			paceMinKmLow: formatPace(paceSlowMinKm),
			paceMinKmHigh: formatPace(paceFastMinKm),
			paceMinMileLow: formatPace(minPerKmToMinPerMile(paceSlowMinKm)),
			paceMinMileHigh: formatPace(minPerKmToMinPerMile(paceFastMinKm))
		};
	});
}

/**
 * Given a race result, return training pace zones or a sentinel for invalid/out-of-range input.
 * - Returns null for invalid input (zero/negative distance or time).
 * - Returns 'out-of-range' if the performance implies VDOT outside 20–85.
 * - Returns a TrainingPaceResult with VDOT and all 5 zones otherwise.
 */
export function buildTrainingPaceResult(
	distanceKm: number,
	timeSeconds: number
): TrainingPaceResult | 'out-of-range' | null {
	if (distanceKm <= 0 || timeSeconds <= 0) return null;
	const rawVdot = computeRawVdot(distanceKm, timeSeconds);
	if (rawVdot === null) return null;
	if (rawVdot < 20 || rawVdot > 85) return 'out-of-range';
	const vdot = Math.round(rawVdot * 10) / 10;
	return { vdot, zones: getTrainingPaces(rawVdot) };
}
