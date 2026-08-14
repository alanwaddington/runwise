import { describe, it, expect } from 'vitest';
import { Decoder, Stream } from '@garmin/fitsdk';
import { buildFitFilename, buildFitWorkout, type FitExportInput, type FitExportSegment } from './fit-export';

/** Shape of a decoded workout_step message, as returned by @garmin/fitsdk's Decoder. */
interface DecodedWorkoutStep {
	messageIndex: number;
	durationType: string;
	durationTime?: number;
	durationStep?: number;
	targetType?: string;
	repeatSteps?: number;
	customTargetSpeedLow?: number;
	customTargetSpeedHigh?: number;
	customTargetPowerLow?: number;
	customTargetPowerHigh?: number;
	customTargetHeartRateLow?: number;
	customTargetHeartRateHigh?: number;
	intensity?: string;
}

/**
 * Re-expands a decoded workout_step message list back into a flat logical sequence,
 * replaying any repeatUntilStepsCmplt step's referenced block `repeatSteps` times.
 * Used to assert the encoded structure is equivalent to the source segments, regardless
 * of how compactly repeats were encoded.
 */
function unrollSteps(steps: DecodedWorkoutStep[]): DecodedWorkoutStep[] {
	const bySimpleIndex = new Map(steps.map((s) => [s.messageIndex, s]));
	// Steps referenced inside a repeat block's range are only emitted via the repeat
	// expansion below, never as their own standalone entry during the main iteration.
	const consumedByRepeat = new Set<number>();
	for (const step of steps) {
		if (step.durationType === 'repeatUntilStepsCmplt') {
			for (let idx = step.durationStep!; idx < step.messageIndex; idx++) consumedByRepeat.add(idx);
		}
	}

	const unrolled: DecodedWorkoutStep[] = [];
	for (const step of steps) {
		if (step.durationType === 'repeatUntilStepsCmplt') {
			const block: DecodedWorkoutStep[] = [];
			for (let idx = step.durationStep!; idx < step.messageIndex; idx++) {
				block.push(bySimpleIndex.get(idx)!);
			}
			for (let n = 0; n < step.repeatSteps!; n++) unrolled.push(...block);
		} else if (!consumedByRepeat.has(step.messageIndex)) {
			unrolled.push(step);
		}
	}
	return unrolled;
}

interface DecodedWorkoutFile {
	fileIdMesgs: Array<{ type: string }>;
	workoutMesgs: Array<{ wktName: string }>;
	workoutStepMesgs: DecodedWorkoutStep[];
}

async function decodeWorkout(bytes: Uint8Array): Promise<DecodedWorkoutFile> {
	const stream = Stream.fromByteArray(Array.from(bytes));
	expect(Decoder.isFIT(stream)).toBe(true);
	const decoder = new Decoder(stream);
	expect(decoder.checkIntegrity()).toBe(true);
	const { messages, errors } = decoder.read();
	expect(errors).toEqual([]);
	return messages as DecodedWorkoutFile;
}

function seg(type: FitExportSegment['type'], durationMinutes: number, intensity: number): FitExportSegment {
	return { type, durationMinutes, intensity };
}

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

	it('buildFitFilename_HrWorkout_UsesHrSuffix', () => {
		expect(buildFitFilename('1000m reps', 'I', 'hr')).toBe('runwise-1000m-reps-I-hr.fit');
	});
});

