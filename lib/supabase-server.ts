import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'

export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies,
      headers,
    }
  )
}

export async function getSession() {
  const supabase = createSupabaseServerClient()

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
