const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const API_PREFIX = '/api'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface ApiError extends Error {
  status?: number
  data?:
    | {
        success?: boolean
        message?: string
        details?: unknown
        [key: string]: unknown
      }
    | string
    | null
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const err = error as ApiError | undefined
  const data = err?.data as Record<string, unknown> | string | null | undefined

  if (data && typeof data === 'object' && typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (err?.message && err.message !== 'API request failed') {
    return err.message
  }

  return fallback
}

function getAccessToken() {
  return localStorage.getItem('pv_access_token') || ''
}

export function getCurrentLabId() {
  return localStorage.getItem('pv_lab_id') || ''
}

export function setAuthSession(params: { accessToken: string; labId: string | null }) {
  localStorage.setItem('pv_access_token', params.accessToken)
  if (params.labId) {
    localStorage.setItem('pv_lab_id', params.labId)
  }
}

export function clearAuthSession() {
  localStorage.removeItem('pv_access_token')
  localStorage.removeItem('pv_lab_id')
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: {
    query?: Record<string, string | number | boolean | undefined>
    body?: any
    auth?: boolean
    signal?: AbortSignal
    headers?: Record<string, string>
  } = {},
): Promise<T> {
  const url = new URL(API_PREFIX + path, API_BASE_URL)

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (options.auth) {
    const token = getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const text = await response.text()
  let data: unknown = undefined
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const err: ApiError = new Error('API request failed')
    err.status = response.status
    err.data = (data as ApiError['data']) ?? null
    throw err
  }

  return data as T
}

export const api = {
  get: <T>(path: string, options?: Parameters<typeof request<T>>[2]) =>
    request<T>('GET', path, options),
  post: <T>(path: string, options?: Parameters<typeof request<T>>[2]) =>
    request<T>('POST', path, options),
  put: <T>(path: string, options?: Parameters<typeof request<T>>[2]) =>
    request<T>('PUT', path, options),
  delete: <T>(path: string, options?: Parameters<typeof request<T>>[2]) =>
    request<T>('DELETE', path, options),
}

