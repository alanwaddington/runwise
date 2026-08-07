import { describe, it, expect } from 'vitest';
import { serializeRaceResult, parseRaceResultParams } from './race-result-params';

describe('serializeRaceResult', () => {
	it('serializeRaceResult_StandardDistance_IncludesDistanceAndTime', () => {
		const qs = serializeRaceResult({ selectedOption: '5K', customKmRaw: '', timeRaw: '25:00' });
		const params = new URLSearchParams(qs);
		expect(params.get('distance')).toBe('5K');
		expect(params.get('time')).toBe('25:00');
		expect(params.has('km')).toBe(false);
	});

	it('serializeRaceResult_CustomDistance_IncludesKm', () => {
		const qs = serializeRaceResult({
			selectedOption: 'Custom',
			customKmRaw: '12.5',
			timeRaw: '1:02:00'
		});
		const params = new URLSearchParams(qs);
		expect(params.get('distance')).toBe('Custom');
		expect(params.get('km')).toBe('12.5');
		expect(params.get('time')).toBe('1:02:00');
	});
});

describe('parseRaceResultParams', () => {
	it('parseRaceResultParams_StandardDistance_RoundTrips', () => {
		const input = { selectedOption: '5K', customKmRaw: '', timeRaw: '25:00' };
		const parsed = parseRaceResultParams(new URLSearchParams(serializeRaceResult(input)));
		expect(parsed).toEqual(input);
	});

	it('parseRaceResultParams_CustomDistance_RoundTrips', () => {
		const input = { selectedOption: 'Custom', customKmRaw: '12.5', timeRaw: '1:02:00' };
		const parsed = parseRaceResultParams(new URLSearchParams(serializeRaceResult(input)));
		expect(parsed).toEqual(input);
	});

	it('parseRaceResultParams_MissingDistance_ReturnsNull', () => {
		expect(parseRaceResultParams(new URLSearchParams('time=25:00'))).toBeNull();
	});

	it('parseRaceResultParams_MissingTime_ReturnsNull', () => {
		expect(parseRaceResultParams(new URLSearchParams('distance=5K'))).toBeNull();
	});

	it('parseRaceResultParams_UnparseableTime_ReturnsNull', () => {
		expect(parseRaceResultParams(new URLSearchParams('distance=5K&time=notatime'))).toBeNull();
	});

	it('parseRaceResultParams_UnrecognizedDistance_ReturnsNull', () => {
		expect(parseRaceResultParams(new URLSearchParams('distance=Bogus&time=25:00'))).toBeNull();
	});

	it('parseRaceResultParams_CustomWithoutKm_ReturnsNull', () => {
		expect(parseRaceResultParams(new URLSearchParams('distance=Custom&time=25:00'))).toBeNull();
	});

	it('parseRaceResultParams_CustomWithNonNumericKm_ReturnsNull', () => {
		expect(
			parseRaceResultParams(new URLSearchParams('distance=Custom&km=abc&time=25:00'))
		).toBeNull();
	});

	it('parseRaceResultParams_CustomWithNegativeKm_ReturnsNull', () => {
		expect(
			parseRaceResultParams(new URLSearchParams('distance=Custom&km=-5&time=25:00'))
		).toBeNull();
	});

	it('parseRaceResultParams_EmptyParams_ReturnsNull', () => {
		expect(parseRaceResultParams(new URLSearchParams())).toBeNull();
	});
});
