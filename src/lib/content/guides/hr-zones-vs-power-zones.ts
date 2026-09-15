import type { GuideContent } from './types';

export const guide: GuideContent = {
	slug: 'hr-zones-vs-power-zones',
	route: '/guides/hr-zones-vs-power-zones',
	title: 'Heart rate zones vs power zones: which should you train by?',
	excerpt:
		'Heart rate and running power measure fundamentally different things. This guide explains what each actually tells you, where each falls short, and how to combine them instead of picking one.',
	sourcesCredited: ["Friel's LTHR method", "device-specific running power models (Stryd Critical Power, Garmin Threshold Power, Polar MAP)"],
	intro:
		"Ask five experienced runners whether to train by heart rate or by power and you'll likely get five different, confidently-held answers. The honest answer is that they measure different things, respond on different timescales, and fail in different situations — which means the useful question isn't \"which is better\" but \"which is the right tool for this particular session, on this particular terrain, today.\"",
	sections: [
		{
			heading: 'What heart rate actually measures',
			body: "Heart rate is a downstream physiological response to effort, not effort itself. When you increase pace or hit a hill, your heart rate doesn't jump instantly; it climbs over tens of seconds to a couple of minutes as your cardiovascular system responds to the new demand, a delay often called \"cardiac lag.\" This makes heart rate excellent for steady-state training, where you want to hold a genuinely sustainable aerobic effort over 40 minutes or two hours, because it reflects your body's actual internal strain rather than a number on a display. It makes heart rate frustrating for interval work: by the time your heart rate has climbed into the target zone on a 3-minute rep, the rep might be half over, and by the time it settles after a hard effort, the recovery interval might already be ending."
		},
		{
			heading: 'What running power actually measures',
			body: "Running power estimates the mechanical work rate your body is producing — force and motion combined into watts — independent of how your cardiovascular system happens to be responding that day. This is why power reacts instantly to a change in effort: accelerate into a hill and your power number jumps immediately, not thirty seconds later. It's also why power stays consistent across conditions that confuse pace: a headwind, a hill, or soft trail surface all slow your pace for the same physiological effort, but a well-calibrated power meter shows the effort staying roughly level. The trade-off is that running power is a newer, less standardised technology than heart-rate monitoring, and, critically, different manufacturers measure genuinely different things and call them all \"power.\""
		},
		{
			heading: "Critical Power, Threshold Power, and MAP are three different metrics, not one",
			body: "This is the single most misunderstood fact about running power, and it trips up even experienced athletes switching devices. Stryd's zones are built around Critical Power (CP): the highest power output you can sustain indefinitely before fatigue accumulates, derived from modelling multiple all-out efforts of different durations. Garmin uses a broadly similar concept it calls Threshold Power, calculated from its own algorithm rather than Stryd's. Polar instead uses Maximal Aerobic Power (MAP), derived from a single 6-minute all-out test — a meaningfully different physiological construct to CP even though the unit on screen is watts in both cases. A Stryd CP of 280W and a Garmin Threshold Power of 280W do not represent the same running effort, because the underlying models producing that number are different. Anyone switching devices, or comparing power numbers with a training partner who uses a different brand, needs to treat the two numbers as non-interchangeable rather than assuming watts are watts."
		},
		{
			heading: 'Heart rate zones: Max HR percentage vs LTHR',
			body: "Within heart-rate training there's a second choice worth understanding: zones set as a percentage of maximum heart rate, or Joe Friel's method of setting zones relative to lactate threshold heart rate (LTHR). Max-HR-percentage zones are simple but only as accurate as your maximum heart rate figure, which most runners never measure directly and instead estimate from an age-based formula that can be off by ten or more beats per minute for a meaningful fraction of people. LTHR-based zones anchor to a heart rate you can actually establish with a focused effort — a 30-minute time trial, using your average heart rate over the final 20 minutes as a close approximation — and tend to track training-specific fitness more precisely as a result, which is why TrainingPeaks and many endurance coaches default to the LTHR method over simple Max HR percentages."
		},
		{
			heading: 'Where each method genuinely wins',
			body: "On flat, calm, controlled terrain — a track, a canal towpath, a treadmill — pace is usually the simplest and most reliable target of all three, since there's nothing external distorting it. Heart rate earns its keep on long, steady aerobic efforts where you want to guard against unconsciously drifting too hard, and on hot or humid days where \"cardiac drift\" (heart rate climbing at a constant pace as the run goes on) is a genuinely useful early-warning signal that pace alone would miss entirely. Power earns its keep on hilly or windy routes, and on interval sessions where its near-instant responsiveness lets you hit a target effort within the first few seconds of a rep rather than the last."
		},
		{
			heading: 'Using both instead of choosing one',
			body: "In practice, most runners who train with a power meter don't abandon heart rate, and vice versa. A common, effective pattern is targeting power (or pace) as the primary number during a session, while keeping an eye on heart rate as a secondary check on how hard the effort is actually costing you physiologically — useful for spotting an off day early, before a session that looks fine on paper turns into unproductive overreaching. Neither number lies, but each tells you a different part of the story, and a runner who understands both is better equipped to make sense of a session than one relying on either number alone."
		},
		{
			heading: 'A practical way to decide, session by session',
			body: "Rather than picking one metric permanently, it helps to ask two quick questions before each run: is the terrain and weather stable enough that pace alone would be reliable, and does the session need an instant response (short reps, surges) or a settled, sustained one (a long steady run)? Flat, calm conditions plus a sustained effort usually make pace the simplest choice. Variable terrain or weather plus a sustained effort points towards heart rate, since it will surface genuine physiological strain that pace and power both miss. Any session built around short, sharp efforts — hill reps, track intervals — points towards power precisely because heart rate's lag makes it nearly useless for judging effort within a rep that's over in under a minute. Building this habit turns 'which metric should I use' from an abstract debate into a five-second decision made fresh for each run."
		}
	]
};
