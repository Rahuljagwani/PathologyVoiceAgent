export function Settings() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">
            Everything the voice agent reads comes from here (to be wired in
            later commits).
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Basic Info</h2>
          <div className="grid gap-3 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Lab Name
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Shree Diagnostics"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Address
              </label>
              <textarea
                rows={2}
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Street, area, city, pincode"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Voice Agent</h2>
          <div className="grid gap-3 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Escalation Phone
              </label>
              <input
                type="tel"
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="+91-98XXXXXX"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Language Preference
              </label>
              <select className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400">
                <option value="hi">Hindi (default)</option>
                <option value="en">English</option>
                <option value="kn">Kannada</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Home Collection
          </h2>
          <p className="text-xs text-slate-500">
            Toggle and configure home sample collection areas and slots in later
            commits.
          </p>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Call Forwarding Instructions
          </h2>
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-700">
            To forward your existing lab number to your Twilio number, dial:{' '}
            <span className="font-semibold">
              *21*[Twilio Number]#
            </span>{' '}
            from your landline.
          </p>
        </section>
      </div>
    </div>
  )
}

