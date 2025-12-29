✅ WORKING cPanel Deployment Guide for Next.js + Prisma + SQLite (Standalone Build)

(Updated and fixed — safe for production on cPanel)

This guide assumes NO SSH and uses cPanel File Manager + Setup Node.js App only.

🟦 1) Prepare Your Build ON WSL (NOT Windows native)

Prisma needs Linux binaries. WSL gives you exactly that.

1️⃣ Install dependencies (WSL)
npm install

2️⃣ Confirm Prisma binary target inside prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl"]
}


(If your server uses GNU libc I will tell you, but 99% of shared hosts are musl.)

3️⃣ Generate Prisma client (WSL)
npx prisma generate


This will produce:

query_engine-linux-musl.node   ✔ (correct)
query_engine-windows.dll.node  ❌ (safe to delete later)

4️⃣ Build standalone Next.js app (WSL)
npm run build


You will now have:

.next/standalone/server.js
.next/standalone/node_modules/@prisma/client/
.next/static/
.next/BUILD_ID
server.js   <-- wrapper

🟦 2) Create DEPLOY Folder (WSL)

This avoids uploading unnecessary files.

Run this in WSL:

rm -rf deploy
mkdir deploy

mkdir -p deploy/.next

cp -r .next/standalone deploy/.next/
cp -r .next/static deploy/.next/
cp .next/BUILD_ID deploy/.next/

cp -r public deploy/public
cp -r prisma deploy/prisma
cp -r data deploy/data

cp package.json deploy/package.json
cp server.js deploy/server.js

REMOVE Windows Prisma engines
find deploy -name "*windows*.node" -type f -delete
find deploy -name "*.dll.node" -type f -delete

Create ZIP for upload
cd deploy
zip -r ../deploy.zip .
cd ..


Your ZIP is ready.

🟦 3) Upload to cPanel (File Manager)

Upload and extract deploy.zip into:

/home/USERNAME/app/Geofeed-Manager/


Final structure must look like:

app/
  Geofeed-Manager/
    .next/
      BUILD_ID
      static/
      standalone/
        .next/
        node_modules/@prisma/client
        server.js
    public/
    prisma/
    data/geo.db
    package.json
    server.js

🟦 4) Setup cPanel Node.js App

Open:

➡ Setup Node.js App

Set:

Setting	Value
Application root	/app/Geofeed-Manager
Application URL	https://yourdomain.com/geo
Node.js version	22.x
Startup file	server.js
Application mode	production

Click Save then Start App.

🟦 5) Environment Variables in cPanel

Add:

NEXT_PUBLIC_SUPABASE_URL=https://YOUR.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
DATABASE_URL="file:./data/geo.db"
NEXT_DISABLE_TURBOPACK=1
NODE_ENV=production

Standalone note:
- You can keep DATABASE_URL as file:./data/geo.db; the app rewrites it to file:../../data/geo.db in production.
- If you prefer, set DATABASE_URL="file:../../data/geo.db" directly.


Click Save → Restart App.

🟦 6) DO NOT RUN NPM INSTALL on cPanel

You are running a standalone build.

Your app does NOT need cPanel’s node_modules.

Running "NPM Install" can BREAK Prisma engines.

You already have the correct Linux Prisma binaries inside .next/standalone/node_modules.

❌ Do NOT click “Run NPM Install”.
✔ Your app already contains everything needed.
🟦 7) SQLite DB Upload

Place your SQLite file in:

data/geo.db


Correct permissions in File Manager:

Path	Perm
data/	755
data/geo.db	644
🟦 8) Supabase Configuration

Inside Supabase → Authentication → URL config:

Setting	Value
Site URL	https://yourdomain.com/geo
Redirect URL	https://yourdomain.com/geo/auth/callback
🟦 9) Verify Deployment

Visit:

https://yourdomain.com/geo


You should see the login page.

Try logging in with Google.

🟥 TROUBLESHOOTING (All Cases Fixed)
❌ Error: “query engine binary not found”

Cause: wrong Prisma platform.

Fix (WSL):

npx prisma generate --schema=prisma/schema.prisma
npm run build


Make sure linux-musl is included.

❌ Error: “Symlink node_modules is invalid”

Cause: cPanel tried to run next start or dev server.

Fix: startup file must be:

server.js


Not:

node_modules/next/dist/bin/next

❌ Error: “production-start-no-build-id”

Cause: missing .next/BUILD_ID.

Fix: upload full .next folder from deploy folder.

❌ Auth redirects to localhost

Fix:

NEXT_PUBLIC_BASE_URL must be your domain.

Supabase → Redirect → must be /geo/auth/callback.
