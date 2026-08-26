import { describe, it, expect } from 'vitest';
import { createRateLimiter } from './rateLimiter';

describe('createRateLimiter', () => {
	it('isAllowed_underMaxRequests_returnsTrue', () => {
		const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 });

		expect(limiter.isAllowed('1.2.3.4', 0)).toBe(true);
		expect(limiter.isAllowed('1.2.3.4', 0)).toBe(true);
		expect(limiter.isAllowed('1.2.3.4', 0)).toBe(true);
	});

	it('isAllowed_exceedsMaxRequestsWithinWindow_returnsFalse', () => {
		const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 });

		limiter.isAllowed('1.2.3.4', 0);
		limiter.isAllowed('1.2.3.4', 0);
		limiter.isAllowed('1.2.3.4', 0);

		expect(limiter.isAllowed('1.2.3.4', 0)).toBe(false);
	});

	it('isAllowed_afterWindowElapses_returnsTrueAgain', () => {
		const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });

		limiter.isAllowed('1.2.3.4', 0);
		expect(limiter.isAllowed('1.2.3.4', 60_001)).toBe(true);
	});

	it('isAllowed_differentKeys_areTrackedIndependently', () => {
		const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });

		limiter.isAllowed('1.2.3.4', 0);

		expect(limiter.isAllowed('5.6.7.8', 0)).toBe(true);
	});

	it('isAllowed_requestsJustInsideWindow_countTowardsLimit', () => {
		const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });

		limiter.isAllowed('1.2.3.4', 0);
		limiter.isAllowed('1.2.3.4', 59_999);

		expect(limiter.isAllowed('1.2.3.4', 59_999)).toBe(false);
	});
});
