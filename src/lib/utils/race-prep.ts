import { buildTrainingPaceResult, type TrainingZone } from './training-paces';
import { buildZoneWorkouts, type Workout } from './workouts';
import { buildRacePaceTempoWorkout, buildRacePaceRepsWorkout } from './workout-patterns';

export interface RacePrepWeek {
	weekNumber: 1 | 2 | 3 | 4;
	phase: 'Build Aerobic Base' | 'Strength' | 'Peak VO2 Max' | 'Taper';
	/** 3-5 curated/relabeled + race-pace variants, each tagged pattern: 'race-prep'. */
	workouts: Workout[];
}

export interface RacePrepResult {
	raceDistanceKm: number;
	weeksUntilRace: number;
	goalPaceMinKm: number;
	weeks: RacePrepWeek[];
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

function tagRacePrep(workout: Workout): Workout {
	return { ...workout, pattern: 'race-prep' };
}

function buildTaperWeekWorkouts(trainingZones: TrainingZone[], weeklyMileageKm: number): Workout[] {
	const taperMileageKm = weeklyMileageKm * TAPER_MILEAGE_SHARE;
	const eZone = buildZoneWorkouts('E', trainingZones, taperMileageKm);
	const mZone = buildZoneWorkouts('M', trainingZones, taperMileageKm);
	const tZone = buildZoneWorkouts('T', trainingZones, taperMileageKm);
	return [eZone[0], tZone[0], mZone[0]];
}

/**
 * Build a 4-week race-prep plan by curating/relabeling buildZoneWorkouts output (Decision 3) —
 * Build Aerobic Base -> Strength -> Peak VO2 Max -> Taper — plus race-pace-specific variants
 * from workout-patterns.ts. Pace-only for Phase 1; Power/HR modality optimization (AC-1.6) is
 * deferred to the Task 5 UI integration.
 */
export function buildRacePrepResult(
	raceDistanceKm: number | null,
	raceGoalTimeSeconds: number | null,
	raceDateISO: string | null,
	todayISO: string,
	weeklyMileageKm: number | null
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

	const eZone = buildZoneWorkouts('E', trainingZones, weeklyMileageKm);
	const mZone = buildZoneWorkouts('M', trainingZones, weeklyMileageKm);
	const tZone = buildZoneWorkouts('T', trainingZones, weeklyMileageKm);
	const iZone = buildZoneWorkouts('I', trainingZones, weeklyMileageKm);

	const racePaceTempo = buildRacePaceTempoWorkout(goalPaceMinKm, weeklyMileageKm);
	const racePaceReps = buildRacePaceRepsWorkout(goalPaceMinKm, weeklyMileageKm);

	const weeks: RacePrepWeek[] = [
		{
			weekNumber: 1,
			phase: 'Build Aerobic Base',
			workouts: [eZone[0], eZone[1], mZone[0], racePaceTempo].map(tagRacePrep)
		},
		{
			weekNumber: 2,
			phase: 'Strength',
			workouts: [mZone[0], tZone[0], racePaceTempo].map(tagRacePrep)
		},
		{
			weekNumber: 3,
			phase: 'Peak VO2 Max',
			workouts: [iZone[0], iZone[1], racePaceReps].map(tagRacePrep)
		},
		{
			weekNumber: 4,
			phase: 'Taper',
			workouts: buildTaperWeekWorkouts(trainingZones, weeklyMileageKm).map(tagRacePrep)
		}
	];

	return { raceDistanceKm, weeksUntilRace, goalPaceMinKm, weeks };
}
