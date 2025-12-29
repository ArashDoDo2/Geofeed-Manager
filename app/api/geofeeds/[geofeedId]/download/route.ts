import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerSession } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'

export async function GET(
  _request: NextRequest,
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
    })

    if (!geofeed) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const ranges = await prisma.ipRange.findMany({
      where: { geofeedId, userId },
      orderBy: { createdAt: 'asc' },
    })

    const csvLines = ranges.map((range) =>
      [
        range.network,
        range.countryCode,
        range.subdivision || '',
        range.city || '',
        range.postalCode || '',
      ].join(',')
    )

    const csvContent = csvLines.join('\n')
    const filename = `geofeed-${geofeedId}.csv`

    await logActivity({
      userId,
      action: 'geofeed.download',
      message: `Downloaded geofeed "${geofeed.name}" (${ranges.length} ranges)`,
      geofeedId,
      geofeedName: geofeed.name,
    })

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading geofeed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download geofeed' },
      { status: 500 }
    )
  }
}
