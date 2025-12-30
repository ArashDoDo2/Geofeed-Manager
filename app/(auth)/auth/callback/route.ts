import { createSupabaseRouteHandlerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const resolveBaseUrl = (request: Request) => {
  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (envBaseUrl) {
    return envBaseUrl
  }

  const forwardedProto = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = request.headers.get('host')

  if (forwardedHost || host) {
    return `${forwardedProto || 'http'}://${forwardedHost || host}`
  }

  return request.url
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const { supabase } = await createSupabaseRouteHandlerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL('/geo/dashboard', resolveBaseUrl(request)))
    }
  }

  return NextResponse.redirect(new URL('/geo/login', resolveBaseUrl(request)))
}
