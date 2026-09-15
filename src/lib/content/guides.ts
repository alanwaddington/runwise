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
	},
	{
		slug: 'understanding-running-pace',
		route: '/guides/understanding-running-pace',
		title: 'Understanding running pace: what it measures, and where it misleads you',
		excerpt:
			"Pace looks like the simplest number in running — distance over time — but GPS drift, terrain, and the difference between average and target pace trip up even experienced runners. Here's what pace actually tells you, and where it quietly lies.",
		sourcesCredited: ['GPS/footpod pace-measurement principles', "Jack Daniels' training-pace framework"],
		intro:
			"Pace feels like the one running metric that needs no explanation: distance divided by time, full stop. In practice it's the metric runners most often misread, because the number on a watch is an estimate built from noisy positioning data, and the number in a training plan is a target that means something quite different from an average. Understanding both gaps turns pace from a source of confusion — 'why did my watch say 4:45 on a flat road I've run at 5:00 for years' — into a tool you can trust.",
		sections: [
			{
				heading: 'Instantaneous pace vs average pace are different numbers, not different views of the same one',
				body: "A watch's real-time pace display is calculated from your GPS position over the last few seconds, which is why it visibly jumps around even when your effort feels perfectly steady: tree cover, tall buildings, and even how your arm swings while wearing the watch all introduce small position errors that get amplified once you divide a short distance by a short time. Average pace for a whole run or a completed kilometre smooths all of that out by using a much larger distance and time base, which is why the average at the end of a kilometre is almost always more trustworthy than whatever the instantaneous display showed you mid-way through it. Chasing the twitchy real-time number rep to rep is a common way runners inadvertently surge and fade rather than holding one genuinely even effort."
			},
			{
				heading: 'Why GPS pace drifts, and when to distrust it',
				body: "Standard GPS accuracy is typically quoted at 3-5 metres under open sky, which sounds tight until you realise a pace calculation over a short interval divides a small, error-prone distance by time — so the relative error is much larger than the absolute one suggests. Under tree canopy, between tall buildings, or in a stadium bowl, satellite signals reflect and multipath before reaching the watch, and pace can drift by 10-20 seconds per km or more from your true effort without you doing anything differently. A footpod or the watch's own accelerometer-based pace (many modern watches blend both) is generally more reliable exactly in those GPS-hostile conditions, which is why track sessions in particular are often more accurately paced by lap splits on a stopwatch than by a watch's live GPS pace."
			},
			{
				heading: 'Target pace is a range for a reason, not a number to hit exactly',
				body: "A training plan that prescribes 'Easy pace' or 'Threshold pace' is really prescribing a physiological effort, and a pace range (see the Training Paces calculator) is the practical way to express a moving target: heat, humidity, altitude, sleep debt, and accumulated fatigue all shift what pace corresponds to a given effort on a given day. Running at the faster end of an Easy range on a cool, fresh morning and the slower end after a hard training week can both be exactly correct; forcing a single fixed number regardless of conditions is usually the mistake, not a virtue of discipline. This matters most on hot days, where holding yesterday's flat-ground pace on a 28°C afternoon can push what should be an easy aerobic run into genuine cardiovascular strain."
			},
			{
				heading: 'Pace on hills, wind, and uneven terrain',
				body: "Pace is a measure of ground covered over time, and it has no way of knowing that ground was uphill, into a headwind, or across loose trail surface — all conditions that demand more physiological effort for the same number on the watch. A runner who holds 5:00/km effort-for-effort on a hilly out-and-back will show a slower pace on the climbs and a faster one on the descents despite exerting roughly the same energy throughout, which is exactly why pace alone is a poor primary metric for hilly or trail running compared to heart rate or running power (see Heart rate zones vs power zones), both of which respond to effort rather than ground covered. Where pace still works well on variable terrain is grade-adjusted pace, a feature on many GPS watches and platforms that estimates the flat-ground-equivalent effort of a hilly segment — useful for comparing trail efforts to road paces, though the underlying adjustment models are themselves estimates, not physical measurements."
			},
			{
				heading: 'Track pacing: per-lap and per-400m targets',
				body: "Interval sessions are usually prescribed per 400m or 800m rather than per km or mile, because that maps directly onto a standard outdoor track and lets you check pace with a stopwatch at each lap marker rather than doing mental arithmetic mid-rep. Converting a km-based target into a per-lap figure removes a common source of error: a runner mentally converting 4:00/km into 'about 1:36 a lap' on the fly, under fatigue, during a hard session, is exactly the kind of small miscalculation that compounds into a rep run 5-10 seconds off target. Precomputing the conversion before the session starts — this calculator does it automatically — removes that failure point entirely."
			},
			{
				heading: 'Treadmill pace needs its own adjustment',
				body: "A treadmill's belt does the work of moving the ground beneath you, which removes the small propulsive cost of pushing off stationary ground that outdoor running requires, and a treadmill run at 0% incline typically feels easier than the equivalent outdoor pace as a result. Many coaches recommend a 1% incline as a rough compensation for the absence of wind resistance and the assisted belt motion, though this is a widely used approximation rather than a precisely validated figure, and it will under- or over-correct depending on your speed and the specific treadmill. Use outdoor pace as your primary reference, and treat treadmill pace as approximately equivalent effort rather than an identical number, adjusting by feel once incline and belt assistance are accounted for."
			}
		]
	},
	{
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
	},
	{
		slug: 'running-power-zones-explained',
		route: '/guides/running-power-zones-explained',
		title: 'Running power zones explained: Critical Power, Threshold Power, and MAP',
		excerpt:
			"Running power meters all report watts, but Stryd, Garmin, and Polar calculate fundamentally different metrics under that shared unit. Here's what each one actually measures and why treating them as interchangeable causes real training errors.",
		sourcesCredited: ['Stryd Critical Power model', 'Garmin Threshold Power', 'Polar Maximal Aerobic Power (MAP)'],
		intro:
			"Cycling power meters mostly agree on what a watt means, because they're all measuring the same physical quantity: force applied to a crank, multiplied by cadence. Running power is younger and messier: there's no single agreed physical measurement point, manufacturers use different sensor technologies and different underlying models, and two devices reporting '250W' for the same runner at the same pace can mean genuinely different things. Understanding what your specific device is actually calculating is the difference between using running power well and quietly training off a misunderstood number.",
		sections: [
			{
				heading: 'Running power is estimated, not directly measured, for most runners',
				body: "Cycling power meters typically measure force directly at the pedal or crank. Most running power devices, Stryd included, instead use accelerometer data from a footpod or watch to estimate the mechanical work of running — vertical oscillation, ground contact time, leg spring stiffness, and forward motion combined into a model that outputs an estimated wattage, rather than a direct force measurement at the point of ground contact. This is why running power numbers can shift meaningfully with firmware updates (the underlying model changes) in a way that a mechanically simple cycling power meter's numbers generally don't, and why comparing power readings between different brands and even between firmware versions of the same brand deserves real caution."
			},
			{
				heading: 'Critical Power (Stryd)',
				body: "Critical Power (CP) is a well-established concept in exercise physiology, defined as the highest power output theoretically sustainable indefinitely before fatigue mechanisms force a decline — in practice, sustainable for a genuinely long duration rather than literally forever. Stryd estimates your CP by modelling the relationship between several all-out efforts of different durations, then extrapolating the power-duration curve to find its asymptote. Because it's derived from your own effort data rather than a single fixed-duration test, Stryd's CP estimate updates as your fitness changes and as you complete more all-out efforts across different durations, which is also why a CP estimate based on very limited data (a single hard effort) is less reliable than one built from several efforts spanning a range of durations."
			},
			{
				heading: 'Threshold Power (Garmin)',
				body: "Garmin's Threshold Power targets a broadly similar physiological concept to Critical Power — the power output at your lactate/functional threshold — but is calculated through Garmin's own proprietary algorithm rather than Stryd's CP model, using data from Garmin Running Power (built into recent watches) or a compatible third-party footpod. Because the two companies' models weight inputs differently and calibrate against different assumptions, a Garmin Threshold Power figure and a Stryd CP figure for the same runner, even measured on the same run, will typically not match exactly, and the gap between them isn't a sign either device is malfunctioning — it's a sign they're two different models of the same rough idea."
			},
			{
				heading: 'Maximal Aerobic Power (Polar)',
				body: "Polar's MAP is a meaningfully different metric to CP or Threshold Power, not just a different brand's calculation of the same one. MAP is derived from a single, structured 6-minute all-out running test, and represents the power output at your aerobic maximum for that specific test duration and protocol, closer conceptually to a VO2 max-adjacent metric than to a sustainable-threshold metric like CP. A Polar MAP value and a Stryd CP value are answering genuinely different physiological questions, which means the percentage-of-max zone breakdown built on top of each (this calculator applies each device's own published zone percentages to its own metric) produces zones that aren't directly comparable across brands even at the same nominal wattage."
			},
			{
				heading: 'Why the same watts don\'t mean the same effort across devices',
				body: "Because CP, Threshold Power, and MAP are three different underlying constructs, a runner switching from a Stryd footpod to a Garmin watch's built-in running power, or comparing zones with a training partner using Polar, cannot simply carry over a wattage number from one system to the other and expect it to represent the same effort. The correct approach is establishing a fresh baseline on whichever device you're actually training with — running the specific test or accumulating the specific data each brand's model requires — rather than assuming your old Stryd CP of 280W translates directly into a Garmin Threshold Power target of 280W. Getting this wrong is one of the most common practical mistakes runners make when switching hardware."
			},
			{
				heading: 'Wind, calibration, and why power still drifts a little',
				body: "Running power estimates are less affected by wind and terrain than pace, but 'less affected' is not 'unaffected': a strong headwind increases the mechanical work needed to hold a given pace, and while some running power models attempt to account for this, most footpod-based systems have no direct wind sensor and can only infer resistance indirectly from changes in your running mechanics, meaning heavy wind still introduces some error into the wattage reading. Footpod placement and fit matter too — a loosely laced shoe or a footpod that's slipped slightly from its calibrated position can shift readings by a meaningful margin, which is why manufacturers recommend periodic recalibration (often an auto-calibrating outdoor run at a steady effort) rather than treating a single initial setup as permanent. None of this makes running power unreliable, but it's worth knowing that a device's wattage reading carries a small, variable margin of error even under good conditions, larger than most runners assume from a number that displays with such apparent precision."
			},
			{
				heading: 'What power is genuinely good for, regardless of brand',
				body: "Despite the cross-brand inconsistency, running power's core strength holds regardless of which model produced it: it responds to effort within seconds rather than the tens of seconds to minutes heart rate takes to catch up, and it stays far more consistent than pace on hills, in wind, or across variable trail surfaces, because it's estimating the work your body is doing rather than the ground you're covering. This makes power especially valuable for interval and hill-repeat sessions where instant feedback matters, and on races or long runs across terrain variable enough that a fixed pace target would either undercook flat sections or blow you up on the climbs. Pick a device, learn its specific numbers, and treat power as internally consistent within that ecosystem rather than universally comparable across every runner and every brand."
			}
		]
	},
	{
		slug: 'interval-training-explained',
		route: '/guides/interval-training-explained',
		title: 'Interval and repetition training: why duration, recovery, and effort matter more than the number on your watch',
		excerpt:
			"Interval and repetition sessions are where pace, power, and heart rate disagree most sharply, because hard efforts are often over before any of them can fully respond. Here's what actually determines whether a hard session builds fitness or just builds fatigue.",
		sourcesCredited: ["Jack Daniels' VDOT training-intensity framework"],
		intro:
			'Interval and repetition sessions produce the most disagreement between pace, heart rate, and power of any training zone, precisely because they\'re short enough that none of the three metrics has time to fully "settle" before the rep ends. Understanding why that disagreement happens — and which of the three to actually trust moment-to-moment — is the difference between a hard session that builds the intended fitness and one that quietly turns into either an easy jog with pretensions or an overreaching slog.',
		sections: [
			{
				heading: "Interval training targets a different system than repetition training",
				body: "Despite often being grouped together as 'speed work', Interval and Repetition sessions target genuinely different physiological systems. Interval pace, run at an effort close to VO2 max, stresses the cardiovascular system's ceiling: the goal is spending meaningful time at or near your maximum oxygen uptake, which is why interval reps are long enough (typically 2-5 minutes) to actually reach that zone before recovery. Repetition pace, run faster still but with full recovery between reps, targets running economy and neuromuscular speed rather than aerobic capacity at all — reps are short (30 seconds to 2 minutes) specifically so fatigue from lactate accumulation doesn't limit how fast you can run, which is also why repetition work barely touches your cardiovascular system on the same axis interval work does."
			},
			{
				heading: 'Heart rate lag makes HR nearly useless for pacing a rep in real time',
				body: "Heart rate responds to a change in effort with a genuine physiological delay — tens of seconds to a couple of minutes depending on fitness and how large the effort jump is — because the cardiovascular system takes time to ramp up blood flow to match new metabolic demand. On a 3-minute interval rep, this means your heart rate might only reach the intended training zone in the final minute, and by the time it settles into recovery, the next rep may already be starting. Chasing a target heart rate number during a short, hard rep is one of the most common ways runners inadvertently start too fast (heart rate hasn't caught up yet, so the effort feels sustainable) and finish too conservatively (backing off once heart rate finally reads high, even though the rep is nearly over)."
			},
			{
				heading: 'Why pace or power, not heart rate, should drive the rep itself',
				body: "Because pace and running power both respond essentially instantly to a change in effort, they're the far more reliable moment-to-moment guide during a short, hard rep, with heart rate relegated to a secondary check on how the session is costing you physiologically across the whole workout rather than a target within any single rep. On a flat track or road, pace works well for this. On hilly or variable terrain where pace gets distorted by gradient, running power holds up better precisely because it doesn't care whether the ground is flat, since it's estimating output rather than ground covered (see Running power zones explained). Heart rate's real value in an interval session is retrospective: reviewing how quickly it recovered between reps, and whether it crept progressively higher across the session, both useful signals of accumulating fatigue that pace or power alone won't show you."
			},
			{
				heading: 'Recovery duration is not an afterthought — it defines the session',
				body: "The recovery period between reps is doing real physiological work, not just filling time before the next effort: a recovery that's too short doesn't allow enough lactate clearance and phosphocreatine replenishment for the next rep to hit its intended intensity, effectively turning a session of intervals into a longer, less-structured tempo effort. A recovery that's too long, conversely, lets the training stimulus fade between reps and can turn a genuine VO2 max session into a series of disconnected hard efforts with limited cumulative aerobic stress. Prescribed recovery ratios (often close to 1:1 for interval work and considerably longer, sometimes 1:3 or more, for repetition work) reflect how quickly each energy system actually recovers, and shortening recovery to 'make the session harder' usually changes what physiological system is being trained rather than simply intensifying the same one."
			},
			{
				heading: 'Why watch-detected "intervals" summaries can be misleading',
				body: "Many GPS watches auto-detect and summarise interval sessions by looking for repeated patterns of harder and easier effort, which is a useful post-run overview but not a reliable way to judge whether the session hit its intended target while you're actually running it. Auto-lap and auto-pause features, GPS pace noise during short reps (see Understanding running pace), and a watch's own definition of what counts as a 'rep' can all produce a tidy-looking summary that doesn't actually reflect whether each individual rep was run at the intensity the session called for. Treating the watch's own average-pace-per-detected-interval figure as ground truth, rather than checking splits against a stopwatch or a track's actual distance markers, is a quiet way sessions drift off target without the runner noticing."
			},
			{
				heading: "Common ways a hard session under-delivers",
				body: "The single most common failure mode is running the first rep of a session too fast — feeling fresh, chasing a number that felt easy — and then fading across the remaining reps as fatigue accumulates faster than expected, which converts an evenly-paced VO2 max stimulus into an uneven one that overstresses the first rep and undertrains the last. A close second is treating every hard session as an opportunity to run at maximum effort regardless of what the plan calls for, blurring the line between interval and repetition work and, over weeks, accumulating more high-intensity stress than a training plan's easy-to-hard balance was designed to absorb. Running the prescribed pace or power range for the prescribed duration, with the prescribed recovery, delivers the intended adaptation far more reliably than running whatever feels achievable on the day and calling it a good session."
			}
		]
	},
	{
		slug: 'how-runwise-builds-workouts',
		route: '/guides/how-runwise-builds-workouts',
		title: 'How structured workouts are built from your training paces',
		excerpt:
			"Knowing your training paces only answers half the question — a runner also needs to know how much quality work at each pace their current mileage can absorb. Here's the weekly-mileage scaling logic, warm-up sizing, and workout-format taxonomy behind every session this tool generates.",
		sourcesCredited: ["Jack Daniels' Running Formula (weekly-mileage scaling and workout-format conventions)"],
		intro:
			"A training-pace calculator can tell you exactly how fast to run your Threshold or Interval work, but it can't tell you how much of that work is appropriate for someone running 40km a week versus someone running 100km a week — and prescribing the same volume to both is either wasteful for the first runner or injurious for the second. This tool's workout generator exists to close that gap, turning a set of paces into concrete, ready-to-run sessions sized to your actual training load, using scaling rules and format conventions drawn from Jack Daniels' published coaching methodology.",
		sections: [
			{
				heading: 'Quality volume scales as a percentage of weekly mileage, not a fixed number',
				body: "Rather than prescribing a fixed number of kilometres or minutes at each intensity regardless of how much a runner trains overall, the underlying model scales each zone's quality-session volume as a percentage of current weekly mileage: Easy work gets the largest share (25-30%), tapering down through Marathon (15-20%), Threshold (10%), Interval (8%), to Repetition (5%). This reflects a genuine physiological constraint — a body can safely absorb a certain proportion of high-intensity work relative to its overall training volume, and that proportion shrinks as intensity rises, because harder efforts create disproportionately more fatigue and injury risk per minute than easier ones. An absolute per-session cap is layered on top of the percentage so the numbers stay sensible even at very high weekly mileage, where a pure percentage calculation would otherwise prescribe an unrealistically long single session."
			},
			{
				heading: 'Why interval and repetition sessions are duration-based, not distance-based',
				body: "Easy, Marathon, and Threshold sessions in this tool are generally built around a target distance at a target pace, but Interval and Repetition work is deliberately duration-based instead — reps are specified in minutes, not metres. This mirrors standard coaching practice: at high intensity, the physiological stimulus depends primarily on how long you sustain the effort and how much recovery separates reps, not on the exact distance covered, and a fixed-time rep naturally adjusts its distance to whatever pace you're actually capable of on a given day without requiring you to recalculate splits mid-session. It also sidesteps a subtle problem with fixed-distance high-intensity reps: a runner having an off day is forced to either run the full prescribed distance at a slower-than-intended pace (changing what's being trained) or cut the rep short, whereas a duration-based rep at the intended pace simply covers slightly less ground and still delivers the intended stimulus."
			},
			{
				heading: 'Warm-up and cool-down are scaled to the session, not fixed',
				body: "Each generated workout's warm-up and cool-down durations scale independently based on the session's own intensity and length, rather than using a flat '10 minutes each' rule regardless of what follows: harder, more demanding sessions (Interval, Repetition) get proportionally longer warm-ups to properly prepare the neuromuscular and cardiovascular systems for near-maximal effort, while Easy sessions need comparatively little preparation since the work itself is already gentle. Cool-down is typically shorter than warm-up across the board, reflecting that the primary purpose — bringing heart rate down gradually and beginning the clearance of metabolic byproducts — needs less time than fully preparing the body to perform at intensity in the first place."
			},
			{
				heading: 'Why each zone offers several workout formats instead of just one',
				body: "A single workout format per zone would mean identical sessions week after week, which is both demotivating and physiologically suboptimal, since varying the specific stimulus within a zone (continuous efforts, repeats, pyramids, ladders, progressions, fartlek-style surges) trains slightly different aspects of the same broad intensity while keeping training fresh. Easy zone workouts, for instance, include a steady continuous run, a longer run using a larger weekly-mileage share, and an easy fartlek with light pickups — all firmly Easy-zone efforts, but varying enough to prevent a training block from feeling monotonous. Harder zones (Threshold, Interval, Repetition) lean more on repeats, pyramids, and ladders specifically because varying rep length and recovery pattern within a hard session is an established way to extend how long an athlete can sustain quality work at that intensity."
			},
			{
				heading: 'The Recovery Options are deliberately not scaled to your mileage',
				body: "Unlike every other workout card, the Recovery Options offered alongside Repetition-zone work — an easy float, recovery striders, and a shakeout run — are fixed, flexible-duration sessions rather than volume-scaled prescriptions, because their purpose is fundamentally different from the rest of the plan: they exist to aid recovery on an easy or rest day, not to deliver a specific training stimulus proportional to weekly mileage. Scaling a recovery session's length to a runner's overall training volume would work against its purpose, potentially turning what should be a genuinely restorative, low-key session into one long enough to add meaningful fatigue for a high-mileage runner."
			},
			{
				heading: 'Race-Prep periodization: why the plan has exactly four phases',
				body: "The Race-Prep mode's four-phase structure — Build Aerobic Base, Strength, Peak VO2 Max, Taper — reflects a standard short-cycle periodization model for a 4-8 week window before a race: building the aerobic engine first, layering in muscular and lactate-threshold strength once that base exists, sharpening with VO2 max-focused work as the race approaches, then shedding accumulated fatigue in a final taper week while retaining race-pace feel. This deliberately doesn't include a dedicated Repetition/speed phase, because a 4-8 week block peaking at Interval-zone work doesn't have room for a distinct speed-development phase the way a longer, multi-month training cycle might — the plan is intentionally scoped to what's achievable and beneficial in a short pre-race window rather than attempting a full periodization model regardless of how little time is available."
			}
		]
	},
	{
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
				body: "Pace measures ground covered over time: simple, universally understood, and completely blind to hills, wind, or terrain (see Understanding running pace). Heart rate measures your cardiovascular system's response to effort, which makes it a genuine physiological signal but one that lags behind sudden changes in effort by tens of seconds to a couple of minutes (see Interval training explained). Running power estimates the mechanical work rate your body produces, responding almost instantly to effort changes and staying consistent across variable terrain, at the cost of being a newer, less standardised technology where different brands' numbers aren't directly comparable (see Running power zones explained). None of the three is a flawed version of the others; they're three different instruments built to answer three different questions."
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
	}
];
