import { useEffect, useMemo, useState } from 'react'

import { api, getCurrentLabId } from '../api/client'

interface CallLog {
  id: string
  caller_phone: string | null
  call_time: string
  duration_seconds: number | null
  language_detected: string | null
  flow_triggered: string | null
  outcome: string | null
  transfer_reason?: string | null
  summary?: string | null
  recording_url?: string | null
}

interface CallStats {
  period: string
  total_calls: number
  auto_resolved: number
  transferred: number
  logged: number
  automation_rate: number
}

type OutcomeFilter = 'all' | 'resolved' | 'transferred' | 'logged'

type Period = 'today' | '7d'

export function CallLogs() {
  const [logs, setLogs] = useState<CallLog[]>([])
  const [stats, setStats] = useState<CallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all')
  const [flowFilter, setFlowFilter] = useState<string>('all')
  const [date, setDate] = useState('')
  const [period, setPeriod] = useState<Period>('today')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const flows = useMemo(
    () =>
      Array.from(
        new Set(
          logs
            .map((l) => l.flow_triggered || '')
            .filter((x) => x && x.trim().length > 0),
        ),
      ),
    [logs],
  )

  useEffect(() => {
    const labId = getCurrentLabId()
    if (!labId) return

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const query: Record<string, string> = { lab_id: labId }
        if (outcomeFilter !== 'all') query.outcome = outcomeFilter
        if (date) query.date = date

        const [logsRes, statsRes] = await Promise.all([
          api.get<CallLog[]>('/calls', {
            auth: true,
            query,
          }),
          api.get<CallStats>('/calls/stats', {
            auth: true,
            query: { lab_id: labId, period },
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
  }, [outcomeFilter, date, period])

  const filteredLogs = logs.filter((log) => {
    if (flowFilter !== 'all' && log.flow_triggered !== flowFilter) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Call Logs</h1>
          <p className="text-sm text-slate-500">
            Full transparency on every call the voice agent handled.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-slate-50"
          >
            i
          </span>
          <span>
            For demo, call{' '}
            <span className="font-semibold text-slate-900">+15705725797</span>. Calls to
            this number will appear here.
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Calls ({period === 'today' ? 'Today' : 'Last 7 days'})
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
            Based on resolved vs total calls.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
            {(['all', 'resolved', 'transferred', 'logged'] as OutcomeFilter[]).map(
              (o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcomeFilter(o)}
                  className={`rounded-full px-3 py-1 ${
                    outcomeFilter === o
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {o === 'all'
                    ? 'All'
                    : o[0].toUpperCase() + o.slice(1).toLowerCase()}
                </button>
              ),
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => setPeriod('today')}
              className={`rounded-full px-3 py-1 ${
                period === 'today'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPeriod('7d')}
              className={`rounded-full px-3 py-1 ${
                period === '7d'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              7 days
            </button>
            <input
              type="date"
              className="rounded-md border border-slate-200 px-2 py-1 text-xs shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <select
              className="rounded-md border border-slate-200 px-2 py-1 text-xs shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              value={flowFilter}
              onChange={(e) => setFlowFilter(e.target.value)}
            >
              <option value="all">All flows</option>
              {flows.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
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
                {filteredLogs.map((log) => (
                  <>
                    <tr
                      key={log.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === log.id ? null : log.id,
                        )
                      }
                    >
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
                    {expandedId === log.id && (
                      <tr>
                        <td
                          colSpan={6}
                          className="bg-slate-50 px-3 py-3 text-xs text-slate-700"
                        >
                          <div className="space-y-1">
                            {log.summary && (
                              <p>
                                <span className="font-semibold">Summary: </span>
                                {log.summary}
                              </p>
                            )}
                            {log.transfer_reason && (
                              <p>
                                <span className="font-semibold">
                                  Transfer reason:{' '}
                                </span>
                                {log.transfer_reason}
                              </p>
                            )}
                            {log.recording_url && (
                              <p>
                                <a
                                  href={log.recording_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sky-700 underline"
                                >
                                  Listen to recording
                                </a>
                              </p>
                            )}
                            {!log.summary &&
                              !log.transfer_reason &&
                              !log.recording_url && (
                                <p className="text-slate-500">
                                  No additional details available.
                                </p>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filteredLogs.length === 0 && (
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

