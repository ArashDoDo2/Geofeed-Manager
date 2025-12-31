export interface GeofeedFile {
  id: string
  name: string
  createdAt: string
  _count: {
    ranges: number
  }
  publishedUrl?: string | null
  isDraft?: boolean
}

export interface ImportRow {
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

export interface ExistingRange {
  network: string
  countryCode: string
  subdivision?: string | null
  city?: string | null
  postalCode?: string | null
}

export interface ActivityLogEntry {
  id: string
  action: string
  message: string
  createdAt: string
  geofeedId?: string | null
  geofeedName?: string | null
}
