# Kandura Store — Frontend

A React 19 + Vite single-page app for Kandura Store, a bespoke Emirati
kandura design-and-order platform. Talks to a Laravel API over Bearer-token
auth (see `src/services/`).

## Local development

```bash
npm install
cp .env.example .env   # then edit VITE_API_URL if needed
npm run dev
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No (has a hardcoded fallback) | Base URL of the Laravel API, including the `/api` suffix. |

Only variables prefixed `VITE_` are ever exposed to the browser — this is a
Vite platform guarantee, not a convention, so it's safe to add more `VITE_*`
variables here later without risk of accidentally shipping a secret. Never
put a Stripe secret key, Firebase private credentials, Laravel `APP_KEY`, or
Passport client secret in this file or any `.env*` file read by the
frontend build.

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Tests & linting

```bash
npm run test
npm run lint
```

## Deploying to Vercel

- **Root Directory**: this project's folder (the one containing this
  `package.json`) — not a subfolder.
- **Build command**: `npm run build` (default for Vite is auto-detected).
- **Output directory**: `dist` (auto-detected).
- **Environment variables**: set `VITE_API_URL` in the Vercel project's
  Settings → Environment Variables (Production/Preview/Development as
  needed) — it must be set there, not just in a local `.env` file, since
  Vercel doesn't read your local `.env`.
- **`vercel.json`** at the project root handles SPA client-side routing —
  without it, refreshing a nested route (e.g. `/orders/12`) or opening it
  directly returns a `404: NOT_FOUND` from Vercel's static file server,
  because there's no `orders/12/index.html` file for it to serve. The
  rewrite rule sends every non-file request to `index.html` so React
  Router can take over and resolve the route client-side.
