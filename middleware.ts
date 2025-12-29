import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type NextResponseType = ReturnType<typeof NextResponse.next>
type CookieSetOptions = Parameters<NextResponseType['cookies']['set']>[2]
type CookieToSet = { name: string; value: string; options?: CookieSetOptions }

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

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
