import { describe, it, expect } from 'vitest';
import { calculatePowerZones, DEVICE_METRIC_LABEL, DEVICE_DISPLAY_NAME } from './power-zones';

// ─── Stryd ──────────────────────────────────────────────────────────────────

describe('calculatePowerZones (stryd)', () => {
	it('calculatePowerZones_StrydCp252_Returns5Zones', () => {
		expect(calculatePowerZones(252, 'stryd')).toHaveLength(5);
	});

	it('calculatePowerZones_StrydCp252_Zone1Is164to202', () => {
		const zones = calculatePowerZones(252, 'stryd')!;
		expect(zones[0]).toMatchObject({ zone: 1, name: 'Easy', wattsLow: 164, wattsHigh: 202 });
	});

	it('calculatePowerZones_StrydCp252_Zone1PctIs65to80', () => {
		const zones = calculatePowerZones(252, 'stryd')!;
		expect(zones[0]).toMatchObject({ pctLow: 65, pctHigh: 80 });
	});

	it('calculatePowerZones_StrydCp252_Zone2Is202to227', () => {
		const zones = calculatePowerZones(252, 'stryd')!;
		expect(zones[1]).toMatchObject({ zone: 2, name: 'Moderate', wattsLow: 202, wattsHigh: 227 });
	});

	it('calculatePowerZones_StrydCp252_Zone3Is227to252', () => {
		const zones = calculatePowerZones(252, 'stryd')!;
		expect(zones[2]).toMatchObject({ zone: 3, name: 'Threshold', wattsLow: 227, wattsHigh: 252 });
	});

	it('calculatePowerZones_StrydCp252_Zone4Is252to290', () => {
		const zones = calculatePowerZones(252, 'stryd')!;
		expect(zones[3]).toMatchObject({ zone: 4, name: 'Interval', wattsLow: 252, wattsHigh: 290 });
	});

	it('calculatePowerZones_StrydCp252_Zone5Is290to328', () => {
		const zones = calculatePowerZones(252, 'stryd')!;
		expect(zones[4]).toMatchObject({ zone: 5, name: 'Repetition', wattsLow: 290, wattsHigh: 328 });
	});

	it('calculatePowerZones_StrydCp252_Zone5IsClosedRangeNotOpenEnded', () => {
		const zones = calculatePowerZones(252, 'stryd')!;
		expect(zones[4].wattsHigh).not.toBeNull();
	});
});

// ─── COROS ──────────────────────────────────────────────────────────────────
// COROS has its own independent power algorithm (wrist-based or via the
// COROS Pod), so its zone table is NOT the same as Stryd's — verified below
// to be genuinely different, not just structurally separate.

describe('calculatePowerZones (coros)', () => {
	it('calculatePowerZones_CorosCp300_Returns7Zones', () => {
		expect(calculatePowerZones(300, 'coros')).toHaveLength(7);
	});

	it('calculatePowerZones_CorosCp300_DoesNotMatchStryd', () => {
		expect(calculatePowerZones(300, 'coros')).not.toEqual(calculatePowerZones(300, 'stryd'));
	});

	it('calculatePowerZones_CorosCp300_Zone1IsOpenEndedLow', () => {
		const zones = calculatePowerZones(300, 'coros')!;
		expect(zones[0]).toMatchObject({ zone: 1, name: 'Recovery', wattsLow: null, wattsHigh: 168 });
	});

	it('calculatePowerZones_CorosCp300_Zone4Is273to315', () => {
		const zones = calculatePowerZones(300, 'coros')!;
		expect(zones[3]).toMatchObject({ zone: 4, name: 'Threshold', wattsLow: 273, wattsHigh: 315 });
	});

	it('calculatePowerZones_CorosCp300_Zone7IsOpenEndedHigh', () => {
		const zones = calculatePowerZones(300, 'coros')!;
		expect(zones[6]).toMatchObject({ zone: 7, name: 'Sprint', wattsLow: 450, wattsHigh: null });
	});
});

// ─── Garmin ─────────────────────────────────────────────────────────────────
// Verified against a live Garmin Connect "Running > Power Zones" screen
// (5 zones, %TP-based) — see power-zones.ts for the source note.

