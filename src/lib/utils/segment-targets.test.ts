import { describe, it, expect } from 'vitest';
import {
	getSegmentPaceRange,
	getSegmentPaceRangeSeconds,
	getSegmentPowerRange,
	getSegmentPowerRangeWatts,
	getSegmentBpmRange,
	getSegmentBpmRangeNumeric,
	getOpenEndedBpmBound
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

describe('getSegmentBpmRangeNumeric', () => {
	it('getSegmentBpmRangeNumeric_WorkSegmentIntensity1_ReturnsHighBoundaryMinusMargin', () => {
		const range = getSegmentBpmRangeNumeric('145–160 bpm', 1, 'work');
		expect(range).not.toBeNull();
		expect(range!.low).toBe(157); // 160 - 3
		expect(range!.high).toBe(160); // clamped at the zone's high boundary
	});

	it('getSegmentBpmRangeNumeric_WorkSegmentIntensity0_ReturnsLowBoundaryPlusMargin', () => {
		const range = getSegmentBpmRangeNumeric('145–160 bpm', 0, 'work');
		expect(range).not.toBeNull();
		expect(range!.low).toBe(145); // clamped at the zone's low boundary
		expect(range!.high).toBe(148); // 145 + 3
	});

	it('getSegmentBpmRangeNumeric_NonWorkSegment_ReturnsFullZoneBandUnnarrowed', () => {
		expect(getSegmentBpmRangeNumeric('145–160 bpm', 1, 'recovery')).toEqual({ low: 145, high: 160 });
	});

	it('getSegmentBpmRangeNumeric_MalformedZoneRange_ReturnsNull', () => {
		expect(getSegmentBpmRangeNumeric('not-a-range', 1, 'work')).toBeNull();
	});

	it('getSegmentBpmRangeNumeric_OpenEndedZone_ReturnsNull', () => {
		// "< 145 bpm" / "> 160 bpm" — only one boundary, nothing to narrow between.
		expect(getSegmentBpmRangeNumeric('< 145 bpm', 1, 'work')).toBeNull();
		expect(getSegmentBpmRangeNumeric('> 160 bpm', 1, 'work')).toBeNull();
	});
});

describe('getOpenEndedBpmBound', () => {
	it('getOpenEndedBpmBound_EasyZoneUpperBound_ReturnsBound', () => {
		expect(getOpenEndedBpmBound('<152 bpm')).toBe(152);
	});

	it('getOpenEndedBpmBound_RepetitionZoneLowerBound_ReturnsBound', () => {
		expect(getOpenEndedBpmBound('>190 bpm')).toBe(190);
	});

	it('getOpenEndedBpmBound_SpacedVariant_ReturnsBound', () => {
		// formatBpmRange never emits a space, but this stays tolerant of it either way.
		expect(getOpenEndedBpmBound('< 152 bpm')).toBe(152);
	});

	it('getOpenEndedBpmBound_ClosedRange_ReturnsNull', () => {
		expect(getOpenEndedBpmBound('145–160 bpm')).toBeNull();
	});

	it('getOpenEndedBpmBound_MalformedInput_ReturnsNull', () => {
		expect(getOpenEndedBpmBound('not-a-range')).toBeNull();
	});
});

describe('getSegmentBpmRange', () => {
	it('getSegmentBpmRange_WorkSegment_ReturnsFormattedNarrowedRange', () => {
		expect(getSegmentBpmRange('145–160 bpm', 1, 'work')).toBe('157–160 bpm');
	});

	it('getSegmentBpmRange_NonWorkSegment_ReturnsInputUnchanged', () => {
		expect(getSegmentBpmRange('145–160 bpm', 1, 'cooldown')).toBe('145–160 bpm');
	});
});
