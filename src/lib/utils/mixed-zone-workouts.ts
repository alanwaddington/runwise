import {
	computeZoneVolumeKm,
	computeWarmupMinutes,
	computeCooldownMinutes,
	roundToNearest5Seconds,
	sumSegmentMinutes,
	midpointPaceMinKm,
	type Workout,
	type WorkoutSegment
} from './workouts';
import { type ZoneKey, type TrainingZone } from './training-paces';

export type MixedZonePairKey = 'E+M' | 'M+T' | 'T+I';

/** Segment helpers (copied from workouts.ts/power-workouts.ts for consistency) */
const WARMUP_INTENSITY = 0.25;
const COOLDOWN_INTENSITY = 0.25;
const ZONE_INTENSITY: Record<ZoneKey, number> = { E: 0.35, M: 0.55, T: 0.7, I: 0.85, R: 1 };

function warmupSegment(minutes: number): WorkoutSegment {
	return { type: 'warmup', durationMinutes: roundToNearest5Seconds(minutes), intensity: WARMUP_INTENSITY };
}

function cooldownSegment(minutes: number): WorkoutSegment {
	return { type: 'cooldown', durationMinutes: roundToNearest5Seconds(minutes), intensity: COOLDOWN_INTENSITY };
}

function round1(n: number): number {
	return Math.round(n * 10) / 10;
}

function formatMinutes(minutes: number): string {
	const whole = Math.floor(minutes);
	const seconds = Math.round((minutes - whole) * 60);
	if (seconds === 0) return `${whole}`;
	return `${whole}:${seconds.toString().padStart(2, '0')}`;
}

function findZone(trainingZones: TrainingZone[], zone: ZoneKey): TrainingZone {
	const found = trainingZones.find((z) => z.zone === zone);
	if (!found) throw new Error(`Training zone ${zone} not found`);
	return found;
}

/** AC-6.1: easy base (25-40min, midpoint used) with 2-3 marathon-pace bridges (2-3km, midpoint used). */
function buildEasyMarathonBridgeWorkout(trainingZones: TrainingZone[], weeklyMileageKm: number): Workout {
	const ePace = midpointPaceMinKm(findZone(trainingZones, 'E'));
	const mPace = midpointPaceMinKm(findZone(trainingZones, 'M'));

	// AC-6.1's 25-40min base band, scaled within that band by weekly mileage (same E-zone
	// volume calc other E-zone workouts use) rather than a single fixed midpoint.
	const baseTotalMinutes = Math.min(40, Math.max(25, computeZoneVolumeKm('E', weeklyMileageKm, ePace) * ePace));
	const bridgeCount = 2; // within the 2-3 bridge band
	const bridgeKm = 2.5; // midpoint of 2-3km
	const bridgeMinutes = bridgeKm * mPace;
	const baseSegmentMinutes = baseTotalMinutes / (bridgeCount + 1);

	const segments: WorkoutSegment[] = [];
	for (let i = 0; i < bridgeCount; i++) {
		segments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(baseSegmentMinutes), intensity: ZONE_INTENSITY.E });
		segments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(bridgeMinutes), intensity: ZONE_INTENSITY.M });
	}
	segments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(baseSegmentMinutes), intensity: ZONE_INTENSITY.E });

	const qualityMinutes = sumSegmentMinutes(segments);
	const warmupMinutes = computeWarmupMinutes('E', qualityMinutes);
	const cooldownMinutes = computeCooldownMinutes('E', qualityMinutes);
	segments.unshift(warmupSegment(warmupMinutes));
	segments.push(cooldownSegment(cooldownMinutes));

	const totalVolumeKm = round1(baseTotalMinutes / ePace + bridgeCount * bridgeKm);

	return {
		label: 'E+M: Easy Run with Marathon Surges',
		description: `Easy-paced base run with ${bridgeCount} × ${round1(bridgeKm)}km bridges at marathon pace, to build the aerobic-threshold link. Start easy, pick up to marathon pace for each bridge, then settle back to easy.`,
		totalVolumeKm,
		recovery: 'None (continuous — bridges are the only intensity change)',
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'mixed-zone'
	};
}

