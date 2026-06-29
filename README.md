# Orion PlantWise — AI Plant Health Companion

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%23EA54AE?style=flat&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Oriondevcore)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)

AI-powered plant disease diagnostics. Take a photo of any plant — Orion PlantWise identifies the species, detects diseases, and provides step-by-step treatment plans.

![PlantWise Hero](public/plant-hero.png)

## Features

- **AI Vision Diagnosis** — Upload or snap a photo, get instant health analysis powered by Cloudflare Workers AI (Llama 3.2 11B Vision)
- **Disease Detection** — Identifies common issues: overwatering, pests, nutrient deficiency, fungal/bacterial diseases, and more
- **Treatment Plans** — Step-by-step care recommendations in plain language
- **Plant Encyclopedia** — Search any species for detailed care guides (light, water, soil, temperature)
- **Care Reminders** — Set watering, fertilizing, and repotting schedules with notifications
- **Activity Logging** — Track every watering, fertilizing, and pruning session
- **Health Dashboard** — Overview of all your plants with health status at a glance
- **Dark/Light Mode** — Easy on the eyes, day or night

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Database:** SQLite via Prisma ORM
- **AI:** Cloudflare Workers AI (Llama 3.2 11B Vision, Llama 3.1 8B Instruct)
- **State:** Zustand, TanStack React Query
- **Animations:** Framer Motion

## Getting Started

```bash
# Clone
git clone https://github.com/Oriondevcore/orion-plantwise.git
cd orion-plantwise

# Install
bun install

# Set up database
bun run db:push

# Set environment variables (see .env.example)
export CLOUDFLARE_API_TOKEN=your_token_here

# Run
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | Yes | Cloudflare API token with Workers AI permission |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `DATABASE_URL` | No | SQLite database path (defaults to `file:./db/custom.db`) |

## Sponsors

This project is built and maintained by **Orion Dev Core**. If you find it useful, please consider [sponsoring us on GitHub](https://github.com/sponsors/Oriondevcore).

- **$5/mo** — Supporter badge on profile
- **$25/mo** — Name in README acknowledgements + private repo access
- **$100/mo** — Logo on project website + GitHub README
- **$500/mo** — Everything above + company license + feature voting

## License

MIT — see [LICENSE](LICENSE)

---

Built by [Orion Dev Core](https://oriondevcore.com)
