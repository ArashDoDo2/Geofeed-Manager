const sections = [
  {
    title: 'Getting Started',
    id: 'getting-started',
    body: [
      'Sign in with Google from the login page.',
      'Create a geofeed from the dashboard or start an import.',
      'Open the geofeed to manage IP ranges and publish CSVs.',
      'Draft geofeeds appear when starting an import and can be resumed or deleted.',
    ],
  },
  {
    title: 'Add IP Ranges',
    id: 'add-ip-ranges',
    body: [
      'Use CIDR format, e.g. 192.0.2.0/24.',
      'Country code must be 2-letter ISO, e.g. US.',
      'Subdivision, city, and postal are optional fields.',
      'Use bulk delete to remove multiple ranges at once.',
    ],
  },
  {
    title: 'Publish & Unpublish',
    id: 'publish-unpublish',
    body: [
      'Click Publish to generate a public CSV under /geo.',
      'Click Unpublish to remove the public CSV while keeping data.',
      'Use Download for private exports at any time.',
      'Copy URL lets you share the published CSV link.',
    ],
  },
  {
    title: 'Import CSV',
    id: 'import-csv',
    body: [
      'Upload an RFC 8805 CSV (no header).',
      'Preview rows and select valid entries to import.',
      'Duplicates are skipped; conflicts are highlighted in red.',
      'You can import from a URL if the server allows CORS.',
    ],
  },
  {
    title: 'Import to New or Existing',
    id: 'import-target',
    body: [
      'Choose New to create a draft geofeed and import into it.',
      'Choose Existing to add ranges to a current geofeed.',
      'If you refresh, draft geofeeds remain with a Continue Import action.',
      'Canceling an import deletes the draft geofeed.',
    ],
  },
  {
    title: 'Download vs Publish',
    id: 'download-vs-publish',
    body: [
      'Download always creates a private CSV for your account.',
      'Publish creates a public file in /public for external access.',
      'Unpublish removes the public file but keeps your data.',
    ],
  },
  {
    title: 'Activity Timeline',
    id: 'activity-timeline',
    body: [
      'The Activity panel tracks recent changes for your account.',
      'Use View all to open the full activity history page.',
      'Refresh updates the timeline after any action.',
    ],
  },
  {
    title: 'Troubleshooting',
    id: 'troubleshooting',
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
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700/70">
          Help Center
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Learn the Geofeed Manager
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Short guides to manage ranges, publish CSVs, and keep data organized across drafts,
          imports, and activity history.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {sections.slice(0, 4).map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-200"
            >
              {section.title}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section, index) => (
          <div
            key={section.title}
            id={section.id}
            className={`rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-emerald-100 ${
              index === 0 ? 'lg:col-span-2' : ''
            }`}
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

      <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
          Contact support
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Email{' '}
          <a
            href="mailto:arash_mpc@parsun.com"
            className="font-semibold text-emerald-700 hover:text-emerald-900"
          >
            arash_mpc@parsun.com
          </a>{' '}
          if you need help with access, imports, or publishing.
        </p>
      </div>
    </div>
  )
}
