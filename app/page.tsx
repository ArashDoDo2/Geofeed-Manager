import { getSession } from '@/lib/supabase-server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect('/geo/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-2xl rounded-lg bg-white p-12 shadow-2xl">
        <h1 className="mb-4 text-center text-4xl font-bold text-gray-900">
          Geofeed Manager
        </h1>
        <p className="mb-8 text-center text-lg text-gray-600">
          Manage your geofeeds with ease. Generate RFC 8805 compliant CSV files for IP geolocation data.
        </p>

        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-blue-900">Easy Management</h2>
            <p className="text-sm text-blue-700">
              Create and manage multiple geofeeds for different networks.
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-green-900">RFC 8805 Compliant</h2>
            <p className="text-sm text-green-700">
              Generate standard geofeed CSV files ready for deployment.
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-purple-900">Secure & Multi-tenant</h2>
            <p className="text-sm text-purple-700">
              Your data is isolated and protected with OAuth authentication.
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-orange-900">Standalone Ready</h2>
            <p className="text-sm text-orange-700">
              Deploy anywhere with Next.js standalone build support.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/geo/login"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Sign In with Google
          </Link>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>
            Built with Next.js, Prisma, SQLite, and Supabase Auth
          </p>
        </div>
      </div>
    </div>
  )
}