describe('calculatePowerZones (garmin)', () => {
	it('calculatePowerZones_GarminPower300_Returns5Zones', () => {
		expect(calculatePowerZones(300, 'garmin')).toHaveLength(5);
	});

	it('calculatePowerZones_GarminPower300_Zone1Is195to240', () => {
		const zones = calculatePowerZones(300, 'garmin')!;
		expect(zones[0]).toMatchObject({
			zone: 1,
			name: 'Easy',
			wattsLow: 195,
			wattsHigh: 240
		});
	});

	it('calculatePowerZones_GarminPower300_Zone1PctIs65to80', () => {
		const zones = calculatePowerZones(300, 'garmin')!;
		expect(zones[0]).toMatchObject({ pctLow: 65, pctHigh: 80 });
	});

	it('calculatePowerZones_GarminPower300_Zone3Is270to300', () => {
		const zones = calculatePowerZones(300, 'garmin')!;
		expect(zones[2]).toMatchObject({ zone: 3, name: 'Tempo', wattsLow: 270, wattsHigh: 300 });
	});

	it('calculatePowerZones_GarminPower300_Zone5IsOpenEndedHigh', () => {
		const zones = calculatePowerZones(300, 'garmin')!;
		expect(zones[4]).toMatchObject({
			zone: 5,
			name: 'Short Interval',
			wattsLow: 345,
			wattsHigh: null
		});
	});

	it('calculatePowerZones_GarminPower300_Zone5PctIsOpenEndedHigh', () => {
		const zones = calculatePowerZones(300, 'garmin')!;
		expect(zones[4]).toMatchObject({ pctLow: 115, pctHigh: null });
	});
});

// ─── Polar ──────────────────────────────────────────────────────────────────

describe('calculatePowerZones (polar)', () => {
	it('calculatePowerZones_PolarMap300_Returns5Zones', () => {
		expect(calculatePowerZones(300, 'polar')).toHaveLength(5);
	});

	it('calculatePowerZones_PolarMap300_Zone1Is165to207', () => {
		const zones = calculatePowerZones(300, 'polar')!;
		expect(zones[0]).toMatchObject({
			zone: 1,
			name: 'Endurance Running',
			wattsLow: 165,
			wattsHigh: 207
		});
	});

	it('calculatePowerZones_PolarMap300_Zone4Is300to342', () => {
		const zones = calculatePowerZones(300, 'polar')!;
		expect(zones[3]).toMatchObject({
			zone: 4,
			name: 'High-Intensity Interval Training',
			wattsLow: 300,
			wattsHigh: 342
		});
	});

	it('calculatePowerZones_PolarMap300_Zone5IsOpenEndedHigh', () => {
		const zones = calculatePowerZones(300, 'polar')!;
		expect(zones[4]).toMatchObject({
			zone: 5,
			name: 'Sprint Interval Training',
			wattsLow: 345,
			wattsHigh: null
		});
	});
});

// ─── Boundary / plausibility validation ────────────────────────────────────

describe('calculatePowerZones (bounds)', () => {
	it('calculatePowerZones_BelowMinimum_ReturnsNull', () => {
		expect(calculatePowerZones(49, 'stryd')).toBeNull();
	});

	it('calculatePowerZones_AboveMaximum_ReturnsNull', () => {
		expect(calculatePowerZones(701, 'stryd')).toBeNull();
	});

	it('calculatePowerZones_BoundaryMinimum50_ReturnsResult', () => {
		expect(calculatePowerZones(50, 'stryd')).not.toBeNull();
	});

	it('calculatePowerZones_BoundaryMaximum700_ReturnsResult', () => {
		expect(calculatePowerZones(700, 'stryd')).not.toBeNull();
	});

	it('calculatePowerZones_Zero_ReturnsNull', () => {
		expect(calculatePowerZones(0, 'stryd')).toBeNull();
	});

	it('calculatePowerZones_Negative_ReturnsNull', () => {
		expect(calculatePowerZones(-10, 'stryd')).toBeNull();
	});
});

// ─── Device metric/label lookup maps ───────────────────────────────────────

describe('DEVICE_METRIC_LABEL', () => {
	it('DEVICE_METRIC_LABEL_Stryd_IsCriticalPower', () => {
		expect(DEVICE_METRIC_LABEL.stryd).toBe('Critical Power (CP)');
	});

	it('DEVICE_METRIC_LABEL_Coros_IsCriticalPower', () => {
		expect(DEVICE_METRIC_LABEL.coros).toBe('Critical Power (CP)');
	});

	it('DEVICE_METRIC_LABEL_Garmin_IsThresholdPower', () => {
		expect(DEVICE_METRIC_LABEL.garmin).toBe('Threshold Power');
	});

	it('DEVICE_METRIC_LABEL_Polar_IsMaximalAerobicPower', () => {
		expect(DEVICE_METRIC_LABEL.polar).toBe('Maximal Aerobic Power (MAP)');
	});
});

describe('DEVICE_DISPLAY_NAME', () => {
	it('DEVICE_DISPLAY_NAME_HasAllFourDevices', () => {
		expect(DEVICE_DISPLAY_NAME).toEqual({
			stryd: 'Stryd',
			coros: 'COROS',
			garmin: 'Garmin',
			polar: 'Polar'
		});
	});
});
