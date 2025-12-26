import { prisma } from '@/lib/db'
import { getSession } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ geofeedId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { geofeedId } = await params
    const userId = session.user.id

    // Verify ownership
    const geofeed = await prisma.geofeedFile.findUnique({
      where: { id: geofeedId },
    })

    if (!geofeed) {
      return NextResponse.json(
        { success: false, error: 'Geofeed not found' },
        { status: 404 }
      )
    }

    if (geofeed.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    // Delete all ranges first (cascade will handle this, but explicit is better)
    await prisma.ipRange.deleteMany({
      where: { geofeedId },
    })

    // Delete the geofeed
    await prisma.geofeedFile.delete({
      where: { id: geofeedId },
    })

    // Try to delete the CSV file if it exists
    try {
      const filePath = path.join(process.cwd(), 'public', `geofeed-${geofeedId}.csv`)
      await fs.unlink(filePath)
    } catch (err) {
      // File might not exist, that's okay
    }

    return NextResponse.json({ success: true, data: { id: geofeedId } })
  } catch (error) {
    console.error('Error deleting geofeed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete geofeed' },
      { status: 500 }
    )
  }
}
