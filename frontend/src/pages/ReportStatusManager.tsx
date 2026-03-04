import { useEffect, useState } from 'react'

import { api, getCurrentLabId } from '../api/client'

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

export function ReportStatusManager() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    const labId = getCurrentLabId()
    if (!labId) return

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.get<ReportRow[]>('/reports', {
          auth: true,
          query: { lab_id: labId },
        })
        setReports(data)
      } catch (err) {
        console.error(err)
        setError('Could not load reports.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  async function markReady(id: string) {
    try {
      setMarkingId(id)
      await api.put<ReportRow>(`/reports/${id}/mark-ready`, { auth: true })
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'ready', expected_ready_time: r.expected_ready_time } : r,
        ),
      )
    } catch (err) {
      console.error(err)
      alert('Failed to mark report ready')
    } finally {
      setMarkingId(null)
    }
  }

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
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-white">
              All
            </span>
          </div>
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
                  {reports.map((r) => (
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
                  {reports.length === 0 && (
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
    </div>
  )
}

