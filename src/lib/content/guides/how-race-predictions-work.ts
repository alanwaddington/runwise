import type { GuideContent } from './types';

export const guide: GuideContent = {
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
};
