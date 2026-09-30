# CodeLens — Vercel-ready build

This is the same CodeLens frontend and analyzer, flattened from the original Replit/pnpm monorepo into a normal Vite + React project for simpler Vercel deployment.

## Local

```bash
npm install
npm run dev
```

The Vite dev server includes the local `/api/analyze`, `/api/health`, and `/api/healthz` endpoints.

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Keep the project Root Directory as `./`.
4. Do not set `VITE_API_URL` for a same-origin deployment.
5. Deploy.

`vercel.json` already configures Vite output and sends `/api/*` requests to the Express serverless function.

## Production checks

- `/`
- `/dsa`
- `/features`
- `/docs`
- `/about`
- `/api/healthz`
- POST `/api/analyze` with `{ "code": "x = None\nif x == None:\n    pass", "language": "python" }`
