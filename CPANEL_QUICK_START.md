# cPanel Quick Start

## 1) Build locally
```bash
npm install
npm run build
```

## 2) Upload to server

Upload:
- `.next/standalone`
- `.next/static`
- `public`
- `prisma`
- `package.json`
- `package-lock.json`
- `next.config.ts`

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
.next/standalone/server.js
```

Open: `https://your-domain.com/geo`

