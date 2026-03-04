import { useEffect, useState } from 'react'

import { api, getCurrentLabId } from '../api/client'

interface TestRow {
  id: string
  test_name: string
  category: string | null
  price: number
  turnaround_time_hours: number | null
  sample_type: string | null
  is_available: boolean
}

export function TestPriceManager() {
  const [tests, setTests] = useState<TestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const labId = getCurrentLabId()
    if (!labId) return

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.get<TestRow[]>('/tests', {
          auth: true,
          query: { lab_id: labId },
        })
        setTests(data)
      } catch (err) {
        console.error(err)
        setError('Could not load tests.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Test &amp; Price Manager
          </h1>
          <p className="text-sm text-slate-500">
            Manage test catalogue. Voice agent will read prices from here.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Loading tests…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Test</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">TAT (hrs)</th>
                  <th className="px-3 py-2">Sample</th>
                  <th className="px-3 py-2">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2 text-slate-900">{t.test_name}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {t.category || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-900">
                      ₹ {t.price.toFixed(0)}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {t.turnaround_time_hours ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {t.sample_type || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex h-5 w-9 items-center rounded-full px-0.5 text-[10px] ${
                          t.is_available
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <span className="inline-block h-4 w-4 rounded-full bg-white" />
                      </span>
                    </td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-sm text-slate-500"
                      colSpan={6}
                    >
                      No tests configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

