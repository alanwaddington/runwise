import { STANDARD_DISTANCES, parseTime } from './race-predictor';

export interface RaceResultInput {
	selectedOption: string;
	customKmRaw: string;
	timeRaw: string;
}

/**
 * Serialize a race-result form state to a URL query string, for cross-linking between
 * /training-paces and /workouts. Only the race result travels — no other page state.
 */
export function serializeRaceResult(input: RaceResultInput): string {
	const params = new URLSearchParams();
	params.set('distance', input.selectedOption);
	if (input.selectedOption === 'Custom') {
		params.set('km', input.customKmRaw);
	}
	params.set('time', input.timeRaw);
	return params.toString();
}

/**
 * Parse a URL query string back into race-result form state. Returns null for missing or
 * malformed params (never throws) — callers should fall back to their normal empty state.
 */
export function parseRaceResultParams(searchParams: URLSearchParams): RaceResultInput | null {
	const distance = searchParams.get('distance');
	const timeRaw = searchParams.get('time');
	if (!distance || !timeRaw) return null;
	if (parseTime(timeRaw) === null) return null;

	if (distance === 'Custom') {
		const kmRaw = searchParams.get('km');
		if (!kmRaw) return null;
		const km = parseFloat(kmRaw);
		if (isNaN(km) || km <= 0) return null;
		return { selectedOption: 'Custom', customKmRaw: kmRaw, timeRaw };
	}

	const isStandard = STANDARD_DISTANCES.some((d) => d.name === distance);
	if (!isStandard) return null;

	return { selectedOption: distance, customKmRaw: '', timeRaw };
}
