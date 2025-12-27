# Geofeed Manager

Multi-tenant web app for managing RFC 8805 geofeed CSVs with Supabase Auth, Prisma, and SQLite. Built on Next.js App Router with `/geo` base path and standalone deployment.

## Requirements

- Node.js 22 LTS (or newer)
- Next.js 16.1.x
- SQLite (`data/geo.db`)
- Supabase Auth (Google OAuth)

## Features

- Google OAuth login via Supabase
- Secure multi-tenant isolation
- CRUD geofeeds and IP ranges
- RFC 8805 CSV publish/unpublish
- Private CSV download
- Import from file or URL with preview, validation, and dedupe
- Draft import flow with resume support
- Help pages in-app

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run prisma:migrate
npm run dev
```

Open http://localhost:3000/geo

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL="file:./data/geo.db"
```

## CSV Format (RFC 8805)

No header row. Empty optional fields are blank between commas.

```
203.0.113.0/24,AU,VIC,Melbourne,3000
198.51.100.0/24,US,CA,San Francisco,94105
198.51.100.0/24,US,,,
```

## API Routes (core)

- `GET /api/geofeeds`
- `POST /api/geofeeds`
- `GET /api/geofeeds/[geofeedId]`
- `PATCH /api/geofeeds/[geofeedId]`
- `DELETE /api/geofeeds/[geofeedId]`
- `POST /api/geofeeds/[geofeedId]/generate` (publish)
- `POST /api/geofeeds/[geofeedId]/unpublish`
- `GET /api/geofeeds/[geofeedId]/download` (private)
- `POST /api/geofeeds/[geofeedId]/ranges`
- `PATCH /api/geofeeds/[geofeedId]/ranges/[rangeId]`
- `DELETE /api/geofeeds/[geofeedId]/ranges/[rangeId]`
- `POST /api/geofeeds/[geofeedId]/ranges/bulk-delete`
- `POST /api/geofeeds/[geofeedId]/import`

## Project Structure

```
app/
  (auth)/login/page.tsx
  (auth)/auth/callback/route.ts
  dashboard/page.tsx
  dashboard/[geofeedId]/page.tsx
  help/page.tsx
  api/geofeeds/route.ts
  api/geofeeds/[geofeedId]/route.ts
  api/geofeeds/[geofeedId]/ranges/route.ts
  api/geofeeds/[geofeedId]/ranges/[rangeId]/route.ts
  api/geofeeds/[geofeedId]/ranges/bulk-delete/route.ts
  api/geofeeds/[geofeedId]/generate/route.ts
  api/geofeeds/[geofeedId]/unpublish/route.ts
  api/geofeeds/[geofeedId]/download/route.ts
  api/geofeeds/[geofeedId]/import/route.ts
lib/
  db.ts
  supabase-client.ts
  supabase-server.ts
prisma/schema.prisma
middleware.ts
next.config.ts
```

## Deployment

See `CPANEL_DEPLOYMENT.md` and `CPANEL_QUICK_START.md`.

