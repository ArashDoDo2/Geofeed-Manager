# Quick Deploy Checklist for cPanel

## Before Upload
- [ ] Download `Geofeed-Manager-Deploy_[timestamp].zip` (~272 MB)
- [ ] Have Supabase credentials ready (URL + Anon Key)
- [ ] Know your domain name (e.g., ripe.ir)

## Step 1: Upload (5 min)
```bash
# SSH into cPanel server
scp Geofeed-Manager-Deploy_20251226_162238.zip user@your-server.com:~/
ssh user@your-server.com
cd ~
unzip Geofeed-Manager-Deploy_20251226_162238.zip
```

## Step 2: Create Node.js App (3 min)
1. cPanel → **Node.js Application Manager**
2. **Create Application**
3. Choose version **18.x or higher**
4. Set Application Root: `/home/username/Geofeed-Manager-Deploy_20251226_162238`
5. Click **Create**

## Step 3: Set Environment Variables (2 min)
Create file: `~/Geofeed-Manager-Deploy_20251226_162238/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_BASE_URL=https://ripe.ir
```

## Step 4: Create Database (1 min)
```bash
mkdir -p ~/Geofeed-Manager-Deploy_20251226_162238/data
chmod 755 ~/Geofeed-Manager-Deploy_20251226_162238/data
```

## Step 5: Start Application (1 min)
1. cPanel → **Node.js Application Manager**
2. Find your app in the list
3. Click **Start** button (green play icon)
4. Wait 10-15 seconds

## Step 6: Test (2 min)
Visit: `https://your-domain.com/geo`

## Total Time: ~15 minutes

---

## If Something Goes Wrong

**App won't start?**
```bash
# Check logs
cat ~/.pm2/logs/[app-name]-error.log
```

**Can't find Node.js Manager in cPanel?**
- Look for "Setup Node.js App"
- Or check cPanel version (need 94+)

**404 errors on assets?**
- Normal! The app uses `/geo` basePath
- All routes accessed via `https://domain.com/geo/...`

**Database permission errors?**
```bash
chmod 755 ~/Geofeed-Manager-Deploy_20251226_162238/data
chmod 644 ~/Geofeed-Manager-Deploy_20251226_162238/data/geo.db
```

---

## Package Contents

The ZIP file contains everything needed to run the app:
- ✅ `.next/` - Pre-built production application
- ✅ `node_modules/` - All dependencies
- ✅ `package.json` - Configuration
- ✅ `prisma/` - Database schema

## What You Need to Add

- ❌ `.env.local` - Environment variables (create on server)
- ❌ `data/geo.db` - Database file (created automatically, but folder must exist)

---

Need help? Refer to **CPANEL_DEPLOYMENT.md** for detailed instructions.
