import { describe, it, expect } from 'vitest';
import {
	parsePace,
	formatPace,
	minPerKmToMinPerMile,
	minPerMileToMinPerKm,
	minPerKmToKmh,
	kmhToMinPerKm,
	kmhToMph,
	minPerKmToPer400m,
	minPerKmToPer800m
} from './pace';

describe('parsePace', () => {
	it('parsePace_validMSS_returnsDecimalMinutes', () => {
		expect(parsePace('5:30')).toBeCloseTo(5.5, 5);
	});

	it('parsePace_zeroSeconds_returnsWholeMinutes', () => {
		expect(parsePace('5:00')).toBeCloseTo(5.0, 5);
	});

	it('parsePace_singleDigitSeconds_parsesCorrectly', () => {
		expect(parsePace('5:09')).toBeCloseTo(5.15, 5);
	});

	it('parsePace_minutesOnly_returnsDecimalMinutes', () => {
		expect(parsePace('8:51')).toBeCloseTo(8.85, 2);
	});

	it('parsePace_emptyString_returnsNull', () => {
		expect(parsePace('')).toBeNull();
	});

	it('parsePace_nonNumericString_returnsNull', () => {
		expect(parsePace('abc')).toBeNull();
	});

	it('parsePace_secondsGeq60_returnsNull', () => {
		expect(parsePace('5:60')).toBeNull();
		expect(parsePace('5:99')).toBeNull();
	});

	it('parsePace_negativeMinutes_returnsNull', () => {
		expect(parsePace('-1:30')).toBeNull();
	});

	it('parsePace_zeroMinutesZeroSeconds_returnsNull', () => {
		expect(parsePace('0:00')).toBeNull();
	});

	it('parsePace_noColon_returnsNull', () => {
		expect(parsePace('530')).toBeNull();
	});

	it('parsePace_whitespace_returnsNull', () => {
		expect(parsePace('  ')).toBeNull();
	});
});

describe('formatPace', () => {
	it('formatPace_exactMinutes_formatsCorrectly', () => {
		expect(formatPace(5.5)).toBe('5:30');
	});

	it('formatPace_roundsSecondsToNearestInteger', () => {
		expect(formatPace(8.85)).toBe('8:51');
	});

	it('formatPace_padsSecondsToTwoDigits', () => {
		expect(formatPace(5.15)).toBe('5:09');
	});

	it('formatPace_exactHourPace_formatsCorrectly', () => {
		expect(formatPace(5.0)).toBe('5:00');
	});

	it('formatPace_roundTripWithParsePace', () => {
		expect(formatPace(parsePace('4:45')!)).toBe('4:45');
		expect(formatPace(parsePace('10:00')!)).toBe('10:00');
	});
});

describe('minPerKmToMinPerMile', () => {
	it('minPerKmToMinPerMile_5_30perKm_returns8_51perMile', () => {
		expect(minPerKmToMinPerMile(5.5)).toBeCloseTo(8.851, 2);
	});

	it('minPerKmToMinPerMile_4_00perKm_returnsCorrect', () => {
		expect(minPerKmToMinPerMile(4.0)).toBeCloseTo(6.437, 2);
	});
});

describe('minPerMileToMinPerKm', () => {
	it('minPerMileToMinPerKm_8_51perMile_returns5_30perKm', () => {
		expect(minPerMileToMinPerKm(8.851)).toBeCloseTo(5.5, 2);
	});

	it('minPerMileToMinPerKm_isInverseOfMinPerKmToMinPerMile', () => {
		const original = 6.0;
		expect(minPerMileToMinPerKm(minPerKmToMinPerMile(original))).toBeCloseTo(original, 5);
	});
});

describe('minPerKmToKmh', () => {
	it('minPerKmToKmh_5_5minPerKm_returns10_9kmh', () => {
		expect(minPerKmToKmh(5.5)).toBeCloseTo(10.909, 2);
	});

	it('minPerKmToKmh_6_0minPerKm_returns10_kmh', () => {
		expect(minPerKmToKmh(6.0)).toBeCloseTo(10.0, 5);
	});
});

describe('kmhToMinPerKm', () => {
	it('kmhToMinPerKm_10_9kmh_returns5_5minPerKm', () => {
		expect(kmhToMinPerKm(10.909)).toBeCloseTo(5.5, 2);
	});

	it('kmhToMinPerKm_isInverseOfMinPerKmToKmh', () => {
		const original = 5.5;
		expect(kmhToMinPerKm(minPerKmToKmh(original))).toBeCloseTo(original, 5);
	});

	it('kmhToMinPerKm_zero_returnsNull', () => {
		expect(kmhToMinPerKm(0)).toBeNull();
	});

	it('kmhToMinPerKm_negative_returnsNull', () => {
		expect(kmhToMinPerKm(-1)).toBeNull();
	});
});

describe('kmhToMph', () => {
	it('kmhToMph_10_9kmh_returns6_8mph', () => {
		expect(kmhToMph(10.909)).toBeCloseTo(6.778, 2);
	});

	it('kmhToMph_16_093kmh_returns10_0mph', () => {
		expect(kmhToMph(16.0934)).toBeCloseTo(10.0, 4);
	});
});

describe('minPerKmToPer400m', () => {
	it('minPerKmToPer400m_5_5minPerKm_returns2_2min', () => {
		expect(minPerKmToPer400m(5.5)).toBeCloseTo(2.2, 5);
	});

	it('minPerKmToPer400m_formatsAs2_12', () => {
		expect(formatPace(minPerKmToPer400m(5.5))).toBe('2:12');
	});
});

describe('minPerKmToPer800m', () => {
	it('minPerKmToPer800m_5_5minPerKm_returns4_4min', () => {
		expect(minPerKmToPer800m(5.5)).toBeCloseTo(4.4, 5);
	});

	it('minPerKmToPer800m_formatsAs4_24', () => {
		expect(formatPace(minPerKmToPer800m(5.5))).toBe('4:24');
	});
});
