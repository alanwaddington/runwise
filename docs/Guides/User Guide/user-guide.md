# Runwise User Guide

Runwise is a free collection of running calculators. No account required.

---

## Getting Started

Open [runwise](/) in any browser. The home page lists all eight tools — click any card to open it.

---

## Tools

### Pace Calculator — `/pace`

Convert between the three common pace formats. Enter a value in any field and the other two update instantly.

**Editable inputs (any one updates the other two):**

| Field | Format | Example |
|-------|--------|---------|
| Pace (min/km) | M:SS | 5:30 |
| Pace (min/mile) | M:SS | 8:51 |
| Speed (km/h) | decimal | 10.9 |

**Read-only outputs (update automatically):**

| Output | Format | Example |
|--------|--------|---------|
| mph | one decimal place | 6.8 |
| per 400 m | M:SS | 2:12 |
| per 800 m | M:SS | 4:24 |

Each read-only output has a copy-to-clipboard button.

---

### Race Time Predictor — `/race-predictor`

Predict your finish times across all standard race distances from any recent result.

**Inputs:**

| Field | Format | Example |
|-------|--------|---------|
| Known distance | Dropdown (1 Mile, 5K, 10K, 15K, Half Marathon, Marathon, or Custom) | 5K |
| Custom distance | Decimal km — appears when "Custom (km)" is selected | 12.5 |
| Known time | MM:SS or H:MM:SS — auto-detected | 25:00 or 1:56:20 |

**Output:** A prediction table showing estimated finish time, pace per km, and pace per mile for every standard distance (1 Mile, 5K, 10K, 15K, Half Marathon, Marathon), plus your custom distance if entered. The row matching your known distance is highlighted. All predictions use the Riegel formula (T₂ = T₁ × (D₂/D₁)^1.06).

A link to the VO2 Max Estimator is displayed alongside results.

---

### Training Pace Calculator — `/training-paces`

Calculate your optimal training paces for all five intensity zones from a recent race result. Based on Jack Daniels' VDOT methodology.

**Inputs:**

| Field | Format | Example |
|-------|--------|---------|
| Race distance | Dropdown (1 Mile, 5K, 10K, 15K, Half Marathon, Marathon, or Custom) | 5K |
| Custom distance | Decimal km — appears when "Custom (km)" is selected | 12.5 |
| Race time | MM:SS or H:MM:SS — auto-detected | 25:00 or 1:56:20 |

**Output:** Your calculated VDOT score (a measure of aerobic fitness) displayed as a headline, followed by a table of training pace ranges for five zones:

| Zone | Name | Purpose |
|------|------|---------|
| E | Easy / Recovery | Daily easy runs, long runs, warm-ups |
| M | Marathon | Steady-state marathon-pace runs |
| T | Threshold / Tempo | Comfortably hard tempo runs and cruise intervals |
| I | Interval | Hard VO2 max intervals (3–8 minutes per rep) |
| R | Repetition | Short fast reps for speed and running economy |

Each zone shows a pace range (faster–slower) in both min/km and min/mile. A brief description of each zone's purpose is shown below each row.

If the entered time is outside the supported VDOT range (20–85), a friendly message is displayed instead of the table.

A link to the VO2 Max Estimator is displayed alongside results.

---

### HR Zone Calculator — `/hr-zones`

Calculate your five heart rate training zones using either the Max HR percentage method or Joe Friel's lactate threshold (LTHR) method.

**Method selector:** Toggle between Max HR and LTHR using the segmented control at the top of the page. Use the ⓘ icon to learn which method suits you.

**Max HR method inputs:**
- Maximum heart rate (bpm)
- Age (optional) — estimates your max HR using the Tanaka formula (208 − 0.7 × age); a caveat is shown as age-based estimates vary between individuals

**LTHR method inputs:**
- Lactate threshold heart rate (bpm)

**Output:** Five HR training zones with BPM range and training purpose for each zone. In LTHR mode, Zone 5 can be expanded to show sub-zones 5a, 5b, and 5c.

**Note:** Joe Friel's LTHR zone boundaries intentionally have small gaps between them by design.

---

### VO2 Max Estimator — `/vo2max`

Estimate your aerobic fitness level (VO2 max) from a recent race performance using the Jack Daniels VDOT method.

**Inputs:**

| Field | Format | Example |
|-------|--------|---------|
| Race distance | Dropdown (5K, 10K, Half Marathon, Marathon, or Custom) | 5K |
| Custom distance | Decimal km — appears when "Custom (km)" is selected | 8.0 |
| Finish time | MM:SS or H:MM:SS — auto-detected | 25:00 or 1:52:30 |
| Age | Integer (10–100), optional | 35 |
| Gender | Male / Female / Prefer not to say, optional | Male |

