export type HrMethod = 'maxhr' | 'lthr';

export interface HrZone {
	zone: number | string;
	name: string;
	/** null = open-ended lower bound (display as "< {bpmHigh}") */
	bpmLow: number | null;
	/** null = open-ended upper bound (display as "> {bpmLow}") */
	bpmHigh: number | null;
	purpose: string;
}

// ─── Max HR zones ────────────────────────────────────────────────────────────

const MAX_HR_ZONE_META = [
	{
		zone: 1,
		name: 'Recovery',
		lowPct: 0.5,
		highPct: 0.6,
		purpose: 'Very easy aerobic work. Use for warm-ups, cool-downs, and active recovery days.'
	},
	{
		zone: 2,
		name: 'Aerobic base',
		lowPct: 0.6,
		highPct: 0.7,
		purpose: 'Comfortable aerobic running that builds your base fitness. Should feel conversational.'
	},
	{
		zone: 3,
		name: 'Tempo',
		lowPct: 0.7,
		highPct: 0.8,
		purpose: 'Moderate intensity. Breathing is heavier but controlled. Builds aerobic capacity.'
	},
	{
		zone: 4,
		name: 'Threshold',
		lowPct: 0.8,
		highPct: 0.9,
		purpose: 'Comfortably hard. At or near your lactate threshold. Use for tempo runs and race-pace work.'
	},
	{
		zone: 5,
		name: 'Max effort',
		lowPct: 0.9,
		highPct: 1.0,
		purpose: 'Maximum intensity. Only sustainable for short bursts. Develops peak speed and VO2 max.'
	}
] as const;

const MIN_MAX_HR = 100;
const MAX_MAX_HR = 220;

/**
 * Calculate 5 HR training zones using max HR percentage method.
 * Returns null for physiologically implausible inputs (< 100 or > 220 bpm).
 */
export function calculateMaxHrZones(maxHr: number): HrZone[] | null {
	if (maxHr < MIN_MAX_HR || maxHr > MAX_MAX_HR) return null;

	return MAX_HR_ZONE_META.map(({ zone, name, lowPct, highPct, purpose }) => ({
		zone,
		name,
		bpmLow: Math.round(maxHr * lowPct),
		bpmHigh: Math.round(maxHr * highPct),
		purpose
	}));
}

// ─── LTHR zones (Joe Friel method) ──────────────────────────────────────────

const LTHR_ZONE_META = [
	{
		zone: 1,
		name: 'Recovery',
		lowPct: null,
		highPct: 0.85,
		purpose: 'Very light effort. Use for recovery runs and warm-ups.'
	},
	{
		zone: 2,
		name: 'Aerobic',
		lowPct: 0.85,
		highPct: 0.89,
		purpose: 'Comfortable aerobic pace. Builds base fitness. Long runs and easy sessions.'
	},
	{
		zone: 3,
		name: 'Tempo',
		lowPct: 0.9,
		highPct: 0.94,
		purpose: 'Moderate aerobic effort. Slightly challenging but sustainable for extended periods.'
	},
	{
		zone: 4,
		name: 'Sub-threshold',
		lowPct: 0.95,
		highPct: 0.99,
		purpose: 'Just below lactate threshold. Bread-and-butter zone for tempo and threshold work.'
	},
	{
		zone: 5,
		name: 'Supra-threshold',
		lowPct: 1.0,
		highPct: 1.06,
		purpose: 'At and above lactate threshold. High intensity intervals and race efforts.'
	}
] as const;

const LTHR_SUB_ZONE_META = [
	{
		zone: '5a',
		name: 'Supra-threshold',
		lowPct: 1.0,
		highPct: 1.02,
		purpose: 'Just above threshold. Extended intervals at 5K–10K effort.'
	},
	{
		zone: '5b',
		name: 'Aerobic capacity',
		lowPct: 1.03,
		highPct: 1.06,
		purpose: 'VO2 max territory. Short, hard intervals of 3–8 minutes.'
	},
	{
		zone: '5c',
		name: 'Anaerobic capacity',
		lowPct: 1.06,
		highPct: null,
		purpose: 'Anaerobic efforts lasting under 2 minutes. Sprint and short rep work.'
	}
] as const;

