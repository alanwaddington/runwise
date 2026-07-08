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
			'Pace is how long it takes to cover a fixed distance, the inverse of speed. Runners in the US typically think in minutes per mile, most of the rest of the world in minutes per km, and race organisers often quote speed in km/h. This tool converts between all of them instantly.',
		sections: [
			{
				heading: 'Why per-400m and per-800m paces?',
				body: 'Track sessions and interval workouts are usually prescribed per lap (400m) or half-lap-plus (800m) rather than per km or mile. Converting your target pace into these units makes it easy to read a stopwatch mid-session without doing mental maths.'
			},
			{
				heading: 'mph vs km/h',
				body: 'Race organisers, treadmill displays, and some coaching plans use speed rather than pace. Speed and pace are reciprocals of each other, so this calculator keeps both in sync as you type.'
			}
		]
	},
	'/race-predictor': {
		heading: 'About the race time predictor',
		intro:
			'Predicting a finish time for one distance from a real result at another relies on Pete Riegel’s widely used endurance-running formula: T₂ = T₁ × (D₂ / D₁)^1.06.',
		sections: [
			{
				heading: 'Why the 1.06 exponent?',
				body: 'The exponent models how running speed naturally drops off over longer distances due to fatigue. 1.06 is the value Riegel found to fit a wide range of real race results, from 5K through marathon, reasonably well.'
			},
			{
				heading: 'Limitations',
				body: 'Predictions are most accurate when the two distances are reasonably close and your training matches the target distance. For example, a 5K time-trial predicts a 10K well, but is a rougher estimate for a marathon if you have not done any long runs. Terrain, weather, and pacing strategy on race day are not accounted for.'
			}
		]
	},
	'/training-paces': {
		heading: 'About the training pace calculator',
		intro:
			'Jack Daniels’ VDOT method turns a recent race result into a set of training paces matched to your current fitness, rather than generic paces based on age or experience level.',
		sections: [
			{
				heading: 'What is VDOT?',
				body: 'VDOT is a single number derived from a race performance that reflects your current running fitness: a blend of aerobic capacity and running economy. It is the basis for looking up the training paces below, and for predicting equivalent times at other distances.'
			},
			{
				heading: 'The five training paces',
				body: 'Easy paces build aerobic base with low strain. Marathon pace trains race-specific endurance. Threshold pace improves your lactate threshold, the fastest pace you can sustain for about an hour. Interval pace targets VO2 max at a hard-but-controlled effort. Repetition pace is the fastest of the five, developing running economy and speed with full recoveries between reps.'
			}
		]
	},
	'/hr-zones': {
		heading: 'About heart rate zones',
		intro:
			'Training zones split your effort range into bands, each targeting a different physiological adaptation. This calculator supports two ways of setting them: a percentage of maximum heart rate, or Friel’s lactate threshold heart rate (LTHR) method.',
		sections: [
			{
				heading: 'Max HR vs LTHR',
				body: 'The Max HR method sets zones as percentages of your maximum heart rate, which is simple but can be inaccurate if your true max is unknown or estimated. The LTHR method sets zones relative to your lactate threshold heart rate (the heart rate at your threshold effort), which tends to track training-specific fitness more precisely, and is the method used by TrainingPeaks and many endurance coaches.'
			},
			{
				heading: 'Using zones in training',
				body: 'Most easy running should sit in Zone 1–2, building aerobic base without excess fatigue. Zone 3 is often called the "grey zone": hard enough to add fatigue but not targeted enough to build much fitness, so many training plans deliberately avoid spending much time there. Zones 4–5 are reserved for threshold and interval work.'
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
				body: 'Your race time and distance are converted to a VDOT value using Jack Daniels’ formula, which closely tracks VO2 max while also accounting for running economy. The result is then compared against ACSM age- and gender-based norms to place you in a fitness category.'
			},
			{
				heading: 'Why it may differ from your GPS watch',
				body: 'Devices like Garmin and Coros estimate VO2 max continuously from heart rate and pace trends, which can run several points higher or lower than a race-derived estimate, especially if your watch’s max heart rate setting is inaccurate. Treat both figures as estimates rather than exact physiological measurements.'
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
				body: 'Your time is expressed as a percentage of the age-adjusted world standard for your age and gender, using the WMA/Alan Jones age-factor tables. This lets you compare performances fairly across different ages: a 65-year-old and a 25-year-old running the same time can have very different ratings once age is accounted for.'
			}
		]
	}
};
