import type { GuideContent } from './types';

export const guide: GuideContent = {
	slug: 'understanding-vdot',
	route: '/guides/understanding-vdot',
	title: 'Understanding VDOT and how it drives your training paces',
	excerpt:
		"A deep dive into Jack Daniels' VDOT system: what the number actually represents, how it's derived from a race result, and why it produces better training paces than age- or feel-based guesses.",
	sourcesCredited: ["Jack Daniels' VDOT method"],
	intro:
		"Most runners who use a training-pace calculator treat VDOT as a black box: type in a recent race time, get back five paces, move on. That's a perfectly reasonable way to use the tool, but understanding what VDOT actually measures — and why Jack Daniels built it the way he did — makes it much easier to trust the numbers, know when to update them, and avoid the most common way runners misuse them.",
	sections: [
		{
			heading: 'VDOT is not a lab measurement',
			body: "VDOT looks like a laboratory VO2 max score, and the two are closely related, but they are not the same thing. A true VO2 max test measures how much oxygen your body consumes at maximal effort, in a lab, on a treadmill or bike, with a mask strapped to your face. VDOT is a performance-derived estimate: Daniels and his co-author Jimmy Gilbert built a mathematical model that works backwards from a race result to a number that behaves like VO2 max for the purposes of predicting training paces and equivalent race times, while also folding in running economy — how efficiently you convert oxygen into forward motion. Two runners with identical lab-measured VO2 max scores can have meaningfully different VDOT values if one is a more economical runner, because VDOT is calibrated against real race performance, not oxygen consumption alone."
		},
		{
			heading: "Why a race result, and not a formula based on age or resting heart rate",
			body: "Plenty of training-pace systems start from age-predicted maximum heart rate or a generic fitness questionnaire. Daniels deliberately avoided this. A race or honest time-trial result reflects everything that determines running performance at once: aerobic capacity, running economy, lactate threshold, and even psychological factors like pacing discipline, all compressed into a single number that has already been proven to hold up over a real distance under real conditions. An age-based formula has no way of knowing whether you're a lifelong runner in your fifties who out-performs untrained 25-year-olds, or the reverse. Feeding the model an actual performance sidesteps that problem entirely, which is also why re-testing periodically (see below) matters more than getting the exact input distance right."
		},
		{
			heading: 'From VDOT to five distinct training paces',
			body: "Once a VDOT value is known, Daniels' tables translate it into five paces, each targeting a different physiological system rather than an arbitrary fraction of race pace. Easy pace develops the aerobic base — mitochondrial density, capillarization, fat-burning efficiency — with minimal structural stress, which is why it's deliberately slow relative to what many runners feel they \"should\" be running. Marathon pace sits just below that, calibrated to be sustainable for the specific muscular and glycogen demands of racing 26.2 miles rather than simply being an average of easy and threshold. Threshold pace targets the lactate threshold directly: the fastest pace sustainable for roughly an hour before lactate accumulates faster than it can be cleared. Interval pace, run at closer to VO2 max effort, stresses the cardiovascular system's ceiling with short enough reps that lactate doesn't force an early stop. Repetition pace is the fastest and most explosive, run with full recovery, aimed at running economy and neuromuscular speed rather than aerobic adaptation at all. Running quality volume at the wrong one of these — threshold-pace efforts mislabelled as intervals, for instance — is one of the most common ways a structured plan under-delivers."
		},
		{
			heading: 'Why the paces are ranges, not fixed numbers',
			body: "A well-built VDOT table gives a range for each zone rather than a single pace, and that range is doing real work, not just hedging. Heat, humidity, altitude, sleep debt, and accumulated training fatigue can all shift what a given physiological effort feels like on a given day without changing your underlying fitness. Running at the faster end of the Easy range on a cool, fresh morning and the slower end after a hard week of training is still training at the correct intensity; chasing a single fixed pace regardless of conditions is not. The same logic applies to interval and repetition work, where running slightly slower than the top of the range on tired legs still delivers the intended stimulus, whereas forcing the pace can turn a controlled VO2 max session into an uncontrolled one that bleeds into overtraining risk."
		},
		{
			heading: 'When your VDOT is stale — and why that matters more than precision',
			body: "The single biggest way runners misuse VDOT is entering a result that no longer reflects their current fitness: a marathon PB from two years ago, a 5K run in extreme heat, or a time trial on a hilly, uneven course. Because every downstream pace is derived from that one number, an outdated or poor-quality input doesn't just shift one pace slightly, it shifts all five in the same direction, compounding the error across an entire training block. The fix isn't to chase a more precise VDOT calculation; a VDOT of 44 versus 44.5 makes a negligible difference to your paces. The fix is re-testing with a recent, honestly-paced result every few months, especially after a training block that should have moved your fitness meaningfully. A runner training consistently at yesterday's paces because they never updated their input number is one of the most common — and most avoidable — reasons progress plateaus despite training hard."
		},
		{
			heading: 'Where VDOT fits alongside heart rate and power',
			body: "VDOT-derived paces work well precisely because pace is a direct, unambiguous measure of output: a given pace means the same thing every time you run it on a flat, calm course. That's also its weakness — pace doesn't account for wind, hills, heat, or fatigue the way heart rate or power can. Many runners use VDOT paces as their primary target on flat, controlled sessions (track intervals, a measured tempo loop) and cross-check against heart rate or running power on variable terrain, where a fixed pace target would either undercook or overcook the intended effort. None of the three methods is strictly better; each answers a slightly different question about how hard you're actually working."
		}
	]
};
