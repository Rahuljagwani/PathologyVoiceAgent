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
  assigned_to?: string | null
  notes?: string | null
}

type DateFilter = 'all' | 'today' | 'week'

export function HomeCollectionCalendar() {
  const [items, setItems] = useState<HomeCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    patient_name: '',
    patient_phone: '',
    address: '',
    area: '',
    test_names: '',
    preferred_date: '',
    preferred_time: '',
  })

  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [customDate, setCustomDate] = useState('')

  async function load(date?: string) {
    const labId = getCurrentLabId()
    if (!labId) return
    try {
      setLoading(true)
      setError(null)
      const query: Record<string, string> = { lab_id: labId }
      if (date) query.date = date
      const data = await api.get<HomeCollection[]>('/home-collections', {
        auth: true,
        query,
      })
      setItems(data)
    } catch (err) {
      console.error(err)
      setError('Could not load home collections.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (dateFilter === 'today') {
      void load(today)
    } else if (dateFilter === 'all') {
      void load()
    } else if (dateFilter === 'week') {
      void load()
    }
  }, [dateFilter])

  useEffect(() => {
    if (customDate) {
      void load(customDate)
    }
  }, [customDate])

  async function createBooking(e: React.FormEvent) {
    e.preventDefault()
    const labId = getCurrentLabId()
    if (!labId) return
    try {
      setCreating(true)
      setCreateError(null)
      const tests = createForm.test_names
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const bookingRef = `HC-${Date.now()}`
      const body = {
        lab_id: labId,
        booking_ref: bookingRef,
        patient_name: createForm.patient_name,
        patient_phone: createForm.patient_phone,
        address: createForm.address,
        area: createForm.area || null,
        test_names: tests,
        preferred_date: createForm.preferred_date,
        preferred_time: createForm.preferred_time,
      }
      const created = await api.post<HomeCollection>('/home-collections', {
        body,
      })
      setItems((prev) => [created, ...prev])
      setShowCreate(false)
      setCreateForm({
        patient_name: '',
        patient_phone: '',
        address: '',
        area: '',
        test_names: '',
        preferred_date: '',
        preferred_time: '',
      })
    } catch (err) {
      console.error(err)
      setCreateError('Failed to create booking.')
    } finally {
      setCreating(false)
    }
  }

  async function updateStatus(
    booking: HomeCollection,
    status: 'assigned' | 'completed' | 'cancelled',
  ) {
    const labId = getCurrentLabId()
    if (!labId) return

    let assigned_to: string | undefined
    let notes: string | undefined

    if (status === 'assigned') {
      const name = window.prompt('Assign to (phlebotomist name)?', '')
      if (!name) return
      assigned_to = name
    }
    if (status === 'cancelled') {
      const reason = window.prompt('Reason for cancellation?', '')
      if (!reason) return
      notes = reason
    }

    try {
      const payload: { status: string; assigned_to?: string; notes?: string } =
        { status }
      if (assigned_to) payload.assigned_to = assigned_to
      if (notes) payload.notes = notes

      const updated = await api.put<HomeCollection>(
        `/home-collections/${booking.id}/status`,
        {
          auth: true,
          body: payload,
        },
      )
      setItems((prev) =>
        prev.map((b) => (b.id === booking.id ? updated : b)),
      )
    } catch (err) {
      console.error(err)
      alert('Failed to update status.')
    }
  }

  const filteredForWeek =
    dateFilter === 'week'
      ? items.filter((b) => {
          const d = new Date(b.preferred_date)
          const now = new Date()
          const diff =
            (d.getTime() - now.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
          return diff >= 0 && diff < 7
        })
      : items

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
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          New Booking
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-600">
            <button className="rounded-full bg-white px-3 py-1 shadow-sm">
              List
            </button>
            <button className="rounded-full px-3 py-1" disabled>
              Calendar
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`rounded-full px-3 py-1 ${
                dateFilter === 'today'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('week')}
              className={`rounded-full px-3 py-1 ${
                dateFilter === 'week'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`rounded-full px-3 py-1 ${
                dateFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100'
              }`}
            >
              All
            </button>
            <input
              type="date"
              className="rounded-md border border-slate-200 px-2 py-1 text-xs shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-600">
            Bookings:{' '}
            <span className="font-semibold text-slate-900">
              {filteredForWeek.length}
            </span>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading bookings…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredForWeek.map((b) => (
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
                  {b.preferred_date} {b.preferred_time} —{' '}
                  {b.area || 'Home collection'}
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  Tests: {b.test_names.join(', ')}
                </div>
                {b.assigned_to && (
                  <div className="mt-1 text-xs text-slate-500">
                    Assigned to: {b.assigned_to}
                  </div>
                )}
                {b.notes && (
                  <div className="mt-1 text-xs text-slate-500">
                    Notes: {b.notes}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {b.status === 'booked' && (
                    <button
                      type="button"
                      className="rounded-md bg-sky-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-sky-700"
                      onClick={() => void updateStatus(b, 'assigned')}
                    >
                      Assign
                    </button>
                  )}
                  {b.status === 'assigned' && (
                    <button
                      type="button"
                      className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                      onClick={() => void updateStatus(b, 'completed')}
                    >
                      Mark Completed
                    </button>
                  )}
                  {b.status !== 'completed' && (
                    <button
                      type="button"
                      className="rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-rose-700"
                      onClick={() => void updateStatus(b, 'cancelled')}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredForWeek.length === 0 && (
              <p className="text-sm text-slate-500">
                No bookings found for this filter.
              </p>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                New Home Collection Booking
              </h2>
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-700"
                onClick={() => setShowCreate(false)}
              >
                Close
              </button>
            </div>
            <form className="space-y-3 text-sm" onSubmit={createBooking}>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Patient Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={createForm.patient_name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      patient_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Patient Phone
                </label>
                <input
                  type="tel"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={createForm.patient_phone}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      patient_phone: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Address
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={createForm.address}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Area (optional)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={createForm.area}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      area: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Tests (comma-separated)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={createForm.test_names}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      test_names: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={createForm.preferred_date}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        preferred_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    placeholder="e.g. 7:30 AM–8:00 AM"
                    value={createForm.preferred_time}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        preferred_time: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              {createError && (
                <p className="text-xs text-red-600" role="alert">
                  {createError}
                </p>
              )}
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? 'Saving…' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