describe('buildFitWorkout', () => {
	const PACE_REP_WORKOUT: FitExportInput = {
		label: '4 x 3min',
		zone: 'I',
		kind: 'pace',
		zoneRange: '3:30–4:00',
		easyRange: '4:30–5:00',
		segments: [
			seg('warmup', 10, 0),
			seg('work', 3, 1),
			seg('recovery', 1, 0),
			seg('work', 3, 1),
			seg('recovery', 1, 0),
			seg('work', 3, 1),
			seg('recovery', 1, 0),
			seg('work', 3, 1),
			seg('cooldown', 10, 0)
		]
	};

	const POWER_REP_WORKOUT: FitExportInput = {
		label: '5 x 2min power',
		zone: 'T',
		kind: 'power',
		zoneRange: '250–280 W',
		easyRange: '180–220 W',
		segments: [
			seg('warmup', 10, 0),
			seg('work', 2, 1),
			seg('recovery', 1, 0),
			seg('work', 2, 1),
			seg('recovery', 1, 0),
			seg('work', 2, 1),
			seg('cooldown', 10, 0)
		]
	};

	const HR_REP_WORKOUT: FitExportInput = {
		label: '4 x 3min HR',
		zone: 'I',
		kind: 'hr',
		zoneRange: '160–172 bpm',
		easyRange: '120–140 bpm',
		segments: [
			seg('warmup', 10, 0),
			seg('work', 3, 1),
			seg('recovery', 1, 0),
			seg('work', 3, 1),
			seg('cooldown', 10, 0)
		]
	};

	const HR_E_ZONE_WORKOUT: FitExportInput = {
		label: 'Regular easy run',
		zone: 'E',
		kind: 'hr',
		zoneRange: '<152 bpm', // Daniels' E zone has no lower bound (formatBpmRange's convention)
		easyRange: '<152 bpm',
		segments: [seg('warmup', 8, 0), seg('work', 30, 0.5), seg('cooldown', 5, 0)]
	};

	const HR_R_ZONE_WORKOUT: FitExportInput = {
		label: '400m reps',
		zone: 'R',
		kind: 'hr',
		zoneRange: '>190 bpm', // Daniels' R zone has no upper bound
		easyRange: '<152 bpm',
		segments: [seg('warmup', 10, 0), seg('work', 1, 1), seg('recovery', 2, 0), seg('work', 1, 1), seg('cooldown', 10, 0)]
	};

	const CONTINUOUS_WORKOUT: FitExportInput = {
		label: 'Continuous tempo',
		zone: 'T',
		kind: 'power',
		zoneRange: '250–280 W',
		easyRange: '180–220 W',
		segments: [seg('warmup', 10, 0), seg('work', 20, 0.5), seg('cooldown', 10, 0)]
	};

	it('buildFitWorkout_PaceRepWorkout_ProducesValidFitBinaryWithSpeedTargets', async () => {
		const { bytes, filename } = await buildFitWorkout(PACE_REP_WORKOUT);
		expect(filename).toBe('runwise-4-x-3min-I-pace.fit');

		const messages = await decodeWorkout(bytes);
		expect(messages.fileIdMesgs[0].type).toBe('workout');
		expect(messages.workoutMesgs[0].wktName).toBe('4 x 3min');

		const unrolled = unrollSteps(messages.workoutStepMesgs);
		expect(unrolled.map((s) => s.intensity)).toEqual([
			'warmup',
			'active',
			'rest',
			'active',
			'rest',
			'active',
			'rest',
			'active',
			'cooldown'
		]);
		expect(unrolled.every((s) => s.targetType === 'speed')).toBe(true);

		const workStep = unrolled.find((s) => s.intensity === 'active');
		expect(workStep).toBeDefined();
		// 3:30-4:00 zone, intensity 1 -> narrowed to the fast boundary +/-4s (210-214s/km) -> speed 4.386-4.405 m/s
		expect(workStep!.customTargetSpeedLow).toBeCloseTo(1000 / 214, 2);
		expect(workStep!.customTargetSpeedHigh).toBeCloseTo(1000 / 210, 2);
	});

	it('buildFitWorkout_PowerRepWorkout_ProducesValidFitBinaryWithPowerTargets', async () => {
		const { bytes, filename } = await buildFitWorkout(POWER_REP_WORKOUT);
		expect(filename).toBe('runwise-5-x-2min-power-T-power.fit');

		const messages = await decodeWorkout(bytes);
		const unrolled = unrollSteps(messages.workoutStepMesgs);
		expect(unrolled.map((s) => s.intensity)).toEqual([
			'warmup',
			'active',
			'rest',
			'active',
			'rest',
			'active',
			'cooldown'
		]);
		expect(unrolled.every((s) => s.targetType === 'power')).toBe(true);

		const workStep = unrolled.find((s) => s.intensity === 'active');
		expect(workStep).toBeDefined();
		// 250-280W zone, intensity 1 -> narrowed to the high boundary -6W (274-280W)
		expect(workStep!.customTargetPowerLow).toBe(274);
		expect(workStep!.customTargetPowerHigh).toBe(280);
	});

	it('buildFitWorkout_HrRepWorkout_ProducesValidFitBinaryWithHeartRateTargets', async () => {
		const { bytes, filename } = await buildFitWorkout(HR_REP_WORKOUT);
		expect(filename).toBe('runwise-4-x-3min-hr-I-hr.fit');

		const messages = await decodeWorkout(bytes);
		const unrolled = unrollSteps(messages.workoutStepMesgs);
		expect(unrolled.every((s) => s.targetType === 'heartRate')).toBe(true);

		const workStep = unrolled.find((s) => s.intensity === 'active');
		expect(workStep).toBeDefined();
		// 160-172 bpm zone, intensity 1 -> narrowed to the high boundary -3bpm (169-172bpm),
		// encoded as bpm + 100 per FIT's workoutHr bpmOffset convention.
		expect(workStep!.customTargetHeartRateLow).toBe(269);
		expect(workStep!.customTargetHeartRateHigh).toBe(272);

		const warmupStep = unrolled.find((s) => s.intensity === 'warmup');
		expect(warmupStep).toBeDefined();
		// Non-work segments use the full easy-zone band unnarrowed: 120-140 bpm -> 220-240.
		expect(warmupStep!.customTargetHeartRateLow).toBe(220);
		expect(warmupStep!.customTargetHeartRateHigh).toBe(240);
	});

	it('buildFitWorkout_HrEZoneWorkout_EncodesOneSidedTargetAtOpenEndedBound', async () => {
		// E zone is open-ended ("<152 bpm") -- regression test for the FIT-export crash this
		// used to throw on for every HR E-zone/R-zone workout (no second bound to narrow toward).
		const { bytes, filename } = await buildFitWorkout(HR_E_ZONE_WORKOUT);
		expect(filename).toBe('runwise-regular-easy-run-E-hr.fit');

		const messages = await decodeWorkout(bytes);
		const unrolled = unrollSteps(messages.workoutStepMesgs);
		expect(unrolled.every((s) => s.targetType === 'heartRate')).toBe(true);

		const workStep = unrolled.find((s) => s.intensity === 'active');
		expect(workStep).toBeDefined();
		// One-sided target: low === high === the zone's only known bound (152), + FIT's bpm offset.
		expect(workStep!.customTargetHeartRateLow).toBe(252);
		expect(workStep!.customTargetHeartRateHigh).toBe(252);

		const warmupStep = unrolled.find((s) => s.intensity === 'warmup');
		expect(warmupStep!.customTargetHeartRateLow).toBe(252);
		expect(warmupStep!.customTargetHeartRateHigh).toBe(252);
	});

	it('buildFitWorkout_HrRZoneWorkout_EncodesOneSidedTargetAtOpenEndedBound', async () => {
		// R zone is open-ended (">190 bpm") -- the other Daniels zone with only one bound.
		const { bytes } = await buildFitWorkout(HR_R_ZONE_WORKOUT);
		const messages = await decodeWorkout(bytes);
		const unrolled = unrollSteps(messages.workoutStepMesgs);

		const workStep = unrolled.find((s) => s.intensity === 'active');
		expect(workStep).toBeDefined();
		expect(workStep!.customTargetHeartRateLow).toBe(290); // 190 + 100 offset
		expect(workStep!.customTargetHeartRateHigh).toBe(290);
	});

	it('buildFitWorkout_RepWorkout_EncodesRepeatedIntervalUsingNativeRepeatStep', async () => {
		const { bytes } = await buildFitWorkout(PACE_REP_WORKOUT);
		const messages = await decodeWorkout(bytes);

		const repeatStep = messages.workoutStepMesgs.find(
			(s) => s.durationType === 'repeatUntilStepsCmplt'
		);
		expect(repeatStep).toBeDefined();
		expect(repeatStep!.repeatSteps).toBe(3); // reps 2-4 share one encoded (recovery, work) block
		// Fewer physical step messages than a flat 4-work/3-recovery/warmup/cooldown encoding (9 segments).
		expect(messages.workoutStepMesgs.length).toBeLessThan(PACE_REP_WORKOUT.segments.length);
	});

	it('buildFitWorkout_RepWorkout_NoRecoveryStepAfterFinalWorkStep', async () => {
		const { bytes } = await buildFitWorkout(PACE_REP_WORKOUT);
		const messages = await decodeWorkout(bytes);
		const unrolled = unrollSteps(messages.workoutStepMesgs);

		const lastWorkIndex = unrolled.map((s) => s.intensity).lastIndexOf('active');
		expect(unrolled[lastWorkIndex + 1].intensity).not.toBe('rest');
		expect(unrolled[lastWorkIndex + 1].intensity).toBe('cooldown');
	});

	it('buildFitWorkout_ContinuousWorkout_EncodesFlatStepListWithNoRepeatStep', async () => {
		const { bytes, filename } = await buildFitWorkout(CONTINUOUS_WORKOUT);
		expect(filename).toBe('runwise-continuous-tempo-T-power.fit');

		const messages = await decodeWorkout(bytes);
		expect(messages.workoutStepMesgs.length).toBe(3);
		expect(messages.workoutStepMesgs.map((s) => s.intensity)).toEqual([
			'warmup',
			'active',
			'cooldown'
		]);
		expect(
			messages.workoutStepMesgs.some((s) => s.durationType === 'repeatUntilStepsCmplt')
		).toBe(false);
	});

	it('buildFitWorkout_AnyWorkout_StepDurationsMatchSourceSegments', async () => {
		const { bytes } = await buildFitWorkout(CONTINUOUS_WORKOUT);
		const messages = await decodeWorkout(bytes);
		const durations = messages.workoutStepMesgs.map((s) => s.durationTime);
		expect(durations).toEqual([600, 1200, 600]); // 10min, 20min, 10min in seconds
	});
});
