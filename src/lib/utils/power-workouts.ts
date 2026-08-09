import {
	type ZoneKey,
	computeZoneVolumeKm,
	computeWarmupMinutes,
	computeCooldownMinutes,
	WARMUP_BAND,
	COOLDOWN_BAND,
	formatDurationMinutes,
	roundToNearest5Seconds,
	type Workout,
	type WorkoutSegment
} from './workouts';
import { calculatePowerZones, type PowerMeterDevice, type PowerZone } from './power-zones';
import { ZONE_META } from './training-paces';

export type PowerWorkoutZone = {
	zone: ZoneKey;
	deviceZoneNumber: number;
	name: string;
	wattsLow: number | null;
	wattsHigh: number | null;
	workouts: Workout[];
};

export type PowerWorkoutsResult = {
	power: number;
	device: PowerMeterDevice;
	zones: PowerWorkoutZone[];
};

// Empirical pace estimates from power, based on Stryd/Garmin runner data
// Maps power (watts) to min/km pace; serves as a proxy for volume scaling
// These are approximations to allow reusing pace-based volume calculations
// Lower power = slower pace = longer duration for same distance
const POWER_PACE_ESTIMATE: Record<PowerMeterDevice, [number, number][]> = {
	stryd: [
		[50, 6.5],
		[100, 5.5],
		[150, 5.0],
		[200, 4.5],
		[250, 4.15],
		[300, 3.85],
		[350, 3.6],
		[400, 3.4],
		[450, 3.2],
		[500, 3.0],
		[550, 2.85],
		[600, 2.7],
		[700, 2.5]
	],
	garmin: [
		[50, 6.5],
		[100, 5.5],
		[150, 5.0],
		[200, 4.5],
		[250, 4.15],
		[300, 3.85],
		[350, 3.6],
		[400, 3.4],
		[450, 3.2],
		[500, 3.0],
		[550, 2.85],
		[600, 2.7],
		[700, 2.5]
	],
	coros: [
		[50, 6.5],
		[100, 5.5],
		[150, 5.0],
		[200, 4.5],
		[250, 4.15],
		[300, 3.85],
		[350, 3.6],
		[400, 3.4],
		[450, 3.2],
		[500, 3.0],
		[550, 2.85],
		[600, 2.7],
		[700, 2.5]
	],
	polar: [
		[50, 6.5],
		[100, 5.5],
		[150, 5.0],
		[200, 4.5],
		[210, 4.15],
		[250, 3.85],
		[300, 3.6],
		[350, 3.4],
		[400, 3.2],
		[450, 3.0],
		[500, 2.85],
		[550, 2.7],
		[600, 2.5]
	]
};

/** Map device zone number to Daniels' E/M/T/I/R training zone */
const DEVICE_ZONE_TO_TRAINING_ZONE: Record<PowerMeterDevice, Record<number, ZoneKey>> = {
	stryd: { 1: 'E', 2: 'M', 3: 'T', 4: 'I', 5: 'R' },
	garmin: { 1: 'E', 2: 'M', 3: 'T', 4: 'I', 5: 'R' },
	coros: { 1: 'E', 2: 'E', 3: 'M', 4: 'T', 5: 'I', 6: 'I', 7: 'R' },
	polar: { 1: 'E', 2: 'M', 3: 'T', 4: 'I', 5: 'R' }
};

/** Estimate pace (min/km) from power value, using linear interpolation */
export function estimatePaceFromPower(powerWatts: number, device: PowerMeterDevice): number {
	const table = POWER_PACE_ESTIMATE[device];

	// Find the two surrounding points
	for (let i = 0; i < table.length - 1; i++) {
		if (powerWatts >= table[i][0] && powerWatts <= table[i + 1][0]) {
			const [p1, pace1] = table[i];
			const [p2, pace2] = table[i + 1];
			// Linear interpolation
			const t = (powerWatts - p1) / (p2 - p1);
			return pace1 + t * (pace2 - pace1);
		}
	}

	// Extrapolate if needed
	if (powerWatts < table[0][0]) {
		return table[0][1];
	}
	return table[table.length - 1][1];
}

/** Convert device zone number to Daniels training zone */
export function mapPowerZoneToTrainingZone(
	deviceZoneNumber: number,
	device: PowerMeterDevice
): ZoneKey {
	return DEVICE_ZONE_TO_TRAINING_ZONE[device][deviceZoneNumber];
}

