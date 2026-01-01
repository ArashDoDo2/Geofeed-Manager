import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerUser } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import { isValidAlpha2Code, normalizeAlpha2Code } from '@/lib/alpha2-codes'

function isValidCIDR(cidr: string): boolean {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\/\d{1,3}$/
  return cidrRegex.test(cidr.trim())
}


async function verifyGeofeedOwnership(userId: string, geofeedId: string) {
  return prisma.geofeedFile.findFirst({ where: { id: geofeedId, userId } })
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
    if (!geofeedId) {
      return NextResponse.json({ success: false, error: 'Invalid geofeed id' }, { status: 400 })
    }

    const geofeed = await verifyGeofeedOwnership(userId, geofeedId)
    if (!geofeed) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const ranges = await prisma.ipRange.findMany({
      where: { geofeedId, userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: { geofeed, ranges } })
  } catch (error) {
    console.error('Error fetching ranges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ranges' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    if (!geofeedId) {
      return NextResponse.json({ success: false, error: 'Invalid geofeed id' }, { status: 400 })
    }

    const geofeed = await verifyGeofeedOwnership(userId, geofeedId)
    if (!geofeed) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const { network, countryCode, subdivision, city, postalCode } = body

    if (!network || !countryCode) {
      return NextResponse.json(
        { success: false, error: 'Network and country code are required' },
        { status: 400 }
      )
    }

    if (!isValidCIDR(network)) {
      return NextResponse.json(
        { success: false, error: 'Invalid CIDR format' },
        { status: 400 }
      )
    }

    if (!isValidAlpha2Code(countryCode)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid alpha2code (must be a 2-letter ISO 3166-1 code)',
        },
        { status: 400 }
      )
    }

    const range = await prisma.ipRange.create({
      data: {
        geofeedId,
        userId,
        network: network.trim(),
        countryCode: normalizeAlpha2Code(countryCode),
        subdivision: subdivision ? subdivision.trim() : null,
        city: city ? city.trim() : null,
        postalCode: postalCode ? postalCode.trim() : null,
      },
    })

    await logActivity({
      userId,
      action: 'range.create',
      message: `Added range ${range.network} to "${geofeed.name}"`,
      geofeedId,
      geofeedName: geofeed.name,
    })

    return NextResponse.json({ success: true, data: range }, { status: 201 })
  } catch (error) {
    console.error('Error creating range:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create range' },
      { status: 500 }
    )
  }
}
