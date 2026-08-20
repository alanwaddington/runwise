# /workouts manual accessibility audit

**Date:** 2026-08-20
**Scope:** `/workouts` — #100 Phase 3, Task 5 (AC-9.6)
**Method:** Keyboard-only navigation driven live through a real browser (Playwright/Chromium against the production build, not jsdom — jsdom can't observe real focus/keyboard-trap behavior); accessible-name/role inspection via the browser's own accessibility tree as a proxy for what a screen reader would announce.

**Honest limitation:** this environment has no real screen reader available (no VoiceOver/NVDA/JAWS installed or usable in this sandboxed Linux container). The findings below on "what gets announced" are inferred from the accessibility tree (roles, accessible names, `aria-*` attributes) rather than confirmed by actually running a screen reader. That's a real gap, not a substitute for one — if a maintainer has access to a real screen reader, a follow-up pass specifically re-testing the items marked "inferred, not confirmed" below would close it.

---

## Critical finding — fixed during this audit

### Workout detail modal never moved focus into itself on open

**Severity:** Critical (keyboard users effectively cannot use the modal as a modal)

The dialog (`role="dialog"`, `aria-modal="true"`) had `tabindex="-1"` and an `onkeydown` handler for Escape, but nothing ever called `.focus()` on it or a descendant when it opened. Keyboard focus stayed on the workout card's button, which sits behind the modal overlay in the DOM (not inside the dialog's own subtree). Consequences, all confirmed live before the fix:

- **Escape did nothing** — the keydown event fired on the card button (still focused, not the dialog), so it never reached the dialog's own `onkeydown` handler.
- **No focus trap** — Tabbing after "opening" the modal continued tabbing through the rest of the page behind the overlay, not through the modal's own controls. A sighted keyboard user would see the modal open but keep tabbing through invisible-behind-the-overlay page content.
- **A screen reader user would likely not know the modal opened at all** — most screen readers announce a dialog because focus moves into it; since focus never moved, there was no announcement trigger.

**Fix:** `modalDialogEl` (bound via `bind:this`) is now focused via a `$effect` when `selectedWorkout` becomes truthy. `modalTriggerEl` captures `document.activeElement` at the moment a card is clicked/activated, and `closeModal()` restores focus to it on any close path (Escape, backdrop click, X button, bottom Close button) via `tick()` + `.focus()`. A manual Tab-trap (`handleModalKeydown`) cycles focus between the dialog's first and last focusable elements on Tab/Shift+Tab at the boundaries.

