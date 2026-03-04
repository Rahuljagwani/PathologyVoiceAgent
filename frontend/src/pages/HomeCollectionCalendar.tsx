import { useEffect, useState } from 'react'

import { api, getCurrentLabId } from '../api/client'

interface HomeCollection {
  id: string
  patient_name: string
  patient_phone: string
  address: string
  area: string | null
  test_names: string[]
  preferred_date: string
  preferred_time: string
  status: string
}

export function HomeCollectionCalendar() {
  const [items, setItems] = useState<HomeCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const labId = getCurrentLabId()
    if (!labId) return

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.get<HomeCollection[]>('/home-collections', {
          auth: true,
          query: { lab_id: labId },
        })
        setItems(data)
      } catch (err) {
        console.error(err)
        setError('Could not load home collections.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const todayCount = items.length

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Home Collection Calendar
          </h1>
          <p className="text-sm text-slate-500">
            View and manage all home collection bookings.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-600">
            <button className="rounded-full bg-white px-3 py-1 shadow-sm">
              List
            </button>
            <button className="rounded-full px-3 py-1" disabled>
              Calendar
            </button>
          </div>
          <div className="text-sm text-slate-600">
            Today&apos;s bookings:{' '}
            <span className="font-semibold text-slate-900">
              {todayCount}
            </span>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading bookings…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((b) => (
              <div
                key={b.id}
                className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-900">
                    {b.patient_name}
                  </div>
                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {b.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {b.preferred_time} — {b.area || 'Home collection'}
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  Tests: {b.test_names.join(', ')}
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-slate-500">
                No bookings found for this lab.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

