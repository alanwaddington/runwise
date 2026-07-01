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

### Training Paces — `/training-paces`

Generate a full set of training paces from a recent race result.

**Inputs:**
- Recent race distance
- Recent race time

**Output:** Easy, marathon, threshold, interval, and repetition paces.

---

### HR Zone Calculator — `/hr-zones`

Calculate your five heart rate training zones.

**Inputs:**
- Maximum heart rate (or age for estimated max HR)
- Resting heart rate (optional — used for Karvonen formula)

**Output:** HR ranges for zones 1–5.

---

### VO2 Max Estimator — `/vo2max`

Estimate your aerobic fitness level from a race performance.

**Inputs:**
- Race distance
- Race time

**Output:** Estimated VO2 max (ml/kg/min) and fitness category.

---

### Parkrun Predictor — `/parkrun`

Predict your 5K parkrun time from recent training or racing.

**Inputs:**
- Recent race distance
- Recent race time

**Output:** Predicted 5K finish time.

---

## Tips

- All calculators work on mobile — tap any input field and your keyboard will appear.
- Results update as you type; no submit button required.
- Use the navigation bar at the top to switch between tools without going back to the home page.

---

## Dark Mode

Runwise respects your device's dark/light mode setting automatically.
