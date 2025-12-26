# Geofeed Manager - Setup Guide

## Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BASE_URL=https://ripe.ir
```

### Step 3: Set Up Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### Step 4: Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000/geo

## Supabase Configuration

### Create OAuth Application

1. Go to https://supabase.com and create a new project
2. Navigate to Authentication → Providers
3. Enable Google OAuth:
   - Add your Google OAuth credentials
   - Set redirect URL to: `https://ripe.ir/geo/auth/callback`

### Get Credentials

- Project URL: Settings → API → Project URL
- Anon Key: Settings → API → anon key

## Production Deployment

### Build
```bash
npm run build
```

### Deploy to cPanel

1. Upload files to server (excluding node_modules)
2. SSH into server:
   ```bash
   cd /home/user/geofeed-web/Geofeed-Manager
   npm ci --production
   mkdir -p data
   ```

3. Configure environment:
   ```bash
   cat > .env <<EOF
   NEXT_PUBLIC_SUPABASE_URL=your-production-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
   NEXT_PUBLIC_BASE_URL=https://ripe.ir
   EOF
   ```

4. Start application:
   ```bash
   node .next/standalone/server.js
   ```

5. Configure reverse proxy in cPanel to forward `/geo` to Node.js process

## Database

- **Location**: `data/geo.db`
- **Type**: SQLite
- **ORM**: Prisma

### Migrations

Create a new migration:
```bash
npm run prisma:migrate -- --name migration_name
```

View database:
```bash
npm run prisma:studio
```

## File Structure

```
.
├── app/                    # Next.js app directory
├── lib/                    # Shared utilities
├── prisma/                 # Prisma schema
├── public/                 # Static assets & generated CSVs
├── data/                   # SQLite database
├── middleware.ts           # Auth middleware
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Troubleshooting

### Port already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Database locked
Remove `.next` directory and rebuild:
```bash
rm -rf .next
npm run build
```

### Missing environment variables
```bash
# Check that .env.local exists and has all required variables
cat .env.local
```

### Supabase connection failed
- Verify URL and key in `.env.local`
- Check that your Supabase project is active
- Ensure redirect URL is configured in Supabase

## Support

For issues, check:
1. Supabase project status
2. Environment variables
3. Database permissions
4. Node.js version (requires 18+)
