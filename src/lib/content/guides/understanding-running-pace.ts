import type { GuideContent } from './types';

export const guide: GuideContent = {
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
			body: "A training plan built on Jack Daniels' training-pace framework prescribes 'Easy pace' or 'Threshold pace' as a genuine physiological effort, and a pace range (see the Training Paces calculator) is the practical way to express a moving target: heat, humidity, altitude, sleep debt, and accumulated fatigue all shift what pace corresponds to a given effort on a given day. Running at the faster end of an Easy range on a cool, fresh morning and the slower end after a hard training week can both be exactly correct; forcing a single fixed number regardless of conditions is usually the mistake, not a virtue of discipline. This matters most on hot days, where holding yesterday's flat-ground pace on a 28°C afternoon can push what should be an easy aerobic run into genuine cardiovascular strain."
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
};
