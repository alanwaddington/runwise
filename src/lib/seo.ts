export const BASE_URL = import.meta.env?.VITE_SITE_URL || 'https://runwise.app';
export const SITE_NAME = 'Runwise';
export const DEFAULT_OG_IMAGE = '/og/og-default.png';

export interface PageSeo {
	title: string;
	description: string;
	ogImage: string;
	jsonLdType: 'WebApplication' | 'WebSite';
	changefreq: string;
	priority: number;
}

export const PAGES: Record<string, PageSeo> = {
	'/': {
		title: 'Runwise',
		description:
			'Free running calculators for pace, race prediction, training paces, heart rate zones, VO2 max, and parkrun times. No login or signup needed for runners.',
		ogImage: DEFAULT_OG_IMAGE,
		jsonLdType: 'WebSite',
		changefreq: 'monthly',
		priority: 1.0
	},
	'/pace': {
		title: 'Pace Calculator | Runwise',
		description:
			'Free pace calculator for runners. Convert instantly between min/km, min/mile, km/h and mph — the fastest running pace converter for training and racing.',
		ogImage: '/og/og-pace.png',
		jsonLdType: 'WebApplication',
		changefreq: 'monthly',
		priority: 0.8
	},
	'/race-predictor': {
		title: 'Race Time Predictor | Runwise',
		description:
			'Free race time predictor for runners. Enter a recent result to predict finish times for 5K, 10K, half marathon, and full marathon using the Riegel formula.',
		ogImage: '/og/og-race-predictor.png',
		jsonLdType: 'WebApplication',
		changefreq: 'monthly',
		priority: 0.8
	},
	'/training-paces': {
		title: 'Training Pace Calculator | Runwise',
		description:
			'Free training pace calculator using Jack Daniels VDOT paces. Enter a recent race result for your Easy, Marathon, Threshold, Interval and Repetition paces.',
		ogImage: '/og/og-training-paces.png',
		jsonLdType: 'WebApplication',
		changefreq: 'monthly',
		priority: 0.8
	},
	'/hr-zones': {
		title: 'Heart Rate Zone Calculator | Runwise',
		description:
			'Free heart rate zone calculator for runners and triathletes. Calculate your 5 HR training zones using Max HR or Joe Friel LTHR — instant, no login required.',
		ogImage: '/og/og-hr-zones.png',
		jsonLdType: 'WebApplication',
		changefreq: 'monthly',
		priority: 0.8
	},
	'/vo2max': {
		title: 'VO2 Max Estimator | Runwise',
		description:
			'Free VO2 max calculator for runners. Estimate your aerobic fitness from a race result using the VDOT method, with fitness category and race predictions.',
		ogImage: '/og/og-vo2max.png',
		jsonLdType: 'WebApplication',
		changefreq: 'monthly',
		priority: 0.8
	},
	'/parkrun': {
		title: 'Parkrun Predictor | Runwise',
		description:
			'Free parkrun predictor and parkrun pace calculator. Predict your 5K parkrun time from a training run using the Riegel formula, plus splits and PB comparison.',
		ogImage: '/og/og-parkrun.png',
		jsonLdType: 'WebApplication',
		changefreq: 'monthly',
		priority: 0.8
	}
};
