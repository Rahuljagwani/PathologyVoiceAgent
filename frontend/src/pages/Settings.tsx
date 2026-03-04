import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

import { api, getCurrentLabId } from '../api/client'

interface LabSettings {
  lab_name: string
  address: string
  escalation_phone: string
  language_preference: string
}

export function Settings() {
  const [form, setForm] = useState<LabSettings>({
    lab_name: '',
    address: '',
    escalation_phone: '',
    language_preference: 'hi',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const labId = getCurrentLabId()
    if (!labId) return

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.get<Partial<LabSettings>>(`/labs/${labId}/settings`)
        setForm((prev) => ({
          ...prev,
          ...data,
        }))
      } catch (err) {
        console.error(err)
        setError('Could not load lab settings.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const labId = getCurrentLabId()
    if (!labId) return

    try {
      setSaving(true)
      setSaved(false)
      setError(null)
      await api.put(`/labs/${labId}/settings`, {
        auth: true,
        body: form,
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
      setError('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof LabSettings>(key: K, value: LabSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">
            Everything the voice agent reads comes from here.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-2"
      >
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Basic Info</h2>
          {loading ? (
            <p className="text-xs text-slate-500">Loading…</p>
          ) : (
            <div className="grid gap-3 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Lab Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Shree Diagnostics"
                  value={form.lab_name}
                  onChange={(e) => update('lab_name', e.target.value)}
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
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
              </div>
            </div>
          )}
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
                value={form.escalation_phone}
                onChange={(e) => update('escalation_phone', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Language Preference
              </label>
              <select
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                value={form.language_preference}
                onChange={(e) =>
                  update('language_preference', e.target.value)
                }
              >
                <option value="hi">Hindi (default)</option>
                <option value="en">English</option>
                <option value="kn">Kannada</option>
              </select>
            </div>
          </div>
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
          <div className="pt-2">
            {error && (
              <p className="mb-1 text-xs text-red-600" role="alert">
                {error}
              </p>
            )}
            {saved && !error && (
              <p className="mb-1 text-xs text-emerald-600">Saved.</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}

