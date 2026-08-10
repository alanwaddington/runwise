import type { WorkoutSegmentType } from './workouts';
import type { ZoneKey } from './training-paces';
import { getSegmentPaceRangeSeconds, getSegmentPowerRangeWatts } from './segment-targets';
import type { Encodable, Encoder, Mesg } from '@garmin/fitsdk';

/** Lowercase, collapse non-alphanumeric runs to a single hyphen, trim leading/trailing hyphens. */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Filename convention: runwise-<slugified label>-<zone>-<pace|power>.fit */
export function buildFitFilename(label: string, zone: ZoneKey, kind: 'pace' | 'power'): string {
	return `runwise-${slugify(label)}-${zone}-${kind}.fit`;
}

export interface FitExportSegment {
	type: WorkoutSegmentType;
	durationMinutes: number;
	intensity: number;
}

export interface FitExportInput {
	/** Workout name, e.g. "1000m reps". */
	label: string;
	zone: ZoneKey;
	kind: 'pace' | 'power';
	segments: FitExportSegment[];
	/** The workout's own zone band, e.g. "3:30–4:00" (pace) or "250–280 W" (power). Applied to work segments. */
	zoneRange: string;
	/** The Easy-zone band, in the same format as zoneRange. Applied to warmup/recovery/cooldown segments. */
	easyRange: string;
}

export interface FitExportResult {
	bytes: Uint8Array;
	filename: string;
}

const SEGMENT_INTENSITY: Record<WorkoutSegmentType, string> = {
	warmup: 'warmup',
	work: 'active',
	recovery: 'rest',
	cooldown: 'cooldown'
};

interface StepTarget {
	targetType: 'speed' | 'power';
	low: number; // m/s (speed) or watts (power)
	high: number;
}

/** Reuses the exact target math the UI displays (segment-targets.ts) so a downloaded workout never drifts from what's shown on screen. */
function computeStepTarget(input: FitExportInput, segment: FitExportSegment): StepTarget {
	const zoneRangeForSegment = segment.type === 'work' ? input.zoneRange : input.easyRange;

	if (input.kind === 'pace') {
		const range = getSegmentPaceRangeSeconds(zoneRangeForSegment, segment.intensity, segment.type);
		if (range === null) {
			throw new Error(`Unable to compute pace target for zone range "${zoneRangeForSegment}"`);
		}
		// range.low/high are seconds-per-km (low = faster/smaller time, high = slower/larger time).
		// Speed is inversely related to pace, so the bounds swap: slower time -> lower speed.
		return { targetType: 'speed', low: 1000 / range.high, high: 1000 / range.low };
	}

	const range = getSegmentPowerRangeWatts(zoneRangeForSegment, segment.intensity, segment.type);
	if (range === null) {
		throw new Error(`Unable to compute power target for zone range "${zoneRangeForSegment}"`);
	}
	return { targetType: 'power', low: range.low, high: range.high };
}

// The FIT JS SDK Encoder does NOT resolve dynamic subfields (e.g. durationTime,
// customTargetSpeedLow) from the base field they map to -- values must be written directly
// to the base field (durationValue, customTargetValueLow/High) already scaled per the FIT
// profile (confirmed empirically: an encode/decode round-trip drops any subfield key
// silently). The Decoder re-expands these into the human-friendly subfield names on read,
// which is what fit-export.test.ts asserts against.
const SPEED_SCALE = 1000; // customTargetValueLow/High raw units are mm/s when targetType = speed
const DURATION_TIME_SCALE = 1000; // durationValue raw units are ms when durationType = time

interface WorkoutStepMessage {
	messageIndex: number;
	durationType: string;
	durationValue?: number;
	targetType: string;
	targetValue?: number;
	customTargetValueLow?: number;
	customTargetValueHigh?: number;
	intensity?: string;
}

function buildSimpleStep(
	input: FitExportInput,
	segment: FitExportSegment,
	messageIndex: number
): WorkoutStepMessage {
	const target = computeStepTarget(input, segment);
	const scale = target.targetType === 'speed' ? SPEED_SCALE : 1;
	return {
		messageIndex,
		durationType: 'time',
		durationValue: Math.round(segment.durationMinutes * 60 * DURATION_TIME_SCALE),
		targetType: target.targetType,
		customTargetValueLow: Math.round(target.low * scale),
		customTargetValueHigh: Math.round(target.high * scale),
		intensity: SEGMENT_INTENSITY[segment.type]
	};
}

function isSameSegment(a: FitExportSegment, b: FitExportSegment): boolean {
	return a.type === b.type && a.durationMinutes === b.durationMinutes && a.intensity === b.intensity;
}

