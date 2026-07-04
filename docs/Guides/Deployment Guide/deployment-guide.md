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

The project uses `@sveltejs/adapter-vercel`. A `vercel.json` is committed to the repository with the following configuration:

- **www → apex redirect** — all requests to `www.runwise.app/*` are permanently redirected (HTTP 301) to `https://runwise.app/*` to consolidate SEO link equity on the canonical apex domain.
- **Security headers** — applied to all responses:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Note: `Content-Security-Policy` is intentionally omitted — it would block Google Fonts (loaded in `+layout.svelte`) and future ad scripts. `Strict-Transport-Security` is omitted because the `.app` TLD enforces HTTPS at the browser level (HSTS preloaded).

---

## Environment

| Setting | Value |
|---------|-------|
| Framework | SvelteKit (auto-detected) |
| Node.js version | 22 |
| Build command | `npm run build` (auto-detected) |
| Output directory | `.svelte-kit/output` (auto-detected) |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SITE_URL` | No | Canonical site URL used for `<link rel="canonical">`, Open Graph tags, JSON-LD, sitemap `<loc>` entries, and `robots.txt`. Set to `https://runwise.app` in the Vercel production environment. Defaults to `https://runwise.app` if unset, so the site functions correctly without it, but setting it explicitly is recommended. |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | No | Google Search Console site-ownership verification token. When set, `SeoHead.svelte` renders `<meta name="google-site-verification" content="...">` on every page. Omit entirely if not verifying via meta tag (e.g. using DNS TXT verification instead) — the tag is skipped when unset. |
| `PUBLIC_GOOGLE_ADSENSE_ACCOUNT` | No | Google AdSense Publisher ID (e.g. `ca-pub-XXXXXXXXX`). When set, `SeoHead.svelte` renders `<meta name="google-adsense-account" content="...">` on every page — this is the meta-tag ownership verification method required by AdSense. Set this once AdSense is connected; no ads will serve until `PUBLIC_ADSENSE_CLIENT_ID` is also set and the site passes Google's review. |
| `PUBLIC_ADSENSE_CLIENT_ID` | No | Google AdSense publisher client ID (same value as `PUBLIC_GOOGLE_ADSENSE_ACCOUNT`, e.g. `ca-pub-XXXXXXXXX`). When set, `AdUnit.svelte` injects the AdSense script and renders ad slots for users who have granted marketing consent. Set only after the site has passed AdSense review — leaving this unset disables all ad rendering. |

Set optional variables in the Vercel dashboard under **Environment Variables** (left sidebar). See `.env.example` for the full list with descriptions. No environment variables are required for a first-time deploy.

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
