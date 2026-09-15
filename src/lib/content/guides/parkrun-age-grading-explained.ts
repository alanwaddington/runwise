import type { GuideContent } from './types';

export const guide: GuideContent = {
	slug: 'parkrun-age-grading-explained',
	route: '/guides/parkrun-age-grading-explained',
	title: 'How parkrun age-grading actually works, and how to use it well',
	excerpt:
		"A parkrun age-grade percentage lets a 65-year-old and a 25-year-old compare the same 5K time fairly. Here's where the WMA tables the calculation relies on actually come from, and the real limitations behind the single number.",
	sourcesCredited: ['WMA/Alan Jones age-grading tables', 'World Masters Athletics age-factor methodology'],
	intro:
		"A parkrun finishing time on its own tells you very little when comparing across ages: a 25-minute 5K from a 22-year-old and the same time from a 68-year-old represent very different levels of relative performance. Age-grading exists to solve exactly this problem, converting a raw time into a single percentage that's comparable across age and gender — but the tables behind that percentage have a specific history, a specific set of assumptions, and specific situations where they mislead just as easily as they clarify.",
	sections: [
		{
			heading: 'Where the age-factor tables come from',
			body: "Age-grading tables are built from analysing the best recorded performances at each age, across large populations of masters (age-graded) athletes over many decades of competition, to establish an 'age standard' — the best time realistically achievable at each age for a given distance and gender. Alan Jones has maintained and published the widely used WMA (World Masters Athletics) age-grading tables for years, periodically revising them as masters performances improve and more data becomes available; a table published in 2010 and one published a decade later can give meaningfully different ratings for the exact same time, simply because the underlying 'best achievable' standard has moved. This calculator uses a specific, dated version of the tables, which is why an age-grade percentage should be treated as a snapshot against a particular standard, not an eternal, unchanging fact about a performance."
		},
		{
			heading: 'How the percentage is actually calculated',
			body: 'The calculation itself is straightforward once the tables exist: your time is compared against the age-and-gender-adjusted "standard" time for someone at their absolute peak, expressed as a ratio. A time exactly matching the age standard scores 100%; running 10% slower than standard scores 90%, and so on. Two runners of different ages who both score, say, 75% have both run equally impressively relative to what\'s achievable for someone their age and gender — even though their raw finishing times might differ by several minutes.'
		},
		{
			heading: 'The performance bands, and why very few runners crack 80%',
			body: "The commonly cited bands are: 100%+ World Class, 90-99% National Class, 80-89% Regional Class, 70-79% Local Class, with anything below Local Class simply described as Recreational. These labels sound approachable but the underlying bar is genuinely elite: 90%+ is competition-level performance even among dedicated masters athletes, and the large majority of committed recreational runners, even those training seriously for years, tend to plateau somewhere in the 55-70% range. Treating a score in the 60s as unimpressive because it doesn't sound like a 'good percentage' misreads the scale — it's calibrated against the best performances ever recorded at that age, not against an average parkrunner."
		},
		{
			heading: "Age factors don't move in a straight line",
			body: 'A common misconception is that age-grading simply subtracts a fixed amount of time per year of age, but the actual age-factor curve is not linear: performance decline with age accelerates in some ranges and plateaus in others, differs meaningfully between genders, and differs between short and long distances because different physiological systems (raw speed vs endurance capacity) age at different rates. This is exactly why a fixed formula like "add 2% per year over 40" would misrepresent the tables\' actual shape, and why the tables themselves — built from real recorded data rather than a simple mathematical curve — remain the standard reference rather than an approximating formula.'
		},
		{
			heading: 'What age-grading cannot see',
			body: "Age-grading corrects for age and gender and nothing else: it has no way to know that one parkrun course is notoriously hilly and slow while another is flat and fast, that one run happened in calm 10°C conditions and another in blustery wind, or that a runner was carrying a minor niggle. Comparing age-grade percentages across different parkrun courses, or using a single run's percentage as a definitive verdict on current fitness, both stretch the tool beyond what it's designed to do. Age-grading is at its most useful for tracking your own trend on the same course over months and years, or for a rough, course-adjusted-if-you're-aware-of-it comparison between runners of very different ages on the same day."
		},
		{
			heading: 'Why the male and female age curves are calculated separately',
			body: "The tables maintain entirely separate age-standard curves for men and women rather than applying a single curve with a fixed offset, because the two genders don't just differ by a constant gap in absolute performance — the shape of age-related decline itself differs between them across the age range, particularly through the masters years. Building two independently-derived curves from two separately-analysed sets of real performance data, rather than assuming one gender's curve can be shifted to approximate the other, is precisely what makes it possible for a 55-year-old man and a 55-year-old woman running very different raw times to land on directly comparable age-grade percentages. It also means table revisions can, and sometimes do, adjust one gender's curve more than the other in a given update, if the underlying data shows their respective age-related decline rates have genuinely diverged from the previous version's assumptions."
		},
		{
			heading: 'Using age-grading to actually motivate training, not just rank runs',
			body: "The most productive way to use an age-grade percentage is as a personal trend line rather than a single-run scoreboard: tracking it across a season shows whether genuine fitness is improving even as the raw finishing time on a given course varies with conditions or effort level. A runner whose raw 5K time has stayed flat for a year but whose age-grade percentage has quietly climbed (because they've had a birthday and the age standard has shifted in their favour, or because a table revision has changed the baseline) is a useful reminder that the number reflects relative performance against a moving standard, not a pure, unchanging measure of fitness — one more reason to treat it as a helpful compass rather than a precise instrument."
		}
	]
};
