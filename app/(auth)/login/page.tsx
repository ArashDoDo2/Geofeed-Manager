'use client'

import { supabase } from '@/lib/supabase-client'
import { LogIn } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/geo/auth/callback`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/geo/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.18),_transparent_50%),radial-gradient(circle_at_bottom,_rgba(245,158,11,0.18),_transparent_45%)]" />
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[var(--shadow)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700/70">
          Secure access
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Geofeed Manager
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Publish and manage IP geofeeds with clean, audited CSV exports.
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
          >
            <LogIn className="h-5 w-5" />
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          <a
            href="/geo/help"
            className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700/80 hover:text-emerald-900"
          >
            Help & Guides
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          By continuing you agree to publish only data you own.
        </p>
      </div>
    </div>
  )
}
