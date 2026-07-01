import { describe, it, expect } from 'vitest';
import {
	calculateVdot,
	getTrainingPaces,
	buildTrainingPaceResult,
	ZONE_META
} from './training-paces';

describe('ZONE_META', () => {
	it('contains all 5 zones', () => {
		expect(Object.keys(ZONE_META)).toHaveLength(5);
	});

	it('has E, M, T, I, R keys', () => {
		expect(ZONE_META).toHaveProperty('E');
		expect(ZONE_META).toHaveProperty('M');
		expect(ZONE_META).toHaveProperty('T');
		expect(ZONE_META).toHaveProperty('I');
		expect(ZONE_META).toHaveProperty('R');
	});

	it('each zone has name and description', () => {
		for (const key of ['E', 'M', 'T', 'I', 'R'] as const) {
			expect(ZONE_META[key].name).toBeTruthy();
			expect(ZONE_META[key].description).toBeTruthy();
		}
	});
});

describe('calculateVdot', () => {
	it('calculateVdot_5kIn25Min_ReturnsApprox38', () => {
		const vdot = calculateVdot(5, 1500);
		expect(vdot).not.toBeNull();
		expect(vdot!).toBeGreaterThan(37);
		expect(vdot!).toBeLessThan(40);
	});

	it('calculateVdot_5kIn20Min_ReturnsApprox50', () => {
		const vdot = calculateVdot(5, 1200);
		expect(vdot).not.toBeNull();
		expect(vdot!).toBeGreaterThan(48);
		expect(vdot!).toBeLessThan(52);
	});

	it('calculateVdot_10kIn50Min_ReturnsApprox40', () => {
		// 10K in 50:00 → VDOT ~40 (higher than 5K/25:00 because utilisation fraction differs)
		const vdot = calculateVdot(10, 3000);
		expect(vdot).not.toBeNull();
		expect(vdot!).toBeGreaterThan(39);
		expect(vdot!).toBeLessThan(41);
	});

	it('calculateVdot_MarathonIn3h30_ReturnsApprox46', () => {
		const vdot = calculateVdot(42.195, 3 * 3600 + 30 * 60);
		expect(vdot).not.toBeNull();
		expect(vdot!).toBeGreaterThan(44);
		expect(vdot!).toBeLessThan(48);
	});

	it('calculateVdot_VerySlowTime_ReturnsNull', () => {
		// 5K in 80 minutes would be VDOT below 20
		expect(calculateVdot(5, 80 * 60)).toBeNull();
	});

	it('calculateVdot_VeryFastTime_ReturnsNull', () => {
		// 5K in 10:00 would be VDOT above 85
		expect(calculateVdot(5, 600)).toBeNull();
	});

	it('calculateVdot_ZeroDistance_ReturnsNull', () => {
		expect(calculateVdot(0, 1500)).toBeNull();
	});

	it('calculateVdot_ZeroTime_ReturnsNull', () => {
		expect(calculateVdot(5, 0)).toBeNull();
	});

	it('calculateVdot_NegativeDistance_ReturnsNull', () => {
		expect(calculateVdot(-5, 1500)).toBeNull();
	});

	it('calculateVdot_CustomDistance_ReturnsValidVdot', () => {
		// 12K in about 1:12:00 should be roughly similar to 5K in 30 minutes
		const vdot = calculateVdot(12, 4320);
		expect(vdot).not.toBeNull();
		expect(vdot!).toBeGreaterThan(20);
		expect(vdot!).toBeLessThan(85);
	});

	it('calculateVdot_1Mile_ReturnsValidVdot', () => {
		// 1 mile in 8:00 = 480 seconds
		const vdot = calculateVdot(1.60934, 480);
		expect(vdot).not.toBeNull();
		expect(vdot!).toBeGreaterThan(20);
		expect(vdot!).toBeLessThan(85);
	});
});

