import { describe, it, expect } from 'vitest';
import { EXPLAINERS } from './explainers';

describe('EXPLAINERS content', () => {
	it('powerZonesExplainer_crossLinksToTheRunningPowerZonesGuide', () => {
		const hasLink = EXPLAINERS['/power-zones'].sections.some((s) =>
			s.links?.some((l) => l.url === '/guides/running-power-zones-explained')
		);
		expect(hasLink).toBe(true);
	});
});
