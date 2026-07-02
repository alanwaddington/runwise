import { formatTime, riegelPredict } from './race-predictor';

export type EffortLevel = 'easy' | 'moderate' | 'hard';

export interface SplitRow {
	km: number;
	cumulative: string;
	splitPace: string;
}

export interface PbComparison {
	/** Positive when the predicted time is faster than the PB. */
	deltaSeconds: number;
	description: string;
}

/** Effort level mapped to an equivalent race distance (km) used for Riegel prediction. */
export const EFFORT_DISTANCES: Record<EffortLevel, number> = {
	easy: 42.195,
	moderate: 21.0975,
	hard: 10
};

export function effortToRaceDistanceKm(effort: EffortLevel): number {
	return EFFORT_DISTANCES[effort];
}

/**
 * Predict a 5K parkrun time from a training run, distance, and effort level.
 * The training run's per-km pace is treated as the runner's race pace at the
 * effort's mapped distance (Easy → marathon, Moderate → half marathon, Hard → 10K),
 * then Riegel-predicted down to 5K. A slower/easier effort implies more fitness
 * in reserve, so it produces a faster (more optimistic) prediction than a harder effort
 * at the same training pace.
 * Returns null for invalid (zero/negative) distance or time.
 */
export function predictParkrunTime(
	distanceKm: number,
	timeSeconds: number,
	effort: EffortLevel
): number | null {
	if (distanceKm <= 0 || timeSeconds <= 0) return null;
	const effortDistanceKm = effortToRaceDistanceKm(effort);
	const paceSecondsPerKm = timeSeconds / distanceKm;
	const equivalentRaceTimeSeconds = paceSecondsPerKm * effortDistanceKm;
	return riegelPredict(equivalentRaceTimeSeconds, effortDistanceKm, 5);
}

/** Build an even-pacing 1K split table (1K–5K) for a predicted total time. */
export function generateSplits(predictedTimeSeconds: number): SplitRow[] {
	if (predictedTimeSeconds <= 0) return [];
	const splitSeconds = predictedTimeSeconds / 5;
	return Array.from({ length: 5 }, (_, i) => {
		const km = i + 1;
		return {
			km,
			cumulative: formatTime(splitSeconds * km),
			splitPace: formatTime(splitSeconds)
		};
	});
}

/** Compare a predicted time against a personal best, returning a display-ready description. */
export function compareToPb(predictedSeconds: number, pbSeconds: number): PbComparison {
	const deltaSeconds = Math.round(pbSeconds - predictedSeconds);

	if (deltaSeconds === 0) {
		return { deltaSeconds, description: 'right on your PB pace' };
	}

	const absSeconds = Math.abs(deltaSeconds);
	const unit = absSeconds === 1 ? 'second' : 'seconds';
	const direction = deltaSeconds > 0 ? 'faster' : 'slower';

	return { deltaSeconds, description: `${absSeconds} ${unit} ${direction} than your PB` };
}
