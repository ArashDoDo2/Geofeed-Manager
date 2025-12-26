'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

  useEffect(() => {
    fetchGeofeeds()
  }, [])

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

  if (loading) return <div className="text-center text-gray-600">Loading...</div>

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
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {generatedUrl && (
        <div className="mb-4 rounded bg-green-100 p-4 text-green-700">
          <p>Geofeed generated successfully!</p>
          <p className="break-all">
            <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
              {generatedUrl}
            </a>
          </p>
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
        <p className="text-gray-600">No geofeeds yet. Create one to get started!</p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-300">
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
              {geofeeds.map((geofeed) => (
                <tr key={geofeed.id}>
                  <td>{geofeed.name}</td>
                  <td>{new Date(geofeed.createdAt).toLocaleDateString()}</td>
                  <td>{geofeed._count?.ranges || 0}</td>
                  <td>
                    <div className="flex gap-2">
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
