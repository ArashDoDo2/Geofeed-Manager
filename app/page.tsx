import { getSession } from '@/lib/supabase-server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_50%),radial-gradient(circle_at_bottom,_rgba(245,158,11,0.16),_transparent_45%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl flex-col justify-center gap-12 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700/70">
              RFC 8805 geofeed platform
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-gray-900">
              Ship precise geofeeds without the spreadsheet chaos.
            </h1>
            <p className="mt-4 text-base text-gray-600">
              Manage IP ranges, validate metadata, and publish clean CSVs in seconds.
              Built for multi-tenant ops and cPanel hosting.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                Sign in with Google
              </Link>
              <Link
                href="/help"
                className="rounded-full border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-800 hover:border-emerald-400"
              >
                Help & Guides
              </Link>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                Standalone ready
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)]">
            <div className="grid gap-4">
              {[
                {
                  title: 'Single source of truth',
                  body: 'Keep ranges and metadata in one workspace with audit-ready updates.',
                },
                {
                  title: 'RFC compliant exports',
                  body: 'Generate CSVs with proper formatting and empty-field handling.',
                },
                {
                  title: 'Private or public',
                  body: 'Publish to the public URL or keep downloads private.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-emerald-100 bg-white/70 p-4">
                  <h2 className="text-base font-semibold text-gray-900">{item.title}</h2>
                  <p className="mt-2 text-sm text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
          Next.js • Prisma • SQLite • Supabase Auth
        </p>
      </div>
    </div>
  )
}
