import { describe, it, expect } from 'vitest';
import {
	getSegmentPaceRange,
	getSegmentPaceRangeSeconds,
	getSegmentPowerRange,
	getSegmentPowerRangeWatts
} from './segment-targets';

describe('getSegmentPaceRangeSeconds', () => {
	it('getSegmentPaceRangeSeconds_WorkSegmentIntensity1_ReturnsFastBoundaryPlusMargin', () => {
		const range = getSegmentPaceRangeSeconds('3:30–4:00', 1, 'work');
		expect(range).not.toBeNull();
		expect(range!.low).toBeCloseTo(210, 5); // 3:30 = 210s, clamped at the fast boundary
		expect(range!.high).toBeCloseTo(214, 5); // +4s margin
	});

	it('getSegmentPaceRangeSeconds_WorkSegmentIntensity0_ReturnsSlowBoundaryMinusMargin', () => {
		const range = getSegmentPaceRangeSeconds('3:30–4:00', 0, 'work');
		expect(range).not.toBeNull();
		expect(range!.low).toBeCloseTo(236, 5); // 4:00 - 4s margin
		expect(range!.high).toBeCloseTo(240, 5); // 4:00 = 240s, clamped at the slow boundary
	});

	it('getSegmentPaceRangeSeconds_WorkSegmentMidIntensity_InterpolatesBetweenBoundaries', () => {
		const range = getSegmentPaceRangeSeconds('3:30–4:00', 0.5, 'work');
		expect(range).not.toBeNull();
		// target = 240 - (240-210)*0.5 = 225s, margin 4 either side
		expect(range!.low).toBeCloseTo(221, 5);
		expect(range!.high).toBeCloseTo(229, 5);
	});

	it('getSegmentPaceRangeSeconds_NonWorkSegment_ReturnsFullZoneBandUnnarrowed', () => {
		const range = getSegmentPaceRangeSeconds('3:30–4:00', 1, 'warmup');
		expect(range).toEqual({ low: 210, high: 240 });
	});

	it('getSegmentPaceRangeSeconds_MalformedZoneRange_ReturnsNull', () => {
		expect(getSegmentPaceRangeSeconds('not-a-range', 1, 'work')).toBeNull();
		expect(getSegmentPaceRangeSeconds('', 1, 'work')).toBeNull();
	});
});

describe('getSegmentPaceRange', () => {
	it('getSegmentPaceRange_WorkSegment_ReturnsFormattedNarrowedRange', () => {
		expect(getSegmentPaceRange('3:30–4:00', 1, 'work')).toBe('3:34–3:30 /km');
	});

	it('getSegmentPaceRange_NonWorkSegment_ReturnsInputUnchanged', () => {
		expect(getSegmentPaceRange('3:30–4:00', 1, 'recovery')).toBe('3:30–4:00');
	});

	it('getSegmentPaceRange_EmptyInput_ReturnsInputUnchanged', () => {
		expect(getSegmentPaceRange('', 1, 'work')).toBe('');
	});
});

describe('getSegmentPowerRangeWatts', () => {
	it('getSegmentPowerRangeWatts_WorkSegmentIntensity1_ReturnsHighBoundaryMinusMargin', () => {
		const range = getSegmentPowerRangeWatts('164–202 W', 1, 'work');
		expect(range).not.toBeNull();
		expect(range!.low).toBe(196); // 202 - 6
		expect(range!.high).toBe(202); // clamped at the zone's high boundary
	});

	it('getSegmentPowerRangeWatts_WorkSegmentIntensity0_ReturnsLowBoundaryPlusMargin', () => {
		const range = getSegmentPowerRangeWatts('164–202 W', 0, 'work');
		expect(range).not.toBeNull();
		expect(range!.low).toBe(164); // clamped at the zone's low boundary
		expect(range!.high).toBe(170); // 164 + 6
	});

	it('getSegmentPowerRangeWatts_NonWorkSegment_ReturnsFullZoneBandUnnarrowed', () => {
		expect(getSegmentPowerRangeWatts('164–202 W', 1, 'recovery')).toEqual({ low: 164, high: 202 });
	});

	it('getSegmentPowerRangeWatts_MalformedZoneRange_ReturnsNull', () => {
		expect(getSegmentPowerRangeWatts('not-a-range', 1, 'work')).toBeNull();
	});
});

describe('getSegmentPowerRange', () => {
	it('getSegmentPowerRange_WorkSegment_ReturnsFormattedNarrowedRange', () => {
		expect(getSegmentPowerRange('164–202 W', 1, 'work')).toBe('196–202 W');
	});

	it('getSegmentPowerRange_NonWorkSegment_ReturnsInputUnchanged', () => {
		expect(getSegmentPowerRange('164–202 W', 1, 'cooldown')).toBe('164–202 W');
	});
});
