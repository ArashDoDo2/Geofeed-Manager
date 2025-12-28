# cPanel Deployment Guide (No SSH)

This guide assumes you only have access to cPanel File Manager and the **Setup Node.js App** interface.

## Requirements

- cPanel with Node.js support (Node.js 22 LTS or newer)
- Domain or subdomain for `/geo`

## 1) Build Locally

```bash
npm install
npm run build
```

## 2) Upload to Server (File Manager)

Upload these folders/files into your application root:

- `.next/standalone`
- `.next/static`
- `public`
- `prisma`
- `package.json`
- `package-lock.json`
- `next.config.ts`

Tip: Zip them locally, upload once, then use **Extract** in File Manager.

## 3) Create the Database Folder

In File Manager:

1. Create a folder named `data` in the app root.
2. Ensure the folder is writable (755 is typical).

If you cannot run migrations on the server, **upload a pre-migrated SQLite DB** from your local machine:

- Run `npm run prisma:migrate` locally.
- Upload `data/geo.db` into the server `data/` folder.

## 4) Configure Environment Variables

Create a file named `.env` in the app root using File Manager:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
DATABASE_URL="file:./data/geo.db"
```

## 5) Create the Node.js App in cPanel

In **Setup Node.js App**:

- **Application root**: your app folder
- **Application URL**: your domain plus `/geo`
- **Startup file**: `.next/standalone/server.js`
- **Node.js version**: 22 LTS or newer

Save and start the application.

## 6) Verify

Visit: `https://your-domain.com/geo`

## Troubleshooting

- Ensure `.env` exists in the app root.
- Confirm the `data/` folder exists and is writable.
- Check **Node.js App logs** in cPanel for startup errors.
- Ensure the base path `/geo` is used for all URLs.
