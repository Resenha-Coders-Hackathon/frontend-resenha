import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

// Rotas que nunca devem disparar refresh: um 401 nelas é resposta final.
const AUTH_PATHS = ['/login/', '/login/google/', '/refresh/']

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, ''),
  withCredentials: true, // o backend autentica por cookies HttpOnly
  // o Django exige X-CSRFToken em POST/PUT/DELETE quando a auth é por cookie
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withXSRFToken: true,
})

api.interceptors.request.use((config) => {
  if (!config.baseURL) {
    throw new Error('Configure VITE_API_BASE_URL com a URL base do backend.')
  }
  return config
})

// Várias requisições podem expirar juntas: todas esperam o mesmo refresh.
let refreshing: Promise<void> | null = null

function refreshSession(): Promise<void> {
  refreshing ??= api.post('/refresh/').then(
    () => {
      refreshing = null
    },
    (error) => {
      refreshing = null
      throw error
    },
  )
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
    const { default: router } = await import('@/app/router')
    const { currentRoute } = router
    // só expulsa quem está numa página protegida; o guard cuida da navegação inicial
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

  const data = error.response?.data
  if (typeof data?.detail === 'string') return data.detail
  const firstField = data && typeof data === 'object' ? Object.values(data)[0] : undefined
  const message = Array.isArray(firstField) ? firstField[0] : firstField
  return typeof message === 'string' ? message : fallback
}
