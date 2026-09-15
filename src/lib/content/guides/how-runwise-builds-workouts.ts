import type { GuideContent } from './types';

export const guide: GuideContent = {
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
};
