import { prisma } from '@/lib/db'
import { getSession } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// Simple CIDR validation
function isValidCIDR(cidr: string): boolean {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\/\d{1,3}$/
  return cidrRegex.test(cidr.trim())
}

// Simple country code validation (2-letter ISO 3166-1)
function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code.trim())
}

export async function GET(
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

    const body = await request.json()
    const { network, countryCode, subdivision, city, postalCode } = body

    // Validate required fields
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

    if (!isValidCountryCode(countryCode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid country code (must be 2-letter ISO code)' },
        { status: 400 }
      )
    }

    const range = await prisma.ipRange.create({
      data: {
        geofeedId,
        userId,
        network: network.trim(),
        countryCode: countryCode.trim().toUpperCase(),
        subdivision: subdivision ? subdivision.trim() : null,
        city: city ? city.trim() : null,
        postalCode: postalCode ? postalCode.trim() : null,
      },
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
