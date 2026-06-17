---
name: Feelms monorepo architecture
description: Three-app architecture for the Feelms streaming platform — site, admin panel, and API server.
---

## Structure

- `artifacts/feelms` — public site (Vite+React, port 21809 in dev, webview workflow)
- `artifacts/admin` — admin panel (Vite+React, port 5173 in dev, console workflow)
- `artifacts/api-server` — Express API (port 8080, console workflow)
- `shared/` — TypeScript types, utils (slugify, buildMovieUrl), constants, validation

## Key architectural decisions

All apps live under `artifacts/*` which is covered by the pnpm workspace glob `artifacts/*` — no manual workspace registration needed.

**Why:** Keeps the monorepo self-consistent; avoids duplicating workspace config.

**How to apply:** Any new app goes under `artifacts/` and gets picked up automatically.

## Public site SEO

- Movie URLs: `/movie/{title-slug}-{id}` (e.g. `/movie/the-dark-knight-7`)
- Category URLs: `/category/{genre-slug}` (e.g. `/category/action`)
- `movie-detail.tsx` extracts numeric ID from trailing `-{id}` segment of slug
- Sitemap served at `/api/sitemap.xml`, robots.txt at `/api/robots.txt`

## Admin API routes

- Admin-specific endpoints are namespaced under `/api/admin/*`
- Settings endpoint: `GET /api/admin/settings`, `PATCH /api/admin/settings`
- Settings are in-memory (restart resets them); no DB table for settings yet

## DB

- Schema pushed via `cd lib/db && pnpm run push`
- Must run this before API server starts for the first time
- All tables: users, movies, episodes, banners, sections, interpreters, payments, watch_history, ads