/**
 * Compute power-mode quality duration (minutes) for a zone, using the same Daniels
 * percentage logic as pace mode but expressed in time rather than distance.
 */
export function computePowerZoneVolumeDurationMinutes(
	zone: ZoneKey,
	weeklyMileageKm: number,
	estimatedPace: number
): number {
	// Reuse pace-mode volume calculation, then convert to minutes
	const volumeKm = computeZoneVolumeKm(zone, weeklyMileageKm, estimatedPace);
	return volumeKm * estimatedPace;
}

/** Segment helpers (copied from workouts.ts for consistency) */
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

/**
 * Compute a single rep duration (minutes) for reps-based workouts (I/R zones).
 * For power mode, reps are expressed as duration, not distance.
 * Rep duration is derived from power intensity: higher power = shorter sustainable duration.
 */
export function computePowerRepDurationMinutes(
	zone: 'I' | 'R',
	powerWatts: number,
	_weeklyMileageKm: number // Included for API consistency, not used
): number {
	// Rep duration inversely scaled by power: higher power → shorter rep duration
	// Normalize power to 0-1 range (50-700W), then map to duration
	const powerFraction = (powerWatts - 50) / (700 - 50);

	if (zone === 'I') {
		// Interval: 3-8 min (harder effort, shorter reps)
		// Higher power → shorter rep, lower power → longer rep
		const minDuration = 3;
		const maxDuration = 8;
		return maxDuration - powerFraction * (maxDuration - minDuration);
	} else {
		// Repetition: 0.5-2 min (hardest effort, shortest reps)
		const minDuration = 0.5;
		const maxDuration = 2;
		return maxDuration - powerFraction * (maxDuration - minDuration);
	}
}

/**
 * Build a continuous power-mode workout for E/M/T zones.
 */
export function buildPowerContinuousWorkout(
	zone: ZoneKey,
	powerZone: PowerZone,
	weeklyMileageKm: number,
	powerWatts: number,
	device: PowerMeterDevice
): Workout {
	const estimatedPace = estimatePaceFromPower(powerWatts, device);
	const qualityMinutes = computePowerZoneVolumeDurationMinutes(zone, weeklyMileageKm, estimatedPace);
	const warmupMinutes = computeWarmupMinutes(zone, qualityMinutes);
	const cooldownMinutes = computeCooldownMinutes(zone, qualityMinutes);
	const totalMinutes = qualityMinutes + warmupMinutes + cooldownMinutes;

	const zoneName = ZONE_META[zone].name;
	const powerRangeStr =
		powerZone.wattsLow && powerZone.wattsHigh
			? `${powerZone.wattsLow}–${powerZone.wattsHigh} W`
			: `${powerZone.wattsHigh || powerZone.wattsLow} W`;

	return {
		label: `Continuous ${zoneName} run`,
		description: `${formatMinutes(qualityMinutes)} continuous ${zoneName} run at ${zoneName} Power (${powerRangeStr})`,
		totalVolumeKm: round1(qualityMinutes / estimatedPace), // Convert back to km for display
		recovery: 'None (continuous)',
		estimatedDurationMinutes: Math.round(totalMinutes),
		segments: [
			warmupSegment(warmupMinutes),
			{ type: 'work', durationMinutes: qualityMinutes, intensity: ZONE_INTENSITY[zone] },
			cooldownSegment(cooldownMinutes)
		]
	};
}

/**
 * Build a reps-based power-mode workout for I/R zones, using duration-based format.
 */
