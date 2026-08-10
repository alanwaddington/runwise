import { describe, it, expect } from 'vitest';
import { buildFitFilename } from './fit-export';

describe('buildFitFilename', () => {
	it('buildFitFilename_PaceWorkout_MatchesAnalysisExample', () => {
		expect(buildFitFilename('1000m reps', 'I', 'pace')).toBe('runwise-1000m-reps-I-pace.fit');
	});

	it('buildFitFilename_PowerWorkout_UsesPowerSuffix', () => {
		expect(buildFitFilename('1000m reps', 'I', 'power')).toBe('runwise-1000m-reps-I-power.fit');
	});

	it('buildFitFilename_LabelWithTimesSymbol_SlugifiesCleanly', () => {
		expect(buildFitFilename('6 × 3 min', 'T', 'power')).toBe('runwise-6-3-min-T-power.fit');
	});

	it('buildFitFilename_LabelWithPunctuationAndCase_CollapsesAndLowercases', () => {
		expect(buildFitFilename('Tempo Ladder!!', 'T', 'pace')).toBe('runwise-tempo-ladder-T-pace.fit');
	});

	it('buildFitFilename_LabelWithLeadingTrailingPunctuation_TrimsHyphens', () => {
		expect(buildFitFilename('  -Easy Run- ', 'E', 'pace')).toBe('runwise-easy-run-E-pace.fit');
	});
});
