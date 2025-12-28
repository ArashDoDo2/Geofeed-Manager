'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  FilePlus,
  Loader2,
  PlusCircle,
  RefreshCw,
  Trash2,
  Pencil,
  Download,
  UploadCloud,
  Globe,
  XCircle,
  Copy,
} from 'lucide-react'

interface GeofeedFile {
  id: string
  name: string
  createdAt: string
  _count: {
    ranges: number
  }
  publishedUrl?: string | null
  isDraft?: boolean
}

interface ImportRow {
  id: string
  line: number
  network: string
  countryCode: string
  subdivision: string
  city: string
  postalCode: string
  original: string
  valid: boolean
  reason?: string
  duplicate: boolean
  conflict: boolean
  selected: boolean
}

interface ExistingRange {
  network: string
  countryCode: string
  subdivision?: string | null
  city?: string | null
  postalCode?: string | null
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

  useEffect(() => {
    fetchGeofeeds()
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

  const isValidCountryCode = (code: string) => /^[A-Z]{2}$/.test(code.trim())

  const normalizeKey = (row: {
    network?: string | null
    countryCode?: string | null
    subdivision?: string | null
    city?: string | null
    postalCode?: string | null
  }) =>
    [
      (row.network || '').trim(),
      (row.countryCode || '').trim().toUpperCase(),
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
      const normalizedCountry = countryCode.toUpperCase()

      let reason = ''
      if (!network || !isValidCIDR(network)) {
        reason = 'Invalid CIDR network'
      } else if (!normalizedCountry || !isValidCountryCode(normalizedCountry)) {
        reason = 'Invalid country code'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700/70">
            Workspace
          </p>
          <h1 className="mt-2 flex items-center gap-3 text-4xl font-semibold text-gray-900">
            <FilePlus className="h-8 w-8 text-emerald-700" /> Geofeeds
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImportPanel(!showImportPanel)}
            className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400"
          >
            <UploadCloud className="h-4 w-4" /> Import
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800"
          >
            <PlusCircle className="h-5 w-5" /> Create New Geofeed
          </button>
        </div>
      </div>

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
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                Import to Geofeed
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Choose a target, then preview and select rows to import.
              </p>
            </div>
            <button
              onClick={handleCancelImport}
              className="rounded-full border border-gray-300 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-400"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div
              className={`rounded-2xl border border-emerald-100 bg-white/70 p-4 ${
                importStep === 'source' ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Target
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={importTarget === 'new'}
                    onChange={() => setImportTarget('new')}
                  />
                  New geofeed
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={importTarget === 'existing'}
                    onChange={() => setImportTarget('existing')}
                  />
                  Existing geofeed
                </label>
              </div>
              {importTarget === 'new' ? (
                <div className="mt-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Geofeed Name
                  </label>
                  <input
                    type="text"
                    value={importNewName}
                    onChange={(event) => setImportNewName(event.target.value)}
                    className="mt-2 w-full"
                    placeholder="e.g., Import Batch"
                  />
                </div>
              ) : (
                <div className="mt-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Select geofeed
                  </label>
                  <select
                    value={importGeofeedId}
                    onChange={(event) => setImportGeofeedId(event.target.value)}
                    className="mt-2 w-full"
                  >
                    <option value="">Choose...</option>
                    {geofeeds.map((geofeed) => (
                      <option key={geofeed.id} value={geofeed.id}>
                        {geofeed.name}
                        {geofeed.isDraft ? ' (draft)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                type="button"
                onClick={handleStartImport}
                className="mt-4 w-full rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                {importTarget === 'new' ? 'Add Geofeed and Import' : 'Select and Import'}
              </button>
            </div>

            <div
              className={`rounded-2xl border border-emerald-100 bg-white/70 p-4 ${
                importStep === 'source' ? '' : 'pointer-events-none opacity-50'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Source
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <button
                    type="button"
                    onClick={() => setImportSource('file')}
                    className={importSource === 'file' ? 'text-emerald-900' : 'text-emerald-700/70'}
                  >
                    File
                  </button>
                  <span className="h-3 w-px bg-emerald-200" />
                  <button
                    type="button"
                    onClick={() => setImportSource('url')}
                    className={importSource === 'url' ? 'text-emerald-900' : 'text-emerald-700/70'}
                  >
                    URL
                  </button>
                </div>
                {importSource === 'file' ? (
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(event) => handleImportFileChange(event.target.files?.[0] || null)}
                    className="w-full sm:w-auto"
                  />
                ) : (
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <input
                      type="url"
                      value={importUrl}
                      onChange={(event) => setImportUrl(event.target.value)}
                      placeholder="https://example.com/geofeed.csv"
                      className="w-full sm:w-72"
                    />
                    <button
                      type="button"
                      onClick={handleImportUrlPreview}
                      disabled={loadingImportPreview}
                      className="rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800 hover:border-emerald-400 disabled:opacity-50"
                    >
                      {loadingImportPreview ? 'Loading...' : 'Load'}
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={
                    importing ||
                    importRows.filter((row) => row.valid && row.selected).length === 0
                  }
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelImport}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
                >
                  Cancel
                </button>
              </div>

              {importRows.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectAllValid}
                        onChange={toggleSelectAllValid}
                      />
                      Select all valid
                    </label>
                    <span>
                      Valid: {importRows.filter((row) => row.valid).length} · Invalid:{' '}
                      {importRows.filter((row) => !row.valid).length}
                    </span>
                  </div>
                  <div className="max-h-64 overflow-auto rounded-2xl border border-white/70 bg-white/70">
                    <table>
                      <thead>
                        <tr>
                          <th />
                          <th>Network</th>
                          <th>Country</th>
                          <th>Region</th>
                          <th>City</th>
                          <th>Postal</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.map((row) => (
                          <tr
                            key={row.id}
                            className={
                              row.conflict
                                ? 'bg-red-50'
                                : row.duplicate
                                  ? 'bg-slate-50'
                                  : ''
                            }
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={row.selected}
                                disabled={!row.valid || row.duplicate}
                                onChange={() => toggleRowSelection(row.id)}
                              />
                            </td>
                            <td className="font-mono text-xs">{row.network || '-'}</td>
                            <td>{row.countryCode || '-'}</td>
                            <td>{row.subdivision || '-'}</td>
                            <td>{row.city || '-'}</td>
                            <td>{row.postalCode || '-'}</td>
                            <td>
                              {row.duplicate ? (
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                  Duplicate
                                </span>
                              ) : row.conflict ? (
                                <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                                  Conflict
                                </span>
                              ) : row.valid ? (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                  Valid
                                </span>
                              ) : (
                                <span
                                  className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                                  title={row.reason}
                                >
                                  {row.reason || 'Invalid'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importSummary && (
                <p className="mt-4 text-sm font-semibold text-emerald-700">
                  {importSummary}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleCreateGeofeed}
          className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[var(--shadow)]"
        >
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Geofeed Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., US Office Network"
              className="mt-2 w-full"
              disabled={creatingGeofeed}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creatingGeofeed || !newName.trim()}
              className="flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {creatingGeofeed ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" /> Create
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
            >
              <RefreshCw className="h-4 w-4" /> Cancel
            </button>
          </div>
        </form>
      )}

      {geofeeds.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-10 text-center text-gray-600">
          No geofeeds yet. Create one to get started.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/70 bg-white/80 shadow-[var(--shadow)]">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created At</th>
                <th>Ranges</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {geofeeds
                .filter((geofeed) => geofeed.id !== importCreatedId)
                .map((geofeed) => (
                <tr key={geofeed.id}>
                  <td className="font-semibold text-gray-900">
                    {geofeed.name}
                    {geofeed.isDraft && (
                      <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="text-sm text-gray-600">
                    {new Date(geofeed.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-sm text-gray-600">{geofeed._count?.ranges || 0}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      {geofeed.isDraft ? (
                        <>
                          <button
                            onClick={() => handleContinueDraftImport(geofeed.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400"
                          >
                            <UploadCloud className="h-4 w-4" /> Continue Import
                          </button>
                          <button
                            onClick={() => handleDeleteGeofeed(geofeed.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" /> Delete Draft
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => router.push(`/dashboard/${geofeed.id}`)}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 hover:border-emerald-400"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDownloadGeofeed(geofeed.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300"
                          >
                            <Download className="h-4 w-4" /> Download
                          </button>
                          <button
                            onClick={() => handleTogglePublish(geofeed)}
                            disabled={
                              generatingId === geofeed.id || unpublishingId === geofeed.id
                            }
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                              geofeed.publishedUrl
                                ? 'border-orange-200 text-orange-700 hover:border-orange-300'
                                : 'border-emerald-200 text-emerald-800 hover:border-emerald-400'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {generatingId === geofeed.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                              </>
                            ) : unpublishingId === geofeed.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Unpublishing...
                              </>
                            ) : geofeed.publishedUrl ? (
                              <>
                                <XCircle className="h-4 w-4" /> Unpublish
                              </>
                            ) : (
                              <>
                                <Globe className="h-4 w-4" /> Publish
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteGeofeed(geofeed.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                          {geofeed.publishedUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                navigator.clipboard.writeText(geofeed.publishedUrl || '')
                              }
                              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800 hover:border-amber-300"
                              title="Copy URL"
                            >
                              <Copy className="h-3 w-3" />
                              {geofeed.publishedUrl}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
