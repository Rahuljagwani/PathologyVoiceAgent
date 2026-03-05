import { useEffect, useState } from 'react'

import { api, getCurrentLabId, getErrorMessage, type ApiError } from '../api/client'
import { useToast } from '../components/ToastProvider'

interface TestRow {
  id: string
  test_name: string
  category: string | null
  price: number
  turnaround_time_hours: number | null
  sample_type: string | null
  is_available: boolean
}

export function TestPriceManager() {
  const { showToast } = useToast()
  const [tests, setTests] = useState<TestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    test_name: '',
    test_aliases: '',
    category: '',
    price: '',
    turnaround_time_hours: '',
    sample_type: '',
    fasting_required: false,
  })

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPriceValue, setEditingPriceValue] = useState('')

  async function loadTests() {
    const labId = getCurrentLabId()
    if (!labId) return

    try {
      setLoading(true)
      setError(null)
      const data = await api.get<TestRow[]>('/tests', {
        auth: true,
        query: { lab_id: labId },
      })
      setTests(data)
    } catch (err) {
      console.error(err)
      const message = getErrorMessage(err as ApiError, 'Could not load tests.')
      setError(message)
      showToast({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTests()
  }, [])

  async function toggleAvailability(test: TestRow) {
    try {
      const updated = !test.is_available
      setTests((prev) =>
        prev.map((t) =>
          t.id === test.id ? { ...t, is_available: updated } : t,
        ),
      )
      await api.put(`/tests/${test.id}`, {
        auth: true,
        body: { is_available: updated },
      })
      showToast({
        type: 'success',
        message: updated ? 'Test marked available.' : 'Test marked unavailable.',
      })
    } catch (err) {
      console.error(err)
      // revert on error
      setTests((prev) =>
        prev.map((t) =>
          t.id === test.id ? { ...t, is_available: test.is_available } : t,
        ),
      )
      const message = getErrorMessage(err as ApiError, 'Failed to update availability.')
      showToast({ type: 'error', message })
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const labId = getCurrentLabId()
    if (!labId) return

    try {
      setCreating(true)
      setCreateError(null)
      const aliases =
        createForm.test_aliases
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean) || undefined
      const body = {
        lab_id: labId,
        test_name: createForm.test_name,
        test_aliases: aliases,
        category: createForm.category || null,
        price: Number(createForm.price || '0'),
        turnaround_time_hours: createForm.turnaround_time_hours
          ? Number(createForm.turnaround_time_hours)
          : null,
        sample_type: createForm.sample_type || null,
        fasting_required: createForm.fasting_required,
      }
      const created = await api.post<TestRow>('/tests', {
        auth: true,
        body,
      })
      setTests((prev) => [created, ...prev])
      setShowCreate(false)
      setCreateForm({
        test_name: '',
        test_aliases: '',
        category: '',
        price: '',
        turnaround_time_hours: '',
        sample_type: '',
        fasting_required: false,
      })
      showToast({ type: 'success', message: 'Test created.' })
    } catch (err) {
      console.error(err)
      const message = getErrorMessage(err as ApiError, 'Failed to create test.')
      setCreateError(message)
      showToast({ type: 'error', message })
    } finally {
      setCreating(false)
    }
  }

  async function commitPrice(test: TestRow) {
    const value = editingPriceValue.trim()
    if (!value || isNaN(Number(value))) {
      setEditingPriceId(null)
      return
    }
    const newPrice = Number(value)
    try {
      setTests((prev) =>
        prev.map((t) => (t.id === test.id ? { ...t, price: newPrice } : t)),
      )
      await api.put(`/tests/${test.id}`, {
        auth: true,
        body: { price: newPrice },
      })
      showToast({ type: 'success', message: 'Price updated.' })
    } catch (err) {
      console.error(err)
      const message = getErrorMessage(err as ApiError, 'Failed to update price.')
      showToast({ type: 'error', message })
      void loadTests()
    } finally {
      setEditingPriceId(null)
    }
  }

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
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          Add Test
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Loading tests…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
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
                {tests.map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2 text-slate-900">{t.test_name}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {t.category || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-900">
                      {editingPriceId === t.id ? (
                        <input
                          type="number"
                          className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          value={editingPriceValue}
                          onChange={(e) =>
                            setEditingPriceValue(e.target.value)
                          }
                          onBlur={() => void commitPrice(t)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              void commitPrice(t)
                            }
                            if (e.key === 'Escape') {
                              setEditingPriceId(null)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => {
                            setEditingPriceId(t.id)
                            setEditingPriceValue(String(t.price))
                          }}
                        >
                          ₹ {t.price.toFixed(0)}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {t.turnaround_time_hours ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {t.sample_type || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => void toggleAvailability(t)}
                        className={`inline-flex h-5 w-9 items-center rounded-full px-0.5 text-[10px] ${
                          t.is_available
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <span className="inline-block h-4 w-4 rounded-full bg-white" />
                      </button>
                    </td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-sm text-slate-500"
                      colSpan={6}
                    >
                      No tests configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Add Test
              </h2>
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-700"
                onClick={() => setShowCreate(false)}
              >
                Close
              </button>
            </div>
            <form className="space-y-3 text-sm" onSubmit={handleCreate}>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Test Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={createForm.test_name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      test_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Aliases (comma-separated)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={createForm.test_aliases}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      test_aliases: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Category
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={createForm.category}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Price
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={createForm.price}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    TAT (hours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={createForm.turnaround_time_hours}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        turnaround_time_hours: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Sample Type
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    value={createForm.sample_type}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        sample_type: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="fasting_required"
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  checked={createForm.fasting_required}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      fasting_required: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="fasting_required"
                  className="text-xs text-slate-700"
                >
                  Fasting required
                </label>
              </div>
              {createError && (
                <p className="text-xs text-red-600" role="alert">
                  {createError}
                </p>
              )}
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? 'Saving…' : 'Save Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

