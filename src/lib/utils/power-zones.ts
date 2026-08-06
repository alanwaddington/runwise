export type PowerMeterDevice = 'stryd' | 'coros' | 'garmin' | 'polar';

export interface PowerZone {
	zone: number;
	name: string;
	/** null = open-ended lower bound (display as "< {wattsHigh}") */
	wattsLow: number | null;
	/** null = open-ended upper bound (display as "> {wattsLow}") */
	wattsHigh: number | null;
	/** Zone's lower bound as a whole-number percentage of the device's metric, or null if open-ended. */
	pctLow: number | null;
	/** Zone's upper bound as a whole-number percentage of the device's metric, or null if open-ended. */
	pctHigh: number | null;
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

// ─── COROS Running Power zones ──────────────────────────────────────────────
// COROS calculates running power independently — natively from the wrist on
// all current watches, and via its own COROS Pod hardware — using its own
// algorithm, confirmed distinct from Stryd's (COROS also supports pairing an
// actual Stryd pod, in which case it syncs and displays Stryd's own CP/zones
// directly; that case is just the Stryd tab, not this one).
//
// COROS has NOT published a running-specific power zone percentage table.
// The 7-zone breakdown below is adapted from COROS's own published CYCLING
// power zone model (support.coros.com, "Cycling Power Zones") — the same
// zone names COROS also uses for its pace-based EvoLab zones — extended here
// to running Critical Power as the closest available real COROS data. This
// is an approximation for running, not a confirmed running-specific source.
// Revisit if/when COROS publishes a running power zone table directly.

const COROS_ZONE_META: PowerZoneMeta[] = [
	{
		zone: 1,
		name: 'Recovery',
		lowPct: null,
		highPct: 0.56,
		purpose: 'Very light effort for warm-ups, cool-downs, and active recovery.'
	},
	{
		zone: 2,
		name: 'Aerobic Endurance',
		lowPct: 0.56,
		highPct: 0.75,
		purpose: 'Long, easy aerobic running. Most weekly volume should live here.'
	},
	{
		zone: 3,
		name: 'Aerobic Power',
		lowPct: 0.76,
		highPct: 0.9,
		purpose: 'Tempo effort. Comfortably hard, sustainable for extended periods.'
	},
	{
		zone: 4,
		name: 'Threshold',
		lowPct: 0.91,
		highPct: 1.05,
		purpose: 'At or near critical power. Threshold intervals and tempo work.'
	},
	{
		zone: 5,
		name: 'Anaerobic Endurance',
		lowPct: 1.06,
		highPct: 1.2,
		purpose: 'Hard VO2 max intervals, sustainable for several minutes.'
	},
	{
		zone: 6,
		name: 'Anaerobic Power',
		lowPct: 1.21,
		highPct: 1.5,
		purpose: 'Very hard, short intervals developing anaerobic capacity.'
	},
	{
		zone: 7,
		name: 'Sprint',
		lowPct: 1.5,
		highPct: null,
		purpose: 'Maximal short sprints for neuromuscular power.'
	}
];

// ─── Garmin Running Power zones ─────────────────────────────────────────────
// Source: Garmin Connect's own "Running > Power Zones" screen (verified
// directly against a live account, 2026-08-06) for the 5-zone boundaries —
// Minimum 65%, Zone 1 66-80%, Zone 2 81-90%, Zone 3 91-100%, Zone 4 101-115%,
// Zone 5 >115% of Threshold Power — stored here as continuous cut points
// (0.65/0.80/0.90/1.00/1.15) rather than Garmin's rounded integer display.
// Zone 1's lower bound is the screen's "Minimum" setting (65%), not open-ended
// — below that, Garmin doesn't classify the effort into any zone at all.
// Zone names (Easy, Moderate, Tempo, Long Interval, Short Interval) are
// Garmin's own, confirmed via a Garmin Connect forum thread quoting Garmin's
// in-app help text (forums.garmin.com, "Running Power Zones Names?"). Garmin
// does not publish a per-zone purpose/training description anywhere; the
// purpose text below is our own, in the same style as the other tables.

const GARMIN_ZONE_META: PowerZoneMeta[] = [
	{
		zone: 1,
		name: 'Easy',
		lowPct: 0.65,
		highPct: 0.8,
		purpose: 'Genuinely easy running for warm-ups, cool-downs, and recovery.'
	},
	{
		zone: 2,
		name: 'Moderate',
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
		name: 'Long Interval',
		lowPct: 1.0,
		highPct: 1.15,
		purpose: 'Hard, VO2 max-building effort sustainable for several minutes at a time.'
	},
	{
		zone: 5,
		name: 'Short Interval',
		lowPct: 1.15,
		highPct: null,
		purpose: 'Maximal short-effort intensity. Sprint and short repetition work.'
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
	// COROS calculates its own power independently (wrist-based or via the
	// COROS Pod) using its own algorithm, distinct from Stryd's. A user who
	// pairs an actual Stryd pod to their COROS watch gets Stryd's own CP and
	// zones directly — that's the Stryd tab, not this one. No alias here.
	coros: COROS_ZONE_META,
	garmin: GARMIN_ZONE_META,
	polar: POLAR_ZONE_META
};

export const DEVICE_METRIC_LABEL: Record<PowerMeterDevice, string> = {
	stryd: 'Critical Power (CP)',
	coros: 'Critical Power (CP)',
	garmin: 'Threshold Power',
	polar: 'Maximal Aerobic Power (MAP)'
};

/**
 * Disclaimer shown when a device's zone table is an approximation rather
 * than a confirmed, device-published source. Omitted (no key) for devices
 * with a verified table (Stryd, Polar).
 */
export const DEVICE_DISCLAIMER: Partial<Record<PowerMeterDevice, string>> = {
	coros: "These zone percentages are adapted from COROS's own published cycling power zone model — COROS has not published a running-specific power zone table, and this approximation is not confirmed against COROS's app or Training Hub for running.",
	garmin: "These zone percentages match Garmin Connect's running power screen; Garmin does not publish this table in its own official documentation."
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
		pctLow: lowPct === null ? null : Math.round(lowPct * 100),
		pctHigh: highPct === null ? null : Math.round(highPct * 100),
		purpose
	}));
}
