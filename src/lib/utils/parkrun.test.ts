import { describe, it, expect } from 'vitest';
import {
	EFFORT_DISTANCES,
	effortToRaceDistanceKm,
	predictParkrunTime,
	generateSplits,
	compareToPb,
	calculateAgeGrade,
	getAgeGradeLabel
} from './parkrun';

describe('EFFORT_DISTANCES', () => {
	it('contains exactly 3 entries', () => {
		expect(Object.keys(EFFORT_DISTANCES)).toHaveLength(3);
	});

	it('has easy, moderate, hard keys', () => {
		expect(EFFORT_DISTANCES).toHaveProperty('easy');
		expect(EFFORT_DISTANCES).toHaveProperty('moderate');
		expect(EFFORT_DISTANCES).toHaveProperty('hard');
	});
});

describe('effortToRaceDistanceKm', () => {
	it('effortToRaceDistanceKm_Easy_ReturnsMarathonDistance', () => {
		expect(effortToRaceDistanceKm('easy')).toBeCloseTo(42.195, 3);
	});

	it('effortToRaceDistanceKm_Moderate_ReturnsHalfMarathonDistance', () => {
		expect(effortToRaceDistanceKm('moderate')).toBeCloseTo(21.0975, 4);
	});

	it('effortToRaceDistanceKm_Hard_Returns10k', () => {
		expect(effortToRaceDistanceKm('hard')).toBe(10);
	});
});

describe('predictParkrunTime', () => {
	it('predictParkrunTime_8kIn48MinEasy_FasterThanTrainingPace', () => {
		// Training pace: 48:00 / 8km = 6:00/km → 5K at that pace would be 1800s
		const result = predictParkrunTime(8, 2880, 'easy');
		expect(result).not.toBeNull();
		expect(result!).toBeLessThan(1800);
	});

	it('predictParkrunTime_EasyEffort_FasterThanHardEffort', () => {
		// Same training run: Easy effort implies more fitness in reserve than Hard effort
		// at the same pace, so Easy produces a more optimistic (faster) prediction.
		const easyResult = predictParkrunTime(8, 2880, 'easy');
		const hardResult = predictParkrunTime(8, 2880, 'hard');
		expect(easyResult!).toBeLessThan(hardResult!);
	});

	it('predictParkrunTime_AllEfforts_FasterThanNaiveTrainingPace', () => {
		// Naive 5K extrapolation of the training pace: (2880 / 8) * 5 = 1800s
		const naive5k = (2880 / 8) * 5;
		expect(predictParkrunTime(8, 2880, 'easy')!).toBeLessThan(naive5k);
		expect(predictParkrunTime(8, 2880, 'moderate')!).toBeLessThan(naive5k);
		expect(predictParkrunTime(8, 2880, 'hard')!).toBeLessThan(naive5k);
	});

	it('predictParkrunTime_ZeroDistance_ReturnsNull', () => {
		expect(predictParkrunTime(0, 2880, 'easy')).toBeNull();
	});

	it('predictParkrunTime_ZeroTime_ReturnsNull', () => {
		expect(predictParkrunTime(8, 0, 'easy')).toBeNull();
	});

	it('predictParkrunTime_NegativeDistance_ReturnsNull', () => {
		expect(predictParkrunTime(-8, 2880, 'easy')).toBeNull();
	});
});

describe('generateSplits', () => {
	it('generateSplits_1500Seconds_Returns5Rows', () => {
		const splits = generateSplits(1500);
		expect(splits).toHaveLength(5);
	});

	it('generateSplits_1500Seconds_EvenCumulativeSplits', () => {
		const splits = generateSplits(1500);
		expect(splits[0]).toMatchObject({ km: 1, cumulative: '5:00' });
		expect(splits[1]).toMatchObject({ km: 2, cumulative: '10:00' });
		expect(splits[2]).toMatchObject({ km: 3, cumulative: '15:00' });
		expect(splits[3]).toMatchObject({ km: 4, cumulative: '20:00' });
		expect(splits[4]).toMatchObject({ km: 5, cumulative: '25:00' });
	});

	it('generateSplits_1500Seconds_EvenSplitPace', () => {
		const splits = generateSplits(1500);
		for (const row of splits) {
			expect(row.splitPace).toBe('5:00');
		}
	});

	it('generateSplits_ZeroTime_ReturnsEmptyArray', () => {
		expect(generateSplits(0)).toEqual([]);
	});

	it('generateSplits_NegativeTime_ReturnsEmptyArray', () => {
		expect(generateSplits(-100)).toEqual([]);
	});
});

