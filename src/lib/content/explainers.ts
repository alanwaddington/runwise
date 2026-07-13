export interface ExplainerSection {
	heading: string;
	body: string;
}

export interface PageExplainerContent {
	heading: string;
	intro: string;
	sections: ExplainerSection[];
}

export const EXPLAINERS: Record<string, PageExplainerContent> = {
	'/pace': {
		heading: 'About the pace calculator',
		intro:
			'Pace is how long it takes to cover a fixed distance, the inverse of speed. Runners in the US typically think in minutes per mile, most of the rest of the world in minutes per km, and race organisers often quote speed in km/h. This tool converts between all of them instantly, so you never have to do the maths on the fly.',
		sections: [
			{
				heading: 'Why per-400m and per-800m paces?',
				body: 'Track sessions and interval workouts are usually prescribed per lap (400m) or half-lap-plus (800m) rather than per km or mile. Converting your target pace into these units makes it easy to read a stopwatch mid-session without doing mental maths.'
			},
			{
				heading: 'mph vs km/h',
				body: 'Race organisers, treadmill displays, and some coaching plans use speed rather than pace. Speed and pace are reciprocals of each other, so this calculator keeps both in sync as you type.'
			},
			{
				heading: 'Worked example',
				body: 'Say your last parkrun was 25:00 for 5K, a pace of 5:00 min/km. Enter 5:00 into the min/km field and the calculator instantly shows 8:03 min/mile, 12.0 km/h, 7.5 mph, 2:00 per 400m, and 4:00 per 800m — everything you need to plan an interval session or check a treadmill display against your race pace.'
			},
			{
				heading: 'Common pace equivalents',
				body: 'A few reference points worth knowing: 4:00 min/km (6:26 min/mile) is roughly sub-3-hour marathon pace; 5:00 min/km (8:03 min/mile) is a solid recreational 10K pace; 6:00 min/km (9:39 min/mile) suits most easy long runs. Use these as sanity checks when converting between units.'
			},
			{
				heading: 'Treadmill settings',
				body: 'Most treadmills display speed in km/h or mph rather than pace, and gradient affects effective effort even at a fixed speed. If you are matching an outdoor pace on a treadmill, use the km/h or mph figure from this calculator as your starting point, then adjust by feel once you factor in the belt\'s lack of wind resistance and any incline.'
			}
		]
	},
	'/race-predictor': {
		heading: 'About the race time predictor',
		intro:
			'Predicting a finish time for one distance from a real result at another relies on Pete Riegel\'s widely used endurance-running formula: T₂ = T₁ × (D₂ / D₁)^1.06. Riegel developed it in 1977 after analysing thousands of race results across distances from 3 miles to beyond marathon, and it remains one of the most-cited prediction models in distance running.',
		sections: [
			{
				heading: 'Why the 1.06 exponent?',
				body: 'The exponent models how running speed naturally drops off over longer distances due to fatigue. 1.06 is the value Riegel found to fit a wide range of real race results, from 5K through marathon, reasonably well.'
			},
			{
				heading: 'Worked example',
				body: 'A 10K finish of 45:00 (2700 seconds) predicts a half marathon time via T₂ = 2700 × (21.0975/10)^1.06 ≈ 5957 seconds, or about 1:39:17. The same formula scaled down predicts a 5K of roughly 21:35 — always check the prediction against how the training leading into your target race has actually gone.'
			},
			{
				heading: 'Limitations',
				body: 'Predictions are most accurate when the two distances are reasonably close and your training matches the target distance. For example, a 5K time-trial predicts a 10K well, but is a rougher estimate for a marathon if you have not done any long runs. Terrain, weather, and pacing strategy on race day are not accounted for.'
			},
			{
				heading: 'Riegel vs other models',
				body: 'Riegel is not the only prediction method — VDOT-based tables (see the Training Paces calculator) and Cameron\'s formula are common alternatives. Riegel tends to be more optimistic than VDOT for marathon predictions from short-distance results, because it does not separately model the endurance demands of very long races. When the two disagree by more than a few minutes, lean towards the more conservative estimate.'
			},
			{
				heading: 'When to re-test',
				body: 'A prediction is only as good as the input time. If your most recent race result is more than a few months old, or your training volume has changed significantly since then, a fresh time-trial at 5K or 10K will give a more reliable base for predicting your next target race.'
			}
		]
	},
	'/training-paces': {
		heading: 'About the training pace calculator',
		intro:
			'Jack Daniels\' VDOT method turns a recent race result into a set of training paces matched to your current fitness, rather than generic paces based on age or experience level. It is one of the most widely used frameworks in distance-running coaching, underpinning training plans from beginner 5K programmes to elite marathon build-ups.',
		sections: [
			{
				heading: 'What is VDOT?',
				body: 'VDOT is a single number derived from a race performance that reflects your current running fitness: a blend of aerobic capacity and running economy. It is the basis for looking up the training paces below, and for predicting equivalent times at other distances.'
			},
			{
				heading: 'The five training paces',
				body: 'Easy paces build aerobic base with low strain. Marathon pace trains race-specific endurance. Threshold pace improves your lactate threshold, the fastest pace you can sustain for about an hour. Interval pace targets VO2 max at a hard-but-controlled effort. Repetition pace is the fastest of the five, developing running economy and speed with full recoveries between reps.'
			},
			{
				heading: 'Worked example',
				body: 'A 22:00 5K works out to roughly VDOT 44.5. At that VDOT, easy pace sits around 5:29–5:57 min/km, marathon pace around 4:54–5:09 min/km, threshold around 4:33–4:40 min/km, interval around 4:13–4:18 min/km, and repetition around 3:51–4:03 min/km. Enter your own result to get ranges tailored to your fitness rather than these illustrative figures.'
			},
			{
				heading: 'Choosing which race result to enter',
				body: 'VDOT is most accurate from a recent, honestly-paced race or time trial of 3K–half marathon, run in reasonable conditions. Avoid using times from races run in extreme heat, on hilly courses, or well below your current fitness (for example, a marathon PB from two years ago) — recompute from something recent instead.'
			},
			{
				heading: 'Applying the paces in training',
				body: 'These are ranges, not fixed targets: run at the slower end on tired legs or in poor conditions, and the faster end when you are fresh. As your fitness improves, re-enter a new race result every few months to keep the paces current — training at outdated, too-easy paces is one of the most common ways progress stalls.'
			}
		]
	},
	'/hr-zones': {
		heading: 'About heart rate zones',
		intro:
			'Training zones split your effort range into bands, each targeting a different physiological adaptation. This calculator supports two ways of setting them: a percentage of maximum heart rate, or Friel\'s lactate threshold heart rate (LTHR) method.',
		sections: [
			{
				heading: 'Max HR vs LTHR',
				body: 'The Max HR method sets zones as percentages of your maximum heart rate, which is simple but can be inaccurate if your true max is unknown or estimated. The LTHR method sets zones relative to your lactate threshold heart rate (the heart rate at your threshold effort), which tends to track training-specific fitness more precisely, and is the method used by TrainingPeaks and many endurance coaches.'
			},
			{
				heading: 'Using zones in training',
				body: 'Most easy running should sit in Zone 1–2, building aerobic base without excess fatigue. Zone 3 is often called the "grey zone": hard enough to add fatigue but not targeted enough to build much fitness, so many training plans deliberately avoid spending much time there. Zones 4–5 are reserved for threshold and interval work.'
			},
			{
				heading: 'Worked example',
				body: 'A 35-year-old with no known max HR can estimate one using the Tanaka formula, 208 − 0.7 × age, giving 208 − 24.5 ≈ 184 bpm. Feeding that into the Max HR method puts Zone 2 (aerobic base) at roughly 110–129 bpm and Zone 4 (threshold) at roughly 147–166 bpm.'
			},
			{
				heading: 'Finding your LTHR',
				body: 'The most reliable way to find LTHR is a 30-minute time-trial at maximum sustainable effort: average heart rate over the final 20 minutes is a close approximation of LTHR. If you don\'t have that data, a recent 10K or half marathon race average heart rate is a reasonable substitute, since both are run close to threshold effort.'
			},
			{
				heading: 'Why your watch\'s zones might differ',
				body: 'GPS watches often set zones from a max heart rate figure calculated from your age out of the box, which can be off by 10–15 bpm for some individuals. If your watch\'s zones consistently feel too easy or too hard relative to perceived effort, entering a directly measured max HR or LTHR here will usually give more accurate bands than the device default.'
			}
		]
	},
	'/vo2max': {
		heading: 'About the VO2 max estimator',
		intro:
			'VO2 max is the maximum rate at which your body can use oxygen during exercise, and one of the strongest predictors of endurance running performance. This tool estimates it from a race result using the VDOT method, rather than requiring a lab test.',
		sections: [
			{
				heading: 'How the estimate is calculated',
				body: 'Your race time and distance are converted to a VDOT value using Jack Daniels\' formula, which closely tracks VO2 max while also accounting for running economy. The result is then compared against ACSM age- and gender-based norms to place you in a fitness category.'
			},
			{
				heading: 'Why it may differ from your GPS watch',
				body: 'Devices like Garmin and Coros estimate VO2 max continuously from heart rate and pace trends, which can run several points higher or lower than a race-derived estimate, especially if your watch\'s max heart rate setting is inaccurate. Treat both figures as estimates rather than exact physiological measurements.'
			},
			{
				heading: 'Worked example',
				body: 'A 45-year-old male running a 45:00 10K has a VDOT of roughly 45.3, which falls in the "Excellent" ACSM category for his 40-49 age bracket (threshold 42.4). The same time from a 25-year-old male sits one band lower, in "Good" territory, since the 20-29 age bracket has higher thresholds across the board (42.5 for Good, 46.8 for Excellent) — a reminder that VO2 max category is always relative to age and gender, not an absolute fitness score.'
			},
			{
				heading: 'What the fitness categories mean',
				body: 'The six categories, from Very Poor to Superior, come from the ACSM\'s published normative data across six age brackets (20-29 through 70-79) for both genders. They are population percentile bands, not fixed performance targets — "Good" for a 60-year-old and "Good" for a 25-year-old correspond to very different absolute VO2 max values, since aerobic capacity naturally declines with age.'
			},
			{
				heading: 'Improving VO2 max',
				body: 'VO2 max responds most to sustained aerobic training combined with periodic high-intensity work near or above threshold — the Interval and Repetition paces on the Training Paces calculator. Gains are fastest for newer runners and level off with training age, so an experienced runner should expect smaller year-on-year improvements than someone in their first year of structured training.'
			}
		]
	},
	'/parkrun': {
		heading: 'About the parkrun predictor',
		intro:
			'A recent training run or average pace can be used to estimate your parkrun (5K) time, which is then compared against your personal best and shown alongside an age-adjusted performance rating.',
		sections: [
			{
				heading: 'How predictions are calculated',
				body: 'Your input is converted to an equivalent 5K time using the Riegel formula, the same method behind the Race Time Predictor, adjusted for the specific distance and effort of your training run.'
			},
			{
				heading: 'How the age-adjusted rating works',
				body: 'Your time is expressed as a proportion of the age-adjusted world standard for your age and gender, using the WMA/Alan Jones age-factor tables. This lets you compare performances fairly across different ages: a 65-year-old and a 25-year-old running the same time can have very different ratings once age is accounted for.'
			},
			{
				heading: 'Worked example',
				body: 'A 21:00 5K from a 30-year-old male compares against the male open-class standard of 12:49 (769 seconds), adjusted by an age factor of essentially 1.0 at that age, giving a rating of roughly 61 out of 100. The same 21:00 from a 70-year-old male, whose age factor is 0.735, gives an age-adjusted standard closer to 17:26 — pushing the rating up to around 83 out of 100, in "Regional class" territory.'
			},
			{
				heading: 'What the rating bands mean',
				body: 'A rating of 100 or above is World class, 90-99 National class, 80-89 Regional class, and 70-79 Local class, with anything below classed as Recreational. Very few runners exceed 80 even at a strong club level, so a rating in the 60-70 range from consistent training is a solid, realistic benchmark for most recreational runners.'
			},
			{
				heading: 'Choosing a reference run',
				body: 'A recent 10K or longer run tends to give a more optimistic (faster) 5K prediction than a shorter, harder effort, because Riegel assumes similar relative fitness across distances — pick a training run or race result reasonably close to 5K in duration if you want the most realistic estimate.'
			}
		]
	}
};
