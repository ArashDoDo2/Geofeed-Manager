import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerUser } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import fs from 'fs/promises'
import path from 'path'

async function getOwnedGeofeed(userId: string, geofeedId: string) {
  return prisma.geofeedFile.findFirst({
    where: { id: geofeedId, userId },
  })
}

export async function GET(
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

    const geofeed = await prisma.geofeedFile.findFirst({
      where: { id: geofeedId, userId },
      include: {
        ranges: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!geofeed) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: geofeed })
  } catch (error) {
    console.error('Error fetching geofeed:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch geofeed' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ geofeedId: string }> }
) {
  try {
    const user = await getRouteHandlerUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const { geofeedId } = await params
    const geofeed = await getOwnedGeofeed(userId, geofeedId)

    if (!geofeed) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const { name } = await request.json()
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const previousName = geofeed.name

    await prisma.geofeedFile.updateMany({
      where: { id: geofeedId, userId },
      data: { name: name.trim() },
    })

    const updated = await getOwnedGeofeed(userId, geofeedId)
    const updatedName = updated?.name || name.trim()

    await logActivity({
      userId,
      action: 'geofeed.rename',
      message: `Renamed geofeed "${previousName}" to "${updatedName}"`,
      geofeedId,
      geofeedName: updatedName,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating geofeed:', error)
    return NextResponse.json({ success: false, error: 'Failed to update geofeed' }, { status: 500 })
  }
}

export async function DELETE(
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
    const geofeed = await getOwnedGeofeed(userId, geofeedId)

    if (!geofeed) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    await logActivity({
      userId,
      action: 'geofeed.delete',
      message: `Deleted geofeed "${geofeed.name}"`,
      geofeedId,
      geofeedName: geofeed.name,
    })

    const deleted = await prisma.geofeedFile.deleteMany({ where: { id: geofeedId, userId } })

    if (deleted.count > 0) {
      const filePath = path.join(process.cwd(), 'public', `geofeed-${geofeedId}.csv`)
      try {
        await fs.unlink(filePath)
      } catch {
        // File might not exist; ignore
      }
    }

    return NextResponse.json({ success: true, data: { id: geofeedId } })
  } catch (error) {
    console.error('Error deleting geofeed:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete geofeed' }, { status: 500 })
  }
}
