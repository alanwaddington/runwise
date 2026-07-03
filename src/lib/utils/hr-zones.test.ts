import { describe, it, expect } from 'vitest';
import {
	calculateMaxHrZones,
	calculateLthrZones,
	calculateLthrSubZones,
	estimateMaxHr
} from './hr-zones';

// ─── estimateMaxHr ──────────────────────────────────────────────────────────

describe('estimateMaxHr', () => {
	it('estimateMaxHr_Age40_Returns180', () => {
		expect(estimateMaxHr(40)).toBe(180);
	});

	it('estimateMaxHr_Age20_Returns194', () => {
		// 208 − 0.7 × 20 = 208 − 14 = 194
		expect(estimateMaxHr(20)).toBe(194);
	});

	it('estimateMaxHr_Age60_Returns166', () => {
		// 208 − 0.7 × 60 = 208 − 42 = 166
		expect(estimateMaxHr(60)).toBe(166);
	});

	it('estimateMaxHr_Age50_Returns173', () => {
		// 208 − 0.7 × 50 = 208 − 35 = 173
		expect(estimateMaxHr(50)).toBe(173);
	});

	it('estimateMaxHr_ZeroAge_ReturnsNull', () => {
		expect(estimateMaxHr(0)).toBeNull();
	});

	it('estimateMaxHr_NegativeAge_ReturnsNull', () => {
		expect(estimateMaxHr(-1)).toBeNull();
	});

	it('estimateMaxHr_AgeTooHigh_ReturnsNull', () => {
		expect(estimateMaxHr(101)).toBeNull();
	});

	it('estimateMaxHr_BoundaryAge10_ReturnsResult', () => {
		expect(estimateMaxHr(10)).not.toBeNull();
	});

	it('estimateMaxHr_BoundaryAge100_ReturnsResult', () => {
		expect(estimateMaxHr(100)).not.toBeNull();
	});
});

// ─── calculateMaxHrZones ────────────────────────────────────────────────────

describe('calculateMaxHrZones', () => {
	it('calculateMaxHrZones_Returns5Zones', () => {
		expect(calculateMaxHrZones(185)).toHaveLength(5);
	});

	it('calculateMaxHrZones_MaxHr185_Z1Is93to111', () => {
		const zones = calculateMaxHrZones(185)!;
		expect(zones[0].bpmLow).toBe(93);
		expect(zones[0].bpmHigh).toBe(111);
	});

	it('calculateMaxHrZones_MaxHr185_Z2Is111to130', () => {
		const zones = calculateMaxHrZones(185)!;
		expect(zones[1].bpmLow).toBe(111);
		expect(zones[1].bpmHigh).toBe(130);
	});

	it('calculateMaxHrZones_MaxHr185_Z3Is130to148', () => {
		const zones = calculateMaxHrZones(185)!;
		expect(zones[2].bpmLow).toBe(130);
		expect(zones[2].bpmHigh).toBe(148);
	});

	it('calculateMaxHrZones_MaxHr185_Z4Is148to167', () => {
		const zones = calculateMaxHrZones(185)!;
		expect(zones[3].bpmLow).toBe(148);
		expect(zones[3].bpmHigh).toBe(167);
	});

	it('calculateMaxHrZones_MaxHr185_Z5Is167to185', () => {
		const zones = calculateMaxHrZones(185)!;
		expect(zones[4].bpmLow).toBe(167);
		expect(zones[4].bpmHigh).toBe(185);
	});

	it('calculateMaxHrZones_ZonesNumbered1to5', () => {
		const zones = calculateMaxHrZones(185)!;
		expect(zones.map((z) => z.zone)).toEqual([1, 2, 3, 4, 5]);
	});

	it('calculateMaxHrZones_EachZoneHasNameAndPurpose', () => {
		const zones = calculateMaxHrZones(185)!;
		for (const z of zones) {
			expect(z.name).toBeTruthy();
			expect(z.purpose).toBeTruthy();
		}
	});

	it('calculateMaxHrZones_NoBpmLowOrHighIsNull', () => {
		const zones = calculateMaxHrZones(185)!;
		for (const z of zones) {
			expect(z.bpmLow).not.toBeNull();
			expect(z.bpmHigh).not.toBeNull();
		}
	});

	it('calculateMaxHrZones_HigherMaxHr_HigherBpmValues', () => {
		const zones180 = calculateMaxHrZones(180)!;
		const zones200 = calculateMaxHrZones(200)!;
		expect(zones200[0].bpmHigh!).toBeGreaterThan(zones180[0].bpmHigh!);
	});

	it('calculateMaxHrZones_ZeroMaxHr_ReturnsNull', () => {
		expect(calculateMaxHrZones(0)).toBeNull();
	});

	it('calculateMaxHrZones_NegativeMaxHr_ReturnsNull', () => {
		expect(calculateMaxHrZones(-10)).toBeNull();
	});

	it('calculateMaxHrZones_MaxHrTooLow_ReturnsNull', () => {
		expect(calculateMaxHrZones(99)).toBeNull();
	});

	it('calculateMaxHrZones_MaxHrTooHigh_ReturnsNull', () => {
		expect(calculateMaxHrZones(221)).toBeNull();
	});

	it('calculateMaxHrZones_BoundaryMaxHr100_ReturnsZones', () => {
		expect(calculateMaxHrZones(100)).not.toBeNull();
	});

	it('calculateMaxHrZones_BoundaryMaxHr220_ReturnsZones', () => {
		expect(calculateMaxHrZones(220)).not.toBeNull();
	});
});

