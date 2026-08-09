import {
	type ZoneKey,
	computeZoneVolumeKm,
	computeWarmupMinutes,
	computeCooldownMinutes,
	WARMUP_BAND,
	COOLDOWN_BAND,
	formatDurationMinutes,
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
	return { type: 'warmup', durationMinutes: minutes, intensity: WARMUP_INTENSITY };
}

function cooldownSegment(minutes: number): WorkoutSegment {
	return { type: 'cooldown', durationMinutes: minutes, intensity: COOLDOWN_INTENSITY };
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
				durationMinutes: recoveryMinutes,
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
): [Workout, Workout] {
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

	// Build two variants depending on zone type
	if (zone === 'E') {
		// E: two continuous variants (regular and long run)
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

		return [regular, longRun];
	} else if (zone === 'M') {
		// M: continuous and segmented variants
		const continuous = buildPowerContinuousWorkout(zone, powerZone, weeklyMileageKm, powerWatts, device);

		// Build segmented variant (similar to pace mode)
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
				{ type: 'recovery', durationMinutes: recoveryMinutes, intensity: RECOVERY_INTENSITY },
				{ type: 'work', durationMinutes: segmentMinutes, intensity: ZONE_INTENSITY.M },
				cooldownSegment(cooldownMinutes)
			]
		};

		return [continuous, segmented];
	} else if (zone === 'T') {
		// T: continuous and cruise intervals
		const continuous = buildPowerContinuousWorkout(zone, powerZone, weeklyMileageKm, powerWatts, device);

		// Build cruise intervals variant
		const estimatedPace = estimatePaceFromPower(powerWatts, device);
		const volumeMinutes = computePowerZoneVolumeDurationMinutes(zone, weeklyMileageKm, estimatedPace);
		const repMinutes = 5.5;
		const repCount = Math.max(2, Math.round(volumeMinutes / repMinutes));
		const recoveryMinutes = round1(repMinutes / 5);

		const qualityTime = repCount * repMinutes + (repCount - 1) * recoveryMinutes;
		const warmupMinutes = computeWarmupMinutes(zone, qualityTime);
		const cooldownMinutes = computeCooldownMinutes(zone, qualityTime);
		const totalMinutes = qualityTime + warmupMinutes + cooldownMinutes;

		const powerRangeStr =
			powerZone.wattsLow && powerZone.wattsHigh
				? `${powerZone.wattsLow}–${powerZone.wattsHigh} W`
				: `${powerZone.wattsHigh || powerZone.wattsLow} W`;

		const segments: WorkoutSegment[] = [warmupSegment(warmupMinutes)];
		for (let i = 0; i < repCount; i++) {
			segments.push({
				type: 'work',
				durationMinutes: repMinutes,
				intensity: ZONE_INTENSITY.T
			});
			if (i < repCount - 1) {
				segments.push({
					type: 'recovery',
					durationMinutes: recoveryMinutes,
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		segments.push(cooldownSegment(cooldownMinutes));

		const cruise: Workout = {
			label: 'Cruise intervals',
			description: `${repCount} × ${formatMinutes(repMinutes)} min at Threshold Power (${powerRangeStr}), ${formatDurationMinutes(recoveryMinutes)} jog recovery`,
			totalVolumeKm: round1(volumeMinutes / estimatedPace),
			recovery: `${formatDurationMinutes(recoveryMinutes)} jog between reps`,
			estimatedDurationMinutes: Math.round(totalMinutes),
			segments
		};

		return [continuous, cruise];
	} else if (zone === 'I' || zone === 'R') {
		// I/R: two reps-based variants at different rep distances
		const variant1 = buildPowerRepsWorkout(zone, powerZone, weeklyMileageKm, powerWatts, device);

		// For second variant, use a slightly different recovery or adjust rep count
		// Since we're in duration-based format, we'll build a second variant by adjusting the recovery perception
		// For now, create a second workout with varied intensity perception
		const variant2 = buildPowerRepsWorkout(zone, powerZone, weeklyMileageKm, powerWatts, device);

		// Differentiate slightly for UX (longer reps, fewer count)
		const estimatedPace = estimatePaceFromPower(powerWatts, device);
		const volumeMinutes = computePowerZoneVolumeDurationMinutes(zone, weeklyMileageKm, estimatedPace);
		const repCount2 = Math.max(2, Math.round(volumeMinutes / 6)); // Longer reps
		let recoveryFraction = 0.75;
		if (zone === 'R') {
			recoveryFraction = 1.0;
		}
		const repDurationMinutes2 = volumeMinutes / repCount2;
		const recoveryMinutes2 = round1(repDurationMinutes2 * recoveryFraction);

		const qualityTime2 = repCount2 * repDurationMinutes2 + (repCount2 - 1) * recoveryMinutes2;
		const warmupMinutes2 = computeWarmupMinutes(zone, qualityTime2);
		const cooldownMinutes2 = computeCooldownMinutes(zone, qualityTime2);
		const totalMinutes2 = qualityTime2 + warmupMinutes2 + cooldownMinutes2;

		const zoneName = ZONE_META[zone].name;
		const powerRangeStr =
			powerZone.wattsLow && powerZone.wattsHigh
				? `${powerZone.wattsLow}–${powerZone.wattsHigh} W`
				: `${powerZone.wattsHigh || powerZone.wattsLow} W`;

		const segments2: WorkoutSegment[] = [warmupSegment(warmupMinutes2)];
		for (let i = 0; i < repCount2; i++) {
			segments2.push({
				type: 'work',
				durationMinutes: repDurationMinutes2,
				intensity: ZONE_INTENSITY[zone]
			});
			if (i < repCount2 - 1) {
				segments2.push({
					type: 'recovery',
					durationMinutes: recoveryMinutes2,
					intensity: RECOVERY_INTENSITY
				});
			}
		}
		segments2.push(cooldownSegment(cooldownMinutes2));

		const variant2Alt: Workout = {
			label: `${zone} reps (longer)`,
			description: `${repCount2} × ${formatMinutes(repDurationMinutes2)} min at ${zoneName} Power (${powerRangeStr}), ${formatDurationMinutes(recoveryMinutes2)} recovery`,
			totalVolumeKm: round1(qualityTime2 / estimatedPace),
			recovery: `${formatDurationMinutes(recoveryMinutes2)} recovery`,
			estimatedDurationMinutes: Math.round(totalMinutes2),
			segments: segments2
		};

		return [variant1, variant2Alt];
	}

	// Fallback (shouldn't reach here)
	const generic = buildPowerContinuousWorkout(zone, powerZone, weeklyMileageKm, powerWatts, device);
	return [generic, generic];
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
