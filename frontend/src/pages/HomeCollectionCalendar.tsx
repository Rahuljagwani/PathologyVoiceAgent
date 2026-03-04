export function HomeCollectionCalendar() {
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
            <button className="rounded-full px-3 py-1">Calendar</button>
          </div>
          <div className="text-sm text-slate-600">
            Today&apos;s bookings:{' '}
            <span className="font-semibold text-slate-900">5</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium text-slate-900">Rahul Sharma</div>
              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Booked
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              7:30 AM — Koramangala
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Tests: FBS, PPBS, HbA1c
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium text-slate-900">Sneha Iyer</div>
              <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                Assigned
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              9:00 AM — HSR Layout
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Tests: Lipid Profile, LFT
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

