import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRouteHandlerUser } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import { isValidAlpha2Code, normalizeAlpha2Code } from '@/lib/alpha2-codes'

function isValidCIDR(cidr: string): boolean {
  const cidrRegex =
    /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\/\d{1,3}$/
  return cidrRegex.test(cidr.trim())
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

    const geofeed = await prisma.geofeedFile.findFirst({
      where: { id: geofeedId, userId },
    })
    if (!geofeed) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const existingRanges = await prisma.ipRange.findMany({
      where: { geofeedId, userId },
    })

    const normalizeKey = (item: {
      network?: string | null
      countryCode?: string | null
      subdivision?: string | null
      city?: string | null
      postalCode?: string | null
    }) =>
      [
        (item.network || '').trim(),
        normalizeAlpha2Code(item.countryCode || ''),
        (item.subdivision || '').trim(),
        (item.city || '').trim(),
        (item.postalCode || '').trim(),
      ].join('|')

    const existingExact = new Set(existingRanges.map((range) => normalizeKey(range)))
    const existingByNetwork = new Map<string, string[]>()
    existingRanges.forEach((range) => {
      const key = (range.network || '').trim()
      if (!existingByNetwork.has(key)) {
        existingByNetwork.set(key, [])
      }
      existingByNetwork.get(key)?.push(normalizeKey(range))
    })

    const body = await request.json()
    const rows = Array.isArray(body?.rows) ? body.rows : []
    const finalize = Boolean(body?.finalize)
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No rows provided' }, { status: 400 })
    }

    const validRows: Array<{
      geofeedId: string
      userId: string
      network: string
      countryCode: string
      subdivision: string | null
      city: string | null
      postalCode: string | null
    }> = []

    const errors: Array<{ index: number; reason: string; value: string }> = []
    let skippedCount = 0
    let conflictCount = 0
    const seenInImport = new Set<string>()

    rows.forEach((row: unknown, index: number) => {
      if (!row || typeof row !== 'object') {
        errors.push({
          index,
          reason: 'Invalid row payload',
          value: '',
        })
        return
      }

      const record = row as {
        network?: string
        countryCode?: string
        subdivision?: string
        city?: string
        postalCode?: string
        original?: string
      }

      const network = (record.network || '').trim()
      const countryCode = normalizeAlpha2Code(record.countryCode || '')
      const subdivision = record.subdivision ? record.subdivision.trim() : ''
      const city = record.city ? record.city.trim() : ''
      const postalCode = record.postalCode ? record.postalCode.trim() : ''

      if (!network || !isValidCIDR(network)) {
        errors.push({
          index,
          reason: 'Invalid CIDR network',
          value: record.original || '',
        })
        return
      }

      if (!countryCode || !isValidAlpha2Code(countryCode)) {
        errors.push({
          index,
          reason: 'Invalid alpha2code',
          value: record.original || '',
        })
        return
      }

      const key = normalizeKey({
        network,
        countryCode,
        subdivision,
        city,
        postalCode,
      })
      if (seenInImport.has(key)) {
        skippedCount += 1
        errors.push({
          index,
          reason: 'Duplicate in import file',
          value: record.original || '',
        })
        return
      }
      seenInImport.add(key)

      if (existingExact.has(key)) {
        skippedCount += 1
        errors.push({
          index,
          reason: 'Duplicate of existing range',
          value: record.original || '',
        })
        return
      }

      const sameNetwork = existingByNetwork.get(network) || []
      if (sameNetwork.length > 0 && !sameNetwork.includes(key)) {
        conflictCount += 1
      }

      validRows.push({
        geofeedId,
        userId,
        network,
        countryCode,
        subdivision: subdivision || null,
        city: city || null,
        postalCode: postalCode || null,
      })
    })

    if (validRows.length > 0) {
      await prisma.ipRange.createMany({ data: validRows })
    }
    if (finalize) {
      await prisma.geofeedFile.updateMany({
        where: { id: geofeedId, userId },
        data: { isDraft: false },
      })
    }

    const finalizeNote = finalize ? ' and finalized draft' : ''
    await logActivity({
      userId,
      action: 'geofeed.import',
      message: `Imported ${validRows.length} ranges into "${geofeed.name}"${finalizeNote}`,
      geofeedId,
      geofeedName: geofeed.name,
    })

    return NextResponse.json({
      success: true,
      importedCount: validRows.length,
      errorCount: errors.length,
      skippedCount,
      conflictCount,
      errors,
    })
  } catch (error) {
    console.error('Error importing ranges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import ranges' },
      { status: 500 }
    )
  }
}
