# Geofeed Manager

A multi-tenant web application for managing geofeeds with RFC 8805 CSV export. Built with Next.js, Prisma, SQLite, and Supabase Auth.

## Features

- **User Authentication**: Google OAuth via Supabase Auth
- **Multi-tenant Isolation**: Each user can create and manage multiple geofeeds
- **IP Range Management**: Add, edit, and delete IP ranges with geolocation data
- **RFC 8805 CSV Generation**: Generate standard geofeed CSV files for download
- **Standalone Deployment**: Optimized for cPanel and Node.js environments

## Tech Stack

- **Framework**: Next.js 20 (App Router, TypeScript)
- **Database**: SQLite with Prisma ORM
- **Authentication**: Supabase Auth (Google OAuth)
- **Styling**: Tailwind CSS
- **Build**: Standalone output for production deployment

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `NEXT_PUBLIC_BASE_URL`: Your base URL (e.g., `https://ripe.ir`)

### 3. Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Enable Google OAuth provider in Authentication → Providers
3. Add redirect URL: `https://ripe.ir/geo/auth/callback`
4. Copy your URL and anon key to `.env.local`

### 4. Database Setup

```bash
npm run prisma:migrate
```

This will:
- Create the Prisma client
- Create SQLite database at `data/geo.db`
- Run all migrations

### 5. Development

```bash
npm run dev
```

Visit http://localhost:3000/geo

### 6. Production Build

```bash
npm run build
npm start
```

The app will be available at `/geo` path.

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Login page
│   │   └── auth/callback/route.ts   # OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx                 # Geofeed list
│   │   └── [geofeedId]/page.tsx     # IP ranges management
│   ├── api/
│   │   └── geofeeds/
│   │       ├── route.ts             # GET, POST geofeeds
│   │       ├── [geofeedId]/
│   │       │   ├── route.ts         # DELETE geofeed
│   │       │   ├── ranges/
│   │       │   │   ├── route.ts     # GET, POST ranges
│   │       │   │   └── [rangeId]/route.ts  # PUT, DELETE range
│   │       │   └── generate/route.ts       # POST CSV generation
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── db.ts                        # Prisma client
│   ├── supabase-client.ts           # Client-side Supabase
│   └── supabase-server.ts           # Server-side Supabase
├── middleware.ts                     # Auth middleware
├── prisma/
│   └── schema.prisma                # Database schema
├── public/
│   └── geofeed-*.csv                # Generated CSV files
├── next.config.ts
└── package.json
```

## API Routes

### Geofeeds

- `GET /api/geofeeds` - List user's geofeeds
- `POST /api/geofeeds` - Create new geofeed
- `DELETE /api/geofeeds/[geofeedId]` - Delete geofeed

### IP Ranges

- `GET /api/geofeeds/[geofeedId]/ranges` - List ranges
- `POST /api/geofeeds/[geofeedId]/ranges` - Create range
- `PUT /api/geofeeds/[geofeedId]/ranges/[rangeId]` - Update range
- `DELETE /api/geofeeds/[geofeedId]/ranges/[rangeId]` - Delete range

### Generation

- `POST /api/geofeeds/[geofeedId]/generate` - Generate CSV file

## Database Schema

### GeofeedFile

```
id: String (CUID)
userId: String
name: String
createdAt: DateTime
updatedAt: DateTime
ranges: IpRange[]
```

### IpRange

```
id: String (CUID)
geofeedId: String
userId: String
network: String (CIDR)
countryCode: String (ISO 3166-1 alpha-2)
subdivision: String? (optional)
city: String? (optional)
postalCode: String? (optional)
createdAt: DateTime
updatedAt: DateTime
geofeed: GeofeedFile (relation)
```

## CSV Format

Generated CSV follows RFC 8805 format:

```
prefix,country,region,city,postal
203.0.113.0/24,AU,VIC,Melbourne,3000
198.51.100.0/24,US,CA,San Francisco,94105
```

Empty optional fields are represented as empty values between commas.

## Multi-tenant Security

- All routes verify Supabase session
- User ID is extracted from session on the server
- All database queries filter by userId
- Frontend cannot be trusted for authorization

## Deployment on cPanel

1. Build the project locally:
   ```bash
   npm run build
   ```

2. Upload `.next` directory to your cPanel server

3. Create `data/` directory with write permissions:
   ```bash
   mkdir data
   chmod 755 data
   ```

4. Create `.env` file on server with production values

5. Run the application:
   ```bash
   node .next/standalone/server.js
   ```

6. Configure your web server (Apache/Nginx) to proxy requests to Node.js on port 3000

## Notes

- The app uses `basePath: "/geo"` in Next.js config
- All static assets are served from `/geo/` prefix
- CSV files are generated in `public/geofeed-*.csv`
- Database file is stored at `data/geo.db` (SQLite)

## License

MIT