/**
 * Lightweight per-guide metadata (slug/route/title/excerpt) for SEO purposes —
 * used by seo.ts (rendered on every page via SeoHead) and the /guides index page.
 * Deliberately does NOT import the full guide content modules (src/lib/content/
 * guides/<slug>.ts): those carry full article bodies (~1000 words each) that only
 * the guide's own route needs. Kept in sync with GUIDES by
 * guide-index.test.ts — update both when adding, renaming, or editing a guide.
 */

export interface GuideIndexEntry {
	slug: string;
	route: string;
	title: string;
	excerpt: string;
}

export const GUIDE_INDEX: GuideIndexEntry[] = [
	{
		slug: 'understanding-vdot',
		route: '/guides/understanding-vdot',
		title: 'Understanding VDOT and how it drives your training paces',
		excerpt: "A deep dive into Jack Daniels' VDOT system: what the number actually represents, how it's derived from a race result, and why it produces better training paces than age- or feel-based guesses."
	},
	{
		slug: 'hr-zones-vs-power-zones',
		route: '/guides/hr-zones-vs-power-zones',
		title: 'Heart rate zones vs power zones: which should you train by?',
		excerpt: 'Heart rate and running power measure fundamentally different things. This guide explains what each actually tells you, where each falls short, and how to combine them instead of picking one.'
	},
	{
		slug: 'how-race-predictions-work',
		route: '/guides/how-race-predictions-work',
		title: 'How race time predictions actually work (and when to distrust them)',
		excerpt: "Pete Riegel's endurance formula predicts race times across distances with surprising accuracy, but it has real, well-documented blind spots. Here's how the model works and where it breaks down."
	},
	{
		slug: 'reading-your-vo2max',
		route: '/guides/reading-your-vo2max',
		title: 'Reading your VO2 max estimate: what it means and how to improve it',
		excerpt: "A race-derived VO2 max estimate can differ from your GPS watch's number and still both be 'right'. Here's what VO2 max actually measures, how the ACSM fitness categories work, and what actually moves the number."
	},
	{
		slug: 'understanding-running-pace',
		route: '/guides/understanding-running-pace',
		title: 'Understanding running pace: what it measures, and where it misleads you',
		excerpt: "Pace looks like the simplest number in running — distance over time — but GPS drift, terrain, and the difference between average and target pace trip up even experienced runners. Here's what pace actually tells you, and where it quietly lies."
	},
	{
		slug: 'parkrun-age-grading-explained',
		route: '/guides/parkrun-age-grading-explained',
		title: 'How parkrun age-grading actually works, and how to use it well',
		excerpt: "A parkrun age-grade percentage lets a 65-year-old and a 25-year-old compare the same 5K time fairly. Here's where the WMA tables the calculation relies on actually come from, and the real limitations behind the single number."
	},
	{
		slug: 'running-power-zones-explained',
		route: '/guides/running-power-zones-explained',
		title: 'Running power zones explained: Critical Power, Threshold Power, and MAP',
		excerpt: "Running power meters all report watts, but Stryd, Garmin, and Polar calculate fundamentally different metrics under that shared unit. Here's what each one actually measures and why treating them as interchangeable causes real training errors."
	},
	{
		slug: 'interval-training-explained',
		route: '/guides/interval-training-explained',
		title: 'Interval and repetition training: why duration, recovery, and effort matter more than the number on your watch',
		excerpt: "Interval and repetition sessions are where pace, power, and heart rate disagree most sharply, because hard efforts are often over before any of them can fully respond. Here's what actually determines whether a hard session builds fitness or just builds fatigue."
	},
	{
		slug: 'how-runwise-builds-workouts',
		route: '/guides/how-runwise-builds-workouts',
		title: 'How structured workouts are built from your training paces',
		excerpt: "Knowing your training paces only answers half the question — a runner also needs to know how much quality work at each pace their current mileage can absorb. Here's the weekly-mileage scaling logic, warm-up sizing, and workout-format taxonomy behind every session this tool generates."
	},
	{
		slug: 'choosing-your-training-metric',
		route: '/guides/choosing-your-training-metric',
		title: 'Pace, power, or heart rate: how to choose your training metric',
		excerpt: "Every Runwise tool ultimately targets one of three metrics — pace, running power, or heart rate — and none of the three is universally best. Here's a practical, session-by-session framework for picking the right one instead of picking a permanent favourite."
	},
];
