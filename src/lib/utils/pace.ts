const KM_PER_MILE = 1.60934;

/** Parse "M:SS" → decimal minutes. Returns null for empty, invalid, or zero input. */
export function parsePace(str: string): number | null {
	const trimmed = str.trim();
	if (!trimmed) return null;

	const match = trimmed.match(/^(\d+):(\d{2})$/);
	if (!match) return null;

	const minutes = parseInt(match[1], 10);
	const seconds = parseInt(match[2], 10);

	if (seconds >= 60) return null;
	if (minutes < 0) return null;

	const decimal = minutes + seconds / 60;
	if (decimal <= 0) return null;

	return decimal;
}

/** Format decimal minutes → "M:SS". */
export function formatPace(decimal: number): string {
	const totalSeconds = Math.round(decimal * 60);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function minPerKmToMinPerMile(minPerKm: number): number {
	return minPerKm * KM_PER_MILE;
}

export function minPerMileToMinPerKm(minPerMile: number): number {
	return minPerMile / KM_PER_MILE;
}

export function minPerKmToKmh(minPerKm: number): number {
	return 60 / minPerKm;
}

/** Returns null for zero or negative kmh (division by zero / invalid). */
export function kmhToMinPerKm(kmh: number): number | null {
	if (kmh <= 0) return null;
	return 60 / kmh;
}

export function kmhToMph(kmh: number): number {
	return kmh / KM_PER_MILE;
}

export function minPerKmToPer400m(minPerKm: number): number {
	return minPerKm * 0.4;
}

export function minPerKmToPer800m(minPerKm: number): number {
	return minPerKm * 0.8;
}
