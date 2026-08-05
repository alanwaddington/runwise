export type PowerMeterDevice = 'stryd' | 'coros' | 'garmin' | 'polar';

export interface PowerZone {
	zone: number;
	name: string;
	/** null = open-ended lower bound (display as "< {wattsHigh}") */
	wattsLow: number | null;
	/** null = open-ended upper bound (display as "> {wattsLow}") */
	wattsHigh: number | null;
	purpose: string;
}

interface PowerZoneMeta {
	zone: number;
	name: string;
	lowPct: number | null;
	highPct: number | null;
	purpose: string;
}

// ─── Stryd zones ─────────────────────────────────────────────────────────────
// Source: Stryd Help Center ("Power Zones"), verified against Stryd's own
// worked example (CP=252W -> Zone 1 = 164-202W = 65-80% CP).

const STRYD_ZONE_META: PowerZoneMeta[] = [
	{
		zone: 1,
		name: 'Easy',
		lowPct: 0.65,
		highPct: 0.8,
		purpose: 'Very easy aerobic running. Use for warm-ups, cool-downs, and recovery days.'
	},
	{
		zone: 2,
		name: 'Moderate',
		lowPct: 0.8,
		highPct: 0.9,
		purpose: 'Comfortable aerobic effort that builds base fitness. Most easy runs belong here.'
	},
	{
		zone: 3,
		name: 'Threshold',
		lowPct: 0.9,
		highPct: 1.0,
		purpose: 'Comfortably hard, at or near your critical power. Tempo and threshold work.'
	},
	{
		zone: 4,
		name: 'Interval',
		lowPct: 1.0,
		highPct: 1.15,
		purpose: 'Hard, VO2 max-building effort. Sustainable for several minutes at a time.'
	},
	{
		zone: 5,
		name: 'Repetition',
		lowPct: 1.15,
		highPct: 1.3,
		purpose: 'Maximum short-effort intensity. Sprint and short repetition work with full recovery.'
	}
];

// ─── Garmin Running Power zones ─────────────────────────────────────────────
// Source: third-party publication, NOT confirmed against Garmin's own
// documentation. Garmin's own manuals state default zones are computed from
// threshold power plus gender/weight/ability via an undisclosed formula, so
// these percentages are an approximation, not an official Garmin table.
// Revisit if/when an authoritative Garmin source becomes available.

const GARMIN_ZONE_META: PowerZoneMeta[] = [
	{
		zone: 1,
		name: 'Active Recovery',
		lowPct: null,
		highPct: 0.8,
		purpose: 'Genuinely easy running for warm-ups, cool-downs, and recovery.'
	},
	{
		zone: 2,
		name: 'Endurance',
		lowPct: 0.8,
		highPct: 0.9,
		purpose: 'Bread-and-butter aerobic zone. The majority of weekly volume should live here.'
	},
	{
		zone: 3,
		name: 'Tempo',
		lowPct: 0.9,
		highPct: 1.0,
		purpose: 'Moderately hard, sustainable effort. Builds aerobic capacity.'
	},
	{
		zone: 4,
		name: 'Threshold',
		lowPct: 1.0,
		highPct: 1.1,
		purpose: 'Hard but sustainable for 20-40 minutes. Threshold/tempo interval work.'
	},
	{
		zone: 5,
		name: 'VO2 Max',
		lowPct: 1.1,
		highPct: 1.25,
		purpose: 'Very hard efforts that develop maximal aerobic power.'
	},
	{
		zone: 6,
		name: 'Anaerobic',
		lowPct: 1.25,
		highPct: 1.4,
		purpose: 'Short, very intense intervals developing anaerobic capacity.'
	},
	{
		zone: 7,
		name: 'Neuromuscular',
		lowPct: 1.4,
		highPct: null,
		purpose: 'Maximal sprint efforts lasting only a few seconds.'
	}
];

// ─── Polar zones ─────────────────────────────────────────────────────────────
// Source: Polar's own blog ("Power-Based Training Targets With Polar Vantage
// V2"). Based on Maximal Aerobic Power (MAP) from Polar's Running Performance
// Test — a different metric to Stryd/Garmin/COROS's Critical Power / Threshold
// Power, not just a different percentage table.

const POLAR_ZONE_META: PowerZoneMeta[] = [
	{
		zone: 1,
		name: 'Endurance Running',
		lowPct: 0.55,
		highPct: 0.69,
		purpose: 'Long-term aerobic energy, mostly from carbohydrates. Long, easy runs.'
	},
	{
		zone: 2,
		name: 'Endurance Running',
		lowPct: 0.7,
		highPct: 0.84,
		purpose: 'Continuous running at a sustainable, moderate power.'
	},
	{
		zone: 3,
		name: 'High-Intensity Interval Training',
		lowPct: 0.85,
		highPct: 0.99,
		purpose: 'Develops maximal aerobic power and lactate tolerance.'
	},
	{
		zone: 4,
		name: 'High-Intensity Interval Training',
		lowPct: 1.0,
		highPct: 1.14,
		purpose: 'Develops maximal aerobic power and VO2 max.'
	},
	{
		zone: 5,
		name: 'Sprint Interval Training',
		lowPct: 1.15,
		highPct: null,
		purpose: 'Short, maximal power sprints for peak muscle power.'
	}
];

const DEVICE_ZONE_META: Record<PowerMeterDevice, PowerZoneMeta[]> = {
	stryd: STRYD_ZONE_META,
	// COROS has no independent zone model of its own: it syncs and reuses
	// Stryd's CP and zones when paired with a Stryd pod, so this intentionally
	// points at the same table reference rather than a duplicated copy.
	coros: STRYD_ZONE_META,
	garmin: GARMIN_ZONE_META,
	polar: POLAR_ZONE_META
};

export const DEVICE_METRIC_LABEL: Record<PowerMeterDevice, string> = {
	stryd: 'Critical Power (CP)',
	coros: 'Critical Power (CP)',
	garmin: 'Threshold Power',
	polar: 'Maximal Aerobic Power (MAP)'
};

export const DEVICE_DISPLAY_NAME: Record<PowerMeterDevice, string> = {
	stryd: 'Stryd',
	coros: 'COROS',
	garmin: 'Garmin',
	polar: 'Polar'
};

const MIN_POWER = 50;
const MAX_POWER = 700;

/**
 * Calculate power training zones for the given device's model.
 * Returns null for physiologically implausible inputs (< 50 or > 700 W).
 */
export function calculatePowerZones(power: number, device: PowerMeterDevice): PowerZone[] | null {
	if (power < MIN_POWER || power > MAX_POWER) return null;

	return DEVICE_ZONE_META[device].map(({ zone, name, lowPct, highPct, purpose }) => ({
		zone,
		name,
		wattsLow: lowPct === null ? null : Math.round(power * lowPct),
		wattsHigh: highPct === null ? null : Math.round(power * highPct),
		purpose
	}));
}