**Output:**

Your estimated VDOT score is displayed in ml/kg/min to one decimal place. VDOT is a practical proxy for VO2 max derived from race performance rather than a lab test.

**Fitness category** (shown below the VDOT score):

| Situation | Display |
|-----------|---------|
| Age and gender provided | Your personalised category (e.g. *Fair for a male age 30–39*) with a colour-coded badge |
| Age provided, gender set to "Prefer not to say" | Both male and female category ranges for your age bracket |
| No age or gender entered | Full ACSM reference table with norms for both male and female across all age brackets |

Categories follow ACSM norms: Superior, Excellent, Good, Fair, Poor, Very Poor. A note is shown when your age falls outside the published ACSM brackets (20–79) and the nearest bracket is used.

**Race predictions:** A table of predicted finish times for all standard distances (5K, 10K, Half Marathon, Marathon) is shown alongside the VDOT, using the same Riegel formula as the Race Time Predictor.

Cross-links to the Training Pace Calculator and Race Time Predictor are displayed when results are visible.

---

### Parkrun Predictor — `/parkrun`

Predict your 5K parkrun finish time from a recent training run or average pace — or work the other way round and find the pace needed to hit a goal finish time — with pacing splits, PB comparison, and WMA age grading.

**Input mode toggle:** Switch between three input modes at the top of the page:

| Mode | Required inputs |
|------|----------------|
| Recent Run | Distance (km) + Time (MM:SS or H:MM:SS) |
| Average Pace | Pace (M:SS per km) |
| Target Time | Target finish time (MM:SS or H:MM:SS) |

**Reference distance slider:** Shown for Recent Run and Average Pace only. Choose the race distance that best represents your entered pace or time. This controls how the Riegel formula extrapolates your training performance to a 5K prediction — the closer the reference distance is to what you actually ran, the more accurate the prediction.

| Reference distance | Distance (km) |
|---------------------|---------------|
| 1 Mile | 1.60934 |
| 5K | 5 |
| 10K | 10 |
| 15K | 15 |
| Half Marathon | 21.0975 |
| Marathon | 42.195 |

Longer reference distances imply more fitness in reserve, so they produce a faster (more optimistic) 5K prediction for the same pace; shorter reference distances produce a more conservative one. Target Time mode has no reference distance to choose — parkrun is fixed at 5K, so the pace needed is a direct calculation from your target time.

**Optional inputs:**

| Field | Purpose | Shown in |
|-------|---------|----------|
| PB (MM:SS) | Compare your prediction against your personal best | Recent Run, Average Pace only |
| Age | Required for age grading | All three modes |
| Gender | Required for age grading | All three modes |

**Output:**

- **Recent Run / Average Pace:** the headline result is your **predicted parkrun time** (MM:SS), with pace in min/km and min/mile shown beneath it.
- **Target Time:** the headline result is your **required pace** (min/km), since you're working backwards from a goal time rather than forwards to a prediction. Your entered target time and the equivalent pace per mile are shown beneath it, along with a link to the Training Pace Calculator for a full training-paces breakdown at that effort.
- **1K split table** — cumulative time and split pace for each kilometre (1K–5K), based on even pacing; shown in all three modes.
- **PB comparison** — shown only in Recent Run and Average Pace mode, and only when a PB is entered; e.g. *"32 seconds faster than your PB"* (green) or *"15 seconds slower than your PB"* (red). Not shown in Target Time mode, since comparing a self-chosen goal against a PB isn't a meaningful prediction-vs-best comparison.
- **Age grade** — shown in all three modes when age and gender are provided; displays your WMA age grade percentage and performance band, computed against the predicted (or target) time.

**WMA age grade bands:**

| Band | Percentage |
|------|-----------|
| World | 100%+ |
| National | 90–99% |
| Regional | 80–89% |
| Local | 70–79% |
| Recreational | below 70% |

Age grading uses real per-integer-age WMA (World Masters Athletics) factor data for 5K, covering ages 5–100 for both genders.

Cross-links to the Race Time Predictor, Training Pace Calculator, and VO2 Max Estimator are displayed with results.

---

### Power Zones Calculator — `/power-zones`

Calculate your running power training zones for three power meter platforms: Stryd, Garmin, or Polar.

