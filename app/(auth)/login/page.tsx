'use client'

import { supabase } from '@/lib/supabase-client'
import { LogIn } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const showDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug')

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
    <div className="relative flex min-h-screen items-start justify-center px-6 pb-16 pt-28">
      <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white/85 p-9 shadow-[var(--shadow)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
            <LogIn className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700/70">
              Secure access
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">
              Geofeed Manager
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:opacity-50"
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
      {showDebug && (
        <div className="mt-6 w-full max-w-lg rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-xs text-amber-900 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-700">
            Debug
          </p>
          <div className="mt-3 space-y-2">
            <div>
              <span className="font-semibold">NEXT_PUBLIC_BASE_URL: </span>
              {process.env.NEXT_PUBLIC_BASE_URL || '(unset)'}
            </div>
            <div>
              <span className="font-semibold">NEXT_PUBLIC_SUPABASE_URL: </span>
              {process.env.NEXT_PUBLIC_SUPABASE_URL || '(unset)'}
            </div>
            <div>
              <span className="font-semibold">Origin: </span>
              {window.location.origin}
            </div>
            <div>
              <span className="font-semibold">redirectTo: </span>
              {`${window.location.origin}/geo/auth/callback`}
            </div>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500">
        By continuing you agree to publish only data you own.
      </p>
    </div>
    </div>
  )
}
