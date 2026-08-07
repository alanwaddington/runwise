export interface AffiliateProduct {
	name: string;
	description: string;
	url: string;
	program: 'amazon' | 'garmin' | 'direct';
	/** Affiliate tracking tag. Only present for 'amazon'/'garmin' programs. */
	tag?: string;
	/** Display badge for 'direct' (non-affiliate) links, e.g. 'Stryd'. */
	brand?: string;
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
	],
	'/power-zones': [
		{
			// Stryd doesn't sell through Amazon, so this points at Stryd's own store
			// instead. Alan has applied to Stryd's affiliate program (run via
			// UpPromote, af.uppromote.com/strydos/register) — once approved, replace
			// this url with the tracking link and add program: 'amazon'-style tag
			// (check first that the tracking link still preserves the auto-region
			// redirect described below, rather than assuming it does).
			//
			// This is Stryd's own region-auto-detecting entry point, not a specific
			// region's store -- region routing is delegated entirely to Stryd's own
			// infrastructure rather than reimplemented here. Verified directly via
			// curl (2026-08-06): stryd.com/store -> 307 /r/store -> 307
			// /<region>/en/store, resolved from the requester's own IP. Confirmed
			// working for US/EU/UK/Canada/Australia/Japan regional stores (correct
			// local currency for each) plus a "Global" fallback tier for everyone
			// else. It's also the literal URL used in Stryd's own homepage "Buy"
			// nav link, not an internal implementation detail. See issue #88.
			name: 'Stryd Running Power Meter',
			description: 'Dedicated footpod power meter — the device behind the Stryd Critical Power model.',
			url: 'https://www.stryd.com/store',
			program: 'direct',
			brand: 'Stryd'
		},
		{
			name: 'Garmin HRM 600',
			description: 'Premium rechargeable chest strap that generates Garmin Running Power alongside HR data.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+HRM+600&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		}
	],
	'/workouts': [
		{
			name: 'Garmin Forerunner 265',
			description: 'AMOLED watch with structured interval workout support, audio prompts, and daily suggested workouts.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+265&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		},
		{
			name: 'Garmin Forerunner 570',
			description: 'Multi-sport watch with training load monitoring and built-in speaker for rep/interval alerts.',
			url: 'https://www.amazon.co.uk/s?k=Garmin+Forerunner+570&tag=runwise21-21',
			program: 'amazon',
			tag: 'runwise21-21'
		}
	]
};

export function getAffiliateLinks(route: string): AffiliateProduct[] {
	return [...(AFFILIATE_LINKS[route] ?? [])];
}
