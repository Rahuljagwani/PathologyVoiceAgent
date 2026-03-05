import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

import { api, getCurrentLabId } from '../api/client'

type PaymentMode = 'cash' | 'upi' | 'card'

interface LabSettingsForm {
  lab_name: string
  address: string
  escalation_phone: string
  // language_preference is temporarily fixed to English; field kept for compatibility.
  language_preference: string
  weekday_open?: string
  weekday_close?: string
  saturday_open?: string
  saturday_close?: string
  is_open_sunday?: boolean
  sunday_open?: string
  sunday_close?: string
  is_open_public_holidays?: boolean
  home_collection_available?: boolean
  home_collection_charge?: string
  home_collection_areas?: string[]
  home_collection_slots?: string[]
  home_collection_areas_text?: string
  home_collection_slots_text?: string
  landmark?: string
  nearest_bus_stop?: string
  parking_available?: boolean
  walk_in_allowed?: boolean
  nabl_accredited?: boolean
  payment_modes?: PaymentMode[]
}

export function Settings() {
  const [form, setForm] = useState<LabSettingsForm>({
    lab_name: '',
    address: '',
    escalation_phone: '',
    // Default language to English; UI control is hidden for now.
    language_preference: 'en',
    home_collection_areas_text: '',
    home_collection_slots_text: '',
    payment_modes: [],
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
        const data = await api.get<Partial<LabSettingsForm>>(
          `/labs/${labId}/settings`,
        )
        setForm((prev) => ({
          ...prev,
          ...data,
          home_collection_areas_text: (data.home_collection_areas || []).join(
            ', ',
          ),
          home_collection_slots_text: (data.home_collection_slots || []).join(
            ', ',
          ),
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
      const payload: Record<string, unknown> = {
        lab_name: form.lab_name,
        address: form.address,
        escalation_phone: form.escalation_phone,
        // Keep sending language_preference for compatibility, but fixed to English.
        language_preference: 'en',
        weekday_open: form.weekday_open || null,
        weekday_close: form.weekday_close || null,
        saturday_open: form.saturday_open || null,
        saturday_close: form.saturday_close || null,
        is_open_sunday: form.is_open_sunday ?? false,
        sunday_open: form.sunday_open || null,
        sunday_close: form.sunday_close || null,
        is_open_public_holidays: form.is_open_public_holidays ?? false,
        home_collection_available: form.home_collection_available ?? false,
        home_collection_charge: form.home_collection_charge
          ? Number(form.home_collection_charge)
          : 0,
        home_collection_areas: form.home_collection_areas_text
          ? form.home_collection_areas_text
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        home_collection_slots: form.home_collection_slots_text
          ? form.home_collection_slots_text
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        landmark: form.landmark || null,
        nearest_bus_stop: form.nearest_bus_stop || null,
        parking_available: form.parking_available ?? false,
        walk_in_allowed: form.walk_in_allowed ?? true,
        nabl_accredited: form.nabl_accredited ?? false,
        payment_modes: form.payment_modes || [],
      }
      await api.put(`/labs/${labId}/settings`, {
        auth: true,
        body: payload,
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
      setError('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof LabSettingsForm>(
    key: K,
    value: LabSettingsForm[K],
  ) {
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
          <h2 className="text-sm font-semibold text-slate-900">Timings</h2>
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Weekday Open
                </label>
                <input
                  type="time"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={form.weekday_open || ''}
                  onChange={(e) => update('weekday_open', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Weekday Close
                </label>
                <input
                  type="time"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={form.weekday_close || ''}
                  onChange={(e) => update('weekday_close', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Saturday Open
                </label>
                <input
                  type="time"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={form.saturday_open || ''}
                  onChange={(e) => update('saturday_open', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Saturday Close
                </label>
                <input
                  type="time"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={form.saturday_close || ''}
                  onChange={(e) => update('saturday_close', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input
                id="is_open_sunday"
                type="checkbox"
                className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                checked={!!form.is_open_sunday}
                onChange={(e) => update('is_open_sunday', e.target.checked)}
              />
              <label htmlFor="is_open_sunday" className="text-slate-700">
                Open on Sundays
              </label>
            </div>
            {form.is_open_sunday && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Sunday Open
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={form.sunday_open || ''}
                    onChange={(e) => update('sunday_open', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Sunday Close
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={form.sunday_close || ''}
                    onChange={(e) => update('sunday_close', e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <input
                id="is_open_public_holidays"
                type="checkbox"
                className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                checked={!!form.is_open_public_holidays}
                onChange={(e) =>
                  update('is_open_public_holidays', e.target.checked)
                }
              />
              <label
                htmlFor="is_open_public_holidays"
                className="text-slate-700"
              >
                Open on public holidays
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Home Collection
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-xs">
              <input
                id="home_collection_available"
                type="checkbox"
                className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                checked={!!form.home_collection_available}
                onChange={(e) =>
                  update('home_collection_available', e.target.checked)
                }
              />
              <label
                htmlFor="home_collection_available"
                className="text-slate-700"
              >
                Home collection available
              </label>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Charge Amount (₹)
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                value={form.home_collection_charge || ''}
                onChange={(e) =>
                  update('home_collection_charge', e.target.value)
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Areas Covered (comma-separated)
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                value={form.home_collection_areas_text || ''}
                onChange={(e) =>
                  update('home_collection_areas_text', e.target.value)
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Time Slots (comma-separated)
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                value={form.home_collection_slots_text || ''}
                onChange={(e) =>
                  update('home_collection_slots_text', e.target.value)
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Lab Info</h2>
          <div className="grid gap-3 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Landmark
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                value={form.landmark || ''}
                onChange={(e) => update('landmark', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Nearest Bus Stop
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                value={form.nearest_bus_stop || ''}
                onChange={(e) => update('nearest_bus_stop', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <label className="font-medium text-slate-600">Facilities</label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  checked={!!form.parking_available}
                  onChange={(e) =>
                    update('parking_available', e.target.checked)
                  }
                />
                <span className="text-slate-700">Parking available</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  checked={!!form.walk_in_allowed}
                  onChange={(e) =>
                    update('walk_in_allowed', e.target.checked)
                  }
                />
                <span className="text-slate-700">Walk-in allowed</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  checked={!!form.nabl_accredited}
                  onChange={(e) =>
                    update('nabl_accredited', e.target.checked)
                  }
                />
                <span className="text-slate-700">NABL accredited</span>
              </label>
            </div>
            <div className="space-y-1 text-xs">
              <label className="font-medium text-slate-600">
                Payment Modes
              </label>
              {(['cash', 'upi', 'card'] as PaymentMode[]).map((mode) => (
                <label key={mode} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                    checked={form.payment_modes?.includes(mode) ?? false}
                    onChange={(e) => {
                      const next = new Set(form.payment_modes || [])
                      if (e.target.checked) next.add(mode)
                      else next.delete(mode)
                      update('payment_modes', Array.from(next) as PaymentMode[])
                    }}
                  />
                  <span className="text-slate-700">
                    {mode === 'cash'
                      ? 'Cash'
                      : mode === 'upi'
                      ? 'UPI'
                      : 'Card'}
                  </span>
                </label>
              ))}
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
                value={form.escalation_phone}
                onChange={(e) => update('escalation_phone', e.target.value)}
              />
            </div>
            {/* Language preference selector is hidden for now; backend is always given English. */}
          </div>
          <div className="space-y-2 pt-2 text-xs text-slate-700">
            <h3 className="text-xs font-semibold text-slate-900">
              Call Forwarding Instructions
            </h3>
            <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
              To forward your existing lab number to your Twilio number, dial:{' '}
              <span className="font-semibold">
                *21*[Twilio Number]#
              </span>{' '}
              from your landline.
            </p>
            <div className="pt-1">
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
          </div>
        </section>
      </form>
    </div>
  )
}

