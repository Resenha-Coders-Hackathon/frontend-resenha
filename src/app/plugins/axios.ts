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

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryableConfig | undefined
  const isAuthPath = AUTH_PATHS.some((path) => config?.url?.includes(path))

  if (error.response?.status !== 401 || !config || config._retried || isAuthPath) {
    throw error
  }

  config._retried = true
  try {
    await refreshSession()
  } catch {
    // import dinâmico: o router importa este módulo indiretamente (evita ciclo)
    const { default: router } = await import('@/app/router')
    const { currentRoute } = router
    // só expulsa de página protegida; o guard cuida da navegação inicial
    if (currentRoute.value.meta.requiresAuth) {
      await router.push({ path: '/entrar', query: { redirect: currentRoute.value.fullPath } })
    }
    throw error
  }
  return api(config)
})

// O Django devolve {detail: "..."} ou, em validação, {campo: ["msg"]}.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : fallback

  const data: unknown = error.response?.data
  if (!data || typeof data !== 'object') return fallback

  const record = data as Record<string, unknown>
  if (typeof record.detail === 'string') return record.detail

  const first = Object.values(record).flat()[0]
  return typeof first === 'string' ? first : fallback
}

export default api
