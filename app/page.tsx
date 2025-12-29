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
      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl flex-col justify-center gap-12 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              RFC 8805 geofeed platform
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-6xl">
              Control your geofeeds. Publish with confidence, every time.
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-600">
              Give your ops team a clean workflow for IP ranges, metadata, and RFC 8805
              exports. Spend less time fixing CSVs and more time publishing updates with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.2)] transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white !text-white"
              >
                Sign in with Google
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white/80 px-6 py-3 text-sm font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-900 !text-emerald-900"
              >
                Help & Guides
              </Link>
              <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                Production ready
              </span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: 'Multi-tenant safe',
                  body: 'Each user stays isolated with strict server checks.',
                },
                {
                  title: 'Instant publish',
                  body: 'Go public in one click or keep downloads private.',
                },
                {
                  title: 'Import ready',
                  body: 'Upload or fetch CSVs with preview and dedupe.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100"
                >
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-2 text-xs text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
              Platform highlights
            </p>
            <div className="mt-3 grid gap-4">
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
                <div
                  key={item.title}
                  className="rounded-2xl border border-emerald-100 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200"
                >
                  <h2 className="text-base font-semibold text-gray-900">{item.title}</h2>
                  <p className="mt-2 text-sm text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-900">
              Publish once, share anywhere. URLs stay stable across updates.
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
