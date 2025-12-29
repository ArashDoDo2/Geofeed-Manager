import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerSession } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'

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

    const geofeed = await prisma.geofeedFile.findFirst({
      where: { id: geofeedId, userId },
      select: { name: true },
    })
    if (!geofeed) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const ids = Array.isArray(body?.ids) ? body.ids : []
    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No range ids provided' }, { status: 400 })
    }

    const deleted = await prisma.ipRange.deleteMany({
      where: { id: { in: ids }, geofeedId, userId },
    })

    await logActivity({
      userId,
      action: 'range.bulk_delete',
      message: `Deleted ${deleted.count} ranges from "${geofeed.name}"`,
      geofeedId,
      geofeedName: geofeed.name,
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