export function buildPowerRepsWorkout(
	zone: 'I' | 'R',
	powerZone: PowerZone,
	weeklyMileageKm: number,
	powerWatts: number,
	device: PowerMeterDevice
): Workout {
	const estimatedPace = estimatePaceFromPower(powerWatts, device);
	const volumeMinutes = computePowerZoneVolumeDurationMinutes(zone, weeklyMileageKm, estimatedPace);
	const repDurationMinutes = computePowerRepDurationMinutes(zone, powerWatts, weeklyMileageKm);

	// Determine rep count and recovery
	const repCount = Math.max(3, Math.round(volumeMinutes / repDurationMinutes));
	let recoveryFraction = 0.75; // I zone
	if (zone === 'R') {
		recoveryFraction = 1.0; // R zone: equal duration recovery
	}
	const recoveryMinutes = round1(repDurationMinutes * recoveryFraction);

	const qualityTime = repCount * repDurationMinutes + (repCount - 1) * recoveryMinutes;
	const warmupMinutes = computeWarmupMinutes(zone, qualityTime);
	const cooldownMinutes = computeCooldownMinutes(zone, qualityTime);
	const totalMinutes = qualityTime + warmupMinutes + cooldownMinutes;

	const zoneName = ZONE_META[zone].name;
	const powerRangeStr =
		powerZone.wattsLow && powerZone.wattsHigh
			? `${powerZone.wattsLow}–${powerZone.wattsHigh} W`
			: `${powerZone.wattsHigh || powerZone.wattsLow} W`;

	const recoveryStr = formatDurationMinutes(recoveryMinutes);

	// Build segments
	const segments: WorkoutSegment[] = [warmupSegment(warmupMinutes)];
	for (let i = 0; i < repCount; i++) {
		segments.push({
			type: 'work',
			durationMinutes: repDurationMinutes,
			intensity: ZONE_INTENSITY[zone]
		});
		if (i < repCount - 1) {
			segments.push({
				type: 'recovery',
				durationMinutes: roundToNearest5Seconds(recoveryMinutes),
				intensity: RECOVERY_INTENSITY
			});
		}
	}
	segments.push(cooldownSegment(cooldownMinutes));

	return {
		label: `${zone} reps`,
		description: `${repCount} × ${formatMinutes(repDurationMinutes)} min at ${zoneName} Power (${powerRangeStr}), ${recoveryStr} recovery`,
		totalVolumeKm: round1(qualityTime / estimatedPace),
		recovery: `${recoveryStr} ${zone === 'I' ? 'jog' : 'jog'} recovery`,
		estimatedDurationMinutes: Math.round(totalMinutes),
		segments
	};
}

/**
 * Build two workout variants for a single training zone.
 */
