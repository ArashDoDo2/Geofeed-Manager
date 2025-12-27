const sections = [
  {
    title: 'Getting Started',
    body: [
      'Sign in with Google from the login page.',
      'Create a geofeed from the dashboard or start an import.',
      'Open the geofeed to manage IP ranges and generate CSVs.',
      'Draft geofeeds appear when starting an import and can be continued or removed.',
    ],
  },
  {
    title: 'Add IP Ranges',
    body: [
      'Use CIDR format, e.g. 192.0.2.0/24.',
      'Country code must be 2-letter ISO, e.g. US.',
      'Subdivision, city, and postal are optional fields.',
      'Use bulk delete to remove multiple ranges at once.',
    ],
  },
  {
    title: 'Publish & Unpublish',
    body: [
      'Click Publish to generate a public CSV under /geo.',
      'Click Unpublish to remove the public CSV while keeping data.',
      'Use Download for private exports at any time.',
      'Copy URL lets you share the published CSV link.',
    ],
  },
  {
    title: 'Import CSV',
    body: [
      'Upload an RFC 8805 CSV (no header).',
      'Preview rows and select valid entries to import.',
      'Duplicates are skipped; conflicts are highlighted in red.',
      'You can import from a URL if the server allows CORS.',
    ],
  },
  {
    title: 'Import to New or Existing',
    body: [
      'Choose New to create a draft geofeed and import into it.',
      'Choose Existing to add ranges to a current geofeed.',
      'If you refresh, draft geofeeds remain with a Continue Import action.',
      'Canceling an import deletes the draft geofeed.',
    ],
  },
  {
    title: 'Download vs Publish',
    body: [
      'Download always creates a private CSV for your account.',
      'Publish creates a public file in /public for external access.',
      'Unpublish removes the public file but keeps your data.',
    ],
  },
  {
    title: 'Troubleshooting',
    body: [
      'If a route hangs in dev, ensure Webpack dev is active.',
      'Check .env/.env.local for DATABASE_URL.',
      'For auth issues, confirm Supabase redirect URLs.',
      'If imports fail, verify the CSV has 5 columns per line.',
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700/70">
          Help Center
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Learn the Geofeed Manager
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Quick guides to manage ranges, publish CSVs, and import data safely.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)]"
          >
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {section.body.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
