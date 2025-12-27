# Geofeed Manager - Setup Guide

## Local Development

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL="file:./data/geo.db"
```

### 3) Setup database
```bash
npm run prisma:migrate
```

### 4) Run dev server
```bash
npm run dev
```

Open http://localhost:3000/geo

## Supabase OAuth

1. Create a project at https://supabase.com
2. Authentication → Providers → Google
3. Add redirect URL:
   - `https://your-domain.com/geo/auth/callback`
4. Copy URL + anon key into `.env.local`

## Production Build (local)

```bash
npm run build
```

## Notes

- Base path is `/geo` (set in `next.config.ts`).
- CSVs are generated as `public/geofeed-{id}.csv`.
- SQLite DB lives in `data/geo.db`. The folder is created at runtime.

