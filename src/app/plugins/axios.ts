import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

// Rotas em que um 401 é resposta final: nunca disparam refresh.
const AUTH_PATHS = ['/login/', '/refresh/']

export const api = axios.create({
  // Vite proxies this path in development. Production serves it through the web server.
  baseURL: import.meta.env.DEV
    ? '/api/v1'
    : (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, ''),
  withCredentials: true, // o backend autentica por cookies HttpOnly
  // o Django exige X-CSRFToken em POST/PUT/DELETE quando a auth é por cookie
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withXSRFToken: true,
  // Sem timeout a UI ficaria em "carregando" para sempre; chamadas de IA passam um valor maior.
  timeout: 60_000,
})

// Várias requisições podem expirar juntas: todas esperam o mesmo refresh.
let refreshing: Promise<void> | null = null

function refreshSession(): Promise<void> {
  refreshing ??= api
    .post('/refresh/')
    .then(() => undefined)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

async function expireSession(redirect: boolean): Promise<void> {
  const { default: router } = await import('@/app/router')
  const { useAuthStore } = await import('@/modules/auth')
  useAuthStore().clearSession()
  const current = router.currentRoute.value
  // During initial navigation the guard handles the redirect itself.
  if (redirect && current.matched.length && current.meta.requiresAuth !== false) {
    await router.replace({ path: '/entrar', query: { redirect: current.fullPath } })
  }
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryableConfig | undefined
  const isAuthPath = AUTH_PATHS.some((path) => config?.url?.includes(path))
  const redirect = !config?.url?.endsWith('/users/me/')

  if (error.response?.status !== 401 || !config || isAuthPath) {
    throw error
  }

  if (config._retried) {
    await expireSession(redirect)
    throw error
  }

  config._retried = true
  try {
    await refreshSession()
  } catch (refreshError) {
    if (
      axios.isAxiosError(refreshError) &&
      [401, 403].includes(refreshError.response?.status ?? 0)
    ) {
      await expireSession(redirect)
      throw error
    }
    throw refreshError
  }
  return api(config)
})

// O Django devolve {detail: "..."} ou, em validação, {campo: ["msg"]}.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : fallback

  const data: unknown = error.response?.data
  if (!data || typeof data !== 'object') return fallback

  const record = data as Record<string, unknown>
  if (error.response?.status === 429) {
    const wait = Number(error.response.headers?.['retry-after'])
    return Number.isFinite(wait) && wait > 0
      ? `Muitas requisições. Tente novamente em ${Math.ceil(wait)} segundos.`
      : 'Muitas requisições. Aguarde um instante e tente novamente.'
  }
  if (typeof record.detail === 'string') return record.detail

  const first = Object.values(record).flat()[0]
  return typeof first === 'string' ? first : fallback
}

export default api
