# Runwise User Guide

Runwise is a free collection of running calculators. No account required.

---

## Getting Started

Open [runwise](/) in any browser. The home page lists all six tools — click any card to open it.

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

Predict your 5K parkrun finish time from a recent training run or average pace, with pacing splits, PB comparison, and WMA age grading.

**Input mode toggle:** Switch between two input modes at the top of the page:

| Mode | Required inputs |
|------|----------------|
| Recent Run | Distance (km) + Time (MM:SS or H:MM:SS) |
| Average Pace | Pace (M:SS per km) |

**Reference distance slider:** Choose the race distance that best represents your entered pace or time. This controls how the Riegel formula extrapolates your training performance to a 5K prediction — the closer the reference distance is to what you actually ran, the more accurate the prediction.

| Reference distance | Distance (km) |
|---------------------|---------------|
| 1 Mile | 1.60934 |
| 5K | 5 |
| 10K | 10 |
| 15K | 15 |
| Half Marathon | 21.0975 |
| Marathon | 42.195 |

Longer reference distances imply more fitness in reserve, so they produce a faster (more optimistic) 5K prediction for the same pace; shorter reference distances produce a more conservative one.

**Optional inputs:**

| Field | Purpose |
|-------|---------|
| PB (MM:SS) | Compare your prediction against your personal best |
| Age | Required for age grading |
| Gender | Required for age grading |

**Output:**

- **Predicted parkrun time** — displayed in MM:SS
- **Pace** — in min/km and min/mile
- **1K split table** — cumulative time and split pace for each kilometre (1K–5K), based on even pacing
- **PB comparison** — shown only when a PB is entered; e.g. *"32 seconds faster than your PB"* (green) or *"15 seconds slower than your PB"* (red)
- **Age grade** — shown only when age and gender are provided; displays your WMA age grade percentage and performance band

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

## Recommended Gear

Each tool page shows a small section of affiliate product recommendations below the tool card — GPS watches and heart rate monitors relevant to the tool you're using. These link to Amazon search results. As an Amazon Associate, Runwise may earn a small commission from qualifying purchases at no extra cost to you.

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