**Device selector:** Choose your device using the three-way segmented control at the top of the page. Each device uses its own published zone model — switching devices clears your entered value and updates the input's label to that device's own metric name.

| Device | Input label | Metric | Zones |
|--------|-------------|--------|-------|
| Stryd | Critical Power (CP) | Critical Power | 5 (Easy, Moderate, Threshold, Interval, Repetition) |
| Garmin | Threshold Power | Threshold Power | 5 (Easy, Moderate, Tempo, Long Interval, Short Interval) |
| Polar | Maximal Aerobic Power (MAP) | Maximal Aerobic Power | 5 (Endurance Running ×2, High-Intensity Interval Training ×2, Sprint Interval Training) |

**Input:** A single power value in watts (50–700W accepted). Enter the number your own device reports for its own metric — never mix a Stryd CP figure into another tab, since devices are not interchangeable.

**Garmin note:** A disclaimer is shown below the device selector when Garmin is chosen. The zone percentages (65-80%, 80-90%, 90-100%, 100-115%, >115% of Threshold Power — Garmin's own app rounds these to 66-80%, 81-90%, 91-100%, 101-115%, >115% for display) match Garmin Connect's own running power zones screen, but Garmin does not publish this table in its own official documentation.

**Output:** A zone table with watt ranges and training purpose for each zone, using that device's own zone count and names (5 rows for every device). Each zone name is also shown with its % range (e.g. "Easy (65-80%)"), for both the desktop table and the mobile layout.

Cross-links to the HR Zone Calculator are displayed with results.

---

### Workout Suggestions — `/workouts`

Turn your training paces, your device's running power, or your heart rate into concrete session plans, scaled to your current weekly training mileage — plus a 4-8 week race-prep plan once a race is on the horizon. Based on Jack Daniels' weekly-mileage-scaling rules layered on top of the Training Pace Calculator's VDOT method — Power and HR modes reuse the exact same session shapes and scaling rules, substituting an estimated pace derived from your power value or heart rate zone.

**Mode toggle:** A Pace / Power / HR segmented control at the top switches between input sets. A fourth "Race-Prep" tab appears once you've entered a race date 4–8 weeks away (see Race-Prep mode, below) — outside that window it's hidden rather than shown disabled. Your weekly mileage, and your race date, carry over between modes (both are single shared fields), but mode-specific inputs and their validation states do not.

**Pace mode inputs:**

| Field | Format | Example |
|-------|--------|---------|
| Race distance | Dropdown (1 Mile, 5K, 10K, 15K, Half Marathon, Marathon, or Custom) | 5K |
| Custom distance | Decimal km — appears when "Custom (km)" is selected | 12.5 |
| Race time | MM:SS or H:MM:SS — auto-detected | 25:00 or 1:56:20 |
| Weekly training mileage | Decimal km (1–300) | 50 |

Both a valid race result and a valid weekly mileage are required before results appear.

**Power mode inputs:**

| Field | Format | Example |
|-------|--------|---------|
| Power meter device | Dropdown (Stryd, Garmin, COROS, or Polar) | Stryd |
| Power value | Watts (50–700), label changes to that device's own metric name (e.g. "Critical Power (CP)") | 250 |
| Weekly training mileage | Decimal km (1–300), shared with Pace mode | 50 |

**HR mode inputs:**

| Field | Format | Example |
|-------|--------|---------|
| Lactate threshold heart rate (LTHR) | BPM (100–200) | 172 |
| Weekly training mileage | Decimal km (1–300), shared with Pace mode | 50 |

If you've also entered a race result on the Pace tab, HR mode automatically uses your own training paces to size each zone's session duration and shows an informational pace range on Interval/Repetition workout cards (see below). Without a race result, durations fall back to a general easy pace and a notice says so.

**Output (Pace/Power/HR modes):** Pace mode shows your VDOT score; Power mode shows your entered power value; HR mode shows your entered LTHR plus a zone-mapping list — each of the five zones' BPM range alongside a confidence badge (High/Medium/Low, hover for why) reflecting how reliably heart rate maps to that zone. Threshold is Medium confidence because the threshold heart rate band is inherently fuzzy; Interval is Low confidence because heart rate lags behind effort on short reps; Repetition sits *above* Interval (it's Daniels' fastest zone, not a low-intensity "recovery" zone) and is High-confidence-but-pace-led for the same reason — reps are too short for heart rate to catch up, so pace/effort is the more reliable guide even though the zone boundary itself is unambiguous. All three modes then show all five training zones (E, M, T, I, R) with the zone's pace, watt, or BPM range.

Pace mode has by far the widest variety, since it's the only mode with the additional session **patterns** below; Power and HR modes offer 3-4 workouts per zone (the same base formats Pace mode's Standard variants use). Every workout carries a small pattern badge above its title (e.g. "Fartlek", "Decay") — a card with no badge is a Standard workout.

