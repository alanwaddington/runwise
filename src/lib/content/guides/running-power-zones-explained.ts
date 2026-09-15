import type { GuideContent } from './types';

export const guide: GuideContent = {
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
};
