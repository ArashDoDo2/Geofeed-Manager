import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerUser } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import fs from 'fs/promises'
import path from 'path'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ geofeedId: string }> }
) {
  try {
    const user = await getRouteHandlerUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
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

    const filePath = path.join(process.cwd(), 'public', `geofeed-${geofeedId}.csv`)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      const err = error as NodeJS.ErrnoException
      if (err.code !== 'ENOENT') {
        throw error
      }
    }

    await logActivity({
      userId,
      action: 'geofeed.unpublish',
      message: `Unpublished geofeed "${geofeed.name}"`,
      geofeedId,
      geofeedName: geofeed.name,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unpublishing geofeed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unpublish geofeed' },
      { status: 500 }
    )
  }
}
