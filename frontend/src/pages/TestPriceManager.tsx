export function TestPriceManager() {
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
        <button className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
          Add Test
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-white">
              All
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Haematology
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Biochemistry
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Serology
            </span>
          </div>
          <input
            type="search"
            placeholder="Search tests"
            className="w-full max-w-xs rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

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
              <tr>
                <td className="px-3 py-2 text-slate-900">CBC</td>
                <td className="px-3 py-2 text-slate-600">Haematology</td>
                <td className="px-3 py-2 text-slate-900">₹ 250</td>
                <td className="px-3 py-2 text-slate-600">4</td>
                <td className="px-3 py-2 text-slate-600">Blood</td>
                <td className="px-3 py-2">
                  <span className="inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 px-0.5 text-[10px] text-white">
                    <span className="inline-block h-4 w-4 rounded-full bg-white" />
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-900">Lipid Profile</td>
                <td className="px-3 py-2 text-slate-600">Biochemistry</td>
                <td className="px-3 py-2 text-slate-900">₹ 700</td>
                <td className="px-3 py-2 text-slate-600">24</td>
                <td className="px-3 py-2 text-slate-600">Blood</td>
                <td className="px-3 py-2">
                  <span className="inline-flex h-5 w-9 items-center rounded-full bg-slate-200 px-0.5 text-[10px] text-slate-500">
                    <span className="inline-block h-4 w-4 rounded-full bg-white" />
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

