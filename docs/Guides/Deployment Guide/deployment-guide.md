# Runwise Deployment Guide

Runwise deploys to [Vercel](https://vercel.com/) automatically on every merge to `main`.

---

## Architecture

```
GitHub (main branch)
        │
        ▼
  Vercel CI/CD
        │
        ├── Build: npm run build (SvelteKit + Vite)
        └── Deploy: @sveltejs/adapter-vercel
```

---

## Vercel Configuration

The project uses `@sveltejs/adapter-vercel` with no custom `vercel.json` required. Vercel auto-detects SvelteKit.

---

## Environment

| Setting | Value |
|---------|-------|
| Framework | SvelteKit (auto-detected) |
| Node.js version | 22 |
| Build command | `npm run build` (auto-detected) |
| Output directory | `.svelte-kit/output` (auto-detected) |

---

## First-Time Setup

1. Import the GitHub repository into Vercel
2. Vercel detects SvelteKit automatically — no manual configuration needed
3. Every push to `main` triggers a production deployment
4. Every PR gets a preview deployment URL

---

## Deployments

| Trigger | Environment |
|---------|-------------|
| Push to `main` | Production |
| Pull request | Preview (unique URL per PR) |

---

## Local Production Preview

```bash
npm run build
npm run preview
```

Opens a local server serving the production build at [http://localhost:4173](http://localhost:4173).

---

## Monitoring

View deployment status, build logs, and runtime errors in the [Vercel dashboard](https://vercel.com/dashboard).
