import type { FormEvent } from 'react'
import { Loader2, PlusCircle, RefreshCw } from 'lucide-react'

interface CreateGeofeedModalProps {
  newName: string
  creatingGeofeed: boolean
  onNameChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  onCancel: () => void
}

export function CreateGeofeedModal({
  newName,
  creatingGeofeed,
  onNameChange,
  onSubmit,
  onCancel,
}: CreateGeofeedModalProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[var(--shadow)]"
    >
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Geofeed Name
        </label>
        <input
          type="text"
          value={newName}
          onChange={(event) => onNameChange(event.target.value)}
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
          onClick={onCancel}
          className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
        >
          <RefreshCw className="h-4 w-4" /> Cancel
        </button>
      </div>
    </form>
  )
}
