'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Download, FileSpreadsheet, Pencil, Plus, Trash2 } from 'lucide-react'

interface IpRange {
  id: string
  network: string
  countryCode: string
  subdivision?: string
  city?: string
  postalCode?: string
}

interface GeofeedFile {
  id: string
  name: string
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

export default function GeofeedDetailPage() {
  const params = useParams()
  const router = useRouter()
  const geofeedId = params.geofeedId as string

  const [geofeed, setGeofeed] = useState<GeofeedFile | null>(null)
  const [ranges, setRanges] = useState<IpRange[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [generatingUrl, setGeneratingUrl] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [importSummary, setImportSummary] = useState<string | null>(null)
  const [selectAllValid, setSelectAllValid] = useState(false)
  const [importSource, setImportSource] = useState<'file' | 'url'>('file')
  const [importUrl, setImportUrl] = useState('')
  const [loadingImportPreview, setLoadingImportPreview] = useState(false)
  const [selectedRangeIds, setSelectedRangeIds] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    network: '',
    countryCode: '',
    subdivision: '',
    city: '',
    postalCode: '',
  })

  const fetchGeofeedAndRanges = useCallback(async () => {
    try {
      if (!geofeedId) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      const res = await fetch(`/geo/api/geofeeds/${geofeedId}/ranges`)
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to fetch ranges')
        return
      }

      setRanges(data.data?.ranges || [])
      setSelectedRangeIds(new Set())
      if (data.data?.geofeed) {
        setGeofeed(data.data.geofeed)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [geofeedId])

  useEffect(() => {
    fetchGeofeedAndRanges()
  }, [fetchGeofeedAndRanges])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.network.trim() || !formData.countryCode.trim()) {
      setError('Network and country code are required')
      return
    }

    try {
      if (!geofeedId) {
        setError('Missing geofeed id')
        return
      }
      setError(null)
      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId
        ? `/geo/api/geofeeds/${geofeedId}/ranges/${editingId}`
        : `/geo/api/geofeeds/${geofeedId}/ranges`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to save range')
        return
      }

      setFormData({
        network: '',
        countryCode: '',
        subdivision: '',
        city: '',
        postalCode: '',
      })
      setEditingId(null)
      setShowForm(false)
      await fetchGeofeedAndRanges()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleEdit = (range: IpRange) => {
    setFormData({
      network: range.network,
      countryCode: range.countryCode,
      subdivision: range.subdivision || '',
      city: range.city || '',
      postalCode: range.postalCode || '',
    })
    setEditingId(range.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this range?')) return

    try {
      if (!geofeedId) {
        setError('Missing geofeed id')
        return
      }
      setError(null)
      const res = await fetch(`/geo/api/geofeeds/${geofeedId}/ranges/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to delete range')
        return
      }

      await fetchGeofeedAndRanges()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleGenerate = async () => {
    try {
      if (!geofeedId) {
        setError('Missing geofeed id')
        return
      }
      setGeneratingUrl('generating')
      setError(null)
      const res = await fetch(`/geo/api/geofeeds/${geofeedId}/generate`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to generate geofeed')
        return
      }

      setGeneratingUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const toggleSelectAllRanges = () => {
    if (selectedRangeIds.size === ranges.length) {
      setSelectedRangeIds(new Set())
      return
    }
    setSelectedRangeIds(new Set(ranges.map((range) => range.id)))
  }

  const toggleSelectRange = (id: string) => {
    setSelectedRangeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (!geofeedId) {
      setError('Missing geofeed id')
      return
    }
    if (selectedRangeIds.size === 0) {
      setError('Select at least one range to delete')
      return
    }
    if (!confirm(`Delete ${selectedRangeIds.size} selected ranges?`)) return

    try {
      setError(null)
      const res = await fetch(`/geo/api/geofeeds/${geofeedId}/ranges/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedRangeIds) }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to delete ranges')
        return
      }

      await fetchGeofeedAndRanges()
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
    network?: string
    countryCode?: string
    subdivision?: string
    city?: string
    postalCode?: string
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
    const existingKeys = new Set(ranges.map((range) => normalizeKey(range)))
    const existingByNetwork = new Map<string, string[]>()
    ranges.forEach((range) => {
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
    if (!geofeedId) {
      setError('Missing geofeed id')
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

      const res = await fetch(`/geo/api/geofeeds/${geofeedId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      await fetchGeofeedAndRanges()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-600">
        <Download className="h-4 w-4 animate-pulse" /> Loading...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-400"
      >
        Back to list
      </button>

      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)]">
        <h1 className="flex items-center gap-3 text-3xl font-semibold text-gray-900">
          <FileSpreadsheet className="h-8 w-8 text-emerald-700" /> {geofeed?.name}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage ranges and generate updated CSV exports.
        </p>
      </div>
      {generatingUrl && generatingUrl !== 'generating' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-sm">
          <a
            href={generatingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            <Download className="h-4 w-4" /> Download CSV
          </a>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setFormData({
              network: '',
              countryCode: '',
              subdivision: '',
              city: '',
              postalCode: '',
            })
            setEditingId(null)
            setShowForm(!showForm)
          }}
          className="flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" /> Add IP Range
        </button>
        <button
          onClick={handleGenerate}
          disabled={generatingUrl === 'generating'}
          className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 disabled:opacity-50"
        >
          {generatingUrl === 'generating' ? 'Generating...' : 'Generate Geofeed'}
        </button>
        {ranges.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={selectedRangeIds.size === 0}
            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Selected
          </button>
        )}
      </div>

      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
              Import CSV
            </p>
            <p className="mt-1 text-sm text-gray-600">
              RFC 8805 format, no header. Invalid rows will be skipped.
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-sm">
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
                  className="rounded-full border border-emerald-200 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 disabled:opacity-50"
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
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
        {importRows.length > 0 && (
          <div className="mt-5 space-y-3">
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
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800" title={row.reason}>
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

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Network (CIDR)*
              </label>
              <input
                type="text"
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                placeholder="e.g., 192.0.2.0/24"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country Code*
              </label>
              <input
                type="text"
                maxLength={2}
                value={formData.countryCode}
                onChange={(e) =>
                  setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })
                }
                placeholder="e.g., US"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subdivision
              </label>
              <input
                type="text"
                value={formData.subdivision}
                onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
                placeholder="e.g., CA"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., San Francisco"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="e.g., 94105"
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800"
            >
              {editingId ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {ranges.length === 0 ? (
        <p className="text-gray-600">No IP ranges yet. Add one to get started!</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/70 bg-white/80 shadow-[var(--shadow)]">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={ranges.length > 0 && selectedRangeIds.size === ranges.length}
                    onChange={toggleSelectAllRanges}
                    aria-label="Select all ranges"
                  />
                </th>
                <th>Network</th>
                <th>Country</th>
                <th>Subdivision</th>
                <th>City</th>
                <th>Postal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ranges.map((range) => (
                <tr key={range.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRangeIds.has(range.id)}
                      onChange={() => toggleSelectRange(range.id)}
                      aria-label={`Select range ${range.network}`}
                    />
                  </td>
                  <td className="font-mono text-sm">{range.network}</td>
                  <td>{range.countryCode}</td>
                  <td>{range.subdivision || '-'}</td>
                  <td>{range.city || '-'}</td>
                  <td>{range.postalCode || '-'}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(range)}
                        className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(range.id)}
                        className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
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
