# Geofeed Manager Regeneration Prompt + Checklist

Use this prompt to regenerate the full codebase in a new workspace.

## Master Prompt

Build a production-ready Geofeed Manager web app using Next.js 16.1.x App Router, TypeScript, Prisma, SQLite, Tailwind CSS, Lucide icons, and Supabase Auth (Google OAuth). Use @supabase/auth-helpers-nextjs only (never @supabase/ssr). App is deployed under basePath /geo with standalone output; use `next dev --webpack` for dev. All routes/assets must respect /geo.

### Core requirements
- Multi-tenant isolation: never trust userId from client; always use session.user.id from Supabase server helpers.
- Every Prisma query must filter by userId.
- If user does not own record, return 404.
- SQLite database at ./data/geo.db; runtime must mkdirSync("./data", { recursive: true }) before Prisma loads.
- Public CSVs stored at public/geofeed-{id}.csv and accessible at /geo/geofeed-{id}.csv.

### Next.js config
```
output: 'standalone'
basePath: '/geo'
assetPrefix: '/geo'
```

### Supabase
- Use createServerComponentClient / createRouteHandlerClient from @supabase/auth-helpers-nextjs.
- cookies() is async in Next 16.1: always `const cookieStore = await cookies()` then pass `{ cookies: () => cookieStore }`.
- OAuth callback route path must be app/(auth)/auth/callback/route.ts (no extra nesting). Redirect to /geo/dashboard on success, /geo/login on failure.
- Middleware protects /dashboard/:path* and /api/geofeeds/:path* (matchers do NOT include /geo).

### Prisma schema
```
model GeofeedFile {
  id        String   @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ranges    IpRange[]
  isDraft   Boolean  @default(false)
}

model IpRange {
  id          String   @id @default(cuid())
  geofeedId   String
  userId      String
  network     String
  countryCode String
  subdivision String?
  city        String?
  postalCode  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  geofeed     GeofeedFile @relation(fields: [geofeedId], references: [id], onDelete: Cascade)
}
```

### API routes (all JSON)
- /api/geofeeds GET/POST (POST supports { name, isDraft }; GET returns publishedUrl if exists)
- /api/geofeeds/[id] GET/PATCH/DELETE
- /api/geofeeds/[id]/ranges GET/POST
- /api/geofeeds/[id]/ranges/[rangeId] PATCH/DELETE
- /api/geofeeds/[id]/ranges/bulk-delete POST { ids: [] }
- /api/geofeeds/[id]/generate POST (publish CSV to public and return URL)
- /api/geofeeds/[id]/unpublish POST (delete public CSV)
- /api/geofeeds/[id]/download GET (private download even if unpublished)
- /api/geofeeds/[id]/import POST (import CSV rows; preview/finalize; return imported/skipped/conflict counts)

### CSV format (RFC 8805)
- No header
- Format: prefix,country,region,city,postal
- Empty fields must be commas, e.g. 198.51.100.0/24,US,,,

### UI/UX
- Landing page /geo: modern hero layout, rounded pills, green/amber palette, strong typography.
- Login page /geo/login: Google OAuth button + help link.
- Dashboard /geo/dashboard:
  - Create, Edit, Delete geofeeds
  - Publish/Unpublish toggle button
  - Download private CSV
  - Copy URL (shows URL text; clicking copies)
  - Import button before Create button
  - Publish message shows as a fading toast
  - If published, disable/flip publish button to Unpublish
  - If geofeed is draft: show Continue Import + Delete Draft
- Import flow:
  - Step 1: choose new/existing geofeed (new creates draft with isDraft=true)
  - Step 2: choose source (file or URL); preview rows
  - Validate CIDR + country code; show invalid rows
  - Dedupe exact duplicates (disabled), mark conflicts in red
  - Select all valid toggle
  - Import adds to existing records; skip duplicates
  - If cancel before completion and draft was created, delete the draft
  - Drafts not visible in list until refresh; after refresh show drafts with continue/delete
  - Dropdown shows (draft) label
- Geofeed detail /geo/dashboard/[geofeedId]:
  - CRUD ranges, bulk delete ranges with multi-select
  - Import ranges into existing geofeed (same validation/preview)
  - Modern pill buttons with icons
- Help page /geo/help:
  - Multiple sections with self-service instructions
  - Link from login + header/nav

### Styling
- Tailwind with Space Grotesk + Syne fonts.
- Global background: subtle minimal geometric line field (consistent across pages).
- Buttons: rounded pills, light hover lift, consistent colors.
- Avoid heavy animations; keep subtle.

### Required files
- next.config.ts, postcss.config.js, tailwind.config.ts, tsconfig.json
- .env.example with Supabase keys and DATABASE_URL
- lib/db.ts (mkdirSync for data dir)
- lib/supabase-client.ts, lib/supabase-server.ts
- middleware.ts
- Prisma schema + migrations
- setup.sh (checks .env.local, runs migrations)

### Dev/ops
- Ignore DB files in .gitignore (data/, prisma/data/, public/geofeed-*.csv)
- Use `next dev --webpack`
- cookies() and route params must be awaited in Next 16.1

## Checklist (post-generation)
- Base path /geo works for all pages and redirects.
- OAuth callback at app/(auth)/auth/callback/route.ts works.
- Middleware protects /dashboard and /api/geofeeds.
- CSV generation writes to public/geofeed-{id}.csv.
- Unpublish removes public CSV.
- Download works even when unpublished.
- Import preview shows valid/invalid/duplicate/conflict rows.
- Draft imports create isDraft geofeeds and allow continue/delete.
- Buttons are consistent rounded pills with hover lift.
- Global background is subtle geometric lines.