describe('getTrainingPaces', () => {
	it('getTrainingPaces_Returns5Zones', () => {
		const zones = getTrainingPaces(40);
		expect(zones).toHaveLength(5);
	});

	it('getTrainingPaces_ZonesInCorrectOrder', () => {
		const zones = getTrainingPaces(40);
		expect(zones[0].zone).toBe('E');
		expect(zones[1].zone).toBe('M');
		expect(zones[2].zone).toBe('T');
		expect(zones[3].zone).toBe('I');
		expect(zones[4].zone).toBe('R');
	});

	it('getTrainingPaces_EachZoneHasFormattedPaces', () => {
		const zones = getTrainingPaces(40);
		for (const zone of zones) {
			expect(zone.paceMinKmLow).toMatch(/^\d+:\d{2}$/);
			expect(zone.paceMinKmHigh).toMatch(/^\d+:\d{2}$/);
			expect(zone.paceMinMileLow).toMatch(/^\d+:\d{2}$/);
			expect(zone.paceMinMileHigh).toMatch(/^\d+:\d{2}$/);
		}
	});

	it('getTrainingPaces_EachZoneHasNameAndDescription', () => {
		const zones = getTrainingPaces(40);
		for (const zone of zones) {
			expect(zone.name).toBeTruthy();
			expect(zone.description).toBeTruthy();
		}
	});

	it('getTrainingPaces_HigherVdot_FasterPaces', () => {
		const zonesLow = getTrainingPaces(30);
		const zonesHigh = getTrainingPaces(60);
		// Higher VDOT → faster paces → lower min/km values
		// Compare E zone low (slow boundary): higher VDOT runner is still faster
		const eLowVdot30 = parseInt(zonesLow[0].paceMinKmLow.split(':')[0]);
		const eLowVdot60 = parseInt(zonesHigh[0].paceMinKmLow.split(':')[0]);
		expect(eLowVdot30).toBeGreaterThan(eLowVdot60);
	});

	it('getTrainingPaces_5kIn25Min_EasyInExpectedRange', () => {
		// VDOT ~38 → Easy range should be approx 6:10-6:40/km
		const vdot = calculateVdot(5, 1500)!;
		const zones = getTrainingPaces(vdot);
		const eZone = zones.find((z) => z.zone === 'E')!;

		// paceMinKmLow is slow boundary, paceMinKmHigh is fast boundary
		const slowMinutes = parseDecimalPace(eZone.paceMinKmLow);
		const fastMinutes = parseDecimalPace(eZone.paceMinKmHigh);

		// Slow end should be around 6:20-7:00/km
		expect(slowMinutes).toBeGreaterThan(6.0);
		expect(slowMinutes).toBeLessThan(7.5);
		// Fast end should be around 5:50-6:30/km
		expect(fastMinutes).toBeGreaterThan(5.5);
		expect(fastMinutes).toBeLessThan(7.0);
		// Slow boundary should be slower than fast boundary
		expect(slowMinutes).toBeGreaterThan(fastMinutes);
	});

	it('getTrainingPaces_5kIn25Min_ThresholdInExpectedRange', () => {
		// VDOT ~38 → T range should be approx 5:10-5:20/km
		const vdot = calculateVdot(5, 1500)!;
		const zones = getTrainingPaces(vdot);
		const tZone = zones.find((z) => z.zone === 'T')!;

		const slowMinutes = parseDecimalPace(tZone.paceMinKmLow);
		const fastMinutes = parseDecimalPace(tZone.paceMinKmHigh);

		// Threshold slow should be around 5:10-5:30/km
		expect(slowMinutes).toBeGreaterThan(5.0);
		expect(slowMinutes).toBeLessThan(5.75);
		// Threshold fast should be around 4:55-5:20/km
		expect(fastMinutes).toBeGreaterThan(4.75);
		expect(fastMinutes).toBeLessThan(5.5);
		expect(slowMinutes).toBeGreaterThan(fastMinutes);
	});

	it('getTrainingPaces_PacesProgressFasterAcrossZones', () => {
		const zones = getTrainingPaces(40);
		// Each zone's fast pace should be faster than the previous zone's slow pace
		// I.e., zones don't completely overlap
		const eFast = parseDecimalPace(zones[0].paceMinKmHigh);
		const mSlow = parseDecimalPace(zones[1].paceMinKmLow);
		const tSlow = parseDecimalPace(zones[2].paceMinKmLow);
		const iSlow = parseDecimalPace(zones[3].paceMinKmLow);
		const rSlow = parseDecimalPace(zones[4].paceMinKmLow);

		// M should be faster than the E slow boundary
		expect(mSlow).toBeLessThan(parseDecimalPace(zones[0].paceMinKmLow));
		// T should be faster than M
		expect(tSlow).toBeLessThan(mSlow);
		// I should be faster than T
		expect(iSlow).toBeLessThan(tSlow);
		// R should be faster than I
		expect(rSlow).toBeLessThan(iSlow);
		// Suppress unused variable warning
		expect(eFast).toBeGreaterThan(0);
		expect(rSlow).toBeGreaterThan(0);
	});

	it('getTrainingPaces_MinPerMileSlowerThanMinPerKm', () => {
		const zones = getTrainingPaces(40);
		for (const zone of zones) {
			// min/mile should always be a larger number than min/km
			const kmPaceSlow = parseDecimalPace(zone.paceMinKmLow);
			const milePaceSlow = parseDecimalPace(zone.paceMinMileLow);
			expect(milePaceSlow).toBeGreaterThan(kmPaceSlow);
		}
	});
});

