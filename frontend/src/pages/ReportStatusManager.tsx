export function ReportStatusManager() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Report Status Manager
          </h1>
          <p className="text-sm text-slate-500">
            Staff marks reports ready. Voice agent will read from this table in
            later commits.
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
          Add Report
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-white">
              All
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Pending</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Ready</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Today</span>
          </div>
          <input
            type="search"
            placeholder="Search by token, name, or phone"
            className="w-full max-w-xs rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Token</th>
                <th className="px-3 py-2">Patient</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Test</th>
                <th className="px-3 py-2">Sample Date</th>
                <th className="px-3 py-2">Expected</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3 py-2 text-xs text-slate-500">T-1023</td>
                <td className="px-3 py-2">Rahul Sharma</td>
                <td className="px-3 py-2 text-slate-600">+91-98765-XXXX</td>
                <td className="px-3 py-2 text-slate-700">Lipid Profile</td>
                <td className="px-3 py-2 text-slate-600">Today</td>
                <td className="px-3 py-2 text-slate-600">6:00 PM</td>
                <td className="px-3 py-2">
                  <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    Pending
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700">
                    Mark Ready
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-xs text-slate-500">T-1022</td>
                <td className="px-3 py-2">Sneha Iyer</td>
                <td className="px-3 py-2 text-slate-600">+91-99887-XXXX</td>
                <td className="px-3 py-2 text-slate-700">CBC</td>
                <td className="px-3 py-2 text-slate-600">Today</td>
                <td className="px-3 py-2 text-slate-600">Ready</td>
                <td className="px-3 py-2">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Ready
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-xs text-slate-400">
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          47 reports today — 12 pending (static sample data for Commit 1).
        </p>
      </div>
    </div>
  )
}

