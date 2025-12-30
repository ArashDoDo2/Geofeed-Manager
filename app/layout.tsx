import { getUser } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoutButton } from './logout-button'
import './globals.css'

export const metadata: Metadata = {
  title: 'Geofeed Manager',
  description: 'Manage geofeeds with ease',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-2xl font-semibold text-gray-900 no-underline md:text-3xl"
              >
                Geofeed Manager
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 hover:text-emerald-900"
                >
                  Dashboard
                </Link>
              )}
              {user && (
                <Link
                  href="/help"
                  className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 hover:text-emerald-900"
                >
                  Help
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="hidden text-sm text-gray-600 sm:inline">
                    {user.email}
                  </span>
                  <LogoutButton />
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-800 hover:border-emerald-400 hover:text-emerald-900"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
