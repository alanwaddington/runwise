import {
	computeZoneVolumeKm,
	computeWarmupMinutes,
	computeCooldownMinutes,
	roundToNearest5Seconds,
	roundWorkoutSegments,
	sumSegmentMinutes,
	midpointPaceMinKm,
	type Workout,
	type WorkoutSegment
} from './workouts';
import { calculateDanielsLthrZones, type HrTrainingZone } from './hr-zones';
import { ZONE_META, type ZoneKey, type TrainingZone } from './training-paces';

export interface HrWorkoutZone {
	zone: ZoneKey;
	name: string;
	bpmLow: number | null;
	bpmHigh: number | null;
	confidence: 'high' | 'medium' | 'low';
	/** Present only when trainingZones was supplied to buildHrWorkoutsResult. */
	informationalPaceLow?: string;
	informationalPaceHigh?: string;
	workouts: Workout[];
}

export interface HrWorkoutsResult {
	lthr: number;
	zones: HrWorkoutZone[];
	usedFallbackPace: boolean;
}

/** VDOT 45, ~5:30/km — used only to size workout durations when no race result is available. */
const FALLBACK_EASY_PACE_MIN_KM = 5.5;

/** Segment helpers (copied from workouts.ts/power-workouts.ts for consistency) */
const WARMUP_INTENSITY = 0.25;
const COOLDOWN_INTENSITY = 0.25;
const RECOVERY_INTENSITY = 0.2;
const ZONE_INTENSITY: Record<ZoneKey, number> = { E: 0.35, M: 0.55, T: 0.7, I: 0.85, R: 1 };

function warmupSegment(minutes: number): WorkoutSegment {
	return { type: 'warmup', durationMinutes: roundToNearest5Seconds(minutes), intensity: WARMUP_INTENSITY };
}

function cooldownSegment(minutes: number): WorkoutSegment {
	return { type: 'cooldown', durationMinutes: roundToNearest5Seconds(minutes), intensity: COOLDOWN_INTENSITY };
}

function formatMinutes(minutes: number): string {
	const whole = Math.floor(minutes);
	const seconds = Math.round((minutes - whole) * 60);
	if (seconds === 0) return `${whole}`;
	return `${whole}:${seconds.toString().padStart(2, '0')}`;
}

function round1(n: number): number {
	return Math.round(n * 10) / 10;
}

/** Formats an HR zone's bpm range for use in a workout description, e.g. "142–153 bpm". */
function formatBpmRangeStr(hrZone: HrTrainingZone): string {
	if (hrZone.bpmLow !== null && hrZone.bpmHigh !== null) {
		return `${hrZone.bpmLow}–${hrZone.bpmHigh} bpm`;
	}
	if (hrZone.bpmHigh !== null) return `<${hrZone.bpmHigh} bpm`;
	if (hrZone.bpmLow !== null) return `>${hrZone.bpmLow} bpm`;
	return 'N/A';
}

function buildHrContinuousWorkout(
	zone: ZoneKey,
	hrZone: HrTrainingZone,
	weeklyMileageKm: number,
	pace: number,
	label: string,
	qualityMinutesOverride?: number
): Workout {
	const qualityMinutes = qualityMinutesOverride ?? computeZoneVolumeKm(zone, weeklyMileageKm, pace) * pace;
	const warmupMinutes = computeWarmupMinutes(zone, qualityMinutes);
	const cooldownMinutes = computeCooldownMinutes(zone, qualityMinutes);
	const zoneName = ZONE_META[zone].name;
	const bpmRangeStr = formatBpmRangeStr(hrZone);

	const segments: WorkoutSegment[] = [
		warmupSegment(warmupMinutes),
		{ type: 'work', durationMinutes: roundToNearest5Seconds(qualityMinutes), intensity: ZONE_INTENSITY[zone] },
		cooldownSegment(cooldownMinutes)
	];

	return {
		label,
		description: `${formatMinutes(qualityMinutes)} continuous ${zoneName} run at ${zoneName} HR (${bpmRangeStr})`,
		totalVolumeKm: round1(qualityMinutes / pace),
		recovery: 'None (continuous)',
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments
	};
}

/**
 * Fixed rep durations for HR-mode I/R workouts — duration-based (Decision 5), since HR carries
 * no distance. Mirrors power-workouts.ts's short/medium/long scheme (2/4/6 min) for consistency.
 */
const REP_DURATIONS_MINUTES = { short: 2, medium: 4, long: 6 };

