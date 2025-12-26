import { getSession } from '@/lib/supabase-server'
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
  const session = await getSession()
  const user = session?.user

  return (
    <html lang="en">
      <body>
        <nav className="border-b border-gray-300 bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/geo" className="text-xl font-bold text-gray-900 no-underline">
                  Geofeed Manager
                </Link>
                {user && (
                  <Link href="/geo/dashboard" className="text-blue-600 hover:text-blue-800">
                    Dashboard
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <span className="text-sm text-gray-600">{user.email}</span>
                    <LogoutButton />
                  </>
                ) : (
                  <Link href="/geo/login" className="text-blue-600 hover:text-blue-800">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
