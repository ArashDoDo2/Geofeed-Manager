import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/supabase-server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(
  _request: NextRequest,
  { params }: { params: { geofeedId: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { geofeedId } = params

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

    const publicDir = path.join(process.cwd(), 'public')
    await fs.mkdir(publicDir, { recursive: true })

    const filePath = path.join(publicDir, `geofeed-${geofeedId}.csv`)
    await fs.writeFile(filePath, csvContent, 'utf-8')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const url = `${baseUrl}/geo/geofeed-${geofeedId}.csv`

    return NextResponse.json({ success: true, url, recordCount: ranges.length })
  } catch (error) {
    console.error('Error generating geofeed:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate geofeed' }, { status: 500 })
  }
}
