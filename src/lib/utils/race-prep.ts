import { buildTrainingPaceResult, type TrainingZone, type ZoneKey } from './training-paces';
import { buildZoneWorkouts, type Workout } from './workouts';
import { buildRacePaceTempoWorkout, buildRacePaceRepsWorkout } from './workout-patterns';
import {
	calculatePowerZones,
	type PowerMeterDevice,
	type PowerZone
} from './power-zones';
import { buildPowerZoneWorkouts, mapPowerZoneToTrainingZone, formatPowerRangeStr } from './power-workouts';
import { calculateDanielsLthrZones, formatBpmRange } from './hr-zones';
import { buildHrZoneWorkouts } from './hr-workouts';

export type RacePrepPhase = 'Build Aerobic Base' | 'Strength' | 'Peak VO2 Max' | 'Taper';
export type RacePrepModality = 'pace' | 'power' | 'hr';

export type RacePrepModalityInput =
	| { modality: 'pace' }
	| { modality: 'power'; power: number; device: PowerMeterDevice }
	| { modality: 'hr'; lthr: number };

export interface RacePrepWeek {
	weekNumber: number;
	phase: RacePrepPhase;
	/** 3-5 curated/relabeled + race-pace variants, each tagged pattern: 'race-prep' and zone: <its source zone>. */
	workouts: Workout[];
}

export interface RacePrepZoneBand {
	zone: ZoneKey;
	/** e.g. "3:30–4:00 /km" (pace), "250–280 W" (power), "145–160 bpm" (hr) — ready to feed
	 *  straight into getSegmentPaceRange/getSegmentPowerRange/getSegmentBpmRange and FIT export. */
	rangeLabel: string;
}

