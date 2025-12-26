'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

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

  const [formData, setFormData] = useState({
    network: '',
    countryCode: '',
    subdivision: '',
    city: '',
    postalCode: '',
  })

  const fetchGeofeedAndRanges = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/geo/api/geofeeds/${geofeedId}/ranges`, { signal })

        if (!res.ok) {
          throw new Error('Unable to load geofeed details')
        }

        const data = await res.json()

        if (!data.success) {
          setError(data.error || 'Failed to fetch ranges')
          return
        }

        setRanges(data.data?.ranges || [])
        if (data.data?.geofeed) {
          setGeofeed(data.data.geofeed)
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    },
    [geofeedId],
  )

  useEffect(() => {
    const controller = new AbortController()
    void fetchGeofeedAndRanges(controller.signal)
    return () => controller.abort()
  }, [fetchGeofeedAndRanges])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.network.trim() || !formData.countryCode.trim()) {
      setError('Network and country code are required')
      return
    }

    try {
      setError(null)
      const method = editingId ? 'PUT' : 'POST'
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

  const handleCopyGenerated = async () => {
    if (!generatingUrl || generatingUrl === 'generating') return
    try {
      await navigator.clipboard.writeText(generatingUrl)
      setError(null)
    } catch (err) {
      setError('Could not copy the generated URL')
    }
  }

  if (loading)
    return (
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="space-y-2 rounded border border-gray-200 p-4">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    )

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back
      </button>

      <h1 className="mb-2 text-3xl font-bold text-gray-900">{geofeed?.name}</h1>
      {generatingUrl && generatingUrl !== 'generating' && (
        <div className="mb-4 flex flex-col gap-2 rounded bg-green-100 p-3 text-green-800 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={generatingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            📥 Download CSV
          </a>
          <div className="flex gap-2">
            <button
              onClick={handleCopyGenerated}
              className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700"
            >
              Copy URL
            </button>
            <button
              onClick={() => setGeneratingUrl(null)}
              className="rounded bg-green-200 px-3 py-1 text-sm font-semibold text-green-900 hover:bg-green-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded bg-red-100 p-4 text-red-700">
          <p className="flex-1 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => fetchGeofeedAndRanges()}
            className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 flex gap-2">
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
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Add IP Range
        </button>
        <button
          onClick={handleGenerate}
          disabled={generatingUrl === 'generating'}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {generatingUrl === 'generating' ? 'Generating...' : 'Generate Geofeed'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded bg-gray-100 p-4">
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
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              {editingId ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {ranges.length === 0 ? (
        <p className="text-gray-600">No IP ranges yet. Add one to get started!</p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-300">
          <table>
            <thead>
              <tr>
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
                  <td className="font-mono text-sm">{range.network}</td>
                  <td>{range.countryCode}</td>
                  <td>{range.subdivision || '—'}</td>
                  <td>{range.city || '—'}</td>
                  <td>{range.postalCode || '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(range)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(range.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
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
