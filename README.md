# Midnight Smashers — Outrun burger landing

Single viewport (above the fold): Outrun / synthwave styling, two burgers (single + double), add-ons, Uber Eats / DoorDash. Hero: `public/pics/hero.png`.

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local — paste your Uber Eats and DoorDash store URLs
npm run dev
```

`NEXT_PUBLIC_*` vars are required for the buttons to link out; until they’re set, the page shows where to add them.

## Build

```bash
npm run build && npm start
```
