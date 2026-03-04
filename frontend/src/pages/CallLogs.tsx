export function CallLogs() {
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
          <div className="mt-2 text-2xl font-semibold text-slate-900">47</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Auto-Resolved
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">38</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Automation Rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600">
            81%
          </div>
          <p className="mt-1 text-xs text-emerald-700">Healthy — lab will renew</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-white">
              All
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Resolved
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Transferred
            </span>
          </div>
          <input
            type="search"
            placeholder="Filter by caller or outcome"
            className="w-full max-w-xs rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

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
              <tr>
                <td className="px-3 py-2 text-slate-600">10:12 AM</td>
                <td className="px-3 py-2 text-slate-900">+91-98XXX-12XX</td>
                <td className="px-3 py-2 text-slate-600">02:13</td>
                <td className="px-3 py-2 text-slate-600">hi</td>
                <td className="px-3 py-2 text-slate-600">report_status</td>
                <td className="px-3 py-2">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    resolved
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-600">10:05 AM</td>
                <td className="px-3 py-2 text-slate-900">+91-99XXX-45XX</td>
                <td className="px-3 py-2 text-slate-600">01:02</td>
                <td className="px-3 py-2 text-slate-600">en</td>
                <td className="px-3 py-2 text-slate-600">pricing</td>
                <td className="px-3 py-2">
                  <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    transferred
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

