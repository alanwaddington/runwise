import { formatPace, minPerKmToMinPerMile } from './pace';

const KM_PER_MILE = 1.60934;

export interface RaceDistance {
	name: string;
	km: number;
}

export const STANDARD_DISTANCES: RaceDistance[] = [
	{ name: '1 Mile', km: KM_PER_MILE },
	{ name: '5K', km: 5 },
	{ name: '10K', km: 10 },
	{ name: '15K', km: 15 },
	{ name: 'Half Marathon', km: 21.0975 },
	{ name: 'Marathon', km: 42.195 }
];

export interface PredictionRow {
	name: string;
	km: number;
	timeSeconds: number;
	timeFormatted: string;
	paceMinKm: string;
	paceMinMile: string;
}

/** Parse "MM:SS" or "H:MM:SS" → total seconds. Returns null for invalid/empty input. */
export function parseTime(str: string): number | null {
	const trimmed = str.trim();
	if (!trimmed) return null;

	const parts = trimmed.split(':');

	if (parts.length === 2) {
		// MM:SS
		const minutes = parseInt(parts[0], 10);
		const seconds = parseInt(parts[1], 10);
		if (isNaN(minutes) || isNaN(seconds)) return null;
		if (seconds >= 60 || seconds < 0) return null;
		if (minutes < 0) return null;
		const total = minutes * 60 + seconds;
		if (total <= 0) return null;
		return total;
	}

	if (parts.length === 3) {
		// H:MM:SS
		const hours = parseInt(parts[0], 10);
		const minutes = parseInt(parts[1], 10);
		const seconds = parseInt(parts[2], 10);
		if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
		if (seconds >= 60 || seconds < 0) return null;
		if (minutes >= 60 || minutes < 0) return null;
		if (hours < 0) return null;
		const total = hours * 3600 + minutes * 60 + seconds;
		if (total <= 0) return null;
		return total;
	}

	return null;
}

/** Format total seconds → "MM:SS" or "H:MM:SS". */
export function formatTime(totalSeconds: number): string {
	const rounded = Math.round(totalSeconds);
	const hours = Math.floor(rounded / 3600);
	const minutes = Math.floor((rounded % 3600) / 60);
	const seconds = rounded % 60;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Riegel formula: T2 = T1 × (D2 / D1) ^ 1.06 */
export function riegelPredict(
	knownTimeSeconds: number,
	knownDistanceKm: number,
	targetDistanceKm: number
): number {
	return knownTimeSeconds * Math.pow(targetDistanceKm / knownDistanceKm, 1.06);
}

/** Returns decimal minutes per km from predicted seconds and distance. */
export function predictedPaceMinPerKm(predictedSeconds: number, distanceKm: number): number {
	return predictedSeconds / 60 / distanceKm;
}

/** Build a sorted prediction table; optionally includes a custom distance row. */
export function buildPredictionTable(
	knownTimeSeconds: number,
	knownDistanceKm: number,
	customTargetKm: number | null
): PredictionRow[] {
	const distances: RaceDistance[] = [...STANDARD_DISTANCES];

	if (customTargetKm !== null) {
		const isDupe = STANDARD_DISTANCES.some((d) => Math.abs(d.km - customTargetKm) < 0.01);
		if (!isDupe) {
			distances.push({ name: 'Custom', km: customTargetKm });
		}
	}

	distances.sort((a, b) => a.km - b.km);

	return distances.map((d) => {
		const timeSeconds = riegelPredict(knownTimeSeconds, knownDistanceKm, d.km);
		const paceDecimal = predictedPaceMinPerKm(timeSeconds, d.km);
		return {
			name: d.name,
			km: d.km,
			timeSeconds,
			timeFormatted: formatTime(timeSeconds),
			paceMinKm: formatPace(paceDecimal),
			paceMinMile: formatPace(minPerKmToMinPerMile(paceDecimal))
		};
	});
}
