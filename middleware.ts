import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard and API routes
  const pathname = request.nextUrl.pathname

  // Remove basePath '/geo' for comparison
  const pathWithoutBase = pathname.startsWith('/geo') ? pathname.slice(4) : pathname

  const protectedPaths = ['/dashboard', '/api/geofeeds']
  const isProtected = protectedPaths.some(path => pathWithoutBase.startsWith(path))

  if (isProtected && !session) {
    // Redirect to login with basePath
    return NextResponse.redirect(new URL('/geo/login', request.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}


