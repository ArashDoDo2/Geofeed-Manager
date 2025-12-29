'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronLeft, RefreshCw } from 'lucide-react'

interface ActivityLogEntry {
  id: string
  action: string
  message: string
  createdAt: string
  geofeedId?: string | null
  geofeedName?: string | null
}

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

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivity = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/geo/api/activity?limit=100')
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to fetch activity')
        return
      }

      setActivity(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
            Activity
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">Recent activity</h1>
          {activity.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Showing {activity.length} latest actions
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
          <button
            type="button"
            onClick={fetchActivity}
            disabled={loading}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white/80 text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 disabled:opacity-60"
            title="Refresh activity"
          >
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading activity...
        </div>
      )}

      {!loading && !error && activity.length === 0 && (
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-10 text-center text-gray-600">
          No activity yet.
        </div>
      )}

      {!loading && activity.length > 0 && (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)]">
          <ul className="space-y-6">
            {activity.map((entry, index) => {
              const tag = getActivityTag(entry.action)
              const isLast = index === activity.length - 1
              const absoluteTime = new Date(entry.createdAt).toLocaleString()

              return (
                <li key={entry.id} className="relative pl-8">
                  <span
                    className={`absolute left-1.5 top-2 h-3 w-3 rounded-full ${tag.dot}`}
                  />
                  {!isLast && (
                    <span className="absolute left-2.5 top-5 h-full w-px bg-emerald-100/70" />
                  )}
                  <div className="space-y-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tag.classes}`}
                    >
                      {tag.label}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">{entry.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(entry.createdAt)} · {absoluteTime}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
