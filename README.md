# Runwise

Fast, clean running calculators: pace, race time predictor, HR zones, VO2 max, and parkrun predictor.

## Tools

- **Pace Calculator** — `/pace`
- **Race Time Predictor** — `/race-predictor`
- **Training Pace Calculator** — `/training-paces`
- **Heart Rate Zone Calculator** — `/hr-zones`
- **VO2 Max Estimator** — `/vo2max`
- **Parkrun Predictor** — `/parkrun`

## Requirements

- Node.js 22 or later

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Checks

```bash
npm run check   # TypeScript / svelte-check
npm run lint    # ESLint
npm run format  # Prettier
```

## Testing

```bash
npm run test
```

Uses [Vitest](https://vitest.dev/) + [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/) with jsdom. Tests live alongside their components (`*.test.ts`).

## Design System

Shared components in `src/lib/components/`:

| Component | Purpose |
|---|---|
| `ToolLayout` | Page wrapper — back link, `<h1>`, description, bordered content card, and `<title>` |
| `SiteNav` | Top navigation with brand link, all six tool links, and active-route highlighting |
| `InputField` | Labelled numeric/text input with optional unit suffix and focus ring |
| `ResultDisplay` | Prominent result block — large mono value, uppercase label, copy-to-clipboard |

Design tokens defined via Tailwind v4 `@theme` in `src/app.css`:

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#1B8A5A` | Primary green — links, active states, focus rings, result values |
| `--color-accent-dark` | `#146344` | Hover variant of accent |
| `--color-bg` | `#FAFAF8` / `#19191A` dark | Page background |
| `--color-ink` | `#19191A` / `#FAFAF8` dark | Body text |
| `--font-sans` | Manrope, system-ui | Body and UI text |
| `--font-mono` | IBM Plex Mono, ui-monospace | Result values |

## Stack

- [SvelteKit](https://kit.svelte.dev/) + Svelte 5 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/) + [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/)
- Deployed on [Vercel](https://vercel.com/) via `@sveltejs/adapter-vercel`