// ─── calculateLthrZones ─────────────────────────────────────────────────────

describe('calculateLthrZones', () => {
	it('calculateLthrZones_Returns5Zones', () => {
		expect(calculateLthrZones(170)).toHaveLength(5);
	});

	it('calculateLthrZones_Lthr170_Z1IsLessThan145', () => {
		const zones = calculateLthrZones(170)!;
		expect(zones[0].bpmLow).toBeNull();
		expect(zones[0].bpmHigh).toBe(145);
	});

	it('calculateLthrZones_Lthr170_Z2Is145to151', () => {
		const zones = calculateLthrZones(170)!;
		expect(zones[1].bpmLow).toBe(145);
		expect(zones[1].bpmHigh).toBe(151);
	});

	it('calculateLthrZones_Lthr170_Z3Is153to160', () => {
		const zones = calculateLthrZones(170)!;
		expect(zones[2].bpmLow).toBe(153);
		expect(zones[2].bpmHigh).toBe(160);
	});

	it('calculateLthrZones_Lthr170_Z4Is162to168', () => {
		const zones = calculateLthrZones(170)!;
		expect(zones[3].bpmLow).toBe(162);
		expect(zones[3].bpmHigh).toBe(168);
	});

	it('calculateLthrZones_Lthr170_Z5Is170to180', () => {
		const zones = calculateLthrZones(170)!;
		expect(zones[4].bpmLow).toBe(170);
		expect(zones[4].bpmHigh).toBe(180);
	});

	it('calculateLthrZones_ZonesNumbered1to5', () => {
		const zones = calculateLthrZones(170)!;
		expect(zones.map((z) => z.zone)).toEqual([1, 2, 3, 4, 5]);
	});

	it('calculateLthrZones_EachZoneHasNameAndPurpose', () => {
		const zones = calculateLthrZones(170)!;
		for (const z of zones) {
			expect(z.name).toBeTruthy();
			expect(z.purpose).toBeTruthy();
		}
	});

	it('calculateLthrZones_Zone1HasNullLow', () => {
		const zones = calculateLthrZones(170)!;
		expect(zones[0].bpmLow).toBeNull();
	});

	it('calculateLthrZones_ZeroLthr_ReturnsNull', () => {
		expect(calculateLthrZones(0)).toBeNull();
	});

	it('calculateLthrZones_LthrTooLow_ReturnsNull', () => {
		expect(calculateLthrZones(99)).toBeNull();
	});

	it('calculateLthrZones_LthrTooHigh_ReturnsNull', () => {
		expect(calculateLthrZones(201)).toBeNull();
	});

	it('calculateLthrZones_BoundaryLthr100_ReturnsZones', () => {
		expect(calculateLthrZones(100)).not.toBeNull();
	});

	it('calculateLthrZones_BoundaryLthr200_ReturnsZones', () => {
		expect(calculateLthrZones(200)).not.toBeNull();
	});
});

// ─── calculateLthrSubZones ──────────────────────────────────────────────────

describe('calculateLthrSubZones', () => {
	it('calculateLthrSubZones_Returns3SubZones', () => {
		expect(calculateLthrSubZones(170)).toHaveLength(3);
	});

	it('calculateLthrSubZones_Lthr170_5aIs170to173', () => {
		const sub = calculateLthrSubZones(170)!;
		expect(sub[0].zone).toBe('5a');
		expect(sub[0].bpmLow).toBe(170);
		expect(sub[0].bpmHigh).toBe(173);
	});

	it('calculateLthrSubZones_Lthr170_5bIs175to180', () => {
		const sub = calculateLthrSubZones(170)!;
		expect(sub[1].zone).toBe('5b');
		expect(sub[1].bpmLow).toBe(175);
		expect(sub[1].bpmHigh).toBe(180);
	});

	it('calculateLthrSubZones_Lthr170_5cIsGreaterThan180', () => {
		const sub = calculateLthrSubZones(170)!;
		expect(sub[2].zone).toBe('5c');
		expect(sub[2].bpmLow).toBe(180);
		expect(sub[2].bpmHigh).toBeNull();
	});

	it('calculateLthrSubZones_EachSubZoneHasNameAndPurpose', () => {
		const sub = calculateLthrSubZones(170)!;
		for (const z of sub) {
			expect(z.name).toBeTruthy();
			expect(z.purpose).toBeTruthy();
		}
	});

	it('calculateLthrSubZones_ZeroLthr_ReturnsNull', () => {
		expect(calculateLthrSubZones(0)).toBeNull();
	});

	it('calculateLthrSubZones_InvalidLthr_ReturnsNull', () => {
		expect(calculateLthrSubZones(99)).toBeNull();
	});
});
