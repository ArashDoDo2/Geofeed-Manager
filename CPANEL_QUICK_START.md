# cPanel Quick Start

## 1) Build locally
```bash
npm install
npm run build
```

## 2) Upload to server

Upload **two small zips** to avoid cPanel extraction issues:

1) **core.zip**: `public/`, `prisma/`, `data/geo.db`, `package.json`,
   `package-lock.json`, `next.config.ts`, `.env`, `server.js`
2) **next.zip**: `.next/` only (must include `BUILD_ID`, `server/`, `static/`)

## 3) Create `.env`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
DATABASE_URL="file:./data/geo.db"
```

## 4) Create DB folder
```bash
mkdir -p data
chmod 755 data
```

## 5) Migrate (first deploy)
```bash
npm install
npx prisma migrate deploy
```

## 6) Start

Startup file:
```
server.js
```

Open: `https://your-domain.com/geo`

## Permissions (if needed)

```bash
find .next -type d -exec chmod 755 {} +
find .next -type f -exec chmod 644 {} +
chmod 775 data
chmod 664 data/geo.db
```
