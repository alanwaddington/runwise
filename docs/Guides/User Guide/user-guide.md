# Runwise User Guide

Runwise is a free collection of running calculators. No account required.

---

## Getting Started

Open [runwise](/) in any browser. The home page lists all seven tools — click any card to open it.

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

Turn your training paces into concrete session plans, scaled to your current weekly training mileage. Based on Jack Daniels' weekly-mileage-scaling rules layered on top of the Training Pace Calculator's VDOT method.

**Inputs:**

| Field | Format | Example |
|-------|--------|---------|
| Race distance | Dropdown (1 Mile, 5K, 10K, 15K, Half Marathon, Marathon, or Custom) | 5K |
| Custom distance | Decimal km — appears when "Custom (km)" is selected | 12.5 |
| Race time | MM:SS or H:MM:SS — auto-detected | 25:00 or 1:56:20 |
| Weekly training mileage | Decimal km (1–300) | 50 |

Both a valid race result and a valid weekly mileage are required before results appear.

**Output:** Your VDOT score, followed by all five training zones (E, M, T, I, R), each showing its pace range and exactly two example workouts:

| Zone | Two workouts |
|------|-------------|
| E | A regular easy run and a long run — each uses its own distinct weekly-mileage share and duration cap |
| M | One continuous marathon-pace run, and one 2-segment version with an easy jog between segments |
| T | One continuous ~20 minute tempo run, and one cruise-interval session |
| I | Two rep-distance variants (e.g. 1000m and 1200m) at the same computed volume |
| R | Two rep-distance variants (e.g. 200m and 400m) at the same computed volume |

Each workout card shows the session format, target pace, recovery, total quality volume, estimated duration, and a standard warm-up/cool-down line.

**Time-available filter:** A dropdown (Any time / Under 30 min / 30–45 min / 45–60 min / 60+ min) filters which workouts are shown across every zone at once. If no workout in a zone fits the selected window, that zone shows a short message instead of a mismatched or hidden result.

Volume-scaling percentages and rep-distance conventions are corroborated across multiple independent secondary sources on Daniels' methodology, documented in code with their confidence level.

A cross-link to the Training Pace Calculator is shown once a valid race result is entered, carrying your race result across automatically. The Training Pace Calculator links back the same way — your weekly mileage does not carry over between the two, since it is only used here.

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
