export interface AffiliateProduct {
	name: string;
	description: string;
	url: string;
	program: 'amazon' | 'garmin';
	tag: string;
}

export const AFFILIATE_LINKS: Record<string, AffiliateProduct[]> = {
	'/pace': [
		{
			name: 'Garmin Forerunner 165',
			description: 'GPS running watch with pace alerts and training load tracking.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+165&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		},
		{
			name: 'Garmin Forerunner 265',
			description: 'Advanced GPS watch with AMOLED display and real-time stamina tracking.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+265&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		}
	],
	'/race-predictor': [
		{
			name: 'Garmin Forerunner 265',
			description: 'Advanced GPS watch with race predictor and performance condition metrics.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+265&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		},
		{
			name: 'Garmin Forerunner 965',
			description: 'Premium GPS watch with race-day weather forecasting and pace strategy.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+965&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		}
	],
	'/training-paces': [
		{
			name: 'Garmin Forerunner 265',
			description: 'GPS watch with daily suggested workouts based on your training load.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+265&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		},
		{
			name: 'Garmin Forerunner 955 Solar',
			description: 'Endurance GPS watch with training status and VO2 max tracking.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+955+Solar&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		}
	],
	'/hr-zones': [
		{
			name: 'Garmin HRM-Pro Plus',
			description: 'Premium chest strap heart rate monitor for precise zone training.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+HRM-Pro+Plus&tag=runwise-21',
			program: 'garmin',
			tag: 'runwise-21'
		},
		{
			name: 'Garmin HRM-Dual',
			description: 'Dual-band heart rate monitor compatible with most GPS watches and apps.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+HRM-Dual&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		}
	],
	'/vo2max': [
		{
			name: 'Garmin Forerunner 965',
			description: 'Premium GPS watch with VO2 max estimation and HRV status tracking.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+965&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		},
		{
			name: 'Garmin Fenix 7',
			description: 'Multisport GPS watch with VO2 max, training load, and acclimatisation data.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Fenix+7&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		}
	],
	'/parkrun': [
		{
			name: 'Garmin Forerunner 165',
			description: 'Lightweight GPS watch ideal for 5K parkrun pacing and lap splits.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+165&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		},
		{
			name: 'Garmin Forerunner 55',
			description: 'Entry-level GPS running watch perfect for parkrun tracking and personal bests.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+55&tag=runwise-21',
			program: 'amazon',
			tag: 'runwise-21'
		}
	]
};

export function getAffiliateLinks(route: string): AffiliateProduct[] {
	return [...(AFFILIATE_LINKS[route] ?? [])];
}