describe('compareToPb', () => {
	it('compareToPb_PredictedFasterThanPb_ReturnsPositiveDelta', () => {
		const result = compareToPb(1500, 1532);
		expect(result.deltaSeconds).toBe(32);
		expect(result.description).toBe('32 seconds faster than your PB');
	});

	it('compareToPb_PredictedSlowerThanPb_ReturnsNegativeDelta', () => {
		const result = compareToPb(1500, 1480);
		expect(result.deltaSeconds).toBe(-20);
		expect(result.description).toBe('20 seconds slower than your PB');
	});

	it('compareToPb_PredictedEqualsPb_ReturnsZeroDelta', () => {
		const result = compareToPb(1500, 1500);
		expect(result.deltaSeconds).toBe(0);
		expect(result.description).toBe('right on your PB pace');
	});

	it('compareToPb_SingleSecondFaster_UsesSingularWording', () => {
		const result = compareToPb(1499, 1500);
		expect(result.description).toBe('1 second faster than your PB');
	});

	it('compareToPb_SingleSecondSlower_UsesSingularWording', () => {
		const result = compareToPb(1501, 1500);
		expect(result.description).toBe('1 second slower than your PB');
	});
});

describe('calculateAgeGrade', () => {
	it('calculateAgeGrade_Age35Male_ReturnsPercentageBetween0And100', () => {
		const result = calculateAgeGrade(1500, 35, 'male');
		expect(result).not.toBeNull();
		expect(result!).toBeGreaterThan(0);
		expect(result!).toBeLessThan(100);
	});

	it('calculateAgeGrade_PeakAgeMale_FactorNearOne', () => {
		// At peak age (~25), a time equal to the open standard should grade close to 100%.
		const result = calculateAgeGrade(769, 25, 'male');
		expect(result!).toBeCloseTo(100, 0);
	});

	it('calculateAgeGrade_PeakAgeFemale_FactorNearOne', () => {
		const result = calculateAgeGrade(834, 25, 'female');
		expect(result!).toBeCloseTo(100, 0);
	});

	it('calculateAgeGrade_Age70_HigherGradeThanPeakAgeSameTime', () => {
		// The same absolute time is a relatively stronger performance for an older
		// runner, so their age grade percentage should be higher than a peak-age runner's.
		const peak = calculateAgeGrade(1500, 25, 'male');
		const senior = calculateAgeGrade(1500, 70, 'male');
		expect(senior!).toBeGreaterThan(peak!);
	});

	it('calculateAgeGrade_AgeBelow5_ReturnsNull', () => {
		expect(calculateAgeGrade(1500, 4, 'male')).toBeNull();
	});

	it('calculateAgeGrade_AgeAbove100_ReturnsNull', () => {
		expect(calculateAgeGrade(1500, 101, 'male')).toBeNull();
	});

	it('calculateAgeGrade_ZeroTime_ReturnsNull', () => {
		expect(calculateAgeGrade(0, 35, 'male')).toBeNull();
	});

	it('calculateAgeGrade_NegativeTime_ReturnsNull', () => {
		expect(calculateAgeGrade(-100, 35, 'male')).toBeNull();
	});
});

describe('getAgeGradeLabel', () => {
	it('getAgeGradeLabel_95Percent_ReturnsNational', () => {
		expect(getAgeGradeLabel(95)).toBe('National');
	});

	it('getAgeGradeLabel_55Percent_ReturnsRecreational', () => {
		expect(getAgeGradeLabel(55)).toBe('Recreational');
	});

	it('getAgeGradeLabel_100Percent_ReturnsWorld', () => {
		expect(getAgeGradeLabel(100)).toBe('World');
	});

	it('getAgeGradeLabel_105Percent_ReturnsWorld', () => {
		expect(getAgeGradeLabel(105)).toBe('World');
	});

	it('getAgeGradeLabel_90Percent_ReturnsNational', () => {
		expect(getAgeGradeLabel(90)).toBe('National');
	});

	it('getAgeGradeLabel_80Percent_ReturnsRegional', () => {
		expect(getAgeGradeLabel(80)).toBe('Regional');
	});

	it('getAgeGradeLabel_70Percent_ReturnsLocal', () => {
		expect(getAgeGradeLabel(70)).toBe('Local');
	});

	it('getAgeGradeLabel_69Percent_ReturnsRecreational', () => {
		expect(getAgeGradeLabel(69)).toBe('Recreational');
	});
});