/**
 * Build the FIT workout_step sequence from a Workout's segments, compressing genuine
 * repeating (work, recovery) runs into a native FIT repeat_step so high rep-count
 * intervals stay compact and safely under FIT's step-count limits. The first work step
 * of a repeat-eligible run is emitted standalone, followed by a repeat block over
 * (recovery, work) x (N-1) -- never (work, recovery) x N -- so the repeat mechanism's
 * last physical action is always the work step, never a recovery: no recovery step is
 * ever encoded after the final rep, matching the source segments, which already omit it.
 * Non-uniform runs (ladder/pyramid/single steps) are simply left as individual steps.
 */
function buildWorkoutSteps(input: FitExportInput): WorkoutStepMessage[] {
	const steps: WorkoutStepMessage[] = [];
	const segments = input.segments;
	let i = 0;

	while (i < segments.length) {
		const isRepeatEligible =
			segments[i].type === 'work' &&
			i + 3 < segments.length &&
			segments[i + 1].type === 'recovery' &&
			isSameSegment(segments[i + 2], segments[i]) &&
			segments[i + 2].type === 'work' &&
			segments[i + 3].type === 'recovery' &&
			isSameSegment(segments[i + 3], segments[i + 1]);

		if (!isRepeatEligible) {
			steps.push(buildSimpleStep(input, segments[i], steps.length));
			i += 1;
			continue;
		}

		// Standalone first rep — never part of the repeated block.
		steps.push(buildSimpleStep(input, segments[i], steps.length));

		// Shared (recovery, work) block: encoded once, then replayed by the repeat step below.
		const recoverySegment = segments[i + 1];
		const workSegment = segments[i + 2];
		const blockStartIndex = steps.length;
		steps.push(buildSimpleStep(input, recoverySegment, steps.length));
		steps.push(buildSimpleStep(input, workSegment, steps.length));

		let repeatCount = 1; // the block just pushed already represents one repetition
		let j = i + 3;
		while (
			j + 1 < segments.length &&
			isSameSegment(segments[j], recoverySegment) &&
			isSameSegment(segments[j + 1], workSegment)
		) {
			repeatCount += 1;
			j += 2;
		}

		steps.push({
			messageIndex: steps.length,
			durationType: 'repeatUntilStepsCmplt',
			durationValue: blockStartIndex, // durationStep subfield: message_index to loop back to
			targetType: 'open',
			targetValue: repeatCount // repeatSteps subfield: total times the block plays
		});

		i = j;
	}

	return steps;
}

interface FileIdMessage {
	mesgNum: number;
	type: string;
	manufacturer: string;
	product: number;
	serialNumber: number;
	timeCreated: Date;
}

interface WorkoutMessage {
	mesgNum: number;
	sport: string;
	numValidSteps: number;
	wktName: string;
}

/**
 * @garmin/fitsdk's shipped .d.ts types every FIT enum field (type, sport, durationType,
 * targetType, intensity, ...) as a plain `number`, even though the SDK's own documented
 * convention -- and its own README examples -- pass the human-readable string enum name
 * (e.g. `type: "workout"`), which is what the runtime encoder/decoder actually expects
 * (confirmed empirically). This narrow, single-purpose cast bridges that gap for our own
 * well-typed message shapes, rather than typing our messages as `number` fields we'd then
 * have to pass strings into anyway.
 */
function writeFitMesg<T extends { mesgNum: number }>(encoder: Encoder, mesg: T): void {
	encoder.writeMesg(mesg as unknown as Encodable<Mesg>);
}

/** Encodes a Workout into a downloadable FIT workout file, entirely client-side. */
export async function buildFitWorkout(input: FitExportInput): Promise<FitExportResult> {
	if (input.segments.length === 0) {
		throw new Error('Cannot build a FIT workout with no segments.');
	}

	const steps = buildWorkoutSteps(input);
	const filename = buildFitFilename(input.label, input.zone, input.kind);

	const { Encoder: EncoderCtor, Profile } = await import('@garmin/fitsdk');
	const encoder = new EncoderCtor();

	const fileId: FileIdMessage = {
		mesgNum: Profile.MesgNum.FILE_ID,
		type: 'workout',
		manufacturer: 'development',
		product: 0,
		serialNumber: 1,
		timeCreated: new Date()
	};
	writeFitMesg(encoder, fileId);

	const workout: WorkoutMessage = {
		mesgNum: Profile.MesgNum.WORKOUT,
		sport: 'running',
		numValidSteps: steps.length,
		wktName: input.label
	};
	writeFitMesg(encoder, workout);

	for (const step of steps) {
		writeFitMesg(encoder, { mesgNum: Profile.MesgNum.WORKOUT_STEP, ...step });
	}

	const bytes = encoder.close();
	return { bytes, filename };
}
