import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerUser } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import { isValidAlpha2Code, normalizeAlpha2Code } from '@/lib/alpha2-codes'

function isValidCIDR(cidr: string): boolean {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\/\d{1,3}$/
  return cidrRegex.test(cidr.trim())
}


async function verifyOwnership(userId: string, geofeedId: string, rangeId: string) {
  return prisma.ipRange.findFirst({
    where: { id: rangeId, geofeedId, userId },
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ geofeedId: string; rangeId: string }> }
) {
  try {
    const user = await getRouteHandlerUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const { geofeedId, rangeId } = await params

    const range = await verifyOwnership(userId, geofeedId, rangeId)
    if (!range) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const geofeed = await prisma.geofeedFile.findFirst({
      where: { id: geofeedId, userId },
      select: { name: true },
    })

    const { network, countryCode, subdivision, city, postalCode } = await request.json()

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

    await prisma.ipRange.updateMany({
      where: { id: rangeId, geofeedId, userId },
      data: {
        network: network.trim(),
      countryCode: normalizeAlpha2Code(countryCode),
        subdivision: subdivision ? subdivision.trim() : null,
        city: city ? city.trim() : null,
        postalCode: postalCode ? postalCode.trim() : null,
      },
    })

    const updated = await verifyOwnership(userId, geofeedId, rangeId)
    const updatedNetwork = network.trim()
    const geofeedName = geofeed?.name || 'Geofeed'
    const message =
      range.network === updatedNetwork
        ? `Updated range ${updatedNetwork} in "${geofeedName}"`
        : `Updated range ${range.network} to ${updatedNetwork} in "${geofeedName}"`

    await logActivity({
      userId,
      action: 'range.update',
      message,
      geofeedId,
      geofeedName,
    })

    return NextResponse.json({ success: true, data: updated })
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
    const user = await getRouteHandlerUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const { geofeedId, rangeId } = await params

    const range = await verifyOwnership(userId, geofeedId, rangeId)
    if (!range) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const geofeed = await prisma.geofeedFile.findFirst({
      where: { id: geofeedId, userId },
      select: { name: true },
    })

    const geofeedName = geofeed?.name || 'Geofeed'
    await logActivity({
      userId,
      action: 'range.delete',
      message: `Deleted range ${range.network} from "${geofeedName}"`,
      geofeedId,
      geofeedName,
    })

    await prisma.ipRange.deleteMany({ where: { id: rangeId, geofeedId, userId } })

    return NextResponse.json({ success: true, data: { id: rangeId } })
  } catch (error) {
    console.error('Error deleting range:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete range' },
      { status: 500 }
    )
  }
}
