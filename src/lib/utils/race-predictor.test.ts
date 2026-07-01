import { describe, it, expect } from 'vitest';
import {
	parseTime,
	formatTime,
	riegelPredict,
	predictedPaceMinPerKm,
	buildPredictionTable,
	STANDARD_DISTANCES
} from './race-predictor';

describe('STANDARD_DISTANCES', () => {
	it('contains exactly 6 entries', () => {
		expect(STANDARD_DISTANCES).toHaveLength(6);
	});

	it('includes 5K with km = 5', () => {
		const fiveK = STANDARD_DISTANCES.find((d) => d.name === '5K');
		expect(fiveK).toBeDefined();
		expect(fiveK!.km).toBe(5);
	});

	it('includes Marathon with correct distance', () => {
		const marathon = STANDARD_DISTANCES.find((d) => d.name === 'Marathon');
		expect(marathon).toBeDefined();
		expect(marathon!.km).toBeCloseTo(42.195, 2);
	});
});

describe('parseTime', () => {
	it('parseTime_ValidMMSS_ReturnsSeconds', () => {
		expect(parseTime('25:00')).toBe(1500);
	});

	it('parseTime_ValidHMMSS_ReturnsSeconds', () => {
		expect(parseTime('1:56:20')).toBe(6980);
	});

	it('parseTime_EmptyString_ReturnsNull', () => {
		expect(parseTime('')).toBeNull();
	});

	it('parseTime_InvalidSeconds_ReturnsNull', () => {
		expect(parseTime('5:99:00')).toBeNull();
	});

	it('parseTime_InvalidMinutes_ReturnsNull', () => {
		expect(parseTime('1:99:00')).toBeNull();
	});

	it('parseTime_NegativeValue_ReturnsNull', () => {
		expect(parseTime('-5:00')).toBeNull();
	});

	it('parseTime_RandomText_ReturnsNull', () => {
		expect(parseTime('abc')).toBeNull();
	});

	it('parseTime_ZeroTime_ReturnsNull', () => {
		expect(parseTime('0:00')).toBeNull();
	});

	it('parseTime_SingleSegment_ReturnsNull', () => {
		expect(parseTime('25')).toBeNull();
	});

	it('parseTime_WhitespaceOnly_ReturnsNull', () => {
		expect(parseTime('   ')).toBeNull();
	});

	it('parseTime_TrimsWhitespace_ReturnsSeconds', () => {
		expect(parseTime('  25:00  ')).toBe(1500);
	});

	it('parseTime_HoursZeroMinutes_ReturnsSeconds', () => {
		expect(parseTime('2:00:00')).toBe(7200);
	});
});

describe('formatTime', () => {
	it('formatTime_Under1Hour_ReturnsMmSs', () => {
		expect(formatTime(1500)).toBe('25:00');
	});

	it('formatTime_Over1Hour_ReturnsHMmSs', () => {
		expect(formatTime(6980)).toBe('1:56:20');
	});

	it('formatTime_ExactlyOneHour_ReturnsHMmSs', () => {
		expect(formatTime(3600)).toBe('1:00:00');
	});

	it('formatTime_SingleDigitSeconds_PadsZero', () => {
		expect(formatTime(61)).toBe('1:01');
	});

	it('formatTime_245Seconds_Returns4m05s', () => {
		expect(formatTime(245)).toBe('4:05');
	});

	it('formatTime_Zero_ReturnsMmSs', () => {
		expect(formatTime(0)).toBe('0:00');
	});
});

describe('riegelPredict', () => {
	it('riegelPredict_5kTo10k_ReturnsApproximateTime', () => {
		// 25:00 5K → ~52:18 10K
		const result = riegelPredict(1500, 5, 10);
		expect(result).toBeGreaterThan(3100);
		expect(result).toBeLessThan(3200);
	});

	it('riegelPredict_5kToHalfMarathon_ReturnsApproximateTime', () => {
		// 25:00 5K → ~1:55:00 half marathon per Riegel
		const result = riegelPredict(1500, 5, 21.0975);
		expect(result).toBeGreaterThan(6850);
		expect(result).toBeLessThan(6950);
	});

	it('riegelPredict_SameDistance_ReturnsSameTime', () => {
		const result = riegelPredict(1500, 5, 5);
		expect(result).toBeCloseTo(1500, 0);
	});
});

describe('predictedPaceMinPerKm', () => {
	it('predictedPaceMinPerKm_ReturnsDecimalMinutesPerKm', () => {
		// 3000 seconds over 10km = 5 min/km
		const result = predictedPaceMinPerKm(3000, 10);
		expect(result).toBeCloseTo(5, 2);
	});

	it('predictedPaceMinPerKm_1500SecOver5km_Returns5MinPerKm', () => {
		const result = predictedPaceMinPerKm(1500, 5);
		expect(result).toBeCloseTo(5, 2);
	});
});

describe('buildPredictionTable', () => {
	it('buildPredictionTable_NoCustom_Returns6Rows', () => {
		const rows = buildPredictionTable(1500, 5, null);
		expect(rows).toHaveLength(6);
	});

	it('buildPredictionTable_CustomNonDupe_Returns7Rows', () => {
		const rows = buildPredictionTable(1500, 5, 12);
		expect(rows).toHaveLength(7);
	});

	it('buildPredictionTable_CustomMatchesStandard_Returns6Rows', () => {
		// 5.0 is the same as 5K — should be deduped
		const rows = buildPredictionTable(1500, 5, 5.0);
		expect(rows).toHaveLength(6);
	});

	it('buildPredictionTable_CustomWithinTolerance_Returns6Rows', () => {
		// 5.005 is within 0.01 of 5K — should be deduped
		const rows = buildPredictionTable(1500, 5, 5.005);
		expect(rows).toHaveLength(6);
	});

	it('buildPredictionTable_SortedByKm', () => {
		const rows = buildPredictionTable(1500, 5, 12);
		for (let i = 1; i < rows.length; i++) {
			expect(rows[i].km).toBeGreaterThan(rows[i - 1].km);
		}
	});

	it('buildPredictionTable_ContainsTimeFormatted', () => {
		const rows = buildPredictionTable(1500, 5, null);
		const fiveK = rows.find((r) => r.name === '5K');
		expect(fiveK).toBeDefined();
		expect(fiveK!.timeFormatted).toBe('25:00');
	});

	it('buildPredictionTable_ContainsPaceFields', () => {
		const rows = buildPredictionTable(1500, 5, null);
		const fiveK = rows.find((r) => r.name === '5K');
		expect(fiveK!.paceMinKm).toMatch(/^\d+:\d{2}$/);
		expect(fiveK!.paceMinMile).toMatch(/^\d+:\d{2}$/);
	});

	it('buildPredictionTable_CustomRowLabelledCustom', () => {
		const rows = buildPredictionTable(1500, 5, 12);
		const custom = rows.find((r) => r.km === 12);
		expect(custom).toBeDefined();
		expect(custom!.name).toBe('Custom');
	});
});