function buildHrRepsWorkout(
	zone: 'I' | 'R',
	hrZone: HrTrainingZone,
	weeklyMileageKm: number,
	pace: number,
	repMinutes: number,
	label: string,
	recoveryFraction: number
): Workout {
	const volumeMinutes = computeZoneVolumeKm(zone, weeklyMileageKm, pace) * pace;
	const repCount = Math.max(3, Math.round(volumeMinutes / repMinutes));
	const recoveryMinutes = roundToNearest5Seconds(repMinutes * recoveryFraction);

	const segments: WorkoutSegment[] = [];
	for (let i = 0; i < repCount; i++) {
		segments.push({
			type: 'work',
			durationMinutes: roundToNearest5Seconds(repMinutes),
			intensity: ZONE_INTENSITY[zone]
		});
		if (i < repCount - 1) {
			segments.push({ type: 'recovery', durationMinutes: recoveryMinutes, intensity: RECOVERY_INTENSITY });
		}
	}

	const qualityTime = sumSegmentMinutes(segments);
	const warmupMinutes = computeWarmupMinutes(zone, qualityTime);
	const cooldownMinutes = computeCooldownMinutes(zone, qualityTime);
	segments.unshift(warmupSegment(warmupMinutes));
	segments.push(cooldownSegment(cooldownMinutes));

	const zoneName = ZONE_META[zone].name;
	const bpmRangeStr = formatBpmRangeStr(hrZone);
	const recoveryStr = formatMinutes(recoveryMinutes);

	return {
		label,
		description: `${repCount} × ${formatMinutes(repMinutes)} min at ${zoneName} HR (${bpmRangeStr}), ${recoveryStr} min recovery`,
		totalVolumeKm: round1(qualityTime / pace),
		recovery: `${recoveryStr} min recovery between reps`,
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(segments)),
		segments
	};
}

