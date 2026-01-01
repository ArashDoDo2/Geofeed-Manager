'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { CreateGeofeedModal } from './_components/CreateGeofeedModal'
import { GeofeedHeader } from './_components/GeofeedHeader'
import { GeofeedList } from './_components/GeofeedList'
import { ImportPanel } from './_components/ImportPanel'
import type {
  ActivityLogEntry,
  ExistingRange,
  GeofeedFile,
  ImportRow,
} from './_components/types'
import { isValidAlpha2Code, normalizeAlpha2Code } from '@/lib/alpha2-codes'

const ACTIVITY_TAGS: Record<
  string,
  { label: string; classes: string; dot: string }
> = {
  'geofeed.create': {
    label: 'Create',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  'geofeed.publish': {
    label: 'Publish',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  'geofeed.unpublish': {
    label: 'Unpublish',
    classes: 'border-amber-200 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
  },
  'geofeed.delete': {
    label: 'Delete',
    classes: 'border-red-200 bg-red-50 text-red-700',
    dot: 'bg-red-500',
  },
  'geofeed.rename': {
    label: 'Rename',
    classes: 'border-sky-200 bg-sky-50 text-sky-700',
    dot: 'bg-sky-500',
  },
  'geofeed.import': {
    label: 'Import',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  'geofeed.download': {
    label: 'Download',
    classes: 'border-slate-200 bg-slate-50 text-slate-600',
    dot: 'bg-slate-400',
  },
  'range.create': {
    label: 'Range',
    classes: 'border-teal-200 bg-teal-50 text-teal-700',
    dot: 'bg-teal-500',
  },
  'range.update': {
    label: 'Range',
    classes: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    dot: 'bg-indigo-500',
  },
  'range.delete': {
    label: 'Range',
    classes: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
  'range.bulk_delete': {
    label: 'Bulk',
    classes: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

const DEFAULT_ACTIVITY_TAG = {
  label: 'Activity',
  classes: 'border-slate-200 bg-slate-50 text-slate-600',
  dot: 'bg-slate-400',
}

const getActivityTag = (action: string) => ACTIVITY_TAGS[action] || DEFAULT_ACTIVITY_TAG

const formatRelativeTime = (value: string) => {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return ''
  const diffMs = Date.now() - timestamp
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000))

  if (diffSeconds < 5) return 'just now'
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hours ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} days ago`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} months ago`

  const diffYears = Math.floor(diffDays / 365)
  return `${diffYears} years ago`
}

export default function DashboardPage() {
  const router = useRouter()
  const [geofeeds, setGeofeeds] = useState<GeofeedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [creatingGeofeed, setCreatingGeofeed] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null)
  const [publishNotice, setPublishNotice] = useState<string | null>(null)
  const [showImportPanel, setShowImportPanel] = useState(false)
  const [importTarget, setImportTarget] = useState<'new' | 'existing'>('new')
  const [importNewName, setImportNewName] = useState('')
  const [importGeofeedId, setImportGeofeedId] = useState<string>('')
  const [importRanges, setImportRanges] = useState<ExistingRange[]>([])
  const [importing, setImporting] = useState(false)
  const [importSource, setImportSource] = useState<'file' | 'url'>('file')
  const [importUrl, setImportUrl] = useState('')
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [selectAllValid, setSelectAllValid] = useState(false)
  const [importSummary, setImportSummary] = useState<string | null>(null)
  const [loadingImportPreview, setLoadingImportPreview] = useState(false)
  const [importStep, setImportStep] = useState<'target' | 'source'>('target')
  const [importCreatedId, setImportCreatedId] = useState<string | null>(null)
  const [importCommitted, setImportCommitted] = useState(false)
  const [importTargetIsDraft, setImportTargetIsDraft] = useState(false)
  const [activity, setActivity] = useState<ActivityLogEntry[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)

  const fetchActivity = async () => {
    try {
      setActivityLoading(true)
      setActivityError(null)
      const res = await fetch('/geo/api/activity?limit=10')
      const data = await res.json()

      if (!data.success) {
        setActivityError(data.error || 'Failed to fetch activity')
        return
      }

      setActivity(data.data || [])
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActivityLoading(false)
    }
  }

  useEffect(() => {
    fetchGeofeeds()
    fetchActivity()
  }, [])

  useEffect(() => {
    if (!publishNotice) return
    const timeoutId = setTimeout(() => setPublishNotice(null), 3500)
    return () => clearTimeout(timeoutId)
  }, [publishNotice])

  const formatGeofeedNotice = (geofeed?: GeofeedFile | null) => {
    if (geofeed?.name) {
      return `Geofeed "${geofeed.name}"`
    }
    return 'Geofeed'
  }

  const fetchGeofeeds = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/geo/api/geofeeds')
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to fetch geofeeds')
        return
      }

      setGeofeeds(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGeofeed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    try {
      setCreatingGeofeed(true)
      setError(null)
      const res = await fetch('/geo/api/geofeeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to create geofeed')
        return
      }

      setNewName('')
      setShowCreateForm(false)
      await fetchGeofeeds()
      await fetchActivity()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setCreatingGeofeed(false)
    }
  }

  const handleDeleteGeofeed = async (id: string) => {
    if (!confirm('Are you sure you want to delete this geofeed?')) return

    try {
      setError(null)
      const res = await fetch(`/geo/api/geofeeds/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to delete geofeed')
        return
      }

      await fetchGeofeeds()
      await fetchActivity()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleGenerateGeofeed = async (geofeed: GeofeedFile) => {
    try {
      setGeneratingId(geofeed.id)
      setError(null)
      const res = await fetch(`/geo/api/geofeeds/${geofeed.id}/generate`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to generate geofeed')
        return
      }

      setPublishNotice(`${formatGeofeedNotice(geofeed)} is now published.`)
      await fetchGeofeeds()
      await fetchActivity()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setGeneratingId(null)
    }
  }

  const fetchRangesForImport = async (geofeedId: string) => {
    const res = await fetch(`/geo/api/geofeeds/${geofeedId}/ranges`)
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch ranges')
    }
    setImportRanges(data.data?.ranges || [])
  }

  const handleStartImport = async () => {
    try {
      setError(null)
      setImportSummary(null)
      setImportRows([])
      setSelectAllValid(false)
      setImportCommitted(false)

      if (importTarget === 'new') {
        if (!importNewName.trim()) {
          setError('Geofeed name is required')
          return
        }
        const res = await fetch('/geo/api/geofeeds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: importNewName.trim(), isDraft: true }),
        })
        const data = await res.json()
        if (!data.success) {
          setError(data.error || 'Failed to create geofeed')
          return
        }
        const newId = data.data?.id as string
        setImportGeofeedId(newId)
        setImportCreatedId(newId)
        setImportTargetIsDraft(true)
        await fetchRangesForImport(newId)
        await fetchActivity()
      } else {
        if (!importGeofeedId) {
          setError('Select a geofeed to import into')
          return
        }
        const target = geofeeds.find((item) => item.id === importGeofeedId)
        setImportTargetIsDraft(Boolean(target?.isDraft))
        await fetchRangesForImport(importGeofeedId)
      }
      setImportStep('source')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const isValidCIDR = (cidr: string) => {
    const cidrRegex =
      /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\/\d{1,3}$/
    return cidrRegex.test(cidr.trim())
  }

  const normalizeKey = (row: {
    network?: string | null
    countryCode?: string | null
    subdivision?: string | null
    city?: string | null
    postalCode?: string | null
  }) =>
    [
      (row.network || '').trim(),
      normalizeAlpha2Code(row.countryCode || ''),
      (row.subdivision || '').trim(),
      (row.city || '').trim(),
      (row.postalCode || '').trim(),
    ].join('|')

  const parseImportText = async (text: string) => {
    const lines = text.split(/\r?\n/)
    const parsed: ImportRow[] = []
    const existingKeys = new Set(importRanges.map((range) => normalizeKey(range)))
    const existingByNetwork = new Map<string, string[]>()
    importRanges.forEach((range) => {
      const net = (range.network || '').trim()
      if (!existingByNetwork.has(net)) {
        existingByNetwork.set(net, [])
      }
      existingByNetwork.get(net)?.push(normalizeKey(range))
    })

    lines.forEach((rawLine, index) => {
      const line = rawLine.trim()
      if (!line) return

      const parts = line.split(',')
      const recordLine = index + 1

      if (parts.length !== 5) {
        parsed.push({
          id: `${recordLine}-${rawLine}`,
          line: recordLine,
          network: '',
          countryCode: '',
          subdivision: '',
          city: '',
          postalCode: '',
          original: rawLine,
          valid: false,
          reason: 'Expected 5 comma-separated values',
          duplicate: false,
          conflict: false,
          selected: false,
        })
        return
      }

      const [network, countryCode, subdivision, city, postalCode] = parts.map((p) => p.trim())
      const normalizedCountry = normalizeAlpha2Code(countryCode)

      let reason = ''
      if (!network || !isValidCIDR(network)) {
        reason = 'Invalid CIDR network'
      } else if (!normalizedCountry || !isValidAlpha2Code(normalizedCountry)) {
        reason = 'Invalid alpha2code'
      }

      const key = normalizeKey({
        network,
        countryCode: normalizedCountry,
        subdivision,
        city,
        postalCode,
      })
      const duplicate = existingKeys.has(key)
      const conflict =
        !duplicate &&
        (existingByNetwork.get(network) || []).some((existingKey) => existingKey !== key)

      parsed.push({
        id: `${recordLine}-${network}-${countryCode}`,
        line: recordLine,
        network,
        countryCode: normalizedCountry,
        subdivision,
        city,
        postalCode,
        original: rawLine,
        valid: reason === '',
        reason: reason || undefined,
        duplicate,
        conflict,
        selected: reason === '' && !duplicate,
      })
    })

    setImportRows(parsed)
    const validRows = parsed.filter((row) => row.valid && !row.duplicate)
    setSelectAllValid(validRows.length > 0 && validRows.every((row) => row.selected))
  }

  const handleImportFileChange = async (file: File | null) => {
    setImportSummary(null)
    if (file) {
      await parseImportText(await file.text())
    } else {
      setImportRows([])
      setSelectAllValid(false)
    }
  }

  const handleImportUrlPreview = async () => {
    if (!importUrl.trim()) {
      setError('Enter a valid URL to import')
      return
    }

    try {
      setLoadingImportPreview(true)
      setError(null)
      setImportSummary(null)
      const res = await fetch(importUrl.trim())
      if (!res.ok) {
        setError('Failed to fetch CSV from URL')
        return
      }
      const text = await res.text()
      await parseImportText(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CSV from URL')
    } finally {
      setLoadingImportPreview(false)
    }
  }

  const toggleSelectAllValid = () => {
    const next = !selectAllValid
    setSelectAllValid(next)
    setImportRows((prev) =>
      prev.map((row) =>
        row.valid && !row.duplicate ? { ...row, selected: next } : row
      )
    )
  }

  const toggleRowSelection = (id: string) => {
    setImportRows((prev) => {
      const nextRows = prev.map((row) =>
        row.id === id ? { ...row, selected: !row.selected } : row
      )
      const validRows = nextRows.filter((row) => row.valid && !row.duplicate)
      setSelectAllValid(validRows.length > 0 && validRows.every((row) => row.selected))
      return nextRows
    })
  }

  const handleImport = async () => {
    if (!importGeofeedId) {
      setError('Select a geofeed to import into')
      return
    }
    const selectedRows = importRows.filter(
      (row) => row.valid && !row.duplicate && row.selected
    )
    if (selectedRows.length === 0) {
      setError('Select at least one valid row to import')
      return
    }

    try {
      setImporting(true)
      setError(null)
      setImportSummary(null)

      const res = await fetch(`/geo/api/geofeeds/${importGeofeedId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalize: importTargetIsDraft || Boolean(importCreatedId),
          rows: selectedRows.map((row) => ({
            network: row.network,
            countryCode: row.countryCode,
            subdivision: row.subdivision,
            city: row.city,
            postalCode: row.postalCode,
            original: row.original,
          })),
        }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to import ranges')
        return
      }

      const conflictNote = data.conflictCount
        ? `, ${data.conflictCount} conflicts`
        : ''
      const skippedNote = data.skippedCount ? `, ${data.skippedCount} skipped` : ''
      setImportSummary(
        `Imported ${data.importedCount} ranges${skippedNote}${conflictNote}`
      )
      setImportUrl('')
      setImportRows([])
      setSelectAllValid(false)
      setImportStep('target')
      setImportCreatedId(null)
      setImportTargetIsDraft(false)
      setImportCommitted(true)
      await fetchGeofeeds()
      await fetchActivity()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setImporting(false)
    }
  }

  const handleCancelImport = async () => {
    if (importCreatedId && !importCommitted) {
      try {
        await fetch(`/geo/api/geofeeds/${importCreatedId}`, { method: 'DELETE' })
      } catch {
        // Ignore cleanup errors
      }
    }

    setImportCreatedId(null)
    setImportCommitted(false)
    setImportGeofeedId('')
    setImportNewName('')
    setImportUrl('')
    setImportRows([])
    setSelectAllValid(false)
    setImportSummary(null)
    setImportStep('target')
    setShowImportPanel(false)
    setImportTargetIsDraft(false)
    await fetchGeofeeds()
    await fetchActivity()
  }

  const handleContinueDraftImport = async (geofeedId: string) => {
    try {
      setError(null)
      setImportSummary(null)
      setImportRows([])
      setSelectAllValid(false)
      setImportTarget('existing')
      setImportGeofeedId(geofeedId)
      setImportTargetIsDraft(true)
      setShowImportPanel(true)
      setImportStep('source')
      await fetchRangesForImport(geofeedId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleDownloadGeofeed = (id: string) => {
    window.location.href = `/geo/api/geofeeds/${id}/download`
    setTimeout(() => {
      void fetchActivity()
    }, 800)
  }

  const handleUnpublishGeofeed = async (geofeed: GeofeedFile) => {
    if (!confirm('Unpublish this geofeed file from the public URL?')) return

    try {
      setUnpublishingId(geofeed.id)
      setError(null)
      const res = await fetch(`/geo/api/geofeeds/${geofeed.id}/unpublish`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to unpublish geofeed')
        return
      }

      setPublishNotice(`${formatGeofeedNotice(geofeed)} is now unpublished.`)
      await fetchGeofeeds()
      await fetchActivity()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUnpublishingId(null)
    }
  }

  const handleTogglePublish = async (geofeed: GeofeedFile) => {
    if (geofeed.publishedUrl) {
      await handleUnpublishGeofeed(geofeed)
      return
    }
    await handleGenerateGeofeed(geofeed)
  }

  const latestActivity = activity[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading...
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <GeofeedHeader
          latestActivity={latestActivity}
          onToggleImport={() => setShowImportPanel(!showImportPanel)}
          onToggleCreate={() => setShowCreateForm(!showCreateForm)}
          formatRelativeTime={formatRelativeTime}
        />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {publishNotice && (
        <div className="toast rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 shadow-sm">
          {publishNotice}
        </div>
      )}

      {showImportPanel && (
        <ImportPanel
          geofeeds={geofeeds}
          importTarget={importTarget}
          importNewName={importNewName}
          importGeofeedId={importGeofeedId}
          importStep={importStep}
          importSource={importSource}
          importUrl={importUrl}
          importRows={importRows}
          selectAllValid={selectAllValid}
          importing={importing}
          loadingImportPreview={loadingImportPreview}
          importSummary={importSummary}
          onSetImportTarget={setImportTarget}
          onSetImportNewName={setImportNewName}
          onSetImportGeofeedId={setImportGeofeedId}
          onSetImportSource={setImportSource}
          onSetImportUrl={setImportUrl}
          onStartImport={handleStartImport}
          onImportFileChange={handleImportFileChange}
          onImportUrlPreview={handleImportUrlPreview}
          onImport={handleImport}
          onCancelImport={handleCancelImport}
          onToggleSelectAllValid={toggleSelectAllValid}
          onToggleRowSelection={toggleRowSelection}
        />
      )}

      {showCreateForm && (
        <CreateGeofeedModal
          newName={newName}
          creatingGeofeed={creatingGeofeed}
          onNameChange={setNewName}
          onSubmit={handleCreateGeofeed}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <GeofeedList
        geofeeds={geofeeds}
        importCreatedId={importCreatedId}
        generatingId={generatingId}
        unpublishingId={unpublishingId}
        onContinueDraftImport={handleContinueDraftImport}
        onDeleteGeofeed={handleDeleteGeofeed}
        onEditGeofeed={(id) => router.push('/dashboard/' + id)}
        onDownloadGeofeed={handleDownloadGeofeed}
        onTogglePublish={handleTogglePublish}
      />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-3xl border border-white/70 bg-white/85 shadow-[var(--shadow)]">
          <div className="-mx-5 -mt-5 rounded-t-3xl border-b border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white/80 px-5 pb-4 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                  Activity
                </p>
                <p className="text-sm text-gray-600">
                  Recent actions
                  {activity.length > 0 && (
                    <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      {activity.length}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/activity"
                  className="rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400"
                >
                  View all
                </Link>
                <button
                  type="button"
                  onClick={fetchActivity}
                  disabled={activityLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white/80 text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 disabled:opacity-60"
                  title="Refresh activity"
                >
                  <RefreshCw className={activityLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5 pt-4">
            {activityError && (
              <p className="text-xs font-semibold text-red-600">{activityError}</p>
            )}

            {!activityError && activity.length === 0 && (
              <p className="text-sm text-gray-500">
                {activityLoading ? 'Loading activity...' : 'No activity yet.'}
              </p>
            )}

            {activity.length > 0 && (
              <ul className="max-h-[520px] space-y-3 overflow-auto pr-2">
                {activity.map((entry, index) => {
                  const tag = getActivityTag(entry.action)
                  const isLast = index === activity.length - 1

                  return (
                    <li
                      key={entry.id}
                      className="relative rounded-2xl border border-transparent pl-7 pr-2 py-2 transition hover:border-emerald-100 hover:bg-emerald-50/40"
                    >
                      <span
                        className={`absolute left-1.5 top-3 h-2.5 w-2.5 rounded-full ${tag.dot}`}
                      />
                      {!isLast && (
                        <span className="absolute left-2.5 top-5 h-full w-px bg-emerald-100/70" />
                      )}
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tag.classes}`}
                        >
                          {tag.label}
                        </span>
                        <p className="text-sm font-semibold text-gray-900">{entry.message}</p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(entry.createdAt)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
