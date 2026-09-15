import type { GuideContent } from './types';

export const guide: GuideContent = {
	slug: 'choosing-your-training-metric',
	route: '/guides/choosing-your-training-metric',
	title: 'Pace, power, or heart rate: how to choose your training metric',
	excerpt:
		"Every Runwise tool ultimately targets one of three metrics — pace, running power, or heart rate — and none of the three is universally best. Here's a practical, session-by-session framework for picking the right one instead of picking a permanent favourite.",
	sourcesCredited: ["Jack Daniels' VDOT method", 'Friel LTHR method', 'Stryd/Garmin/Polar running-power models'],
	intro:
		"Runners often ask which of pace, heart rate, or running power is 'the best' metric to train by, as though one will eventually be crowned the correct answer and the other two discarded. The more useful framing, and the one this guide takes, is that each metric answers a genuinely different question — what ground did I cover, how hard is my body working right now, and how much mechanical work am I producing — and the right choice depends on the session and the conditions, not on picking a permanent allegiance.",
	sections: [
		{
			heading: 'What each metric is actually measuring',
			body: "Pace, the basis of Jack Daniels' VDOT method, measures ground covered over time: simple, universally understood, and completely blind to hills, wind, or terrain (see Understanding running pace). Heart rate, whether set as a percentage of max or via Friel's LTHR method, measures your cardiovascular system's response to effort, which makes it a genuine physiological signal but one that lags behind sudden changes in effort by tens of seconds to a couple of minutes (see Interval training explained). Running power — Stryd's Critical Power, Garmin's Threshold Power, or Polar's MAP — estimates the mechanical work rate your body produces, responding almost instantly to effort changes and staying consistent across variable terrain, at the cost of being a newer, less standardised technology where different brands' numbers aren't directly comparable (see Running power zones explained). None of the three is a flawed version of the others; they're three different instruments built to answer three different questions."
		},
		{
			heading: 'Flat, calm, controlled sessions: pace usually wins',
			body: "On a track, a canal towpath, or a treadmill — anywhere flat, calm, and free of GPS-hostile obstructions — pace is typically the simplest and most reliable target of the three, because there's nothing external distorting it and no lag or cross-brand inconsistency to account for. This is exactly why track intervals and flat tempo runs are conventionally paced by watch or stopwatch rather than by heart rate or power: on genuinely controlled terrain, pace does its one job better than the alternatives do theirs."
		},
		{
			heading: 'Long, steady aerobic efforts: heart rate earns its keep',
			body: "On a long run or extended Easy-zone effort, the goal is usually holding a genuinely sustainable aerobic intensity rather than a specific pace, and heart rate is well suited to exactly that: it reflects your body's actual internal strain, catching the moment you've unconsciously drifted into too-hard territory even when the pace feels fine. It's also the best of the three metrics for spotting cardiac drift — heart rate climbing at a constant pace as a long run continues, a genuinely useful early-warning sign of heat stress, dehydration, or accumulated fatigue that pace and power both miss entirely, since neither reflects internal physiological strain the way heart rate does."
		},
		{
			heading: 'Hilly or variable terrain: power earns its keep',
			body: "Once a route stops being flat, pace stops being a reliable single number: the same physiological effort produces a slower pace uphill and a faster one downhill, and heart rate's lag means it won't reflect a short, sharp climb until the climb is nearly over. Running power responds to the actual work being done regardless of gradient, which makes it the most reliable of the three metrics for maintaining even effort across genuinely hilly or technical terrain — useful both for training runs on rolling routes and for pacing a hilly race, where holding steady power rather than steady pace usually produces a smarter, more even effort distribution."
		},
		{
			heading: 'Short, hard reps: power or pace, rarely heart rate',
			body: "For interval and repetition work, heart rate's response lag makes it nearly useless as a moment-to-moment target within a rep that might be over in under a minute, leaving pace (on flat, controlled terrain) or power (on variable terrain, or for runners who train with a power meter regardless of terrain) as the two genuinely workable choices. Heart rate still has a role in these sessions, just a different one: reviewed after the fact, it shows how quickly you recovered between reps and whether it crept progressively higher across the session, both useful fatigue signals that the instant-response metrics don't provide on their own."
		},
		{
			heading: 'Racing day: why a backup metric matters more than usual',
			body: "Race day is exactly when metrics disagree most consequentially, because it combines everything each one struggles with at once: adrenaline and taper freshness can distort perceived effort, unfamiliar course terrain tests pace's blind spot for gradient, and the stakes of getting pacing wrong are far higher than in a routine training session. A runner who has practised with two metrics in training — say, power as primary with heart rate as a sanity check — is far better placed on race day to notice something's off (power looks right but heart rate is unusually high, suggesting heat or dehydration stress) than a runner who has only ever trained by a single number and has no independent check when that number stops telling the full story."
		},
		{
			heading: 'A practical decision habit, not a permanent choice',
			body: "Rather than committing to one metric permanently, it helps to ask two quick questions before each session: is the terrain and weather stable enough that pace alone would be trustworthy, and does the session need an instant response (short reps, surges, hills) or a settled, sustained one (a long steady run)? Flat, calm conditions with a sustained effort point towards pace. Variable weather or terrain with a sustained effort points towards heart rate, since it surfaces genuine physiological strain the other two miss. Hills, wind, or short sharp efforts point towards power. Most experienced runners who train seriously with more than one device don't pick a favourite at all — they keep an eye on whichever second metric adds information the primary one that session can't provide, turning three separate tools into one more complete picture of effort."
		}
	]
};
