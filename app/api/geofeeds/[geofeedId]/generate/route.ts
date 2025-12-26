import { prisma } from '@/lib/db'
import { getSession } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ geofeedId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { geofeedId } = await params
    const userId = session.user.id

    // Verify the geofeed belongs to the user
    const geofeed = await prisma.geofeedFile.findUnique({
      where: { id: geofeedId },
    })

    if (!geofeed || geofeed.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch all ranges for this geofeed
    const ranges = await prisma.ipRange.findMany({
      where: { geofeedId, userId },
    })

    // Generate RFC 8805 CSV format: prefix,country,region,city,postal
    const csvLines: string[] = ['prefix,country,region,city,postal']

    for (const range of ranges) {
      const line = [
        range.network,
        range.countryCode,
        range.subdivision || '',
        range.city || '',
        range.postalCode || '',
      ].join(',')
      csvLines.push(line)
    }

    const csvContent = csvLines.join('\n')

    // Write to public directory
    const publicDir = path.join(process.cwd(), 'public')
    try {
      await fs.mkdir(publicDir, { recursive: true })
    } catch {
      // Directory might already exist
    }

    const filePath = path.join(publicDir, `geofeed-${geofeedId}.csv`)
    await fs.writeFile(filePath, csvContent, 'utf-8')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ripe.ir'
    const url = `${baseUrl}/geo/geofeed-${geofeedId}.csv`

    return NextResponse.json({
      success: true,
      url,
      recordCount: ranges.length,
    })
  } catch (error) {
    console.error('Error generating geofeed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate geofeed' },
      { status: 500 }
    )
  }
}
