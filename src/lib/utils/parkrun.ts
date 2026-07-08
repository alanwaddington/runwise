import { formatTime, riegelPredict } from './race-predictor';

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

export interface ReferenceDistance {
	name: string;
	short: string;
	km: number;
}

/** Discrete reference distances selectable via the Average Pace slider, nearest-to-5K first is not required — order is display order (shortest to longest). */
export const REFERENCE_DISTANCES: ReferenceDistance[] = [
	{ name: '1 Mile', short: '1mi', km: 1.60934 },
	{ name: '5K', short: '5K', km: 5 },
	{ name: '10K', short: '10K', km: 10 },
	{ name: '15K', short: '15K', km: 15 },
	{ name: 'Half Marathon', short: 'HM', km: 21.0975 },
	{ name: 'Marathon', short: 'M', km: 42.195 }
];

/**
 * Predict a 5K parkrun time from a training run, distance, and a reference distance (km).
 * The training run's per-km pace is treated as the runner's race pace at the given
 * reference distance, then Riegel-predicted down to 5K. Reference distances closer to
 * 5K extrapolate more accurately; longer reference distances (e.g. marathon) imply more
 * fitness in reserve, so they tend to produce faster (more optimistic) predictions.
 * Returns null for invalid (zero/negative) distance or time.
 */
export function predictParkrunTime(
	distanceKm: number,
	timeSeconds: number,
	referenceDistanceKm: number
): number | null {
	if (distanceKm <= 0 || timeSeconds <= 0) return null;
	const paceSecondsPerKm = timeSeconds / distanceKm;
	const equivalentRaceTimeSeconds = paceSecondsPerKm * referenceDistanceKm;
	return riegelPredict(equivalentRaceTimeSeconds, referenceDistanceKm, 5);
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
// Source: WMA/Alan Jones Road Running Age Standards, "Version 2025-07-27".
// https://github.com/AlanLyttonJones/Age-Grade-Tables/tree/master/2025%20Files
// (MaleRoadStd2025.xlsx / FemaleRoadStd2025.xlsx, "Age Factors" sheet, 5 km column).
// Verified against that source on 2026-07-08 — female matched exactly; male had
// been transcribed incorrectly (large errors for youth ages, small systematic
// drift elsewhere) and was corrected to match.
// OC_SECONDS is the open-class (peak-age) standard time for 5K.
// AGE_FACTORS maps age (5–100) to the WMA age factor for 5K (1.0 = peak).

const OC_SECONDS: Record<Gender, number> = {
	male: 769,
	female: 834
};

const AGE_FACTORS: Record<Gender, Record<number, number>> = {
	male: {
		5: 0.608, 6: 0.6664, 7: 0.72, 8: 0.7688, 9: 0.8128, 10: 0.852,
		11: 0.8864, 12: 0.916, 13: 0.9408, 14: 0.9608, 15: 0.976, 16: 0.9864,
		17: 0.9944, 18: 0.9995, 19: 1.0, 20: 1.0, 21: 1.0, 22: 1.0,
		23: 1.0, 24: 1.0, 25: 1.0, 26: 1.0, 27: 1.0, 28: 1.0,
		29: 1.0, 30: 0.9999, 31: 0.9988, 32: 0.9965, 33: 0.993, 34: 0.9883,
		35: 0.9824, 36: 0.9755, 37: 0.9685, 38: 0.9615, 39: 0.9545, 40: 0.9475,
		41: 0.9405, 42: 0.9335, 43: 0.9265, 44: 0.9195, 45: 0.9125, 46: 0.9055,
		47: 0.8985, 48: 0.8915, 49: 0.8845, 50: 0.8775, 51: 0.8705, 52: 0.8635,
		53: 0.8565, 54: 0.8495, 55: 0.8425, 56: 0.8355, 57: 0.8285, 58: 0.8215,
		59: 0.8145, 60: 0.8075, 61: 0.8005, 62: 0.7935, 63: 0.7865, 64: 0.7795,
		65: 0.7725, 66: 0.7655, 67: 0.7585, 68: 0.7514, 69: 0.7436, 70: 0.7353,
		71: 0.7264, 72: 0.7169, 73: 0.7068, 74: 0.696, 75: 0.6847, 76: 0.6728,
		77: 0.6603, 78: 0.6472, 79: 0.6334, 80: 0.6191, 81: 0.6042, 82: 0.5887,
		83: 0.5726, 84: 0.5558, 85: 0.5385, 86: 0.5206, 87: 0.5021, 88: 0.483,
		89: 0.4632, 90: 0.4429, 91: 0.422, 92: 0.4005, 93: 0.3784, 94: 0.3556,
		95: 0.3323, 96: 0.3084, 97: 0.2839, 98: 0.2588, 99: 0.233, 100: 0.2067
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
