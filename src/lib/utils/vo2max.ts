export type FitnessCategory = 'Superior' | 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
export type Gender = 'male' | 'female';

export const CATEGORIES: FitnessCategory[] = [
	'Superior',
	'Excellent',
	'Good',
	'Fair',
	'Poor',
	'Very Poor'
];

export const CATEGORY_COLOURS: Record<FitnessCategory, string> = {
	Superior: 'bg-emerald-600',
	Excellent: 'bg-emerald-500',
	Good: 'bg-teal-500',
	Fair: 'bg-amber-500',
	Poor: 'bg-orange-500',
	'Very Poor': 'bg-red-500'
};

export interface CategoryThresholds {
	/** Minimum VO2 max (ml/kg/min) for this category */
	superior: number;
	excellent: number;
	good: number;
	fair: number;
	poor: number;
}

export interface AcsmBracket {
	ageMin: number;
	ageMax: number;
	label: string;
	male: CategoryThresholds;
	female: CategoryThresholds;
}

export interface FitnessResult {
	category: FitnessCategory;
	bracket: string;
	gender: Gender;
	/** true when age was outside published ACSM brackets (mapped to nearest) */
	isApproximate: boolean;
}

// ─── ACSM Normative Data ─────────────────────────────────────────────────────
// Source: ACSM's Guidelines for Exercise Testing and Prescription, 11th ed.
// Values are minimum VO2 max (ml/kg/min) required for each category.

const ACSM_BRACKETS: AcsmBracket[] = [
	{
		ageMin: 20,
		ageMax: 29,
		label: '20-29',
		male: { superior: 51.4, excellent: 46.8, good: 42.5, fair: 36.5, poor: 33.0 },
		female: { superior: 44.2, excellent: 39.5, good: 35.5, fair: 31.6, poor: 28.0 }
	},
	{
		ageMin: 30,
		ageMax: 39,
		label: '30-39',
		male: { superior: 48.2, excellent: 44.6, good: 41.0, fair: 35.5, poor: 31.5 },
		female: { superior: 41.0, excellent: 36.7, good: 33.8, fair: 29.9, poor: 26.5 }
	},
	{
		ageMin: 40,
		ageMax: 49,
		label: '40-49',
		male: { superior: 45.7, excellent: 42.4, good: 38.1, fair: 33.0, poor: 29.4 },
		female: { superior: 38.1, excellent: 35.1, good: 31.6, fair: 28.0, poor: 24.5 }
	},
	{
		ageMin: 50,
		ageMax: 59,
		label: '50-59',
		male: { superior: 41.0, excellent: 38.3, good: 35.2, fair: 30.2, poor: 26.5 },
		female: { superior: 35.2, excellent: 32.3, good: 28.7, fair: 25.5, poor: 22.3 }
	},
	{
		ageMin: 60,
		ageMax: 69,
		label: '60-69',
		male: { superior: 37.8, excellent: 33.6, good: 29.4, fair: 25.1, poor: 22.8 },
		female: { superior: 32.3, excellent: 28.7, good: 25.3, fair: 23.7, poor: 20.2 }
	},
	{
		ageMin: 70,
		ageMax: 79,
		label: '70-79',
		male: { superior: 33.6, excellent: 30.2, good: 26.5, fair: 23.7, poor: 20.5 },
		female: { superior: 28.7, excellent: 25.1, good: 23.7, fair: 21.2, poor: 18.5 }
	}
];

const MIN_AGE = 10;
const MAX_AGE = 100;

/** Returns the full ACSM reference table for display. */
export function getAcsmTable(): AcsmBracket[] {
	return ACSM_BRACKETS;
}

/**
 * Look up a fitness category for a given VDOT, age, and gender using ACSM norms.
 * Returns null if age or gender are not provided, or if age is outside 10-100.
 * Ages outside the published ACSM brackets (20-79) map to the nearest bracket
 * with isApproximate set to true.
 */
export function getFitnessCategory(
	vdot: number,
	age?: number,
	gender?: Gender
): FitnessResult | null {
	if (age === undefined || age === null || gender === undefined || gender === null) return null;
	if (age < MIN_AGE || age > MAX_AGE) return null;

	// Find the matching ACSM bracket, clamping to the nearest if out of published range
	let bracket: AcsmBracket;
	let isApproximate = false;

	if (age < ACSM_BRACKETS[0].ageMin) {
		bracket = ACSM_BRACKETS[0];
		isApproximate = true;
	} else if (age > ACSM_BRACKETS[ACSM_BRACKETS.length - 1].ageMax) {
		bracket = ACSM_BRACKETS[ACSM_BRACKETS.length - 1];
		isApproximate = true;
	} else {
		bracket = ACSM_BRACKETS.find((b) => age >= b.ageMin && age <= b.ageMax)!;
	}

	const thresholds = bracket[gender];
	let category: FitnessCategory;

	if (vdot >= thresholds.superior) {
		category = 'Superior';
	} else if (vdot >= thresholds.excellent) {
		category = 'Excellent';
	} else if (vdot >= thresholds.good) {
		category = 'Good';
	} else if (vdot >= thresholds.fair) {
		category = 'Fair';
	} else if (vdot >= thresholds.poor) {
		category = 'Poor';
	} else {
		category = 'Very Poor';
	}

	return { category, bracket: bracket.label, gender, isApproximate };
}