function buildHrZoneWorkoutsUnrounded(
	zone: ZoneKey,
	hrZone: HrTrainingZone,
	weeklyMileageKm: number,
	pace: number
): Workout[] {
	const bpmRangeStr = formatBpmRangeStr(hrZone);

	if (zone === 'E') {
		const regular = buildHrContinuousWorkout(zone, hrZone, weeklyMileageKm, pace, 'Continuous Easy run');

		const longMinutes = computeZoneVolumeKm('E', weeklyMileageKm, pace) * pace * 1.3;
		const longRun = buildHrContinuousWorkout(zone, hrZone, weeklyMileageKm, pace, 'Long run', longMinutes);

		const fartlekMinutes = (computeZoneVolumeKm('E', weeklyMileageKm, pace) * pace) * 0.8;
		const fartlekPickupMinutes = 2;
		const fartlekRecoveryMinutes = 1.5;
		const fartlekPickupCount = Math.floor(fartlekMinutes / (fartlekPickupMinutes + fartlekRecoveryMinutes));
		const fartlekWarmupMinutes = computeWarmupMinutes('E', fartlekMinutes);
		const fartlekCooldownMinutes = computeCooldownMinutes('E', fartlekMinutes);

		const fartlekSegments: WorkoutSegment[] = [warmupSegment(fartlekWarmupMinutes)];
		for (let i = 0; i < fartlekPickupCount; i++) {
			fartlekSegments.push({
				type: 'work',
				durationMinutes: roundToNearest5Seconds(fartlekPickupMinutes),
				intensity: 0.75
			});
			if (i < fartlekPickupCount - 1) {
				fartlekSegments.push({
					type: 'recovery',
					durationMinutes: roundToNearest5Seconds(fartlekRecoveryMinutes),
					intensity: ZONE_INTENSITY.E
				});
			}
		}
		fartlekSegments.push(cooldownSegment(fartlekCooldownMinutes));

		const fartlek: Workout = {
			label: 'Easy fartlek',
			description: `${fartlekPickupCount} × ${formatMinutes(fartlekPickupMinutes)} min pickups at Easy HR (${bpmRangeStr}), ${formatMinutes(fartlekRecoveryMinutes)} min easy jog recovery`,
			totalVolumeKm: round1(fartlekMinutes / pace),
			recovery: `${formatMinutes(fartlekRecoveryMinutes)} min easy jog between pickups`,
			estimatedDurationMinutes: Math.round(sumSegmentMinutes(fartlekSegments)),
			segments: fartlekSegments
		};

		return [regular, longRun, fartlek];
	}

	if (zone === 'M') {
		const continuous = buildHrContinuousWorkout(zone, hrZone, weeklyMileageKm, pace, 'Continuous Marathon run');

		const volumeMinutes = computeZoneVolumeKm('M', weeklyMileageKm, pace) * pace;
		const segmentMinutes = volumeMinutes / 2;
		const recoveryMinutes = 1.5 * pace;
		const qualityTime = volumeMinutes + recoveryMinutes;
		const warmupMinutes = computeWarmupMinutes('M', qualityTime);
		const cooldownMinutes = computeCooldownMinutes('M', qualityTime);

		const segmentedSegments: WorkoutSegment[] = [
			warmupSegment(warmupMinutes),
			{ type: 'work', durationMinutes: roundToNearest5Seconds(segmentMinutes), intensity: ZONE_INTENSITY.M },
			{ type: 'recovery', durationMinutes: roundToNearest5Seconds(recoveryMinutes), intensity: RECOVERY_INTENSITY },
			{ type: 'work', durationMinutes: roundToNearest5Seconds(segmentMinutes), intensity: ZONE_INTENSITY.M },
			cooldownSegment(cooldownMinutes)
		];
		const segmented: Workout = {
			label: 'Segments',
			description: `2 × ${formatMinutes(segmentMinutes)} min at Marathon HR (${bpmRangeStr}), ${formatMinutes(recoveryMinutes)} min easy jog recovery`,
			totalVolumeKm: round1(volumeMinutes / pace),
			recovery: `${formatMinutes(recoveryMinutes)} min easy jog between segments`,
			estimatedDurationMinutes: Math.round(sumSegmentMinutes(segmentedSegments)),
			segments: segmentedSegments
		};

		const progWarmupMinutes = computeWarmupMinutes('M', volumeMinutes);
		const progCooldownMinutes = computeCooldownMinutes('M', volumeMinutes);
		const progSegmentCount = 3;
		const progSegmentMinutes = volumeMinutes / progSegmentCount;
		const progSegments: WorkoutSegment[] = [warmupSegment(progWarmupMinutes)];
		for (let i = 0; i < progSegmentCount; i++) {
			const intensity = RECOVERY_INTENSITY + (i / (progSegmentCount - 1)) * (ZONE_INTENSITY.M - RECOVERY_INTENSITY);
			progSegments.push({ type: 'work', durationMinutes: roundToNearest5Seconds(progSegmentMinutes), intensity });
		}
		progSegments.push(cooldownSegment(progCooldownMinutes));
		const progression: Workout = {
			label: 'Progression',
			description: `${progSegmentCount} progressive segments building to Marathon HR (${bpmRangeStr})`,
			totalVolumeKm: round1(volumeMinutes / pace),
			recovery: 'None (continuous progression)',
			estimatedDurationMinutes: Math.round(sumSegmentMinutes(progSegments)),
			segments: progSegments
		};

		return [continuous, segmented, progression];
	}

	if (zone === 'T') {
		const continuous = buildHrContinuousWorkout(zone, hrZone, weeklyMileageKm, pace, 'Continuous Threshold run');

		const volumeMinutes = computeZoneVolumeKm('T', weeklyMileageKm, pace) * pace;
		const cruiseRepMinutes = 5.5;
		const cruiseRepCount = Math.max(2, Math.round(volumeMinutes / cruiseRepMinutes));
		const cruiseRecoveryMinutes = round1(cruiseRepMinutes / 5);
		const cruiseSegments: WorkoutSegment[] = [];
		for (let i = 0; i < cruiseRepCount; i++) {
			cruiseSegments.push({
				type: 'work',
				durationMinutes: roundToNearest5Seconds(cruiseRepMinutes),
				intensity: ZONE_INTENSITY.T
			});
			if (i < cruiseRepCount - 1) {
				cruiseSegments.push({
					type: 'recovery',
					durationMinutes: roundToNearest5Seconds(cruiseRecoveryMinutes),
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		const cruiseQualityTime = sumSegmentMinutes(cruiseSegments);
		const cruiseWarmupMinutes = computeWarmupMinutes('T', cruiseQualityTime);
		const cruiseCooldownMinutes = computeCooldownMinutes('T', cruiseQualityTime);
		cruiseSegments.unshift(warmupSegment(cruiseWarmupMinutes));
		cruiseSegments.push(cooldownSegment(cruiseCooldownMinutes));
		const cruise: Workout = {
			label: 'Cruise intervals',
			description: `${cruiseRepCount} × ${formatMinutes(cruiseRepMinutes)} min at Threshold HR (${bpmRangeStr}), ${formatMinutes(cruiseRecoveryMinutes)} min jog recovery`,
			totalVolumeKm: round1(volumeMinutes / pace),
			recovery: `${formatMinutes(cruiseRecoveryMinutes)} min jog between reps`,
			estimatedDurationMinutes: Math.round(sumSegmentMinutes(cruiseSegments)),
			segments: cruiseSegments
		};

		const ladderSteps = 5;
		const stepMinutes = volumeMinutes / (ladderSteps * 2 - 1);
		const ladderSegments: WorkoutSegment[] = [];
		for (let i = 0; i < ladderSteps; i++) {
			ladderSegments.push({
				type: 'work',
				durationMinutes: roundToNearest5Seconds(stepMinutes * (i + 1)),
				intensity: ZONE_INTENSITY.T
			});
			const recoveryDuration = roundToNearest5Seconds((stepMinutes * (i + 1)) / 5);
			ladderSegments.push({ type: 'recovery', durationMinutes: recoveryDuration, intensity: RECOVERY_INTENSITY });
		}
		for (let i = ladderSteps - 2; i >= 0; i--) {
			ladderSegments.push({
				type: 'work',
				durationMinutes: roundToNearest5Seconds(stepMinutes * (i + 1)),
				intensity: ZONE_INTENSITY.T
			});
			if (i > 0) {
				const recoveryDuration = roundToNearest5Seconds((stepMinutes * (i + 1)) / 5);
				ladderSegments.push({ type: 'recovery', durationMinutes: recoveryDuration, intensity: RECOVERY_INTENSITY });
			}
		}
		const ladderQualityTime = sumSegmentMinutes(ladderSegments);
		const ladderWarmupMinutes = computeWarmupMinutes('T', ladderQualityTime);
		const ladderCooldownMinutes = computeCooldownMinutes('T', ladderQualityTime);
		ladderSegments.unshift(warmupSegment(ladderWarmupMinutes));
		ladderSegments.push(cooldownSegment(ladderCooldownMinutes));
		const ladder: Workout = {
			label: 'Tempo ladder',
			description: `Ascending and descending tempo ladder at Threshold HR (${bpmRangeStr})`,
			totalVolumeKm: round1(volumeMinutes / pace),
			recovery: 'Recovery increases with each rung',
			estimatedDurationMinutes: Math.round(sumSegmentMinutes(ladderSegments)),
			segments: ladderSegments
		};

		return [continuous, cruise, ladder];
	}

	// I and R: duration-based reps (Decision 5) — HR is the prescription, pace is informational
	// only (surfaced at the HrWorkoutZone level, not baked into these descriptions).
	const recoveryFraction = zone === 'I' ? 0.75 : 1.0;
	const short = buildHrRepsWorkout(
		zone,
		hrZone,
		weeklyMileageKm,
		pace,
		REP_DURATIONS_MINUTES.short,
		'Short intervals',
		recoveryFraction
	);
	const medium = buildHrRepsWorkout(
		zone,
		hrZone,
		weeklyMileageKm,
		pace,
		REP_DURATIONS_MINUTES.medium,
		'Medium intervals',
		recoveryFraction
	);
	const long = buildHrRepsWorkout(
		zone,
		hrZone,
		weeklyMileageKm,
		pace,
		REP_DURATIONS_MINUTES.long,
		'Long intervals',
		recoveryFraction
	);

	if (zone === 'I') {
		const volumeMinutes = computeZoneVolumeKm('I', weeklyMileageKm, pace) * pace;
		const pyramidSteps = 4;
		const stepMinutes = volumeMinutes / (pyramidSteps * 2 - 1);
		const pyramidSegments: WorkoutSegment[] = [];
		for (let i = 0; i < pyramidSteps; i++) {
			pyramidSegments.push({
				type: 'work',
				durationMinutes: roundToNearest5Seconds(stepMinutes * (i + 1)),
				intensity: ZONE_INTENSITY.I
			});
			pyramidSegments.push({ type: 'recovery', durationMinutes: roundToNearest5Seconds(stepMinutes), intensity: RECOVERY_INTENSITY });
		}
		for (let i = pyramidSteps - 2; i >= 0; i--) {
			pyramidSegments.push({
				type: 'work',
				durationMinutes: roundToNearest5Seconds(stepMinutes * (i + 1)),
				intensity: ZONE_INTENSITY.I
			});
			if (i > 0) {
				pyramidSegments.push({
					type: 'recovery',
					durationMinutes: roundToNearest5Seconds(stepMinutes),
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		const pyramidQualityTime = sumSegmentMinutes(pyramidSegments);
		const pyramidWarmupMinutes = computeWarmupMinutes('I', pyramidQualityTime);
		const pyramidCooldownMinutes = computeCooldownMinutes('I', pyramidQualityTime);
		pyramidSegments.unshift(warmupSegment(pyramidWarmupMinutes));
		pyramidSegments.push(cooldownSegment(pyramidCooldownMinutes));
		const pyramid: Workout = {
			label: 'Pyramid',
			description: `Ascending and descending intensity pyramid at Interval HR (${bpmRangeStr})`,
			totalVolumeKm: round1(volumeMinutes / pace),
			recovery: `${formatMinutes(stepMinutes)} min recovery between steps`,
			estimatedDurationMinutes: Math.round(sumSegmentMinutes(pyramidSegments)),
			segments: pyramidSegments
		};
		return [short, medium, long, pyramid];
	}

	// R
	const volumeMinutes = computeZoneVolumeKm('R', weeklyMileageKm, pace) * pace;
	const descendingSteps = 5;
	const descendingStepMinutes = volumeMinutes / (descendingSteps * 2 - 1);
	const descendingSegments: WorkoutSegment[] = [];
	for (let i = descendingSteps - 1; i >= 0; i--) {
		descendingSegments.push({
			type: 'work',
			durationMinutes: roundToNearest5Seconds(descendingStepMinutes * (i + 1)),
			intensity: ZONE_INTENSITY.R
		});
		if (i > 0) {
			descendingSegments.push({
				type: 'recovery',
				durationMinutes: roundToNearest5Seconds(descendingStepMinutes),
				intensity: RECOVERY_INTENSITY
			});
		}
	}
	const descendingQualityTime = sumSegmentMinutes(descendingSegments);
	const descendingWarmupMinutes = computeWarmupMinutes('R', descendingQualityTime);
	const descendingCooldownMinutes = computeCooldownMinutes('R', descendingQualityTime);
	descendingSegments.unshift(warmupSegment(descendingWarmupMinutes));
	descendingSegments.push(cooldownSegment(descendingCooldownMinutes));
	const descending: Workout = {
		label: 'Descending reps',
		description: `Descending repetition lengths at Repetition HR (${bpmRangeStr})`,
		totalVolumeKm: round1(volumeMinutes / pace),
		recovery: `${formatMinutes(descendingStepMinutes)} min recovery between reps`,
		estimatedDurationMinutes: Math.round(sumSegmentMinutes(descendingSegments)),
		segments: descendingSegments
	};
	return [short, medium, long, descending];
}

function buildHrZoneWorkouts(
	zone: ZoneKey,
	hrZone: HrTrainingZone,
	weeklyMileageKm: number,
	pace: number
): Workout[] {
	return buildHrZoneWorkoutsUnrounded(zone, hrZone, weeklyMileageKm, pace).map(roundWorkoutSegments);
}

/**
 * Build HR-based workout prescriptions for all zones from LTHR + weekly mileage.
 * Duration-based (Decision 5) since HR carries no distance. When trainingZones is supplied
 * (the user has also entered a race result elsewhere on the page), each zone's own pace sizes
 * its workout durations and informational pace fields are populated; otherwise a documented
 * fallback pace (VDOT 45, ~5:30/km) is used for all zones and usedFallbackPace is set true so
 * the UI can flag the estimate as such.
 */
export function buildHrWorkoutsResult(
	lthr: number | null,
	weeklyMileageKm: number | null,
	trainingZones?: TrainingZone[]
): HrWorkoutsResult | 'out-of-range' | null {
	if (lthr === null || weeklyMileageKm === null || weeklyMileageKm === undefined) {
		return null;
	}

	if (weeklyMileageKm <= 0) return 'out-of-range';

	const hrZones = calculateDanielsLthrZones(lthr);
	if (hrZones === null) return 'out-of-range';

	const usedFallbackPace = !trainingZones || trainingZones.length === 0;
	const paceByZone = trainingZones
		? new Map(trainingZones.map((z) => [z.zone, midpointPaceMinKm(z)]))
		: null;
	const trainingZoneByZone = trainingZones ? new Map(trainingZones.map((z) => [z.zone, z])) : null;

	const zones: HrWorkoutZone[] = hrZones.map((hrZone) => {
		const pace = paceByZone?.get(hrZone.zone) ?? FALLBACK_EASY_PACE_MIN_KM;
		const trainingZone = trainingZoneByZone?.get(hrZone.zone);

		return {
			zone: hrZone.zone,
			name: ZONE_META[hrZone.zone].name,
			bpmLow: hrZone.bpmLow,
			bpmHigh: hrZone.bpmHigh,
			confidence: hrZone.confidence,
			...(trainingZone
				? { informationalPaceLow: trainingZone.paceMinKmLow, informationalPaceHigh: trainingZone.paceMinKmHigh }
				: {}),
			workouts: buildHrZoneWorkouts(hrZone.zone, hrZone, weeklyMileageKm, pace)
		};
	});

	return { lthr, zones, usedFallbackPace };
}
