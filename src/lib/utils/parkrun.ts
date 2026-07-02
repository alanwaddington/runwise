import { formatTime, riegelPredict } from './race-predictor';

export type EffortLevel = 'easy' | 'moderate' | 'hard';
export type Gender = 'male' | 'female';
export type AgeGradeLabel = 'World' | 'National' | 'Regional' | 'Local' | 'Recreational';

export interface SplitRow {
	km: number;
	cumulative: string;
	splitPace: string;
}

export interface PbComparison {
	/** Positive when the predicted time is faster than the PB. */
	deltaSeconds: number;
	description: string;
}

/** Effort level mapped to an equivalent race distance (km) used for Riegel prediction. */
export const EFFORT_DISTANCES: Record<EffortLevel, number> = {
	easy: 42.195,
	moderate: 21.0975,
	hard: 10
};

export function effortToRaceDistanceKm(effort: EffortLevel): number {
	return EFFORT_DISTANCES[effort];
}

/**
 * Predict a 5K parkrun time from a training run, distance, and effort level.
 * The training run's per-km pace is treated as the runner's race pace at the
 * effort's mapped distance (Easy → marathon, Moderate → half marathon, Hard → 10K),
 * then Riegel-predicted down to 5K. A slower/easier effort implies more fitness
 * in reserve, so it produces a faster (more optimistic) prediction than a harder effort
 * at the same training pace.
 * Returns null for invalid (zero/negative) distance or time.
 */
export function predictParkrunTime(
	distanceKm: number,
	timeSeconds: number,
	effort: EffortLevel
): number | null {
	if (distanceKm <= 0 || timeSeconds <= 0) return null;
	const effortDistanceKm = effortToRaceDistanceKm(effort);
	const paceSecondsPerKm = timeSeconds / distanceKm;
	const equivalentRaceTimeSeconds = paceSecondsPerKm * effortDistanceKm;
	return riegelPredict(equivalentRaceTimeSeconds, effortDistanceKm, 5);
}

/** Build an even-pacing 1K split table (1K–5K) for a predicted total time. */
export function generateSplits(predictedTimeSeconds: number): SplitRow[] {
	if (predictedTimeSeconds <= 0) return [];
	const splitSeconds = predictedTimeSeconds / 5;
	return Array.from({ length: 5 }, (_, i) => {
		const km = i + 1;
		return {
			km,
			cumulative: formatTime(splitSeconds * km),
			splitPace: formatTime(splitSeconds)
		};
	});
}

/** Compare a predicted time against a personal best, returning a display-ready description. */
export function compareToPb(predictedSeconds: number, pbSeconds: number): PbComparison {
	const deltaSeconds = Math.round(pbSeconds - predictedSeconds);

	if (deltaSeconds === 0) {
		return { deltaSeconds, description: 'right on your PB pace' };
	}

	const absSeconds = Math.abs(deltaSeconds);
	const unit = absSeconds === 1 ? 'second' : 'seconds';
	const direction = deltaSeconds > 0 ? 'faster' : 'slower';

	return { deltaSeconds, description: `${absSeconds} ${unit} ${direction} than your PB` };
}

// ─── WMA Age Grading (5K, road) ──────────────────────────────────────────────
// Source: WMA/Alan Jones Age-Grade Tables, 2025 road-running standards.
// OC_SECONDS is the open-class (peak-age) standard time for 5K.
// AGE_FACTORS maps age (5–100) to the WMA age factor for 5K (1.0 = peak).

const OC_SECONDS: Record<Gender, number> = {
	male: 769,
	female: 834
};

