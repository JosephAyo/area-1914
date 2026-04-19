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

## Available Scripts

| Script           | Description                      |
| ---------------- | -------------------------------- |
| `yarn dev`       | Start Vite dev server with HMR   |
| `yarn build`     | Production build to `dist/`      |
| `yarn preview`   | Preview production build locally |
| `yarn lint`      | Run ESLint on all files          |
| `yarn typecheck` | Run `tsc --noEmit` type checking |

## Pre-commit Hooks

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
