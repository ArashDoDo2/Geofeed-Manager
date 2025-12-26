# cPanel Node.js Deployment Guide

## Overview
This guide walks you through deploying the Geofeed Manager application to a cPanel server running Node.js.

## Pre-Deployment Requirements
- cPanel account with Node.js support
- SSH access to your server
- Domain or subdomain (e.g., `ripe.ir`)
- cPanel version 94+

## Deployment Steps

### 1. Upload the Deployment Package

Download the compressed file `Geofeed-Manager-Deploy_[timestamp].zip` from your local machine.

**Via cPanel File Manager:**
1. Log into cPanel
2. Go to **File Manager**
3. Navigate to your home directory or desired location
4. Upload `Geofeed-Manager-Deploy_[timestamp].zip`
5. Right-click → **Extract** to unzip the folder

**Via SSH (faster):**
```bash
cd ~
# Upload the ZIP file using SCP or SFTP, then:
unzip Geofeed-Manager-Deploy_20251226_162238.zip
```

### 2. Create Node.js Application in cPanel

1. Log into **cPanel**
2. Find and click **Node.js Application Manager** (or **Setup Node.js App**)
3. Click **Create Application**
4. Configure as follows:

   | Setting | Value |
   |---------|-------|
   | **Node.js version** | 18.x or higher |
   | **Application mode** | Production |
   | **Application startup file** | `server.js` (we'll create this) |
   | **Application root** | `/home/username/Geofeed-Manager-Deploy_20251226_162238` |
   | **Application URL** | Your domain with `/geo` path |
   | **Application port** | 3000 (cPanel will assign) |

5. Click **Create**

### 3. Create Startup Script

cPanel will create a `server.js` file. Edit it to start your Next.js app:

**Via SSH:**
```bash
cd ~/Geofeed-Manager-Deploy_20251226_162238
cat > server.js << 'EOF'
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Start the Next.js standalone server
const server = spawn('node', ['.next/standalone/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || 3000,
    NODE_ENV: 'production'
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});
EOF
chmod +x server.js
```

### 4. Set Environment Variables

Create `.env.local` in the app root with your Supabase credentials:

**Via cPanel File Manager:**
1. Navigate to `~/Geofeed-Manager-Deploy_20251226_162238/`
2. Create new file: `.env.local`
3. Add your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://ripe.ir
```

**Via SSH:**
```bash
cd ~/Geofeed-Manager-Deploy_20251226_162238
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://ripe.ir
EOF
```

### 5. Create SQLite Database Directory

```bash
cd ~/Geofeed-Manager-Deploy_20251226_162238
mkdir -p data
chmod 755 data
touch data/geo.db
chmod 644 data/geo.db
```

### 6. Configure Apache Reverse Proxy

cPanel will automatically set up a reverse proxy. Verify in **EasyApache Configuration** that the app is accessible.

**If using Addon Domains:**
- Point your domain (e.g., `ripe.ir`) to the cPanel account
- The `/geo` basePath is configured in `next.config.ts`
- Access your app at: `https://ripe.ir/geo`

### 7. Start the Application

**Via cPanel Node.js Manager:**
1. Return to **Node.js Application Manager**
2. Find your application in the list
3. Click the **Start Application** button (green play icon)
4. Wait 10-15 seconds for startup

**Via SSH:**
```bash
cd ~/Geofeed-Manager-Deploy_20251226_162238
npm start
```

### 8. Verify Deployment

1. **Check application status** in cPanel Node.js Manager (should show "Running")
2. **Test the app**: Visit `https://your-domain.com/geo` in your browser
3. **Check logs** in cPanel for any errors:
   - **Node.js Application Manager** → Your app → **Logs**
   - Or via SSH: `cat ~/.pm2/logs/[app-name]-error.log`

## Troubleshooting

### Port Already in Use
cPanel automatically assigns a port. If conflicts occur:
```bash
lsof -i -P -n | grep LISTEN  # Check listening ports
kill -9 [PID]  # Kill process if needed
```

### Database Permission Denied
```bash
chmod 755 ~/Geofeed-Manager-Deploy_20251226_162238/data
chmod 644 ~/Geofeed-Manager-Deploy_20251226_162238/data/geo.db
```

### Application Won't Start
1. Check environment variables in `.env.local`
2. Review logs in cPanel Node.js Manager
3. Verify Node.js version: `node --version` (should be 18+)
4. Test locally: `npm run build && npm start`

### Connection to Supabase Fails
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase console for API key validity
- Ensure firewall rules allow outbound HTTPS to Supabase

### Static Assets Not Loading
The app uses `basePath="/geo"` and `assetPrefix="/geo"` configured in `next.config.ts`. All assets are automatically prefixed. No manual configuration needed.

## File Structure on Server

```
~/Geofeed-Manager-Deploy_20251226_162238/
├── .next/                    # Pre-built Next.js application
│   ├── standalone/           # Standalone server
│   ├── static/               # Static assets
│   └── server/               # Server-side code
├── node_modules/             # Production dependencies
├── prisma/                   # Database schema reference
├── data/                     # SQLite database directory
│   └── geo.db               # Database file
├── .env.local               # Environment variables (create this!)
├── package.json             # Dependencies manifest
├── package-lock.json        # Dependency lock file
└── server.js                # Application startup script
```

## Maintenance

### Update Application
1. Download new deployment package
2. Upload and extract to new folder
3. Create new Node.js app in cPanel pointing to new folder
4. Stop old app, start new app
5. Delete old folder after verifying new app works

### Backup Database
```bash
cp ~/Geofeed-Manager-Deploy_20251226_162238/data/geo.db ~/geo.db.backup
```

### View Real-Time Logs
```bash
tail -f ~/.pm2/logs/[app-name]-error.log
tail -f ~/.pm2/logs/[app-name]-out.log
```

## Performance Tips

1. **Enable cPanel AutoSSL** for HTTPS
2. **Enable cPanel Mod Deflate** for gzip compression
3. **Set Node.js to Production mode** (already configured)
4. **Monitor memory usage** in cPanel Resource Monitor
5. **Consider using Redis cache** if performance issues arise

## Support

- **Supabase Issues**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **cPanel Support**: Your hosting provider's support team

---

**Deployment Package Generated**: December 26, 2025
**Next.js Version**: 15.5.9
**Node.js Required**: 18.x or higher
