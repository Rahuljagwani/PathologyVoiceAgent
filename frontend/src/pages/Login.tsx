import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { clearAuthSession, setAuthSession } from '../api/client'

interface TokenResponse {
  access_token: string
  token_type: string
  role: string
  lab_id: string | null
}

export function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [labName, setLabName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [address, setAddress] = useState('')
  const [escalationPhone, setEscalationPhone] = useState('')
  const [languagePreference, setLanguagePreference] = useState('hi')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      clearAuthSession()

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

      const response =
        mode === 'login'
          ? await fetch(baseUrl + '/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                username: email,
                password,
              }),
            })
          : await fetch(baseUrl + '/api/auth/signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                organization_name: orgName,
                lab_name: labName,
                owner_name: ownerName,
                owner_email: email,
                owner_phone: ownerPhone,
                password,
                address,
                escalation_phone: escalationPhone,
                language_preference: languagePreference,
              }),
            })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = (await response.json()) as TokenResponse
      setAuthSession({ accessToken: data.access_token, labId: data.lab_id })
      navigate('/dashboard/reports', { replace: true })
    } catch (err) {
      console.error(err)
      setError(
        mode === 'login'
          ? 'Login failed. Please check your credentials.'
          : 'Signup failed. Please check the details and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <div className="flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full px-3 py-1 ${
                mode === 'login' ? 'bg-white shadow-sm text-slate-900' : ''
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full px-3 py-1 ${
                mode === 'signup' ? 'bg-white shadow-sm text-slate-900' : ''
              }`}
            >
              Signup
            </button>
          </div>
          <h1 className="mt-3 text-lg font-semibold text-slate-900">
            {mode === 'login' ? 'Lab Owner Login' : 'Create your lab account'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {mode === 'login'
              ? 'Sign in with the email and password you used during signup.'
              : 'Signup creates your organization, default lab, and owner login.'}
          </p>
        </div>
        <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Organization Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Shree Diagnostics"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Lab Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Main Branch"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Owner Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Dr. Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="owner@lab.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Owner Phone
              </label>
              <input
                type="tel"
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="+91-98XXXXXX"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value.slice(0, 72))}
              maxLength={72}
              required
            />
          </div>
          {mode === 'signup' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Address
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Street, area, city, pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Escalation Phone
                </label>
                <input
                  type="tel"
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="+91-98XXXXXX"
                  value={escalationPhone}
                  onChange={(e) => setEscalationPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Language Preference
                </label>
                <select
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  value={languagePreference}
                  onChange={(e) => setLanguagePreference(e.target.value)}
                >
                  <option value="hi">Hindi (default)</option>
                  <option value="en">English</option>
                  <option value="kn">Kannada</option>
                </select>
              </div>
            </>
          )}
          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? mode === 'login'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

