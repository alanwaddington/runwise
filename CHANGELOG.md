# Changelog

All notable changes to Runwise are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Runwise doesn't
follow semantic versioning yet (`package.json` has stayed at `0.0.1` throughout) — entries are
grouped by the issue-driven development phase they shipped in, dated by merge date, rather than
by a version number. If/when a real release process starts, that's a separate decision (see
issue #100's Design section, Task 7 note) — this file just needs a new dated section added above
whatever's here, following the same Added/Changed/Fixed grouping.

Backfilled from Phase 1 onward (#100) — earlier project history (initial scaffold through the
pre-#100 calculator tools) isn't included here, since #100 is where this file's own history
starts.

## [Unreleased] — Phase 3: Polish & Completeness (#100)

### Added
- E2E test coverage for `/workouts`: the Race-Prep flow, HR mode + pattern badges, FIT download
  across all three modalities, and a mobile-viewport pass (`e2e/workouts-*.test.ts`)
- Automated WCAG AA accessibility scanning (`@axe-core/playwright`) for `/workouts`, covering all
  4 modes plus the workout-detail modal
- Manual accessibility audit findings (`docs/accessibility/workouts-manual-audit.md`)

### Fixed
- 6 real WCAG AA violations found by the new automated scan: insufficient color contrast on
  active mode/modality tabs, inactive tab labels, the "Amazon" affiliate badge, modal stat-caption
  labels, and segment-detail pace text; and cross-link paragraphs relying on color alone to
  distinguish links from surrounding text. Fixed everywhere the same copy-pasted pattern appeared
  (`/workouts`, `/hr-zones`, `/parkrun`, `/power-zones`, plus several shared components), not just
  on `/workouts`
- **Critical:** the workout detail modal never moved keyboard focus into itself on open, so
  Escape-to-close and the Tab focus trap both silently did nothing — found during the manual
  keyboard audit, not caught by any automated tool or existing test
- Two touch targets below WCAG 2.2's 24×24px minimum: the "Purpose & execution" disclosure toggle
  (16px tall) and the modal's close (×) button (24×24px with zero padding)

## [Phase 2] — 2026-08-14 (PR #104, #100)

Fartlek, Progression, Decay, Rep-Expansion, and Recovery-Focused workout patterns — Pace mode only.

### Added
- Fartlek pattern for M/T/I zones (`buildFartlekWorkout`)
- Progression pattern for T/I zones (M already had one from Phase 1) (`buildProgressionWorkout`)
- Decay pattern for I/R zones (`buildDecayWorkout`)
- Rep Distance Expansion: 1500m/2000m (I) and 150m/300m (R) distance reps, plus one time-based
  session per zone (`buildRepExpansionWorkouts`)
- Recovery-Focused prescriptions: Easy float, Recovery striders, Shakeout run
  (`recovery-workouts.ts`), surfaced as a "Recovery Options" subsection under the R zone
- Pattern badges on workout cards (Fartlek ∿, Progression ↗, Decay ↘, Time-based ⏱, Recovery ◐)

### Fixed
- Recovery cards' FIT-export/segment-target pace band was pulling from Repetition zone (Daniels'
  fastest zone) instead of Easy zone
- The workout detail modal's stats grid showed a misleading "0 km" Total Volume for recovery cards

### Fixed (pr-reviewer follow-up, same PR before merge)
- The pace-band fix above only covered the pace *values* — the FIT-export filename and modal
  header still read "Repetition"/"R" for recovery-focused workouts. Both now correctly read Easy.
- AC-7.6: Recovery-Focused prescriptions were unavailable in Race-Prep mode — Race-Prep's Taper
  week now ends with a Shakeout run, correctly targeted to the Easy pace/power/HR band in every
  modality
- AC-8.1's stale "~400-500 test cases" target corrected to reflect the actual, well-justified
  93-test coverage
- Added `npm run check:bundle-size` — an automated regression check for `/workouts`' client
  bundle size, since AC-8.6/8.7 had only ever been verified by a one-off manual measurement

## [Phase 1] — 2026-08-14 (PR #102, #100)

HR mode, Race-Prep mode, and Mixed-Zone workouts.

### Added
- HR-based workout prescriptions with Daniels-aligned LTHR zone mapping and confidence badges
  (High/Medium/Low)
- Race-Prep mode: a 4–8-week periodized plan (Build Aerobic Base → Strength → Peak VO2 Max →
  Taper), scaled to how many weeks out the race is, with Pace/Power/HR modality support via a
  "Train by" sub-selector
- Mixed-Zone workouts: E+M, M+T, T+I combinations blending two effort zones in one session
- Genuine HR-target FIT export encoding (FIT's `workoutHr` bpm+100 format) for HR-mode workout
  cards — `Download as .FIT` itself shipped earlier, pre-#100, in #98/#99
