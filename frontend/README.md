# The Nigerian History Pulse — Frontend

A React + TypeScript frontend built with Vite, visualizing historical relevance of Nigerian events and people.

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **Vite 8** for dev server and bundling
- **Recharts** for data visualization
- **TanStack React Query** for data fetching and caching
- **SCSS Modules** for component-scoped styling

## Prerequisites

- **Node.js v24+** (managed via `.nvmrc`)
- **Yarn** (v1.x classic)

## Getting Started

```bash
# Use the correct Node version
nvm use

# Install dependencies
yarn install

# Start dev server
yarn dev
```

The dev server runs at [http://localhost:5173](http://localhost:5173).

The main app also needs the API running on port 8000. In a separate terminal, from the repository root:

```bash
cd backend
.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Check [backend health](http://127.0.0.1:8000/health). `ERR_CONNECTION_REFUSED` for this address means the API process is not listening. The standalone prototype works without the backend; the main app uses real API data. An old cache can take longer on its first collection request while Wikipedia records refresh.

## Available Scripts

| Script           | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `yarn dev`       | Start Vite dev server with HMR                                  |
| `yarn build`     | Production build to `dist/`                                     |
| `yarn preview`   | Preview production build locally                                |
| `yarn lint`      | Run ESLint on all files                                         |
| `yarn typecheck` | Run `tsc --noEmit` type checking                                |
| `yarn test`      | Run chart, navigation, search, and server-rendered route checks |

## Pre-commit Hooks

The approved compact explorer is implemented in the main app. Run the frontend and backend as described above and in the root README to exercise real API data. Open `/` for grid-first Explore (the existing `/discover` URL remains supported), `/topics/:slug` for quick reading history, and `/stories` for deeper reading. `/stories/subjects/:slug` contains article source breakdowns.

Search filters the returned collection while preserving Wikipedia autocomplete and direct subject lookup. Percent changes require two complete 30-day periods and at least 50 views in the prior period. The featured endpoint now supplies a 60-day lookback. Self-hosted Noto Sans fonts and their license live under `public/fonts/`.

The [design plan](../docs/design/REVAMP_PLAN.md), [backlog](../docs/design/BACKLOG.md), and [release review](../docs/design/RELEASE_REVIEW.md) record scope and remaining validation. The approved standalone prototype remains at `/prototypes/explorer/` and earlier editorial studies at `/design-studies/` during local development; neither is included in the production build.

Husky + lint-staged runs on every commit:

- **`.ts/.tsx`** → ESLint auto-fix + Prettier
- **`.json/.scss/.css/.md`** → Prettier

## Project Structure

```
src/
├── types/          # Shared TypeScript interfaces
├── services/       # API client (fetch wrappers)
├── config/         # Curated topic categories
├── components/     # React components (with .module.scss)
├── styles/         # Global SCSS tokens and base styles
├── App.tsx         # Root component
└── main.tsx        # Entry point
```
