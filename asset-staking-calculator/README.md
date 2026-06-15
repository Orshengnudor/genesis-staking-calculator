# Real Genesis Staking Calculator

A time-weighted staking rewards calculator for the Real Finance Genesis Campaign.

## What it does

Enter any Ethereum wallet address to see:
- Projected USDC reward at pool close (Aug 12, 2026)
- Accrued rewards so far
- Your pool share and weight share
- Early exit penalty if applicable

Data is fetched live from the Real Finance staking protocol and cached for 12 hours.

## Project Structure

```
packages/
  web/                  Vite + React frontend + Hono API proxy
    src/
      api/index.ts      Hono routes — proxies staking.real.finance
      web/pages/        Frontend pages
  mobile/               Expo mobile app
  desktop/              Electron desktop app
```

## Dev

```sh
bun install
bun run dev
```

Open http://localhost:4200

## Deploy (Vercel)

```sh
npx vercel --prod
```

Build command: `cd packages/web && bunx vite build`
Output directory: `packages/web/dist`

## Environment Variables

Only one env var needed for production:

```
NODE_ENV=production
```

No database, no auth, no file storage — the app proxies directly from `staking.real.finance`.