const AGE_FACTORS: Record<Gender, Record<number, number>> = {
	male: {
		5: 0.5533, 6: 0.6158, 7: 0.6734, 8: 0.7262, 9: 0.7742, 10: 0.8174,
		11: 0.8559, 12: 0.8895, 13: 0.9183, 14: 0.9423, 15: 0.9615, 16: 0.976,
		17: 0.988, 18: 0.997, 19: 1.0, 20: 1.0, 21: 1.0, 22: 1.0, 23: 1.0,
		24: 1.0, 25: 1.0, 26: 1.0, 27: 1.0, 28: 1.0, 29: 1.0, 30: 0.9999,
		31: 0.9987, 32: 0.9962, 33: 0.9924, 34: 0.9874, 35: 0.981, 36: 0.974,
		37: 0.967, 38: 0.96, 39: 0.953, 40: 0.946, 41: 0.939, 42: 0.932,
		43: 0.925, 44: 0.918, 45: 0.911, 46: 0.904, 47: 0.897, 48: 0.89,
		49: 0.883, 50: 0.876, 51: 0.869, 52: 0.862, 53: 0.855, 54: 0.848,
		55: 0.841, 56: 0.834, 57: 0.827, 58: 0.82, 59: 0.813, 60: 0.806,
		61: 0.799, 62: 0.792, 63: 0.785, 64: 0.778, 65: 0.771, 66: 0.764,
		67: 0.757, 68: 0.7498, 69: 0.7422, 70: 0.7339, 71: 0.725, 72: 0.7156,
		73: 0.7055, 74: 0.6948, 75: 0.6836, 76: 0.6717, 77: 0.6592, 78: 0.6462,
		79: 0.6325, 80: 0.6182, 81: 0.6034, 82: 0.5879, 83: 0.5718, 84: 0.5552,
		85: 0.5379, 86: 0.52, 87: 0.5016, 88: 0.4825, 89: 0.4628, 90: 0.4426,
		91: 0.4217, 92: 0.4002, 93: 0.3782, 94: 0.3555, 95: 0.3322, 96: 0.3084,
		97: 0.2839, 98: 0.2588, 99: 0.2332, 100: 0.2069
	},
	female: {
		5: 0.6903, 6: 0.7222, 7: 0.7527, 8: 0.7816, 9: 0.8091, 10: 0.8351,
		11: 0.8596, 12: 0.8827, 13: 0.9042, 14: 0.9243, 15: 0.9433, 16: 0.9622,
		17: 0.9811, 18: 0.9953, 19: 1.0, 20: 1.0, 21: 1.0, 22: 1.0, 23: 1.0,
		24: 1.0, 25: 1.0, 26: 1.0, 27: 0.9997, 28: 0.999, 29: 0.9977, 30: 0.9959,
		31: 0.9936, 32: 0.9908, 33: 0.9875, 34: 0.9836, 35: 0.9793, 36: 0.9744,
		37: 0.9691, 38: 0.9632, 39: 0.9568, 40: 0.9499, 41: 0.9425, 42: 0.9346,
		43: 0.9262, 44: 0.9172, 45: 0.9078, 46: 0.898, 47: 0.8883, 48: 0.8786,
		49: 0.8689, 50: 0.8592, 51: 0.8495, 52: 0.8398, 53: 0.8301, 54: 0.8204,
		55: 0.8107, 56: 0.8009, 57: 0.7912, 58: 0.7815, 59: 0.7718, 60: 0.7621,
		61: 0.7524, 62: 0.7427, 63: 0.733, 64: 0.7233, 65: 0.7136, 66: 0.7038,
		67: 0.6941, 68: 0.6844, 69: 0.6747, 70: 0.665, 71: 0.6553, 72: 0.6456,
		73: 0.6359, 74: 0.6262, 75: 0.6165, 76: 0.6067, 77: 0.597, 78: 0.5868,
		79: 0.5758, 80: 0.564, 81: 0.5515, 82: 0.5382, 83: 0.5242, 84: 0.5094,
		85: 0.4938, 86: 0.4775, 87: 0.4604, 88: 0.4426, 89: 0.424, 90: 0.4046,
		91: 0.3845, 92: 0.3636, 93: 0.3419, 94: 0.3195, 95: 0.2964, 96: 0.2725,
		97: 0.2478, 98: 0.2223, 99: 0.1961, 100: 0.1692
	}
};

const AGE_GRADE_BANDS: { minPercent: number; label: AgeGradeLabel }[] = [
	{ minPercent: 100, label: 'World' },
	{ minPercent: 90, label: 'National' },
	{ minPercent: 80, label: 'Regional' },
	{ minPercent: 70, label: 'Local' },
	{ minPercent: 0, label: 'Recreational' }
];

/**
 * Calculate a WMA-style age grade percentage for a 5K time.
 * Uses real WMA/Alan Jones 2025 road-running age factors: the age-adjusted
 * standard time is the open-class standard divided by the runner's age factor,
 * and the age grade is that standard expressed as a percentage of the actual time.
 * Returns null for an invalid time or an age outside the supported 5–100 range.
 */
export function calculateAgeGrade(
	timeSeconds: number,
	age: number,
	gender: Gender
): number | null {
	if (timeSeconds <= 0) return null;
	const ageFactor = AGE_FACTORS[gender][age];
	if (ageFactor === undefined) return null;
	const ageStandardSeconds = OC_SECONDS[gender] / ageFactor;
	return (ageStandardSeconds / timeSeconds) * 100;
}

/** Map an age grade percentage to its WMA-style performance band. */
export function getAgeGradeLabel(percent: number): AgeGradeLabel {
	const band = AGE_GRADE_BANDS.find((b) => percent >= b.minPercent);
	return band!.label;
}
