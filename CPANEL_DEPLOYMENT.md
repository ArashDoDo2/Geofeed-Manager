# cPanel Deployment Guide

## Requirements

- cPanel with Node.js support (Node.js 22 LTS or newer)
- SSH access recommended
- Domain or subdomain for `/geo`

## Build Locally

```bash
npm install
npm run build
```

## Upload to Server

Upload these folders/files to your app root:

- `.next/standalone`
- `.next/static`
- `public`
- `prisma`
- `package.json`
- `package-lock.json`
- `next.config.ts`

## Configure Environment

Create `.env` in the app root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
DATABASE_URL="file:./data/geo.db"
```

## Prepare Database Folder

```bash
mkdir -p data
chmod 755 data
```

## Run Migrations (first deploy)

If you need to run migrations on the server, install deps and run:

```bash
npm install
npx prisma migrate deploy
```

If you prefer, run migrations locally and upload `data/geo.db` to the server once.

## Start App

Set the startup file in cPanel to:

```
.next/standalone/server.js
```

Or from SSH:

```bash
node .next/standalone/server.js
```

## Verify

Visit: `https://your-domain.com/geo`

## Troubleshooting

- Ensure `.env` is present and correct
- Check cPanel Node.js logs for startup errors
- Confirm base path `/geo` in URLs

