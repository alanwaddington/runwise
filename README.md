# Runwise

Fast, clean running calculators: pace, race time predictor, HR zones, VO2 max, and parkrun predictor.

## Tools

- **Pace Calculator** — `/pace`
- **Race Time Predictor** — `/race-predictor`
- **Training Pace Calculator** — `/training-paces`
- **Heart Rate Zone Calculator** — `/hr-zones`
- **VO2 Max Estimator** — `/vo2max`
- **Parkrun Predictor** — `/parkrun`

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

## Stack

- [SvelteKit](https://kit.svelte.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/) via `@sveltejs/adapter-vercel`