const MIN_LTHR = 100;
const MAX_LTHR = 200;

/**
 * Calculate 5 HR training zones using the Joe Friel LTHR method.
 * Returns null for physiologically implausible inputs (< 100 or > 200 bpm).
 */
export function calculateLthrZones(lthr: number): HrZone[] | null {
	if (lthr < MIN_LTHR || lthr > MAX_LTHR) return null;

	return LTHR_ZONE_META.map(({ zone, name, lowPct, highPct, purpose }) => ({
		zone,
		name,
		bpmLow: lowPct === null ? null : Math.round(lthr * lowPct),
		bpmHigh: Math.round(lthr * highPct),
		purpose
	}));
}

/**
 * Calculate the three Zone 5 sub-zones (5a, 5b, 5c) for the Friel LTHR method.
 * Returns null for physiologically implausible inputs.
 */
export function calculateLthrSubZones(lthr: number): HrZone[] | null {
	if (lthr < MIN_LTHR || lthr > MAX_LTHR) return null;

	return LTHR_SUB_ZONE_META.map(({ zone, name, lowPct, highPct, purpose }) => ({
		zone,
		name,
		bpmLow: Math.round(lthr * lowPct),
		bpmHigh: highPct === null ? null : Math.round(lthr * highPct),
		purpose
	}));
}

// ─── Age-based max HR estimation ────────────────────────────────────────────

const MIN_AGE = 10;
const MAX_AGE = 100;

/**
 * Estimate max HR using the Tanaka formula: 208 − 0.7 × age.
 * Returns null for implausible ages (< 10 or > 100).
 */
export function estimateMaxHr(age: number): number | null {
	if (age < MIN_AGE || age > MAX_AGE) return null;
	return Math.round(208 - 0.7 * age);
}

// ─── Daniels E/M/T/I/R LTHR zones (for HR-based workout generation) ────────

export interface HrTrainingZone {
	zone: 'E' | 'M' | 'T' | 'I' | 'R';
	name: string;
	bpmLow: number | null;
	bpmHigh: number | null;
	confidence: 'high' | 'medium' | 'low';
}

/**
 * %LTHR bands for Daniels' E/M/T/I/R zones. R is Repetition — Daniels' fastest
 * zone (fast, short reps of 30-90s) — placed *above* I, not a generic "Recovery"
 * zone below E. HR can't stabilise over reps that short, so R's confidence
 * reflects a well-defined boundary (unambiguously "above I") while the zone
 * itself stays pace-led rather than HR-led in practice.
 */
const DANIELS_LTHR_ZONE_META = [
	{ zone: 'E', name: 'Easy / Recovery', lowPct: null, highPct: 0.6, confidence: 'high' },
	{ zone: 'M', name: 'Marathon', lowPct: 0.6, highPct: 0.9, confidence: 'high' },
	{ zone: 'T', name: 'Threshold / Tempo', lowPct: 0.9, highPct: 1.05, confidence: 'medium' },
	{ zone: 'I', name: 'Interval', lowPct: 1.05, highPct: 1.2, confidence: 'low' },
	{ zone: 'R', name: 'Repetition', lowPct: 1.2, highPct: null, confidence: 'high' }
] as const;

/**
 * Calculate Daniels-aligned E/M/T/I/R HR training zones from LTHR, with a
 * confidence tier per zone reflecting how reliably HR maps to that zone's
 * intended effort. Returns null for physiologically implausible LTHR values.
 */
export function calculateDanielsLthrZones(lthr: number): HrTrainingZone[] | null {
	if (lthr < MIN_LTHR || lthr > MAX_LTHR) return null;

	return DANIELS_LTHR_ZONE_META.map(({ zone, name, lowPct, highPct, confidence }) => ({
		zone,
		name,
		bpmLow: lowPct === null ? null : Math.round(lthr * lowPct),
		bpmHigh: highPct === null ? null : Math.round(lthr * highPct),
		confidence
	}));
}
