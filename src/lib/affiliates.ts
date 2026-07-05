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
			name: 'Garmin Forerunner 170',
			description: 'AMOLED running watch with barometric altimeter, offline music, and 10-day battery.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+170&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		},
		{
			name: 'Garmin Forerunner 265',
			description: 'Dual-frequency GPS with AMOLED display, SatIQ satellite selection, and music storage.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+265&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		}
	],
	'/race-predictor': [
		{
			name: 'Garmin Forerunner 265',
			description: 'Dual-frequency GPS with race predictor, performance metrics, and 10+ day battery.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+265&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		},
		{
			name: 'Garmin Forerunner 970',
			description: 'Flagship running watch with topographic maps, dual-frequency GPS, and automatic race transitions.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+970&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		}
	],
	'/training-paces': [
		{
			name: 'Garmin Forerunner 265',
			description: 'AMOLED watch with daily suggested workouts and training load monitoring.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+265&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		},
		{
			name: 'Garmin Forerunner 570',
			description: 'Multi-sport watch with skin temperature tracking, built-in speaker, and triathlon support.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+570&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		}
	],
	'/hr-zones': [
		{
			name: 'Garmin HRM-Pro Plus',
			description: 'Mid-range chest strap with running dynamics, running power, and swim data logging.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+HRM-Pro+Plus&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		},
		{
			name: 'Garmin HRM 600',
			description: 'Premium rechargeable strap with running power metrics, standalone recording, and 2-month battery.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+HRM+600&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		}
	],
	'/vo2max': [
		{
			name: 'Garmin Forerunner 970',
			description: 'Flagship watch with VO2 max tracking, HRV status, and complete aerobic metrics.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+970&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		},
		{
			name: 'Garmin Fenix 8',
			description: 'Premium multisport watch with AMOLED display, VO2 max, and topographic maps.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Fenix+8&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		}
	],
	'/parkrun': [
		{
			name: 'Garmin Forerunner 170',
			description: 'Lightweight AMOLED watch ideal for 5K running with smart features and music support.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+170&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		},
		{
			name: 'Garmin Forerunner 70',
			description: 'Entry-level GPS watch with Garmin Coach workouts and 13-day battery for casual runners.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+70&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		}
	]
};

export function getAffiliateLinks(route: string): AffiliateProduct[] {
	return [...(AFFILIATE_LINKS[route] ?? [])];
}
