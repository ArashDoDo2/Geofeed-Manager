import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not set')
  }

  return { supabaseUrl, supabaseAnonKey }
}

async function createCookieAwareServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials()
  const cookieStore = await cookies()

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // The cookies instance can be immutable in some contexts (e.g. middleware)
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // The cookies instance can be immutable in some contexts (e.g. middleware)
        }
      },
    },
  })

  return { supabase, cookieStore }
}

export async function createSupabaseServerComponentClient() {
  return {
    ...(await createCookieAwareServerClient()),
  }
}

export async function getSession() {
  const { supabase, cookieStore } = await createCookieAwareServerClient()
  const hasAuthCookie = cookieStore
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'))

  if (!hasAuthCookie) {
    return null
  }

  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return data.session
  } catch (error) {
    console.error('Unexpected error in getSession:', error)
    return null
  }
}

export async function createSupabaseRouteHandlerClient() {
  return {
    ...(await createCookieAwareServerClient()),
  }
}

export async function getRouteHandlerSession() {
  const { supabase, cookieStore } = await createCookieAwareServerClient()
  const hasAuthCookie = cookieStore
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'))

  if (!hasAuthCookie) {
    return null
  }

  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return data.session
  } catch (error) {
    console.error('Unexpected error in getRouteHandlerSession:', error)
    return null
  }
}
