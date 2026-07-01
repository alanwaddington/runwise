# Runwise Developer Guide

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit + Svelte 5 + TypeScript |
| Styling | Tailwind CSS v4 |
| Testing | Vitest + @testing-library/svelte |
| Deployment | Vercel (`@sveltejs/adapter-vercel`) |

---

## Prerequisites

- Node.js 22 or later
- npm

---

## Setup

```bash
git clone https://github.com/alanwaddington/runwise.git
cd runwise
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
src/
├── app.css              # Global styles + Tailwind theme tokens
├── app.html             # SvelteKit HTML shell
├── lib/
│   ├── components/      # Shared UI components
│   │   ├── HeroSection.svelte
│   │   ├── HeroSection.test.ts
│   │   ├── InputField.svelte
│   │   ├── InputField.test.ts
│   │   ├── ResultDisplay.svelte
│   │   ├── ResultDisplay.test.ts
│   │   ├── SiteNav.svelte
│   │   ├── SiteNav.test.ts
│   │   ├── ToolCard.svelte
│   │   ├── ToolCard.test.ts
│   │   ├── ToolLayout.svelte
│   │   └── ToolLayout.test.ts
│   └── utils/           # Pure utility modules (no Svelte dependency)
│       ├── pace.ts               # Pace/speed conversion functions
│       ├── pace.test.ts
│       ├── race-predictor.ts     # Riegel formula, time parsing/formatting, prediction table
│       ├── race-predictor.test.ts
│       ├── training-paces.ts     # VDOT calculation (Daniels' formula), training zone pace derivation
│       └── training-paces.test.ts
└── routes/
    ├── +layout.svelte   # Root layout — header + main wrapper
    ├── +page.svelte     # Home page — HeroSection + ToolCard grid
    ├── +error.svelte    # Error page
    ├── pace/
    ├── race-predictor/
    ├── training-paces/
    ├── hr-zones/
    ├── vo2max/
    └── parkrun/
```

---

## Design System

### Tokens (`src/app.css`)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-accent` | `#1B8A5A` | `#1B8A5A` | Links, active states, focus rings |
| `--color-accent-dark` | `#146344` | `#146344` | Hover variant |
| `--color-bg` | `#FAFAF8` | `#19191A` | Page background |
| `--color-ink` | `#19191A` | `#FAFAF8` | Body text |
| `--font-sans` | Manrope | — | UI and body text |
| `--font-mono` | IBM Plex Mono | — | Result values, route labels |

Dark mode is applied automatically via `prefers-color-scheme`. Always use design tokens (`text-ink`, `bg-bg`, `border-ink/10`) rather than hardcoded Tailwind colours.

### Components

| Component | Props | Purpose |
|-----------|-------|---------|
| `HeroSection` | none | Home page hero — icon, tagline, sub-copy, separator |
| `ToolCard` | `href`, `name`, `description`, `route` | Linked card on the home page |
| `ToolLayout` | `title`, `description`, `pageTitle?` | Wrapper for tool pages — back link, heading, description. `pageTitle` overrides the default `"{title} \| Runwise"` document title. |
| `SiteNav` | none | Top navigation — brand + tool links with active-route highlight |
| `InputField` | `label`, `id`, `value`, `type?`, `unit?`, `step?`, `placeholder?`, `inputmode?` | Labelled input with optional unit suffix. `inputmode` triggers the correct mobile keyboard (e.g. `"decimal"`). |
| `ResultDisplay` | `value`, `label` | Prominent result block with copy-to-clipboard |

---

## Adding a New Tool

1. Create `src/routes/<tool-name>/+page.svelte`
2. Import `ToolLayout` and pass `title` and `description` props
3. Add the tool to the `tools` array in `src/routes/+page.svelte`
4. Add the tool link to `SiteNav.svelte`
5. Add tests alongside the page

---

## Testing

### Unit and component tests (Vitest)

```bash
npm run test          # Run all tests once
npm run test -- --watch  # Watch mode
```

Tests live alongside their source files (`*.test.ts`). Follow the existing pattern:

```ts
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import MyComponent from './MyComponent.svelte';

afterEach(() => { cleanup(); });

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(MyComponent, { props: { ... } });
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
});
```

### E2E tests (Playwright)

```bash
npx playwright install chromium  # First time only
npm run test:e2e                 # Run E2E tests against the production build
```

E2E tests live in the `e2e/` directory. They run against the production preview server (`npm run build && npm run preview` on port 4173). Configuration is in `playwright.config.ts`.

---

## Code Quality

```bash
npm run check        # TypeScript / svelte-check
npm run lint         # ESLint
npm run format       # Prettier (auto-fix)
npm run test:e2e     # Playwright E2E tests (requires built app)
```

---

## Workflow

This project follows an issue-driven workflow:

```
/analyse <issue>   → requirements + acceptance criteria
/design <issue>    → architecture + work breakdown
/develop <issue>   → TDD implementation
/verify <PR>       → runtime verification
/pr-reviewer <PR>  → acceptance criteria audit
/merge <PR>        → merge + close issues
```