**Why nothing caught this earlier:** not testable by jsdom component tests (jsdom's `render()` never reconciles against real browser focus/tab-order behavior the way a real browser does — this is the same category of gap the project's `verifier-runwise` skill already documents for CSS-driven visibility). Not testable by axe-core (focus management isn't a contrast/ARIA-attribute check axe performs). Only caught by literally tabbing/pressing-Escape through a real running instance.

**Regression coverage added:** `e2e/workouts-modal-keyboard.test.ts` — 5 tests covering focus-on-open, Escape-closes, focus-restored-on-close, the Tab focus trap, and both close-button paths.

---

## Keyboard-only walkthrough

Full pass: page load → mode tabs → race inputs → workout cards → modal → Race-Prep week stepper → FIT download.

| Element | Result |
|---|---|
| Skip from site nav into `/workouts` page content | ✅ Logical order: logo → nav links → theme toggle → "← All tools" → mode tabs → form inputs |
| Mode tabs (Pace/Power/HR/Race-Prep) | ✅ Reachable, `Enter`/`Space` activate. ⚠️ See "Tab pattern" observation below. |
| Race-Prep "Train by" sub-tabs, week stepper | ✅ Reachable and activatable via keyboard (confirmed: focusing a week-stepper button and pressing Enter correctly switches to that week and reveals its Shakeout card) |
| Workout cards (open detail modal) | ✅ Focusable button, `Enter` opens the modal |
| Workout detail modal | ✅ **After the fix above** — focus enters on open, Tab trap holds, Escape closes, focus returns to the triggering card |
| "Purpose & execution" `<details>`/`<summary>` disclosure | ✅ Native HTML disclosure widget — reliably keyboard-operable and announced by screen readers with zero custom code, no issue found |
| "Download as .FIT" button | ✅ Reachable inside the modal's focus trap, activatable via `Enter`/`Space` |
| Focus-visible outline | ✅ Present on every interactive element tabbed through in this pass (`focus-visible:ring-2` is applied consistently) |

### Observation (not a defect, not fixed): tab strips don't use the ARIA APG roving-tabindex pattern

The WAI-ARIA Authoring Practices Guide's Tabs pattern recommends that a `role="tablist"` have only *one* Tab stop for the whole strip, with arrow keys moving between individual tabs (roving `tabindex`). This codebase's tab strips (mode tabs, Race-Prep modality sub-tabs, Race-Prep week stepper) instead make every tab individually Tab-reachable — confirmed live: tabbing through the Pace/Power/HR/Race-Prep strip took 4 separate Tab presses, not 1 Tab + arrow keys.

This is a deviation from the idiomatic ARIA pattern, but **not a WCAG failure** — every tab is still independently reachable and operable via keyboard, just via a different (arguably more discoverable, if slower) navigation model than a screen-reader power-user might expect from a `role="tablist"`. Flagging for awareness, not fixing here — changing it would mean adding arrow-key handling to every tab strip in the codebase (a bigger, separate task, and a deliberate interaction-model change that deserves its own product decision rather than being bundled into an audit-driven fix).

---

## Screen-reader-relevant structure (accessibility-tree inspection, not confirmed with a real screen reader)

| Element | Accessible name / role found | Assessment |
|---|---|---|
| Pattern badges (Fartlek/Progression/Decay/Recovery/Time-based) | Glyph (e.g. "∿") is `aria-hidden="true"`; the label text ("Fartlek") is the only content a screen reader would read | ✅ Correct — decorative glyph excluded, label is the accessible content |
| "Recovery Options" heading | Real `<h4>` heading, present in the accessibility tree by that name | ✅ Landmark-navigable |
| Toast notifications (FIT download success/failure) | `role="status"` (success) / `role="alert"` (failure) per existing component tests | ✅ Correct roles for the urgency difference — `alert` interrupts, `status` doesn't |
| Recovery-card modal header ("Zone Easy / Recovery") | Confirmed present as plain text ahead of the `<h2>` workout title | ✅ Reads in a sensible order: zone context, then workout name |
| Zone-letter badge circles (E/M/T/I/R) | `aria-label="Zone E"` etc. present on every instance checked | ✅ Accessible name doesn't rely on the visual letter/color alone |

**Not independently re-verified with a real screen reader**: the exact prosody/order a screen reader announces when tabbing into the newly-fixed modal (e.g., whether `aria-labelledby` correctly causes the dialog's accessible name to be spoken before its content). The accessibility tree shows the wiring is structurally correct (`aria-labelledby="workout-modal-title"` points at the real `<h2>` id), which is the right setup — but "structurally correct" and "sounds right when actually spoken" aren't quite the same guarantee. Recommended as a targeted follow-up if/when real screen-reader access is available.

---

## Deferred (documented, not fixed here — see PR discussion for scope reasoning)

**axe-core's 209 "incomplete" results, particularly the E/M/T/I/R zone-letter badge circles.** During Task 4's automated scan, axe-core returned these as "incomplete" (needs manual judgment) rather than "violation" — a known heuristic limitation for small, rounded-background elements. Manually computing the same white-on-`--color-accent` (#1b8a5a) contrast pair used by these badges gives **4.34:1**, the same failing ratio the active-tab fill had before Task 4's fix (which used `--color-accent-dark`, 7.25:1, instead). Since these badges use the identical two colors, they almost certainly have the identical real problem — axe just can't confirm it mechanically.

**Recommendation:** apply the same `bg-accent` → `bg-accent-dark` swap to the zone-badge circles (`+page.svelte`, `hr-zones/+page.svelte`, `power-zones/+page.svelte`, `training-paces/+page.svelte`) and the "Download as .FIT"/"Close" buttons and `CookieBanner.svelte`'s two buttons (all confirmed via `grep` to use the same `bg-accent` + `text-white` combination). Not done in this pass because it's a materially bigger, riskier change (affects the brand accent color's most prominent live-badge and primary-button usages across 4+ pages) than Task 4's narrower, axe-confirmed fix — this deserves its own scoped decision rather than folding into an audit-findings doc as a done deal.
