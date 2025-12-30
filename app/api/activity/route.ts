import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerUser } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getRouteHandlerUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const rawLimit = limitParam ? Number(limitParam) : null
    const limitValue = rawLimit ?? 10
    const limit = Number.isFinite(limitValue)
      ? Math.max(1, Math.min(100, Math.floor(limitValue)))
      : 10
    const activity = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ success: true, data: activity })
  } catch (error) {
    console.error('Error fetching activity log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity log' },
      { status: 500 }
    )
  }
}

