'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface GeofeedFile {
  id: string
  name: string
  createdAt: string
  _count: {
    ranges: number
  }
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
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)

  const fetchGeofeeds = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/geo/api/geofeeds', { signal })

        if (!res.ok) {
          throw new Error('Unable to reach the geofeed service')
        }

        const data = await res.json()

        if (!data.success) {
          setError(data.error || 'Failed to fetch geofeeds')
          return
        }

        setGeofeeds(data.data || [])
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    void fetchGeofeeds(controller.signal)
    return () => controller.abort()
  }, [fetchGeofeeds])

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

  const handleGenerateGeofeed = async (id: string) => {
    try {
      setGeneratingId(id)
      setGeneratedUrl(null)
      setError(null)
      const res = await fetch(`/geo/api/geofeeds/${id}/generate`, { method: 'POST' })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to generate geofeed')
        return
      }

      setGeneratedUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setGeneratingId(null)
    }
  }

  const handleCopyUrl = async () => {
    if (!generatedUrl) return
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setError(null)
    } catch (err) {
      setError('Could not copy the generated URL')
    }
  }

  if (loading)
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="space-y-2 rounded border border-gray-200 p-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Geofeeds</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Create New Geofeed
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded bg-red-100 p-4 text-red-700">
          <p className="flex-1 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => fetchGeofeeds()}
            className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {generatedUrl && (
        <div className="mb-4 rounded bg-green-100 p-4 text-green-700">
          <p className="font-semibold">Geofeed generated successfully!</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-blue-800 underline"
            >
              {generatedUrl}
            </a>
            <div className="flex gap-2">
              <button
                onClick={handleCopyUrl}
                className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700"
              >
                Copy URL
              </button>
              <button
                onClick={() => setGeneratedUrl(null)}
                className="rounded bg-green-200 px-3 py-1 text-sm font-semibold text-green-800 hover:bg-green-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleCreateGeofeed}
          className="mb-6 rounded bg-gray-100 p-4"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Geofeed Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., US Office Network"
              className="mt-1"
              disabled={creatingGeofeed}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creatingGeofeed || !newName.trim()}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {creatingGeofeed ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {geofeeds.length === 0 ? (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
          <p className="mb-3 font-medium">No geofeeds yet.</p>
          <p className="mb-4 text-sm">Create your first geofeed to start adding IP ranges.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Create geofeed
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-300">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created At</th>
                <th>Ranges</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {geofeeds.map((geofeed) => (
                <tr key={geofeed.id}>
                  <td>{geofeed.name}</td>
                  <td>{new Date(geofeed.createdAt).toLocaleDateString()}</td>
                  <td>{geofeed._count?.ranges || 0}</td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => router.push(`/geo/dashboard/${geofeed.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleGenerateGeofeed(geofeed.id)}
                        disabled={generatingId === geofeed.id}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {generatingId === geofeed.id ? 'Generating...' : 'Generate'}
                      </button>
                      <button
                        onClick={() => handleDeleteGeofeed(geofeed.id)}
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
