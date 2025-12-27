import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/supabase-server'

export async function GET() {
  try {
    const session = await getSession()
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

    return NextResponse.json({ success: true, data: geofeeds })
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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const geofeed = await prisma.geofeedFile.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
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
