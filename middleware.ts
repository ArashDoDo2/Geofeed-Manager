import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient({ req: request, res: response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname.startsWith('/geo')
    ? request.nextUrl.pathname.slice(4)
    : request.nextUrl.pathname
  const isDashboard = pathname.startsWith('/dashboard')
  const isApi = pathname.startsWith('/api/geofeeds')

  if ((isDashboard || isApi) && !session) {
    const redirectUrl = new URL('/geo/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/geofeeds/:path*'],
}
