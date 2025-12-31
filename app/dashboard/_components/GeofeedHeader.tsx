import { FilePlus, PlusCircle, UploadCloud } from 'lucide-react'
import type { ActivityLogEntry } from './types'

interface GeofeedHeaderProps {
  latestActivity?: ActivityLogEntry | null
  onToggleImport: () => void
  onToggleCreate: () => void
  formatRelativeTime: (value: string) => string
}

export function GeofeedHeader({
  latestActivity,
  onToggleImport,
  onToggleCreate,
  formatRelativeTime,
}: GeofeedHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700/70">
          Workspace
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-4xl font-semibold text-gray-900">
          <FilePlus className="h-8 w-8 text-emerald-700" /> Geofeeds
        </h1>
        {latestActivity && (
          <p className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="uppercase tracking-[0.2em] text-emerald-700/70">
              Last action
            </span>
            <span className="font-semibold text-gray-800">
              {latestActivity.message}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700/70">
              {formatRelativeTime(latestActivity.createdAt)}
            </span>
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 self-start rounded-full border border-emerald-100 bg-white/80 p-1 shadow-sm sm:mt-0">
        <button
          onClick={onToggleImport}
          className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          <UploadCloud className="h-4 w-4" /> Import
        </button>
        <button
          onClick={onToggleCreate}
          className="flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800"
        >
          <PlusCircle className="h-5 w-5" /> Create New Geofeed
        </button>
      </div>
    </div>
  )
}