/** AC-6.2: marathon-pace base with 2-3 threshold surges (5-8min, midpoint used). */
function buildMarathonThresholdSurgeWorkout(trainingZones: TrainingZone[], weeklyMileageKm: number): Workout {
	const mPace = midpointPaceMinKm(findZone(trainingZones, 'M'));
	const tPace = midpointPaceMinKm(findZone(trainingZones, 'T'));

	// No AC-specified base band for M+T (unlike AC-6.1's E+M band), so 20-40min is a
	// documented assumption, scaled by weekly mileage via the same M-zone volume calc.
	const baseTotalMinutes = Math.min(40, Math.max(20, computeZoneVolumeKm('M', weeklyMileageKm, mPace) * mPace));
	const surgeCount = 2; // within the 2-3 surge band
	const surgeMinutes = 6.5; // midpoint of 5-8min
	const baseSegmentMinutes = baseTotalMinutes / (surgeCount + 1);

	const segments: WorkoutSegment[] = [];
	for (let i = 0; i < surgeCount; i++) {
		segments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(baseSegmentMinutes), intensity: ZONE_INTENSITY.M });
		segments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(surgeMinutes), intensity: ZONE_INTENSITY.T });
	}
	segments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(baseSegmentMinutes), intensity: ZONE_INTENSITY.M });

	const qualityMinutes = sumSegmentMinutes(segments);
	const warmupMinutes = computeWarmupMinutes('M', qualityMinutes);
	const cooldownMinutes = computeCooldownMinutes('M', qualityMinutes);
	segments.unshift(warmupSegment(warmupMinutes));
	segments.push(cooldownSegment(cooldownMinutes));

	const totalVolumeKm = round1(baseTotalMinutes / mPace + (surgeCount * surgeMinutes) / tPace);

	return {
		label: 'M+T: Marathon Base with Threshold Surges',
		description: `Marathon-pace base with ${surgeCount} × ${formatMinutes(surgeMinutes)} min surges at threshold pace — race-specific training for holding form under rising effort. Settle into marathon pace, surge to threshold, then recover back to marathon pace.`,
		totalVolumeKm,
		recovery: 'None (continuous — surges are the only intensity change)',
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'mixed-zone'
	};
}

/** AC-6.3: threshold blocks (2-3 x 8min) with fast pickups (30sec-1min, midpoint used) after each block. */
function buildThresholdIntervalPickupWorkout(trainingZones: TrainingZone[], weeklyMileageKm: number): Workout {
	const tPace = midpointPaceMinKm(findZone(trainingZones, 'T'));
	const iPace = midpointPaceMinKm(findZone(trainingZones, 'I'));

	// Within the AC-6.3 2-3 block band: 3 blocks once weekly mileage supports the extra volume.
	const blockCount = weeklyMileageKm >= 50 ? 3 : 2;
	const blockMinutes = 8;
	const pickupMinutes = 0.75; // 45sec, midpoint of 30sec-1min
	const betweenBlockRecoveryMinutes = 1.5;

	const segments: WorkoutSegment[] = [];
	for (let i = 0; i < blockCount; i++) {
		segments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(blockMinutes), intensity: ZONE_INTENSITY.T });
		segments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(pickupMinutes), intensity: ZONE_INTENSITY.I });
		if (i < blockCount - 1) {
			segments.push({ type: 'recovery', durationMinutes: roundToNearest5Seconds(betweenBlockRecoveryMinutes), intensity: 0.2 });
		}
	}

	const qualityMinutes = sumSegmentMinutes(segments);
	const warmupMinutes = computeWarmupMinutes('T', qualityMinutes);
	const cooldownMinutes = computeCooldownMinutes('T', qualityMinutes);
	segments.unshift(warmupSegment(warmupMinutes));
	segments.push(cooldownSegment(cooldownMinutes));

	const totalVolumeKm = round1((blockCount * blockMinutes) / tPace + (blockCount * pickupMinutes) / iPace);

	return {
		label: 'T+I: Threshold Blocks with Fast Pickups',
		description: `${blockCount} × ${blockMinutes} min threshold blocks, each finished with a ${formatMinutes(pickupMinutes)} min fast pickup at VO2 max effort — upper-end threshold work with a top-end kick. Hold threshold pace for the block, then accelerate hard for the pickup before easing into recovery.`,
		totalVolumeKm,
		recovery: `${formatMinutes(betweenBlockRecoveryMinutes)} min jog between blocks`,
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments,
		pattern: 'mixed-zone'
	};
}

/**
 * Build the mixed-zone workout for a given zone pair (Decision 7) — segments alternate between
 * the pair's two zones' paces with a valid, non-inverted (base < surge) intensity progression.
 */
export function buildMixedZoneWorkouts(
	pairKey: MixedZonePairKey,
	trainingZones: TrainingZone[],
	weeklyMileageKm: number
): Workout[] {
	switch (pairKey) {
		case 'E+M':
			return [buildEasyMarathonBridgeWorkout(trainingZones, weeklyMileageKm)];
		case 'M+T':
			return [buildMarathonThresholdSurgeWorkout(trainingZones, weeklyMileageKm)];
		case 'T+I':
			return [buildThresholdIntervalPickupWorkout(trainingZones, weeklyMileageKm)];
	}
}
