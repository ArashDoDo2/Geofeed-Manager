import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerSession } from '@/lib/supabase-server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const session = await getRouteHandlerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const geofeeds = await prisma.geofeedFile.findMany({
      where: { userId },
      include: {
        _count: { select: { ranges: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const enriched = await Promise.all(
      geofeeds.map(async (geofeed) => {
        const filePath = path.join(process.cwd(), 'public', `geofeed-${geofeed.id}.csv`)
        let publishedUrl: string | null = null
        try {
          await fs.access(filePath)
          publishedUrl = `${baseUrl}/geo/geofeed-${geofeed.id}.csv`
        } catch {
          publishedUrl = null
        }

        return { ...geofeed, publishedUrl }
      })
    )

    return NextResponse.json({ success: true, data: enriched })
  } catch (error) {
    console.error('Error fetching geofeeds:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch geofeeds' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getRouteHandlerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { name, isDraft } = await request.json()

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }
    if (typeof isDraft !== 'undefined' && typeof isDraft !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid draft flag' },
        { status: 400 }
      )
    }

    const geofeed = await prisma.geofeedFile.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        isDraft: Boolean(isDraft),
      },
    })

    return NextResponse.json({ success: true, data: geofeed }, { status: 201 })
  } catch (error) {
    console.error('Error creating geofeed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create geofeed' },
      { status: 500 }
    )
  }
}
