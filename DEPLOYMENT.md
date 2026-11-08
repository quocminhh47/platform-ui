# Deploying platform-ui on Vercel (Hobby)

This frontend is a **Vite + React 19** single-page app (SPA) using **React Router 7** (`createBrowserRouter`). The Spring Boot API is deployed separately (e.g. on **Render**). The UI talks to the API only through `VITE_API_BASE_URL` at build time.

## Prerequisites

- GitHub repository connected to Vercel (this repo’s remote is already configured locally; you only need to import it in the Vercel dashboard).
- Backend URL on Render (or another host), with **CORS** allowing your Vercel origins (`https://<project>.vercel.app` and preview URLs).

## Import from GitHub

1. Open [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. Import the **platform-ui** GitHub repository.
3. Confirm Vercel detects **Vite** (or set **Framework Preset** to Vite).
4. Leave **Root Directory** as `.` (repository root).
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. **Install Command**: `npm install` (default)
8. Add environment variables (below), then deploy.

Each push to the default branch triggers a **Production** deployment. Pull requests and other branches get **Preview** deployments unless you change that in project settings.

## Required environment variables

| Variable | Environments | Example | Notes |
|----------|----------------|---------|--------|
| `VITE_API_BASE_URL` | Production, Preview (and Development if you use Vercel dev) | `https://your-backend.onrender.com` | Public, inlined at **build** time. **No trailing slash.** Not a secret—do not put JWT or DB credentials here. |

### Production vs Preview

- Set `VITE_API_BASE_URL` for **Production** to your stable Render URL.
- For **Preview**, use the same staging API or a dedicated preview API; each preview build bakes in whatever value was set when that build ran.
- Changing the variable in Vercel does **not** affect already-built deployments until you **redeploy**.

### Connect the Render backend

1. Deploy the backend and note its HTTPS base URL (no path suffix).
2. In the backend, set `CORS_ALLOWED_ORIGINS` to include:
   - `https://<your-vercel-production-domain>`
   - Optionally `https://*.vercel.app` is **not** supported as a wildcard in Spring; add each preview origin you care about, or use a single production origin for MVP.
3. In Vercel → **Settings** → **Environment Variables**, set `VITE_API_BASE_URL` to that base URL.
4. Redeploy the frontend (or push a commit) so the new value is baked into the bundle.

### Update the backend URL later

1. Change `VITE_API_BASE_URL` in Vercel for the target environment(s).
2. Trigger **Redeploy** on the latest deployment (or push any commit).
3. Update backend CORS if the frontend origin changed.

## SPA routing

Client routes include `/courses`, `/login`, `/dashboard`, `/admin/...`, and nested learning URLs. Direct navigation or refresh must serve `index.html` so React Router can load.

`vercel.json` contains a catch-all rewrite to `/index.html`. Vercel still serves files that exist under `dist/` (e.g. `/assets/*`, `/favicon.svg`) before applying the rewrite.

## Local development vs production builds

| File | Purpose |
|------|---------|
| `.env.development` | Default `VITE_API_BASE_URL=http://localhost:8080` for `npm run dev` (committed). |
| `.env.example` | Placeholder for documentation; copy to `.env` if you prefer a single local override. |
| `.env.local` | Gitignored; overrides for your machine only. |

Production builds (`npm run build`) **fail** if `VITE_API_BASE_URL` is missing—`vite.config.ts` checks this before bundling.

## Authentication and API errors

- JWT access tokens remain in **sessionStorage** only (`src/services/api/token-storage.ts`).
- API calls use `fetch` via `src/services/api/client.ts` (no Axios).
- When the backend is down, sleeping (Render free tier), or unreachable, users see normal request failures from feature UI; there is no frontend keep-alive or polling for the backend.

## Verification before/after deploy

```bash
npm install
npm run lint
npm test
VITE_API_BASE_URL=https://your-backend.onrender.com npm run build
```

Do not commit `.env` files with real production URLs unless your team explicitly wants that; prefer Vercel env settings.

## Free-tier limitations

- **Vercel Hobby**: bandwidth and build minutes limits apply; preview deployments count toward usage.
- **Render free web services**: spin down after inactivity; the first API request after sleep can take tens of seconds—login and catalog loads may feel slow without upgrading the backend tier.
- **CORS**: must be updated on the backend when adding new Vercel preview domains.

## Manual steps checklist

1. Import GitHub repo in Vercel with build settings above.
2. Set `VITE_API_BASE_URL` for Production (and Preview if needed).
3. Configure backend CORS for the Vercel frontend origin(s).
4. Deploy and smoke-test login, catalog, and a deep link (e.g. `/courses` refresh).

No Vercel CLI or extra hosting SDK is required for standard Git-based deployments.
