import type { GuideContent } from './types';

export const guide: GuideContent = {
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
			body: "Despite often being grouped together as 'speed work', Jack Daniels' VDOT training-intensity framework treats Interval and Repetition as sessions that target genuinely different physiological systems. Interval pace, run at an effort close to VO2 max, stresses the cardiovascular system's ceiling: the goal is spending meaningful time at or near your maximum oxygen uptake, which is why interval reps are long enough (typically 2-5 minutes) to actually reach that zone before recovery. Repetition pace, run faster still but with full recovery between reps, targets running economy and neuromuscular speed rather than aerobic capacity at all — reps are short (30 seconds to 2 minutes) specifically so fatigue from lactate accumulation doesn't limit how fast you can run, which is also why repetition work barely touches your cardiovascular system on the same axis interval work does."
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
};
