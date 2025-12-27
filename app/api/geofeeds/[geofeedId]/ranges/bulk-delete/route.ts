import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerSession } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ geofeedId: string }> }
) {
  try {
    const session = await getRouteHandlerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { geofeedId } = await params
    if (!geofeedId) {
      return NextResponse.json({ success: false, error: 'Invalid geofeed id' }, { status: 400 })
    }

    const body = await request.json()
    const ids = Array.isArray(body?.ids) ? body.ids : []
    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No range ids provided' }, { status: 400 })
    }

    await prisma.ipRange.deleteMany({
      where: { id: { in: ids }, geofeedId, userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error bulk deleting ranges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete ranges' },
      { status: 500 }
    )
  }
}