| Zone | Standard variants (all modes) | Pace-mode-only additions |
|------|-------------|---------------------------|
| E | Regular easy run, long run, easy fartlek — the run and long run each use their own distinct weekly-mileage share and duration cap | — |
| M | Continuous marathon-pace run, a 2-segment version with an easy jog between segments, a progression run building from easy to marathon pace | + Marathon-pace fartlek: 2-3km pickups at M pace with steady jog recovery |
| T | Continuous tempo run, cruise intervals, an ascending/descending tempo ladder | + Threshold fartlek (1-2min hard pickups, staying within T intensity); + Threshold progression (3 reps of increasing duration) |
| I | Three rep-distance variants (400m/800m/1200m in Pace mode) plus a pyramid session | + Interval fartlek (3-5min hard bursts, 1min recovery); + Interval progression; + Hard-to-easy decay (2 hard reps then 2 shorter/easier reps); + 1500m and 2000m rep variants; + a time-based session (3/5/7min efforts, no track needed) |
| R | Three rep-distance variants (200m/400m/800m in Pace mode) plus a descending-reps session | + Repetition decay (intensity eases from R pace down to a genuinely easy effort by the final rep); + 150m and 300m rep variants; + a time-based session (1/2min efforts, 30sec recovery); + a **Recovery Options** subsection (see below) |

Each zone's workouts sit in a horizontally scrolling card rail (swipe, or use Arrow Left/Right with the rail focused) rather than a fixed grid, so a zone with more workout variants simply extends the rail instead of the layout. Each card shows the session format, target pace or power, recovery, total quality volume (Pace mode) or estimated duration, and a warm-up/cool-down line — each scaled independently to the session's intensity and length (longer for harder efforts like Interval and Repetition, shorter for Easy running), with cool-down typically the shorter of the two — plus a small visual profile chart underneath: a bar for each segment of the session (warm-up, work, recovery, cool-down), sized by duration and coloured by intensity, so you can see a session's shape (e.g. steady continuous effort vs. repeated intervals) at a glance alongside the text. Every segment's duration is rounded to the nearest 5 seconds, and shown as an exact time (not rounded further for display) so it always matches what's in an exported file (see Download as .FIT, below), and always equals the sum of that workout's own segments. In HR mode, Interval and Repetition zone cards additionally show a de-emphasized "Pace (reference only)" line when a race result is available — heart rate is the primary prescription for those zones, pace is shown only for context.

**Recovery Options (Pace mode, Repetition zone only):** Below the Repetition zone's own rail, a separate "Recovery Options" heading and rail offers three sessions distinct from structured R-zone reps — Easy float (a very easy, unstructured 20-45 min effort — go by feel, not pace), Recovery striders (a 20-30 min easy run finishing with 5 short, controlled accelerations), and Shakeout run (a short, minimal-structure 10-20 min jog). Unlike every other card, these aren't scaled to your weekly mileage — they're flexible options for an easy or recovery day, so their duration doesn't change with your inputs, and their cards don't show a distance stat.

**Mixed-Zone Sessions (Pace mode only):** Below the five zone sections, a "Mixed-Zone Sessions" section offers three additional workouts, each blending two adjacent effort zones in one session rather than staying in a single zone throughout: an Easy run with marathon-pace bridges (E+M), a Marathon-pace base with threshold surges (M+T), and Threshold blocks with fast VO₂max pickups (T+I). Each card carries a small pattern badge (e.g. "E+M") in place of the usual single zone letter, and its detail view adds one line explaining the intensity transition: ease into each higher-intensity segment, then settle back to the base pace.

