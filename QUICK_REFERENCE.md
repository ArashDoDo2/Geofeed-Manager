# QUICK REFERENCE

## Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local with Supabase credentials
nano .env.local

# 4. Generate Prisma client
npm run prisma:generate

# 5. Create database and run migrations
npm run prisma:migrate

# 6. Start development server
npm run dev
```

## Development

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000/geo
```

## Build for Production

```bash
# Build the app
npm run build

# Start production server
npm start
```

## Database Commands

```bash
# Run Prisma migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Open Prisma Studio (database UI)
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset
```

## Environment Variables Required

Create `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_BASE_URL=https://ripe.ir
```

## Supabase Setup

1. Create project at https://supabase.com
2. Go to Authentication → Providers → Google
3. Add your Google OAuth credentials
4. Set redirect URL: `https://ripe.ir/geo/auth/callback`
5. Copy Project URL and Anon Key to `.env.local`

## Project Structure at a Glance

```
app/                          # Next.js App Router
├── (auth)/login              # Login page
├── dashboard/                # Geofeed management
└── api/geofeeds              # API endpoints

lib/                          # Utilities
├── db.ts                     # Prisma client
├── supabase-client.ts        # Client auth
└── supabase-server.ts        # Server auth

prisma/                       # Database
└── schema.prisma             # Models

public/                       # Static files
└── geofeed-*.csv            # Generated files

middleware.ts                 # Auth middleware
```

## API Endpoints

```
GET    /api/geofeeds                    List geofeeds
POST   /api/geofeeds                    Create geofeed
DELETE /api/geofeeds/{id}               Delete geofeed

GET    /api/geofeeds/{id}/ranges        List ranges
POST   /api/geofeeds/{id}/ranges        Create range
PUT    /api/geofeeds/{id}/ranges/{rid}  Update range
DELETE /api/geofeeds/{id}/ranges/{rid}  Delete range

POST   /api/geofeeds/{id}/generate      Generate CSV
```

## Pages

```
/geo/                              Home/Landing
/geo/login                         Google OAuth login
/geo/dashboard                     List all geofeeds
/geo/dashboard/{geofeedId}         Manage IP ranges
```

## Common Issues & Solutions

### Port Already in Use
```bash
PORT=3001 npm run dev
```

### Database Locked
```bash
rm -rf .next
npm run build
```

### Clear All (Caution!)
```bash
rm -rf .next node_modules data/geo.db
npm install
npm run prisma:migrate
npm run dev
```

### Check Database
```bash
npx prisma studio
```

## Production Deployment (cPanel)

```bash
# On local machine
npm run build

# On server
npm ci --production
mkdir -p data
node .next/standalone/server.js
```

## Monitoring

```bash
# View generated CSV
ls -la public/geofeed-*.csv

# Check database size
du -h data/geo.db

# View logs (production)
tail -f application.log
```

## Key Features

✅ Multi-tenant (each user isolated)
✅ Google OAuth authentication
✅ RFC 8805 CSV generation
✅ IP CIDR validation
✅ ISO country code validation
✅ basePath="/geo" support
✅ Standalone build for Node.js
✅ SQLite database
✅ Tailwind CSS styling

## Default Values

- Database file: `data/geo.db`
- basePath: `/geo`
- CSV path: `public/geofeed-{geofeedId}.csv`
- Node.js version: 18+ required

## Testing OAuth Locally

When running on `localhost:3000`:
- You may need to adjust Supabase redirect URLs
- For dev, use: `http://localhost:3000/geo/auth/callback`
- For production, use: `https://ripe.ir/geo/auth/callback`

## Important Notes

1. **Always start with** `npm run prisma:migrate` before first run
2. **basePath is baked in** - don't change without rebuilding
3. **Database is local SQLite** - backup `data/geo.db` regularly
4. **CSV files are public** - anyone can download if they know the ID
5. **Security is server-side** - never trust client for auth

## File Locations

```
Config:     next.config.ts
Auth:       middleware.ts, lib/supabase-*.ts
Database:   data/geo.db
Schema:     prisma/schema.prisma
UI:         Tailwind CSS in app/globals.css
API:        app/api/geofeeds/**
Pages:      app/dashboard/**, app/(auth)/login/
```

## Performance Tips

1. Use `npm run build` for production
2. Enable caching headers for CSV files
3. Monitor `data/geo.db` size
4. Consider CDN for CSV files
5. Set Node.js memory limits for cPanel

## Debugging

```bash
# Enable verbose logging
DEBUG=prisma:* npm run dev

# Check Next.js build
npm run build -- --debug

# Inspect Prisma operations
npm run prisma:studio
```
