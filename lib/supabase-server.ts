import {
  createRouteHandlerClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function createSupabaseServerComponentClient() {
  const cookieStore = await cookies()
  const cookieAdapter = {
    cookies: () => cookieStore,
  } as unknown as { cookies: () => Promise<typeof cookieStore> }
  return {
    client: createServerComponentClient(cookieAdapter),
    cookieStore,
  }
}

export async function getSession() {
  const { client: supabase, cookieStore } =
    await createSupabaseServerComponentClient()
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
  const cookieStore = await cookies()
  const cookieAdapter = {
    cookies: () => cookieStore,
  } as unknown as { cookies: () => Promise<typeof cookieStore> }
  return {
    client: createRouteHandlerClient(cookieAdapter),
    cookieStore,
  }
}

export async function getRouteHandlerSession() {
  const { client: supabase, cookieStore } =
    await createSupabaseRouteHandlerClient()
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