**Race-Prep mode:** Enter a race date (shown alongside the shared inputs, next to Weekly training mileage) — the Race-Prep tab appears once that date is 4–8 weeks away. Selecting it shows a "Train by" sub-selector (Pace / Power / HR) — independent of whichever top-level mode you were last on — plus your goal race pace and a plan that scales in length to how many weeks out your race is (4 to 8 weeks): Build Aerobic Base, Strength, and Peak VO2 Max each get 1 week at the 4-week minimum, with any additional weeks added to Build first, then Strength, then Peak; Taper always stays a single final week. Navigate the plan one week at a time via the week stepper above the cards. Each week offers 3–5 workouts: in Pace modality, drawn from the same zone builders as Pace mode (curated and relabeled per phase) plus two race-pace-specific sessions (a race-pace tempo run and race-pace reps) that appear at the appropriate phase; in Power or HR modality, an extra zone-appropriate workout takes that slot instead, since there's no established way to convert a pace-based race goal into a device-specific power or heart-rate target. Taper week trains at reduced weekly-mileage volume to shed fatigue while keeping race-pace feel sharp, and its final workout is always a Shakeout run — a short, easy loosen-up session standing in for the day before your race, targeted to Easy effort in every modality regardless of the phase's own zone. Every Race-Prep and Mixed-Zone card carries a small "Race-Prep" or pair-key badge so you can tell it apart from a standard zone workout at a glance.

**Time-available filter (Pace mode only):** A dropdown (Any time / Under 30 min / 30–45 min / 45–60 min / 60+ min) filters which workouts are shown across every zone at once. If no workout in a zone fits the selected window, that zone shows a short message instead of a mismatched or hidden result.

**Purpose & execution:** Each card has its own "Purpose & execution" disclosure — click to expand a plain-language explanation of the zone's purpose and how to run the session, inline on the card, without leaving the rail.

**Workout detail view:** Click a workout card (outside the disclosure above) to open a full-screen detail view: the session format, a Mixed-Zone session's intensity-transition note where applicable, total volume/duration/recovery stats, the same profile chart at a larger size, and a segment-by-segment breakdown showing each segment's exact target range (pace, power, or BPM, narrowed to that specific segment's intensity within the zone) and exact duration.

**Download as .FIT:** The detail view's "Download as .FIT" button saves the workout as a structured `.fit` file — the same target pace/power/heart-rate and warm-up/work/recovery/cool-down timing shown on screen, ready to follow step-by-step directly on a compatible device instead of watched manually against a stopwatch. A success or failure notification confirms the result. Race-Prep cards download the same as an equivalent zone workout, tagged to their source zone — except Pace modality's two race-pace-specific sessions (race-pace tempo, race-pace reps), which aren't tied to a single zone and don't offer download. The button doesn't appear for Mixed-Zone Sessions cards, since they blend two zones rather than belonging to one. Device support today:

| Brand | Supported | How |
|-------|-----------|-----|
| Garmin | Yes | Copy the downloaded file onto the watch's `NEWFILES` folder over USB, then select it from Training > Workouts on the device |
| COROS | Yes | Import it in COROS Training Hub and sync it to the watch from there |
| Suunto | No | Suunto doesn't support importing a structured workout file from any source today, including via TrainingPeaks |
| Polar | No | Same limitation as Suunto — no structured `.fit` workout import path exists |

The file is generated entirely in your browser — no workout data is sent to a server. See the "Getting a workout onto your watch" note on the page itself for links to each supported brand's own instructions.

Volume-scaling percentages and rep-distance conventions are corroborated across multiple independent secondary sources on Daniels' methodology, documented in code with their confidence level.

A cross-link to the Training Pace Calculator (Pace mode) or the Power Zones Calculator (Power mode) is shown once your workout results are visible. The Training Pace Calculator link carries your race result across automatically and links back the same way once its own results are visible — your weekly mileage does not carry over between the two, since it is only used here.

---

## Recommended Gear

Each tool page shows affiliate product recommendations alongside the tool — GPS watches and heart rate monitors relevant to the tool you're using. On desktop the recommendations appear in a sidebar to the right of the tool; on mobile they appear below it. These link to Amazon search results. As an Amazon Associate, Runwise may earn a small commission from qualifying purchases at no extra cost to you.

---

## Privacy and Cookies

### Cookie Consent

When you first visit Runwise, a cookie consent banner appears at the bottom of the page. You can choose:

- **Accept All** — enables all cookies (necessary + analytics + marketing)
- **Necessary Only** — enables only cookies required for the site to function
- **Customise** — expands toggles so you can enable or disable each category individually

Your choice is saved in your browser's local storage and remembered for future visits. You can change your preferences at any time via the **Manage Cookies** link in the footer.

### Privacy Policy

The full Privacy Policy is available at [/privacy](/privacy). It covers what data is collected, how cookies are used, Google AdSense, affiliate links, and your rights under GDPR.

---

## Tips

- All calculators work on mobile — tap any input field and your keyboard will appear.
- Results update as you type; no submit button required.
- Use the navigation bar at the top to switch between tools without going back to the home page.

---

## Dark Mode

Runwise respects your device's dark/light mode setting automatically.
