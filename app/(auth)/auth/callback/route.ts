import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const cookieAdapter = {
      cookies: () => cookieStore,
    } as unknown as { cookies: () => Promise<typeof cookieStore> }
    const supabase = createRouteHandlerClient(cookieAdapter)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.url
      return NextResponse.redirect(new URL('/geo/dashboard', baseUrl))
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.url
  return NextResponse.redirect(new URL('/geo/login', baseUrl))
}
