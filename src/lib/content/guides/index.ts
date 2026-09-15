import { guide as understandingVdot } from './understanding-vdot';
import { guide as hrZonesVsPowerZones } from './hr-zones-vs-power-zones';
import { guide as howRacePredictionsWork } from './how-race-predictions-work';
import { guide as readingYourVo2max } from './reading-your-vo2max';
import { guide as understandingRunningPace } from './understanding-running-pace';
import { guide as parkrunAgeGradingExplained } from './parkrun-age-grading-explained';
import { guide as runningPowerZonesExplained } from './running-power-zones-explained';
import { guide as intervalTrainingExplained } from './interval-training-explained';
import { guide as howRunwiseBuildsWorkouts } from './how-runwise-builds-workouts';
import { guide as choosingYourTrainingMetric } from './choosing-your-training-metric';

export type { GuideContent } from './types';

export const GUIDE_MIN_WORD_COUNT = 900;

/**
 * Full article content for every guide, one module per slug (see the sibling files
 * in this directory). Each guide route imports its own module directly rather than
 * this aggregated array (see the +page.svelte files under src/routes/guides/), so
 * a route's own chunk only carries its own article. This array exists for content
 * that genuinely needs all of them at once: the /guides index page (list view) and
 * the test suite. seo.ts deliberately does NOT import this — see guide-index.ts —
 * since it only needs slug/route/title/excerpt and is rendered on every page.
 */
export const GUIDES = [
	understandingVdot,
	hrZonesVsPowerZones,
	howRacePredictionsWork,
	readingYourVo2max,
	understandingRunningPace,
	parkrunAgeGradingExplained,
	runningPowerZonesExplained,
	intervalTrainingExplained,
	howRunwiseBuildsWorkouts,
	choosingYourTrainingMetric
];