export interface RacePrepResult {
	raceDistanceKm: number;
	weeksUntilRace: number;
	goalPaceMinKm: number;
	modality: RacePrepModality;
	weeks: RacePrepWeek[];
	/** Per-zone band for whichever modality built this plan — look up by a workout's own `zone`
	 *  tag, since a single week can mix workouts from different training zones. */
	zoneBands: RacePrepZoneBand[];
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Whole weeks between today and the race date (floored; negative once the race has passed).
 * Plain Date arithmetic per Decision 6 — no date-fns/dayjs dependency needed.
 */
export function computeWeeksUntilRace(raceDateISO: string, todayISO: string): number {
	const raceDate = new Date(raceDateISO);
	const today = new Date(todayISO);
	return Math.floor((raceDate.getTime() - today.getTime()) / MS_PER_WEEK);
}

const MIN_ELIGIBLE_WEEKS = 4;
const MAX_ELIGIBLE_WEEKS = 8;

/** Race-Prep is only shown when the race is 4-8 weeks away (AC-1.5), inclusive both ends. */
export function isRacePrepEligible(weeksUntilRace: number): boolean {
	return weeksUntilRace >= MIN_ELIGIBLE_WEEKS && weeksUntilRace <= MAX_ELIGIBLE_WEEKS;
}

/** Taper week trains at reduced volume to shed fatigue while maintaining race-pace feel. */
const TAPER_MILEAGE_SHARE = 0.5;

/**
 * How many weeks each phase gets for a plan of this total length (Build, Strength, Peak, Taper).
 * Extra weeks (beyond the 4-week minimum) are added to Build first, then Strength, then Peak —
 * Taper stays fixed at 1 week throughout, since these are short (4-8 week) windows where a longer
 * taper would eat into limited race-specific work rather than genuinely aid recovery. Each phase
 * repeats its own curated workout set across its allocated weeks — Phase 1 doesn't do week-over-
 * week volume progression even within a single phase (every week uses the same weeklyMileageKm),
 * so repeating is consistent with, not a regression from, the original 4-week template.
 */
const PHASE_WEEK_ALLOCATION: Record<number, [number, number, number, number]> = {
	4: [1, 1, 1, 1],
	5: [2, 1, 1, 1],
	6: [2, 2, 1, 1],
	7: [3, 2, 1, 1],
	8: [3, 2, 2, 1]
};

function tagRacePrep(zone: ZoneKey | undefined) {
	return (workout: Workout): Workout => ({ ...workout, pattern: 'race-prep', zone });
}

interface ModalityZoneBuild {
	zoneBands: RacePrepZoneBand[];
	/** Per-training-zone workout lists, each already tagged with pattern + zone. */
	byZone: Record<'E' | 'M' | 'T' | 'I', Workout[]>;
	buildTaperWeekWorkouts: () => Workout[];
	/** Present for pace only — power/HR don't have an established way to convert a pace-based
	 *  race goal into a device-specific power or HR target (no existing conversion in this
	 *  codebase), so those modalities substitute an extra zone-appropriate workout instead of
	 *  fabricating a number that might be wrong. See phase composition below. */
	racePaceTempo: Workout | null;
	racePaceReps: Workout | null;
}

function buildPaceModality(
	trainingZones: TrainingZone[],
	weeklyMileageKm: number,
	goalPaceMinKm: number
): ModalityZoneBuild {
	const zoneBands: RacePrepZoneBand[] = trainingZones.map((z) => ({
		zone: z.zone,
		rangeLabel: `${z.paceMinKmHigh}–${z.paceMinKmLow} /km`
	}));

	const build = (zone: ZoneKey, mileageKm: number) =>
		buildZoneWorkouts(zone, trainingZones, mileageKm).map(tagRacePrep(zone));

	return {
		zoneBands,
		byZone: {
			E: build('E', weeklyMileageKm),
			M: build('M', weeklyMileageKm),
			T: build('T', weeklyMileageKm),
			I: build('I', weeklyMileageKm)
		},
		buildTaperWeekWorkouts: () => {
			const taperMileageKm = weeklyMileageKm * TAPER_MILEAGE_SHARE;
			return [
				build('E', taperMileageKm)[0],
				build('T', taperMileageKm)[0],
				build('M', taperMileageKm)[0]
			];
		},
		racePaceTempo: tagRacePrep(undefined)(buildRacePaceTempoWorkout(goalPaceMinKm, weeklyMileageKm)),
		racePaceReps: tagRacePrep(undefined)(buildRacePaceRepsWorkout(goalPaceMinKm, weeklyMileageKm))
	};
}

function buildPowerModality(
	power: number,
	device: PowerMeterDevice,
	weeklyMileageKm: number
): ModalityZoneBuild | 'out-of-range' {
	const powerZones = calculatePowerZones(power, device);
	if (!powerZones) return 'out-of-range';

	const zoneBands: RacePrepZoneBand[] = (['E', 'M', 'T', 'I', 'R'] as ZoneKey[])
		.map((zone) => {
			const deviceZone = powerZones.find((pz) => mapPowerZoneToTrainingZone(pz.zone, device) === zone);
			return deviceZone ? { zone, rangeLabel: formatPowerRangeStr(deviceZone) } : null;
		})
		.filter((b): b is RacePrepZoneBand => b !== null);

	const build = (zone: ZoneKey, mileageKm: number) =>
		buildPowerZoneWorkouts(zone, powerZones, mileageKm, power, device).map(tagRacePrep(zone));

	return {
		zoneBands,
		byZone: {
			E: build('E', weeklyMileageKm),
			M: build('M', weeklyMileageKm),
			T: build('T', weeklyMileageKm),
			I: build('I', weeklyMileageKm)
		},
		buildTaperWeekWorkouts: () => {
			const taperMileageKm = weeklyMileageKm * TAPER_MILEAGE_SHARE;
			return [
				build('E', taperMileageKm)[0],
				build('T', taperMileageKm)[0],
				build('M', taperMileageKm)[0]
			];
		},
		racePaceTempo: null,
		racePaceReps: null
	};
}

function buildHrModality(
	lthr: number,
	trainingZones: TrainingZone[],
	weeklyMileageKm: number
): ModalityZoneBuild | 'out-of-range' {
	const hrZones = calculateDanielsLthrZones(lthr);
	if (!hrZones) return 'out-of-range';

	const paceByZone = new Map(trainingZones.map((z) => [z.zone, z]));
	const midpointPace = (zone: ZoneKey): number => {
		const z = paceByZone.get(zone);
		if (!z) return 5.5; // matches hr-workouts.ts's documented fallback (VDOT 45, ~5:30/km)
		const parseTime = (s: string) => {
			const [m, sec] = s.split(':').map(Number);
			return m + sec / 60;
		};
		return (parseTime(z.paceMinKmLow) + parseTime(z.paceMinKmHigh)) / 2;
	};

	const zoneBands: RacePrepZoneBand[] = hrZones.map((z) => ({
		zone: z.zone,
		rangeLabel: formatBpmRange(z.bpmLow, z.bpmHigh)
	}));

	const build = (zone: ZoneKey, mileageKm: number) => {
		const hrZone = hrZones.find((z) => z.zone === zone)!;
		return buildHrZoneWorkouts(zone, hrZone, mileageKm, midpointPace(zone)).map(tagRacePrep(zone));
	};

	return {
		zoneBands,
		byZone: {
			E: build('E', weeklyMileageKm),
			M: build('M', weeklyMileageKm),
			T: build('T', weeklyMileageKm),
			I: build('I', weeklyMileageKm)
		},
		buildTaperWeekWorkouts: () => {
			const taperMileageKm = weeklyMileageKm * TAPER_MILEAGE_SHARE;
			return [
				build('E', taperMileageKm)[0],
				build('T', taperMileageKm)[0],
				build('M', taperMileageKm)[0]
			];
		},
		racePaceTempo: null,
		racePaceReps: null
	};
}

/**
 * Build a race-prep plan, scaled to how many weeks out the race is (4-8), by curating/relabeling
 * per-zone workout output (Decision 3) — Build Aerobic Base -> Strength -> Peak VO2 Max -> Taper.
 * Supports all three modalities (AC-1.6/AC-2.10): Pace additionally gets race-pace-specific tempo/
 * reps variants (workout-patterns.ts), since goal pace is always known from the race result; Power
 * and HR substitute an extra zone-appropriate workout instead, since converting a pace-based race
 * goal into a device-specific power or HR target has no established formula in this codebase.
 */
export function buildRacePrepResult(
	raceDistanceKm: number | null,
	raceGoalTimeSeconds: number | null,
	raceDateISO: string | null,
	todayISO: string,
	weeklyMileageKm: number | null,
	modalityInput: RacePrepModalityInput
): RacePrepResult | 'out-of-range' | null {
	if (
		raceDistanceKm === null ||
		raceGoalTimeSeconds === null ||
		raceDateISO === null ||
		weeklyMileageKm === null
	) {
		return null;
	}

	if (weeklyMileageKm <= 0) return 'out-of-range';

	const weeksUntilRace = computeWeeksUntilRace(raceDateISO, todayISO);
	if (!isRacePrepEligible(weeksUntilRace)) return 'out-of-range';

	const paceResult = buildTrainingPaceResult(raceDistanceKm, raceGoalTimeSeconds);
	if (paceResult === null || paceResult === 'out-of-range') return 'out-of-range';

	const trainingZones = paceResult.zones;
	const goalPaceMinKm = raceGoalTimeSeconds / 60 / raceDistanceKm;

	const modalityBuild: ModalityZoneBuild | 'out-of-range' =
		modalityInput.modality === 'power'
			? buildPowerModality(modalityInput.power, modalityInput.device, weeklyMileageKm)
			: modalityInput.modality === 'hr'
				? buildHrModality(modalityInput.lthr, trainingZones, weeklyMileageKm)
				: buildPaceModality(trainingZones, weeklyMileageKm, goalPaceMinKm);

	if (modalityBuild === 'out-of-range') return 'out-of-range';

	const { byZone, buildTaperWeekWorkouts, racePaceTempo, racePaceReps, zoneBands } = modalityBuild;

	const phaseWorkouts: Record<RacePrepPhase, Workout[]> = {
		'Build Aerobic Base': racePaceTempo
			? [byZone.E[0], byZone.E[1], byZone.M[0], racePaceTempo]
			: [byZone.E[0], byZone.E[1], byZone.M[0]],
		Strength: racePaceTempo
			? [byZone.M[0], byZone.T[0], racePaceTempo]
			: [byZone.M[0], byZone.T[0], byZone.T[1]],
		'Peak VO2 Max': racePaceReps
			? [byZone.I[0], byZone.I[1], racePaceReps]
			: [byZone.I[0], byZone.I[1], byZone.I[2]],
		Taper: buildTaperWeekWorkouts()
	};

	const [buildWeeks, strengthWeeks, peakWeeks, taperWeeks] = PHASE_WEEK_ALLOCATION[weeksUntilRace];
	const phaseCounts: Array<[RacePrepPhase, number]> = [
		['Build Aerobic Base', buildWeeks],
		['Strength', strengthWeeks],
		['Peak VO2 Max', peakWeeks],
		['Taper', taperWeeks]
	];

	const weeks: RacePrepWeek[] = [];
	for (const [phase, count] of phaseCounts) {
		for (let i = 0; i < count; i++) {
			weeks.push({ weekNumber: weeks.length + 1, phase, workouts: phaseWorkouts[phase] });
		}
	}

	return { raceDistanceKm, weeksUntilRace, goalPaceMinKm, modality: modalityInput.modality, weeks, zoneBands };
}
