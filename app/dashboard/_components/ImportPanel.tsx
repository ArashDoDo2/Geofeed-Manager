import type { GeofeedFile, ImportRow } from './types'

interface ImportPanelProps {
  geofeeds: GeofeedFile[]
  importTarget: 'new' | 'existing'
  importNewName: string
  importGeofeedId: string
  importStep: 'target' | 'source'
  importSource: 'file' | 'url'
  importUrl: string
  importRows: ImportRow[]
  selectAllValid: boolean
  importing: boolean
  loadingImportPreview: boolean
  importSummary: string | null
  onSetImportTarget: (value: 'new' | 'existing') => void
  onSetImportNewName: (value: string) => void
  onSetImportGeofeedId: (value: string) => void
  onSetImportSource: (value: 'file' | 'url') => void
  onSetImportUrl: (value: string) => void
  onStartImport: () => void
  onImportFileChange: (file: File | null) => void
  onImportUrlPreview: () => void
  onImport: () => void
  onCancelImport: () => void
  onToggleSelectAllValid: () => void
  onToggleRowSelection: (id: string) => void
}

export function ImportPanel({
  geofeeds,
  importTarget,
  importNewName,
  importGeofeedId,
  importStep,
  importSource,
  importUrl,
  importRows,
  selectAllValid,
  importing,
  loadingImportPreview,
  importSummary,
  onSetImportTarget,
  onSetImportNewName,
  onSetImportGeofeedId,
  onSetImportSource,
  onSetImportUrl,
  onStartImport,
  onImportFileChange,
  onImportUrlPreview,
  onImport,
  onCancelImport,
  onToggleSelectAllValid,
  onToggleRowSelection,
}: ImportPanelProps) {
  return (
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
          onClick={onCancelImport}
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
                onChange={() => onSetImportTarget('new')}
              />
              New geofeed
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={importTarget === 'existing'}
                onChange={() => onSetImportTarget('existing')}
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
                onChange={(event) => onSetImportNewName(event.target.value)}
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
                onChange={(event) => onSetImportGeofeedId(event.target.value)}
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
            onClick={onStartImport}
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
                onClick={() => onSetImportSource('file')}
                className={
                  importSource === 'file' ? 'text-emerald-900' : 'text-emerald-700/70'
                }
              >
                File
              </button>
              <span className="h-3 w-px bg-emerald-200" />
              <button
                type="button"
                onClick={() => onSetImportSource('url')}
                className={
                  importSource === 'url' ? 'text-emerald-900' : 'text-emerald-700/70'
                }
              >
                URL
              </button>
            </div>
            {importSource === 'file' ? (
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) =>
                  onImportFileChange(event.target.files?.[0] || null)
                }
                className="w-full sm:w-auto"
              />
            ) : (
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <input
                  type="url"
                  value={importUrl}
                  onChange={(event) => onSetImportUrl(event.target.value)}
                  placeholder="https://example.com/geofeed.csv"
                  className="w-full sm:w-72"
                />
                <button
                  type="button"
                  onClick={onImportUrlPreview}
                  disabled={loadingImportPreview}
                  className="rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800 hover:border-emerald-400 disabled:opacity-50"
                >
                  {loadingImportPreview ? 'Loading...' : 'Load'}
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onImport}
              disabled={importing || importRows.filter((row) => row.valid && row.selected).length === 0}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
            <button
              type="button"
              onClick={onCancelImport}
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
                    onChange={onToggleSelectAllValid}
                  />
                  Select all valid
                </label>
                <span>
                  Valid: {importRows.filter((row) => row.valid).length} &nbsp; Invalid:{' '}
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
                          row.conflict ? 'bg-red-50' : row.duplicate ? 'bg-slate-50' : ''
                        }
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={row.selected}
                            disabled={!row.valid || row.duplicate}
                            onChange={() => onToggleRowSelection(row.id)}
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
  )
}
