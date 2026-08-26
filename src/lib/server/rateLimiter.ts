export interface RateLimiterOptions {
	maxRequests: number;
	windowMs: number;
}

export interface RateLimiter {
	/** Records a request for `key` and returns whether it is within the allowed rate. */
	isAllowed(key: string, now: number): boolean;
}

/**
 * Per-instance sliding-window rate limiter. On Fluid Compute this state is scoped to a single
 * function instance, not shared globally across concurrent instances — see #110 design notes.
 */
export function createRateLimiter({ maxRequests, windowMs }: RateLimiterOptions): RateLimiter {
	const requestTimestampsByKey = new Map<string, number[]>();

	return {
		isAllowed(key, now) {
			const windowStart = now - windowMs;
			const timestamps = (requestTimestampsByKey.get(key) ?? []).filter((t) => t > windowStart);

			if (timestamps.length >= maxRequests) {
				requestTimestampsByKey.set(key, timestamps);
				return false;
			}

			timestamps.push(now);
			requestTimestampsByKey.set(key, timestamps);
			return true;
		}
	};
}
