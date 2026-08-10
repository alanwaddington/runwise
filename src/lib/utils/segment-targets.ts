import type { WorkoutSegmentType } from './workouts';

const PACE_TARGET_MARGIN_SECONDS = 4;
const POWER_TARGET_MARGIN_WATTS = 6;

export interface NumericRange {
	low: number;
	high: number;
}

/** Parse "M:SS" or "H:MM:SS" pace-range boundary text into total seconds. Returns 0 for unparseable input. */
function parsePaceTime(timeStr: string): number {
	const parts = timeStr.split(':').map((p) => parseFloat(p));
	if (parts.length === 2) return parts[0] * 60 + parts[1];
	if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
	return 0;
}

function formatPaceTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.round(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Narrow a pace zone's "fast–slow" band (e.g. "3:30–4:00") to a single segment's target,
 * in seconds-per-km. Work segments are interpolated by the segment's relative intensity
 * (0 = zone's slow boundary, 1 = zone's fast boundary) with a fixed +/-4s margin either
 * side, clamped to the zone band. Non-work segments return the full band unnarrowed.
 * Returns null if zoneRange isn't a parseable "fast–slow" pace string.
 */
export function getSegmentPaceRangeSeconds(
	zoneRange: string,
	intensity: number,
	segmentType: WorkoutSegmentType
): NumericRange | null {
	const parts = zoneRange.split('–');
	if (parts.length !== 2) return null;

	const fast = parsePaceTime(parts[0].trim());
	const slow = parsePaceTime(parts[1].trim());
	if (fast === 0 || slow === 0) return null;

	if (segmentType !== 'work') return { low: fast, high: slow };

	const targetPace = slow - (slow - fast) * intensity;
	const low = Math.max(fast, targetPace - PACE_TARGET_MARGIN_SECONDS);
	const high = Math.min(slow, targetPace + PACE_TARGET_MARGIN_SECONDS);
	return { low, high };
}

/** Display-string form of getSegmentPaceRangeSeconds, matching the existing "M:SS–M:SS /km" UI format. */
export function getSegmentPaceRange(
	zoneRange: string,
	intensity: number,
	segmentType: WorkoutSegmentType
): string {
	if (!zoneRange || segmentType !== 'work') return zoneRange;

	const range = getSegmentPaceRangeSeconds(zoneRange, intensity, segmentType);
	if (range === null) return zoneRange;

	return `${formatPaceTime(range.high)}–${formatPaceTime(range.low)} /km`;
}

/**
 * Narrow a power zone's "low–high W" band to a single segment's target, in watts. Work
 * segments are interpolated by the segment's relative intensity with a fixed +/-6W margin
 * either side, clamped to the zone band. Non-work segments return the full band unnarrowed.
 * Returns null if zoneRange isn't a parseable "low–high W" power string.
 */
export function getSegmentPowerRangeWatts(
	zoneRange: string,
	intensity: number,
	segmentType: WorkoutSegmentType
): NumericRange | null {
	const match = zoneRange.match(/(\d+)–(\d+)\s*W/);
	if (!match) return null;

	const low = parseInt(match[1], 10);
	const high = parseInt(match[2], 10);

	if (segmentType !== 'work') return { low, high };

	const targetPower = low + (high - low) * intensity;
	const lowPower = Math.max(low, Math.round(targetPower - POWER_TARGET_MARGIN_WATTS));
	const highPower = Math.min(high, Math.round(targetPower + POWER_TARGET_MARGIN_WATTS));
	return { low: lowPower, high: highPower };
}

/** Display-string form of getSegmentPowerRangeWatts, matching the existing "N–N W" UI format. */
export function getSegmentPowerRange(
	zoneRange: string,
	intensity: number,
	segmentType: WorkoutSegmentType
): string {
	if (!zoneRange || segmentType !== 'work') return zoneRange;

	const range = getSegmentPowerRangeWatts(zoneRange, intensity, segmentType);
	if (range === null) return zoneRange;

	return `${range.low}–${range.high} W`;
}
