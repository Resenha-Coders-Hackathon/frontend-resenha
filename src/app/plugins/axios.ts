import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api/',
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback

  const data: unknown = error.response?.data
  if (!data || typeof data !== 'object') return fallback

  if ('detail' in data && typeof data.detail === 'string') return data.detail

  for (const value of Object.values(data)) {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  }

  return fallback
}

export default api
