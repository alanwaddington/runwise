import type { GuideContent } from './types';

export const guide: GuideContent = {
	slug: 'reading-your-vo2max',
	route: '/guides/reading-your-vo2max',
	title: 'Reading your VO2 max estimate: what it means and how to improve it',
	excerpt:
		"A race-derived VO2 max estimate can differ from your GPS watch's number and still both be 'right'. Here's what VO2 max actually measures, how the ACSM fitness categories work, and what actually moves the number.",
	sourcesCredited: ["Jack Daniels' VDOT method", "ACSM normative VO2 max data"],
	intro:
		"VO2 max is one of the most quoted numbers in endurance sport, and one of the most commonly misunderstood. It's treated as a single, objective fitness score, compared obsessively between training partners and across GPS watch brands, when it's actually a specific, narrowly-defined physiological measurement with real limits on what it can and can't tell you about how fast you'll run on race day.",
	sections: [
		{
			heading: 'What VO2 max is actually measuring',
			body: "VO2 max is the maximum rate at which your body can take in, transport, and use oxygen during exercise, typically expressed in millilitres of oxygen per kilogram of body weight per minute. Measured properly, it requires a graded treadmill or bike test to voluntary exhaustion while breathing through a mask connected to a gas-analysis system in an exercise physiology lab, tracking the point where oxygen consumption plateaus despite further increases in effort. Almost nobody training for a race has access to that setup regularly, which is exactly why estimation methods — from race results to wrist-based sensors — exist, and exactly why it's worth understanding that every estimate is an approximation of that lab measurement, not a replacement for it."
		},
		{
			heading: 'Race-derived estimates vs GPS-watch estimates',
			body: "A race-result-based estimate (the VDOT method used here) works backwards from an actual competitive performance: because VDOT accounts for running economy as well as raw oxygen consumption, it tends to reflect how fast you can actually race, which is usually what runners care about most. A GPS watch's continuous VO2 max estimate instead works forwards, inferring fitness in real time from patterns in your heart rate and pace across easy training runs. The two methods can reasonably disagree by several points, and both can be \"correct\" in the sense of doing what they're designed to do: one estimates racing capability from a race, the other estimates trending fitness from everyday training data, using an entirely different data source and algorithm. A GPS watch estimate is also only as accurate as its heart-rate data and its assumed maximum heart rate setting, so an inaccurate max-HR configuration on the device can visibly skew its VO2 max number without your actual fitness having changed at all."
		},
		{
			heading: "Why the ACSM categories are relative, not absolute",
			body: "Once a VO2 max value is estimated, it's often placed into a fitness category — Very Poor through Superior — using normative data published by the American College of Sports Medicine (ACSM), built from population testing across six age brackets and both genders. The critical detail most people miss is that these are percentile bands within an age and gender group, not a fixed, universal scale. \"Good\" for a 60-year-old and \"Good\" for a 25-year-old correspond to genuinely different absolute VO2 max numbers, because aerobic capacity declines with age across the whole population, and the ACSM thresholds shift down accordingly for each older bracket. This is precisely why the same finishing time from two runners of different ages can land in different categories: a 45-minute 10K might sit in the \"Excellent\" band for a runner in their forties but only \"Good\" for a runner in their twenties, purely because the underlying age-based thresholds are calibrated differently, not because the older runner is somehow the fitter of the two in absolute terms."
		},
		{
			heading: 'What genuinely moves VO2 max',
			body: "VO2 max responds most reliably to two complementary types of training: a large aerobic base of easy, sustained running, which builds the capillary density and mitochondrial machinery needed to deliver and use oxygen efficiently, and periodic high-intensity work at or above the threshold and interval paces derived from your training-pace calculation, which stresses the cardiovascular system's ceiling directly. Neither alone tends to produce as much improvement as the combination; easy running alone builds a strong base but doesn't push the ceiling much higher, while high-intensity work without an aerobic base to support it produces diminishing returns and elevated injury risk. Consistency over months, rather than any single standout session, is what actually shifts the number."
		},
		{
			heading: 'Why gains slow down with training age',
			body: "A runner in their first year of structured training can often see VO2 max climb noticeably within a few months, simply because there's so much low-hanging physiological adaptation available: an untrained cardiovascular and muscular system responds quickly to any consistent stimulus. An experienced runner with a decade of training behind them is working much closer to their individual genetic ceiling, and can expect a fraction of that rate of improvement even from very well-structured training, sometimes with VO2 max barely moving at all while race times still improve through gains in running economy, fuelling, or pacing. Plateauing VO2 max after years of training is not, by itself, a sign that training is going wrong; it's an expected feature of how trainable the metric is at different points in an athlete's development."
		},
		{
			heading: 'The honest limits of any VO2 max number',
			body: 'However it\'s derived, VO2 max explains a meaningful share of endurance performance but not all of it. Running economy, lactate threshold as a percentage of VO2 max, pacing discipline, fuelling strategy, and even mental resilience under fatigue all contribute independently to race-day results, which is why two runners with an identical VO2 max estimate can produce noticeably different race times. Treat the number as one useful data point for tracking your own trend over months, not as a scoreboard for comparing yourself against training partners, GPS watch brands, or anyone whose training history and running economy you can\'t see.'
		}
	]
};
