# SaaS Scheduler — Frontend

React + Vite frontend application.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:5000`.

## Production Build

```bash
npm run build
```

Output is in `dist/`. Deploy this folder as a static site (Vercel, Netlify, Nginx, etc.).

## Environment

No `.env` is needed for the frontend. All API calls go through the `/api` proxy (configured in `vite.config.ts`).

For production, set the backend API base URL in your hosting config or update `vite.config.ts`'s `server.proxy`.
