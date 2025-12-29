# cPanel Deployment Guide (No SSH, Production)

# cPanel Deployment Guide (No SSH, Production)

This guide uses **File Manager + Setup Node.js App** only (no SSH).

## Requirements

- cPanel with Node.js support (Node.js 22 LTS or newer)
- Domain or subdomain for `/geo`

## 1) Build Locally

```bash
npm install
npm run build
```

## 2) Upload to Server (File Manager)

Upload the **built output**, not source files. Your app root should contain:

- `.next/` (must include `.next/BUILD_ID`, `.next/server/`, `.next/static/`)
- `public/`
- `prisma/`
- `data/geo.db`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `.env` (optional; see Env section)

Tip: Use **split packages** to avoid cPanel extraction issues:

1) **core.zip** (small):
   - `public/`, `prisma/`, `data/geo.db`, `package.json`, `package-lock.json`,
     `next.config.ts`, `.env`
2) **next.zip** (only `.next/`):
   - `.next/BUILD_ID`, `.next/server/`, `.next/static/`, manifest files

Upload/extract **core.zip first**, then **next.zip** into the same app root.

## 3) Database

The app uses a prebuilt SQLite DB:

- Local: run `npm run prisma:migrate`
- Upload: `data/geo.db` into the server `data/` folder
- Permissions: `data/` = 755, `data/geo.db` = 644 (or 664)

## 4) Environment Variables

You can set envs in cPanel **or** use a `.env` file in the app root.

Required:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
DATABASE_URL="file:./data/geo.db"
```

Notes:
- If `.env` exists, it overrides cPanel envs.
- `NEXT_PUBLIC_BASE_URL` must be your domain (no localhost).

## 5) Create the Node.js App in cPanel

In **Setup Node.js App**:

- **Application root**: your app folder
- **Application URL**: your domain plus `/geo`
- **Startup file**: `node_modules/next/dist/bin/next`
- **Node.js version**: 22 LTS or newer
- **Application mode**: Production (`NODE_ENV=production`)

Save and start the application.

Set **Application startup file arguments** to:

```
start
```

## 6) Install Dependencies (cPanel)

If your hosting allows it, click **Run NPM Install**.  
If you cannot run npm due to resource limits, use a package that already includes
`node_modules`.

## 7) Permissions (If Things Break)

cPanel sometimes preserves zip permissions. If you see missing files or 403 errors:

```bash
# Fix perms (run from app root)
find .next -type d -exec chmod 755 {} +
find .next -type f -exec chmod 644 {} +
chmod 775 data
chmod 664 data/geo.db
```

If you get **Permission denied** on `.next/server/app/(auth)` paths, quote the folder:

```bash
find ".next/server/app/(auth)" -type d -exec chmod 755 {} +
find ".next/server/app/(auth)" -type f -exec chmod 644 {} +
```

## 8) Supabase Redirects

In Supabase:

- **Site URL**: `https://your-domain.com/geo`
- **Redirect URLs**: `https://your-domain.com/geo/auth/callback`

## 9) Verify

Visit: `https://your-domain.com/geo`

## Troubleshooting

- `production-start-no-build-id`: `.next/BUILD_ID` is missing; re-upload `.next/`.
- `Cannot find module 'next'`: run NPM Install or upload package with `node_modules`.
- `@prisma/client-<hash> not found`: run `prisma generate` or upload `node_modules/.prisma`.
- Redirects to localhost: fix `NEXT_PUBLIC_BASE_URL` and Supabase Redirect URLs.