describe('buildTrainingPaceResult', () => {
	it('buildTrainingPaceResult_ValidInput_ReturnsResult', () => {
		const result = buildTrainingPaceResult(5, 1500);
		expect(result).not.toBeNull();
		expect(result).not.toBe('out-of-range');
		expect(result).toHaveProperty('vdot');
		expect(result).toHaveProperty('zones');
	});

	it('buildTrainingPaceResult_ValidInput_VdotInExpectedRange', () => {
		const result = buildTrainingPaceResult(5, 1500) as { vdot: number };
		expect(result.vdot).toBeGreaterThan(37);
		expect(result.vdot).toBeLessThan(40);
	});

	it('buildTrainingPaceResult_ValidInput_Returns5Zones', () => {
		const result = buildTrainingPaceResult(5, 1500) as { zones: unknown[] };
		expect(result.zones).toHaveLength(5);
	});

	it('buildTrainingPaceResult_VerySlowTime_ReturnsOutOfRange', () => {
		// 5K in 80 minutes → VDOT below 20
		expect(buildTrainingPaceResult(5, 80 * 60)).toBe('out-of-range');
	});

	it('buildTrainingPaceResult_VeryFastTime_ReturnsOutOfRange', () => {
		// 5K in 10 minutes → VDOT above 85
		expect(buildTrainingPaceResult(5, 600)).toBe('out-of-range');
	});

	it('buildTrainingPaceResult_ZeroDistance_ReturnsNull', () => {
		expect(buildTrainingPaceResult(0, 1500)).toBeNull();
	});

	it('buildTrainingPaceResult_ZeroTime_ReturnsNull', () => {
		expect(buildTrainingPaceResult(5, 0)).toBeNull();
	});

	it('buildTrainingPaceResult_VdotRoundedTo1Decimal', () => {
		const result = buildTrainingPaceResult(5, 1500) as { vdot: number };
		// VDOT should be rounded to at most 1 decimal place
		expect(result.vdot).toBeCloseTo(Math.round(result.vdot * 10) / 10, 10);
	});

	it('buildTrainingPaceResult_CustomDistance_ReturnsResult', () => {
		// 12K in 72:00
		const result = buildTrainingPaceResult(12, 72 * 60);
		expect(result).not.toBeNull();
		expect(result).not.toBe('out-of-range');
	});
});

/** Helper: parse "M:SS" formatted pace to decimal minutes */
function parseDecimalPace(formatted: string): number {
	const [min, sec] = formatted.split(':').map(Number);
	return min + sec / 60;
}
