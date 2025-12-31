import {
  Copy,
  Download,
  Globe,
  Loader2,
  Pencil,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react'
import type { GeofeedFile } from './types'

interface GeofeedListProps {
  geofeeds: GeofeedFile[]
  importCreatedId: string | null
  generatingId: string | null
  unpublishingId: string | null
  onContinueDraftImport: (id: string) => void
  onDeleteGeofeed: (id: string) => void
  onEditGeofeed: (id: string) => void
  onDownloadGeofeed: (id: string) => void
  onTogglePublish: (geofeed: GeofeedFile) => void
}

export function GeofeedList({
  geofeeds,
  importCreatedId,
  generatingId,
  unpublishingId,
  onContinueDraftImport,
  onDeleteGeofeed,
  onEditGeofeed,
  onDownloadGeofeed,
  onTogglePublish,
}: GeofeedListProps) {
  if (geofeeds.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-10 text-center text-gray-600">
        No geofeeds yet. Create one to get started.
      </div>
    )
  }

  return (
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
                <td className="text-sm text-gray-600">
                  {geofeed._count?.ranges || 0}
                </td>
                <td>
                  <div className="flex flex-wrap items-center gap-2">
                    {geofeed.isDraft ? (
                      <>
                        <button
                          onClick={() => onContinueDraftImport(geofeed.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400"
                        >
                          <UploadCloud className="h-4 w-4" /> Continue Import
                        </button>
                        <button
                          onClick={() => onDeleteGeofeed(geofeed.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Draft
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onEditGeofeed(geofeed.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 hover:border-emerald-400"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => onDownloadGeofeed(geofeed.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300"
                        >
                          <Download className="h-4 w-4" /> Download
                        </button>
                        <button
                          onClick={() => onTogglePublish(geofeed)}
                          disabled={
                            generatingId === geofeed.id ||
                            unpublishingId === geofeed.id
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
                          onClick={() => onDeleteGeofeed(geofeed.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                        {geofeed.publishedUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                geofeed.publishedUrl || ''
                              )
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
  )
}
