import type { ExplainerSection } from './explainers';

export const GUIDE_MIN_WORD_COUNT = 900;

export interface GuideContent {
	slug: string;
	route: string;
	title: string;
	excerpt: string;
	sourcesCredited: string[];
	intro: string;
	sections: ExplainerSection[];
}

export const GUIDES: GuideContent[] = [
	{
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
	},
	{
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
	},
	{
		slug: 'how-race-predictions-work',
		route: '/guides/how-race-predictions-work',
		title: 'How race time predictions actually work (and when to distrust them)',
		excerpt:
			"Pete Riegel's endurance formula predicts race times across distances with surprising accuracy, but it has real, well-documented blind spots. Here's how the model works and where it breaks down.",
		sourcesCredited: ["Pete Riegel's endurance-running formula (1977)"],
		intro:
			'Type a 10K time into a race predictor and it will confidently hand back a marathon time to the second. That precision is misleading in an important way: the formula behind it is a statistical fit to historical race data, not a law of physiology, and knowing where that fit holds up — and where it quietly stops applying to you — is the difference between using the number as a useful guide and being blindsided on race day.',
		sections: [
			{
				heading: "Where Riegel's formula comes from",
				body: 'In 1977, exercise physiologist Pete Riegel analysed a large set of world-class race results across distances from a few miles to well beyond marathon and found that finishing times followed a strikingly consistent pattern as distance increased: T₂ = T₁ × (D₂ / D₁)^1.06. The exponent, 1.06, captures a simple, near-universal fact about endurance performance — sustainable pace drops as distance increases, but not in direct proportion to the extra distance, because factors like glycogen depletion and cumulative fatigue compound rather than scale linearly. Riegel found that value fit real elite results well enough that the formula has remained a standard reference for over four decades, cited in coaching literature and built into most race-prediction tools, this one included.'
			},
			{
				heading: 'What the formula assumes about you',
				body: "Riegel's original dataset was built from elite, well-trained athletes racing at their genuine current fitness across both distances being compared. Baked into the formula, invisibly, is an assumption that your training has prepared you similarly well for both the input and target distances. A recreational runner who races a fast 5K off pure speed and minimal weekly mileage, then asks the formula to predict a marathon, is asking it to extrapolate into training territory the formula was never fit against. The model has no way to know that your endurance for a fourth consecutive hour of running hasn't been built the way an elite marathoner's has, because it only ever sees two numbers: a time and a distance."
			},
			{
				heading: 'Why it works best over a narrow distance range',
				body: "Riegel-style predictions are most trustworthy when the two distances are reasonably close together and your training profile suits both: a 5K predicting a 10K, or a 10K predicting a half marathon, tend to land close to reality for most consistently-trained runners. The further apart the two distances get, and the more one of them depends on endurance qualities the other doesn't touch, the more the prediction drifts from what actually happens on the day. A 5K time trial predicting a marathon is the classic failure case: 5K performance is disproportionately influenced by VO2 max and speed, while marathon performance is disproportionately influenced by glycogen management, fuelling, and hours spent on your feet, qualities a 5K effort simply doesn't test."
			},
			{
				heading: "Riegel vs VDOT-based predictions",
				body: "Riegel is not the only widely-used prediction model, and it's worth knowing it tends to disagree with Jack Daniels' VDOT-based equivalent-performance tables in a specific, predictable direction: Riegel is generally more optimistic than VDOT for marathon predictions made from short-distance results, because it doesn't separately model the distinct endurance demands of racing that long. VDOT's tables were built with marathon-specific data folded in, which tends to temper the prediction for runners without a strong long-run or marathon-specific training base. When the two disagree by more than a few minutes on a marathon prediction in particular, the more conservative of the two estimates is usually the safer one to plan pacing around, especially for a first-time marathoner with limited data on how their own endurance holds up late in a race."
			},
			{
				heading: 'What the formula cannot see: conditions, terrain, and pacing',
				body: 'Riegel takes exactly two inputs — a time and a distance — and therefore has no way to account for anything else that determines a real result: a hilly, technical course versus a flat, fast one; a hot, humid morning versus cool and calm; a disciplined even-paced effort versus a first-half sprint followed by a fade. Two runners with identical predicted times can have wildly different actual races if one is tackling a notoriously hilly course and the other a flat, record-eligible one. Treat a Riegel prediction as a training-fitness baseline to plan around, not a guaranteed finish-line time, and adjust your expectations for the specific course and conditions on the day using local knowledge the formula simply doesn\'t have access to.'
			},
			{
				heading: 'Keeping predictions fresh',
				body: "Because the formula is only as good as the time fed into it, a prediction based on a race from eighteen months ago, run at a very different fitness level, tells you almost nothing useful about where you stand today. The single highest-leverage thing you can do to keep a prediction trustworthy is feeding it a recent, honestly-paced result — ideally from the last two or three months, and ideally run in reasonable conditions rather than extreme heat or a deliberately conservative pace. A stale input doesn't just shift the prediction slightly; because the exponent compounds over distance, an outdated 5K time can throw a marathon prediction off by considerably more than the error in the original 5K result would suggest."
			},
			{
				heading: 'Using a prediction sensibly on race day',
				body: "The most useful way to treat a Riegel prediction is as a starting point for a pacing conversation with yourself, not a target to defend at all costs from the gun. A sensible approach is to line the predicted pace up against your actual training in the weeks beforehand — long runs, tempo sessions, how the taper felt — and adjust the plan up or down before the race rather than discovering the mismatch at mile 18. Runners who treat the number as gospel and go out exactly on predicted pace regardless of how the day feels are the ones most likely to blow up in the second half; runners who use it as one input among several, alongside how their legs actually feel on the day, tend to get much closer to the model's promise in practice."
			}
		]
	},
	{
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
	}
];
