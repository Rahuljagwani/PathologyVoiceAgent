import { useEffect, useState } from 'react'

import { api, getCurrentLabId, getErrorMessage, type ApiError } from '../api/client'
import { useToast } from '../components/ToastProvider'

interface ReportRow {
  id: string
  token_number: string | null
  patient_name: string
  patient_phone: string
  test_name: string
  sample_date: string
  expected_ready_time: string | null
  status: string
}

type StatusFilter = 'all' | 'pending' | 'ready' | 'today'

export function ReportStatusManager() {
  const { showToast } = useToast()
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [form, setForm] = useState({
    token_number: '',
    patient_name: '',
    patient_phone: '',
    test_name: '',
    sample_date: '',
    expected_ready_time: '',
  })

  async function loadReports(filter: StatusFilter) {
    const labId = getCurrentLabId()
    if (!labId) return

    try {
      setLoading(true)
      setError(null)
      const query: Record<string, string> = { lab_id: labId }
      if (filter === 'pending' || filter === 'ready') {
        query.status = filter
      }
      if (filter === 'today') {
        const today = new Date().toISOString().slice(0, 10)
        query.date = today
      }
      const data = await api.get<ReportRow[]>('/reports', {
        auth: true,
        query,
      })
      setReports(data)
    } catch (err) {
      console.error(err)
      const message = getErrorMessage(err as ApiError, 'Could not load reports.')
      setError(message)
      showToast({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReports(statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function markReady(id: string) {
    try {
      setMarkingId(id)
      await api.put<ReportRow>(`/reports/${id}/mark-ready`, { auth: true })
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'ready', expected_ready_time: r.expected_ready_time } : r,
        ),
      )
      showToast({ type: 'success', message: 'Report marked as ready.' })
    } catch (err) {
      console.error(err)
      const message = getErrorMessage(err as ApiError, 'Failed to mark report ready.')
      showToast({ type: 'error', message })
    } finally {
      setMarkingId(null)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const labId = getCurrentLabId()
    if (!labId) return
    try {
      setCreating(true)
      setCreateError(null)
      const expected =
        form.expected_ready_time.trim().length > 0
          ? new Date(form.expected_ready_time).toISOString()
          : undefined
      const created = await api.post<ReportRow>('/reports', {
        auth: true,
        body: {
          lab_id: labId,
          token_number: form.token_number || null,
          patient_name: form.patient_name,
          patient_phone: form.patient_phone,
          test_name: form.test_name,
          sample_date: form.sample_date,
          expected_ready_time: expected,
        },
      })
      setReports((prev) => [created, ...prev])
      setShowCreate(false)
      setForm({
        token_number: '',
        patient_name: '',
        patient_phone: '',
        test_name: '',
        sample_date: '',
        expected_ready_time: '',
      })
      showToast({ type: 'success', message: 'Report created.' })
    } catch (err) {
      console.error(err)
      const message = getErrorMessage(err as ApiError, 'Failed to create report.')
      setCreateError(message)
      showToast({ type: 'error', message })
    } finally {
      setCreating(false)
    }
  }

  const filtered = reports.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (r.token_number || '').toLowerCase().includes(q) ||
      r.patient_name.toLowerCase().includes(q) ||
      r.patient_phone.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Report Status Manager
          </h1>
          <p className="text-sm text-slate-500">
            Staff marks reports ready. The voice agent reads from this table.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          Add Report
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 text-xs font-medium text-slate-600">
            {(['all', 'pending', 'ready', 'today'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`rounded-full px-3 py-1 ${
                  statusFilter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {f === 'all'
                  ? 'All'
                  : f === 'today'
                  ? 'Today'
                  : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search by token, name, or phone"
            className="w-full max-w-xs rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading reports…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Token</th>
                    <th className="px-3 py-2">Patient</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Test</th>
                    <th className="px-3 py-2">Sample Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {r.token_number || '—'}
                      </td>
                      <td className="px-3 py-2">{r.patient_name}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {r.patient_phone}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {r.test_name}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {new Date(r.sample_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            r.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {r.status === 'ready' ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <button
                            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => void markReady(r.id)}
                            disabled={markingId === r.id}
                          >
                            {markingId === r.id ? 'Marking…' : 'Mark Ready'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        className="px-3 py-4 text-sm text-slate-500"
                        colSpan={7}
                      >
                        No reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Add Report
              </h2>
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-700"
                onClick={() => setShowCreate(false)}
              >
                Close
              </button>
            </div>
            <form className="space-y-3 text-sm" onSubmit={handleCreate}>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Token Number (optional)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={form.token_number}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        token_number: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={form.patient_name}
                    onChange={(e) =>
                      setForm((prev) => ({
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
                    value={form.patient_phone}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        patient_phone: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Test Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={form.test_name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        test_name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Sample Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={form.sample_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sample_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Expected Ready Time (optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={form.expected_ready_time}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        expected_ready_time: e.target.value,
                      }))
                    }
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
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? 'Saving…' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

