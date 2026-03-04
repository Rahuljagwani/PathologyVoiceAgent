import { useEffect, useState } from 'react'

import { api, getCurrentLabId } from '../api/client'

interface CallLog {
  id: string
  caller_phone: string | null
  call_time: string
  duration_seconds: number | null
  language_detected: string | null
  flow_triggered: string | null
  outcome: string | null
}

interface CallStats {
  period: string
  total_calls: number
  auto_resolved: number
  transferred: number
  logged: number
  automation_rate: number
}

export function CallLogs() {
  const [logs, setLogs] = useState<CallLog[]>([])
  const [stats, setStats] = useState<CallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const labId = getCurrentLabId()
    if (!labId) return

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [logsRes, statsRes] = await Promise.all([
          api.get<CallLog[]>('/calls', {
            auth: true,
            query: { lab_id: labId },
          }),
          api.get<CallStats>('/calls/stats', {
            auth: true,
            query: { lab_id: labId, period: 'today' },
          }),
        ])
        setLogs(logsRes)
        setStats(statsRes)
      } catch (err) {
        console.error(err)
        setError('Could not load call logs.')
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
          <h1 className="text-xl font-semibold text-slate-900">Call Logs</h1>
          <p className="text-sm text-slate-500">
            Full transparency on every call the voice agent handled.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Calls Today
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {stats ? stats.total_calls : '—'}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Auto-Resolved
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {stats ? stats.auto_resolved : '—'}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Automation Rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600">
            {stats ? `${stats.automation_rate.toFixed(0)}%` : '—'}
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            Based on resolved vs total calls today.
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
          <p className="text-sm text-slate-500">Loading call logs…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Caller</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">Language</th>
                  <th className="px-3 py-2">Flow</th>
                  <th className="px-3 py-2">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2 text-slate-600">
                      {new Date(log.call_time).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-2 text-slate-900">
                      {log.caller_phone || 'Unknown'}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {log.duration_seconds != null
                        ? `${Math.floor(log.duration_seconds / 60)}:${String(
                            log.duration_seconds % 60,
                          ).padStart(2, '0')}`
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {log.language_detected || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {log.flow_triggered || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {log.outcome || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-sm text-slate-500"
                      colSpan={6}
                    >
                      No calls logged yet.
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

