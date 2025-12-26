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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ geofeedId: string; rangeId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { geofeedId, rangeId } = await params
    const userId = session.user.id

    // Verify ownership
    const range = await prisma.ipRange.findUnique({
      where: { id: rangeId },
    })

    if (!range || range.userId !== userId || range.geofeedId !== geofeedId) {
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

    const updatedRange = await prisma.ipRange.update({
      where: { id: rangeId },
      data: {
        network: network.trim(),
        countryCode: countryCode.trim().toUpperCase(),
        subdivision: subdivision ? subdivision.trim() : null,
        city: city ? city.trim() : null,
        postalCode: postalCode ? postalCode.trim() : null,
      },
    })

    return NextResponse.json({ success: true, data: updatedRange })
  } catch (error) {
    console.error('Error updating range:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update range' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ geofeedId: string; rangeId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { geofeedId, rangeId } = await params
    const userId = session.user.id

    // Verify ownership
    const range = await prisma.ipRange.findUnique({
      where: { id: rangeId },
    })

    if (!range || range.userId !== userId || range.geofeedId !== geofeedId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.ipRange.delete({
      where: { id: rangeId },
    })

    return NextResponse.json({ success: true, data: { id: rangeId } })
  } catch (error) {
    console.error('Error deleting range:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete range' },
      { status: 500 }
    )
  }
}