export function buildPowerZoneWorkouts(
	zone: ZoneKey,
	powerZones: PowerZone[],
	weeklyMileageKm: number,
	powerWatts: number,
	device: PowerMeterDevice
): Workout[] {
	// Find the power zone(s) that map to this training zone
	// For most devices, each training zone maps to exactly one device zone
	// For COROS with 7 zones, some training zones may have multiple device zones
	const deviceZonesForZone = powerZones.filter(
		(pz) => mapPowerZoneToTrainingZone(pz.zone, device) === zone
	);

	if (deviceZonesForZone.length === 0) {
		// Shouldn't happen with valid data, but handle gracefully
		throw new Error(`No device zone found for training zone ${zone}`);
	}

	// For simplicity, use the first (or only) device zone
	const powerZone = deviceZonesForZone[0];

	// Build variants depending on zone type
	if (zone === 'E') {
		// E: continuous, long run, easy fartlek (3 variants)
		const estimatedPace = estimatePaceFromPower(powerWatts, device);
		const regularMinutes = computePowerZoneVolumeDurationMinutes('E', weeklyMileageKm, estimatedPace);
		const longRunMinutes = computePowerZoneVolumeDurationMinutes('E', weeklyMileageKm, estimatedPace) * 1.3;

		const regular = buildPowerContinuousWorkout('E', powerZone, weeklyMileageKm, powerWatts, device);

		// Build long run variant
		const warmupMinutes = computeWarmupMinutes('E', longRunMinutes);
		const cooldownMinutes = computeCooldownMinutes('E', longRunMinutes);
		const totalMinutes = longRunMinutes + warmupMinutes + cooldownMinutes;

		const powerRangeStr =
			powerZone.wattsLow && powerZone.wattsHigh
				? `${powerZone.wattsLow}–${powerZone.wattsHigh} W`
				: `${powerZone.wattsHigh || powerZone.wattsLow} W`;

		const longRun: Workout = {
			label: 'Long run',
			description: `${formatMinutes(longRunMinutes)} continuous long run at Easy Power (${powerRangeStr})`,
			totalVolumeKm: round1(longRunMinutes / estimatePaceFromPower(powerWatts, device)),
			recovery: 'None (continuous)',
			estimatedDurationMinutes: Math.round(totalMinutes),
			segments: [
				warmupSegment(warmupMinutes),
				{ type: 'work', durationMinutes: longRunMinutes, intensity: ZONE_INTENSITY.E },
				cooldownSegment(cooldownMinutes)
			]
		};

		// Build easy fartlek variant
		const fartlekMinutes = regularMinutes * 0.8;
		const fartlekPickupMinutes = 2;
		const fartlekRecoveryMinutes = 1.5;
		const fartlekPickupCount = Math.floor(fartlekMinutes / (fartlekPickupMinutes + fartlekRecoveryMinutes));
		const fartlekWarmupMinutes = computeWarmupMinutes('E', fartlekMinutes);
		const fartlekCooldownMinutes = computeCooldownMinutes('E', fartlekMinutes);
		const fartlekTotalMinutes = fartlekMinutes + fartlekWarmupMinutes + fartlekCooldownMinutes;

		const fartlekSegments: WorkoutSegment[] = [warmupSegment(fartlekWarmupMinutes)];
		for (let i = 0; i < fartlekPickupCount; i++) {
			fartlekSegments.push({
				type: 'work',
				durationMinutes: fartlekPickupMinutes,
				intensity: 0.75
			});
			if (i < fartlekPickupCount - 1) {
				fartlekSegments.push({
					type: 'recovery',
					durationMinutes: fartlekRecoveryMinutes,
					intensity: ZONE_INTENSITY.E
				});
			}
		}
		fartlekSegments.push(cooldownSegment(fartlekCooldownMinutes));

		const fartlek: Workout = {
			label: 'Easy fartlek',
			description: `${fartlekPickupCount} × ${formatMinutes(fartlekPickupMinutes)} min pickups with ${formatMinutes(fartlekRecoveryMinutes)} min easy jog recovery`,
			totalVolumeKm: round1(fartlekMinutes / estimatedPace),
			recovery: `${formatMinutes(fartlekRecoveryMinutes)} min easy jog between pickups`,
			estimatedDurationMinutes: Math.round(fartlekTotalMinutes),
			segments: fartlekSegments
		};

		return [regular, longRun, fartlek];
	} else if (zone === 'M') {
		// M: continuous, segments, progression (3 variants)
		const continuous = buildPowerContinuousWorkout(zone, powerZone, weeklyMileageKm, powerWatts, device);

		// Build segmented variant
		const estimatedPace = estimatePaceFromPower(powerWatts, device);
		const volumeMinutes = computePowerZoneVolumeDurationMinutes(zone, weeklyMileageKm, estimatedPace);
		const segmentMinutes = volumeMinutes / 2;
		const recoveryMinutes = 1.5 * estimatedPace; // ~1.5km jog

		const qualityTime = volumeMinutes + recoveryMinutes;
		const warmupMinutes = computeWarmupMinutes(zone, qualityTime);
		const cooldownMinutes = computeCooldownMinutes(zone, qualityTime);
		const totalMinutes = qualityTime + warmupMinutes + cooldownMinutes;

		const powerRangeStr =
			powerZone.wattsLow && powerZone.wattsHigh
				? `${powerZone.wattsLow}–${powerZone.wattsHigh} W`
				: `${powerZone.wattsHigh || powerZone.wattsLow} W`;

		const segmented: Workout = {
			label: 'Segments',
			description: `2 × ${formatMinutes(segmentMinutes)} min at Moderate Power (${powerRangeStr}), ${formatDurationMinutes(recoveryMinutes)} easy jog recovery`,
			totalVolumeKm: round1(volumeMinutes / estimatedPace),
			recovery: `${formatDurationMinutes(recoveryMinutes)} easy jog between segments`,
			estimatedDurationMinutes: Math.round(totalMinutes),
			segments: [
				warmupSegment(warmupMinutes),
				{ type: 'work', durationMinutes: segmentMinutes, intensity: ZONE_INTENSITY.M },
				{ type: 'recovery', durationMinutes: roundToNearest5Seconds(recoveryMinutes), intensity: RECOVERY_INTENSITY },
				{ type: 'work', durationMinutes: segmentMinutes, intensity: ZONE_INTENSITY.M },
				cooldownSegment(cooldownMinutes)
			]
		};

		// Build progression variant (start easy, finish at M intensity)
		const progWarmupMinutes = computeWarmupMinutes(zone, volumeMinutes);
		const progCooldownMinutes = computeCooldownMinutes(zone, volumeMinutes);
		const progTotalMinutes = volumeMinutes + progWarmupMinutes + progCooldownMinutes;
		const progSegmentCount = 3;
		const progSegmentMinutes = volumeMinutes / progSegmentCount;

		const progSegments: WorkoutSegment[] = [warmupSegment(progWarmupMinutes)];
		for (let i = 0; i < progSegmentCount; i++) {
			const intensity = RECOVERY_INTENSITY + (i / (progSegmentCount - 1)) * (ZONE_INTENSITY.M - RECOVERY_INTENSITY);
			progSegments.push({
				type: 'work',
				durationMinutes: progSegmentMinutes,
				intensity
			});
		}
		progSegments.push(cooldownSegment(progCooldownMinutes));

		const progression: Workout = {
			label: 'Progression',
			description: `${progSegmentCount} progressive segments building to Moderate Power (${powerRangeStr})`,
			totalVolumeKm: round1(volumeMinutes / estimatedPace),
			recovery: 'None (continuous progression)',
			estimatedDurationMinutes: Math.round(progTotalMinutes),
			segments: progSegments
		};

		return [continuous, segmented, progression];
	} else if (zone === 'T') {
		// T: continuous, cruise intervals, tempo ladder (3 variants)
		const continuous = buildPowerContinuousWorkout(zone, powerZone, weeklyMileageKm, powerWatts, device);
		const estimatedPace = estimatePaceFromPower(powerWatts, device);
		const volumeMinutes = computePowerZoneVolumeDurationMinutes(zone, weeklyMileageKm, estimatedPace);

		// Build cruise intervals variant
		const cruiseRepMinutes = 5.5;
		const cruiseRepCount = Math.max(2, Math.round(volumeMinutes / cruiseRepMinutes));
		const cruiseRecoveryMinutes = round1(cruiseRepMinutes / 5);

		const cruiseQualityTime = cruiseRepCount * cruiseRepMinutes + (cruiseRepCount - 1) * cruiseRecoveryMinutes;
		const cruiseWarmupMinutes = computeWarmupMinutes(zone, cruiseQualityTime);
		const cruiseCooldownMinutes = computeCooldownMinutes(zone, cruiseQualityTime);
		const cruiseTotalMinutes = cruiseQualityTime + cruiseWarmupMinutes + cruiseCooldownMinutes;

		const powerRangeStr =
			powerZone.wattsLow && powerZone.wattsHigh
				? `${powerZone.wattsLow}–${powerZone.wattsHigh} W`
				: `${powerZone.wattsHigh || powerZone.wattsLow} W`;

		const cruiseSegments: WorkoutSegment[] = [warmupSegment(cruiseWarmupMinutes)];
		for (let i = 0; i < cruiseRepCount; i++) {
			cruiseSegments.push({
				type: 'work',
				durationMinutes: cruiseRepMinutes,
				intensity: ZONE_INTENSITY.T
			});
			if (i < cruiseRepCount - 1) {
				cruiseSegments.push({
					type: 'recovery',
					durationMinutes: cruiseRecoveryMinutes,
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		cruiseSegments.push(cooldownSegment(cruiseCooldownMinutes));

		const cruise: Workout = {
			label: 'Cruise intervals',
			description: `${cruiseRepCount} × ${formatMinutes(cruiseRepMinutes)} min at Threshold Power (${powerRangeStr}), ${formatDurationMinutes(cruiseRecoveryMinutes)} jog recovery`,
			totalVolumeKm: round1(volumeMinutes / estimatedPace),
			recovery: `${formatDurationMinutes(cruiseRecoveryMinutes)} jog between reps`,
			estimatedDurationMinutes: Math.round(cruiseTotalMinutes),
			segments: cruiseSegments
		};

		// Build tempo ladder variant (increasing then decreasing rep lengths)
		const ladderQualityTime = volumeMinutes;
		const ladderWarmupMinutes = computeWarmupMinutes(zone, ladderQualityTime);
		const ladderCooldownMinutes = computeCooldownMinutes(zone, ladderQualityTime);
		const ladderTotalMinutes = ladderQualityTime + ladderWarmupMinutes + ladderCooldownMinutes;

		const ladderSegments: WorkoutSegment[] = [warmupSegment(ladderWarmupMinutes)];
		const ladderSteps = 5;
		const stepMinutes = ladderQualityTime / (ladderSteps * 2 - 1);
		for (let i = 0; i < ladderSteps; i++) {
			ladderSegments.push({
				type: 'work',
				durationMinutes: stepMinutes * (i + 1),
				intensity: ZONE_INTENSITY.T
			});
			if (i < ladderSteps - 1) {
				ladderSegments.push({
					type: 'recovery',
					durationMinutes: stepMinutes,
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		for (let i = ladderSteps - 2; i >= 0; i--) {
			ladderSegments.push({
				type: 'work',
				durationMinutes: stepMinutes * (i + 1),
				intensity: ZONE_INTENSITY.T
			});
			if (i > 0) {
				ladderSegments.push({
					type: 'recovery',
					durationMinutes: stepMinutes,
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		ladderSegments.push(cooldownSegment(ladderCooldownMinutes));

		const ladder: Workout = {
			label: 'Tempo ladder',
			description: `Ascending and descending tempo ladder at Threshold Power (${powerRangeStr})`,
			totalVolumeKm: round1(ladderQualityTime / estimatedPace),
			recovery: `${formatMinutes(stepMinutes)} jog between steps`,
			estimatedDurationMinutes: Math.round(ladderTotalMinutes),
			segments: ladderSegments
		};

		return [continuous, cruise, ladder];
	} else if (zone === 'I' || zone === 'R') {
		// I: 4 variants (short, medium, long, pyramid); R: 3 variants (short, ladder, descending)
		const estimatedPace = estimatePaceFromPower(powerWatts, device);
		const volumeMinutes = computePowerZoneVolumeDurationMinutes(zone, weeklyMileageKm, estimatedPace);
		const zoneName = ZONE_META[zone].name;
		const powerRangeStr =
			powerZone.wattsLow && powerZone.wattsHigh
				? `${powerZone.wattsLow}–${powerZone.wattsHigh} W`
				: `${powerZone.wattsHigh || powerZone.wattsLow} W`;

		let recoveryFraction = 0.75;
		if (zone === 'R') {
			recoveryFraction = 1.0;
		}

		const variants: Workout[] = [];

		// Short intervals variant
		const shortRepMinutes = 2;
		const shortRepCount = Math.max(4, Math.round(volumeMinutes / shortRepMinutes));
		const shortRecoveryMinutes = round1(shortRepMinutes * recoveryFraction);
		const shortQualityTime = shortRepCount * shortRepMinutes + (shortRepCount - 1) * shortRecoveryMinutes;
		const shortWarmupMinutes = computeWarmupMinutes(zone, shortQualityTime);
		const shortCooldownMinutes = computeCooldownMinutes(zone, shortQualityTime);
		const shortTotalMinutes = shortQualityTime + shortWarmupMinutes + shortCooldownMinutes;

		const shortSegments: WorkoutSegment[] = [warmupSegment(shortWarmupMinutes)];
		for (let i = 0; i < shortRepCount; i++) {
			shortSegments.push({
				type: 'work',
				durationMinutes: roundToNearest5Seconds(shortRepMinutes),
				intensity: ZONE_INTENSITY[zone]
			});
			if (i < shortRepCount - 1) {
				shortSegments.push({
					type: 'recovery',
					durationMinutes: shortRecoveryMinutes,
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		shortSegments.push(cooldownSegment(shortCooldownMinutes));

		variants.push({
			label: 'Short intervals',
			description: `${shortRepCount} × ${formatMinutes(shortRepMinutes)} min at ${zoneName} Power (${powerRangeStr}), ${formatDurationMinutes(shortRecoveryMinutes)} recovery`,
			totalVolumeKm: round1(shortQualityTime / estimatedPace),
			recovery: `${formatDurationMinutes(shortRecoveryMinutes)} recovery between reps`,
			estimatedDurationMinutes: Math.round(shortTotalMinutes),
			segments: shortSegments
		});

		// Medium intervals variant
		const mediumRepMinutes = 4;
		const mediumRepCount = Math.max(3, Math.round(volumeMinutes / mediumRepMinutes));
		const mediumRecoveryMinutes = round1(mediumRepMinutes * recoveryFraction);
		const mediumQualityTime = mediumRepCount * mediumRepMinutes + (mediumRepCount - 1) * mediumRecoveryMinutes;
		const mediumWarmupMinutes = computeWarmupMinutes(zone, mediumQualityTime);
		const mediumCooldownMinutes = computeCooldownMinutes(zone, mediumQualityTime);
		const mediumTotalMinutes = mediumQualityTime + mediumWarmupMinutes + mediumCooldownMinutes;

		const mediumSegments: WorkoutSegment[] = [warmupSegment(mediumWarmupMinutes)];
		for (let i = 0; i < mediumRepCount; i++) {
			mediumSegments.push({
				type: 'work',
				durationMinutes: roundToNearest5Seconds(mediumRepMinutes),
				intensity: ZONE_INTENSITY[zone]
			});
			if (i < mediumRepCount - 1) {
				mediumSegments.push({
					type: 'recovery',
					durationMinutes: mediumRecoveryMinutes,
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		mediumSegments.push(cooldownSegment(mediumCooldownMinutes));

		variants.push({
			label: 'Medium intervals',
			description: `${mediumRepCount} × ${formatMinutes(mediumRepMinutes)} min at ${zoneName} Power (${powerRangeStr}), ${formatDurationMinutes(mediumRecoveryMinutes)} recovery`,
			totalVolumeKm: round1(mediumQualityTime / estimatedPace),
			recovery: `${formatDurationMinutes(mediumRecoveryMinutes)} recovery between reps`,
			estimatedDurationMinutes: Math.round(mediumTotalMinutes),
			segments: mediumSegments
		});

		// Long intervals variant
		const longRepMinutes = 6;
		const longRepCount = Math.max(2, Math.round(volumeMinutes / longRepMinutes));
		const longRecoveryMinutes = round1(longRepMinutes * recoveryFraction);
		const longQualityTime = longRepCount * longRepMinutes + (longRepCount - 1) * longRecoveryMinutes;
		const longWarmupMinutes = computeWarmupMinutes(zone, longQualityTime);
		const longCooldownMinutes = computeCooldownMinutes(zone, longQualityTime);
		const longTotalMinutes = longQualityTime + longWarmupMinutes + longCooldownMinutes;

		const longSegments: WorkoutSegment[] = [warmupSegment(longWarmupMinutes)];
		for (let i = 0; i < longRepCount; i++) {
			longSegments.push({
				type: 'work',
				durationMinutes: roundToNearest5Seconds(longRepMinutes),
				intensity: ZONE_INTENSITY[zone]
			});
			if (i < longRepCount - 1) {
				longSegments.push({
					type: 'recovery',
					durationMinutes: longRecoveryMinutes,
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		longSegments.push(cooldownSegment(longCooldownMinutes));

		variants.push({
			label: 'Long intervals',
			description: `${longRepCount} × ${formatMinutes(longRepMinutes)} min at ${zoneName} Power (${powerRangeStr}), ${formatDurationMinutes(longRecoveryMinutes)} recovery`,
			totalVolumeKm: round1(longQualityTime / estimatedPace),
			recovery: `${formatDurationMinutes(longRecoveryMinutes)} recovery between reps`,
			estimatedDurationMinutes: Math.round(longTotalMinutes),
			segments: longSegments
		});

		if (zone === 'I') {
			// Pyramid variant for I zone
			const pyramidQualityTime = volumeMinutes;
			const pyramidWarmupMinutes = computeWarmupMinutes(zone, pyramidQualityTime);
			const pyramidCooldownMinutes = computeCooldownMinutes(zone, pyramidQualityTime);
			const pyramidTotalMinutes = pyramidQualityTime + pyramidWarmupMinutes + pyramidCooldownMinutes;

			const pyramidSegments: WorkoutSegment[] = [warmupSegment(pyramidWarmupMinutes)];
			const pyramidSteps = 4;
			const stepMinutes = pyramidQualityTime / (pyramidSteps * 2 - 1);
			// Ascending pyramid
			for (let i = 0; i < pyramidSteps; i++) {
				pyramidSegments.push({
					type: 'work',
					durationMinutes: stepMinutes * (i + 1),
					intensity: ZONE_INTENSITY.I
				});
				// Add recovery after every segment, including the peak
				pyramidSegments.push({
					type: 'recovery',
					durationMinutes: stepMinutes,
					intensity: RECOVERY_INTENSITY
				});
			}
			// Descending pyramid (skip the peak)
			for (let i = pyramidSteps - 2; i >= 0; i--) {
				pyramidSegments.push({
					type: 'work',
					durationMinutes: stepMinutes * (i + 1),
					intensity: ZONE_INTENSITY.I
				});
				if (i > 0) {
					pyramidSegments.push({
						type: 'recovery',
						durationMinutes: stepMinutes,
						intensity: RECOVERY_INTENSITY
					});
				}
			}
			pyramidSegments.push(cooldownSegment(pyramidCooldownMinutes));

			variants.push({
				label: 'Pyramid',
				description: `Ascending and descending intensity pyramid at ${zoneName} Power (${powerRangeStr})`,
				totalVolumeKm: round1(pyramidQualityTime / estimatedPace),
				recovery: `${formatMinutes(stepMinutes)} recovery between steps`,
				estimatedDurationMinutes: Math.round(pyramidTotalMinutes),
				segments: pyramidSegments
			});
		} else if (zone === 'R') {
			// Descending reps variant for R zone
			const descendingQualityTime = volumeMinutes;
			const descendingWarmupMinutes = computeWarmupMinutes(zone, descendingQualityTime);
			const descendingCooldownMinutes = computeCooldownMinutes(zone, descendingQualityTime);
			const descendingTotalMinutes = descendingQualityTime + descendingWarmupMinutes + descendingCooldownMinutes;

			const descendingSegments: WorkoutSegment[] = [warmupSegment(descendingWarmupMinutes)];
			const descendingSteps = 5;
			const descendingStepMinutes = descendingQualityTime / (descendingSteps * 2 - 1);
			for (let i = descendingSteps - 1; i >= 0; i--) {
				descendingSegments.push({
					type: 'work',
					durationMinutes: descendingStepMinutes * (i + 1),
					intensity: ZONE_INTENSITY.R
				});
				if (i > 0) {
					descendingSegments.push({
						type: 'recovery',
						durationMinutes: descendingStepMinutes,
						intensity: RECOVERY_INTENSITY
					});
				}
			}
			descendingSegments.push(cooldownSegment(descendingCooldownMinutes));

			variants.push({
				label: 'Descending reps',
				description: `Descending repetition lengths at Recovery Power (${powerRangeStr})`,
				totalVolumeKm: round1(descendingQualityTime / estimatedPace),
				recovery: `${formatMinutes(descendingStepMinutes)} recovery between reps`,
				estimatedDurationMinutes: Math.round(descendingTotalMinutes),
				segments: descendingSegments
			});
		}

		return variants;
	}

	// Fallback (shouldn't reach here)
	const generic = buildPowerContinuousWorkout(zone, powerZone, weeklyMileageKm, powerWatts, device);
	return [generic];
}

/**
 * Top-level result builder: takes power input, device, and mileage, returns complete workouts for all zones.
 */
export function buildPowerWorkoutsResult(
	power: number | null,
	device: PowerMeterDevice,
	mileage: number | null
): PowerWorkoutsResult | 'out-of-range' | null {
	// Handle missing inputs
	if (power === null || mileage === null || mileage === undefined) {
		return null;
	}

	// Validate power and mileage
	if (power < 50 || power > 700 || mileage <= 0) {
		return 'out-of-range';
	}

	// Calculate power zones for this device
	const powerZones = calculatePowerZones(power, device);
	if (!powerZones) {
		return 'out-of-range';
	}

	// Build workouts for each training zone
	const zones: PowerWorkoutZone[] = [];
	const zoneOrder: ZoneKey[] = ['E', 'M', 'T', 'I', 'R'];

	for (const trainingZone of zoneOrder) {
		// Find device zones that map to this training zone
		const deviceZonesForTraining = powerZones.filter(
			(pz) => mapPowerZoneToTrainingZone(pz.zone, device) === trainingZone
		);

		if (deviceZonesForTraining.length > 0) {
			const primaryDeviceZone = deviceZonesForTraining[0];
			const workouts = buildPowerZoneWorkouts(
				trainingZone,
				powerZones,
				mileage,
				power,
				device
			);

			zones.push({
				zone: trainingZone,
				deviceZoneNumber: primaryDeviceZone.zone,
				name: primaryDeviceZone.name,
				wattsLow: primaryDeviceZone.wattsLow,
				wattsHigh: primaryDeviceZone.wattsHigh,
				workouts
			});
		}
	}

	return {
		power,
		device,
		zones
	};
}
