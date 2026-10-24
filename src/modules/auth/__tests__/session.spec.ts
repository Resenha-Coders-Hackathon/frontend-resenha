import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

const auth = {
  user: { id: 'user' } as { id: string } | null,
  sessions: ['session'],
  clearSession() {
    this.user = null
    this.sessions = []
  },
}
const current = {
  fullPath: '/chat?channel=123',
  meta: {} as { requiresAuth?: boolean },
  matched: [{}],
}
const redirects: unknown[] = []
const router = {
  currentRoute: { value: current },
  replace: async (location: unknown) => {
    redirects.push(location)
  },
}
Object.assign(globalThis, { sessionTestAuth: auth, sessionTestRouter: router })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/app/plugins/axios.ts')) {
      const code =
        specifier === '@/modules/auth'
          ? 'export const useAuthStore = () => globalThis.sessionTestAuth;'
          : specifier === '@/app/router'
            ? 'export default globalThis.sessionTestRouter;'
            : undefined
      if (code)
        return { url: `data:text/javascript,${encodeURIComponent(code)}`, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.endsWith('/app/plugins/axios.ts')) {
      return {
        format: 'module-typescript',
        shortCircuit: true,
        source: readFileSync(new URL(url), 'utf8').replaceAll('import.meta.env', '({ DEV: true })'),
      }
    }
    return nextLoad(url, context)
  },
})
const { api } = await import('../../../app/plugins/axios.ts')

function response(config: InternalAxiosRequestConfig, status: number): AxiosResponse {
  return { status, statusText: String(status), data: {}, headers: {}, config }
}
function reject(config: InternalAxiosRequestConfig, status: number): never {
  throw new AxiosError('request failed', undefined, config, undefined, response(config, status))
}

beforeEach(() => {
  auth.user = { id: 'user' }
  auth.sessions = ['session']
  current.meta = {}
  current.matched = [{}]
  redirects.length = 0
})

test('expired sessions clear cached account and redirect private routes without explicit metadata', async () => {
  api.defaults.adapter = async (config) => reject(config, 401)
  await assert.rejects(api.get('/notifications/'))
  assert.equal(auth.user, null)
  assert.deepEqual(auth.sessions, [])
  assert.deepEqual(redirects, [{ path: '/entrar', query: { redirect: current.fullPath } }])
})

test('refresh network errors preserve account and propagate the connection failure', async () => {
  api.defaults.adapter = async (config) => {
    if (config.url === '/refresh/') throw new AxiosError('offline', 'ERR_NETWORK', config)
    return reject(config, 401)
  }
  await assert.rejects(api.get('/notifications/'), /offline/)
  assert.ok(auth.user)
  assert.deepEqual(auth.sessions, ['session'])
  assert.deepEqual(redirects, [])
})

test('concurrent unauthorized requests share one refresh and retry once', async () => {
  let refreshes = 0
  api.defaults.adapter = async (config) => {
    if (config.url === '/refresh/') {
      refreshes++
      await new Promise((resolve) => setTimeout(resolve, 5))
      return response(config, 200)
    }
    if (!(config as InternalAxiosRequestConfig & { _retried?: boolean })._retried)
      return reject(config, 401)
    return response(config, 200)
  }
  const results = await Promise.all([api.get('/notifications/'), api.get('/sessions/')])
  assert.equal(refreshes, 1)
  assert.ok(results.every((result) => result.status === 200))
  assert.ok(auth.user)
  assert.deepEqual(redirects, [])
})

test('a second 401 after successful refresh ends the session instead of leaving a stale profile', async () => {
  let refreshes = 0
  api.defaults.adapter = async (config) => {
    if (config.url === '/refresh/') {
      refreshes++
      return response(config, 200)
    }
    return reject(config, 401)
  }
  await assert.rejects(api.get('/sessions/'))
  assert.equal(refreshes, 1)
  assert.equal(auth.user, null)
  assert.equal(redirects.length, 1)
})

test('session checks let the navigation guard redirect without a recursive login navigation', async () => {
  api.defaults.adapter = async (config) => reject(config, 401)
  await assert.rejects(api.get('/users/me/'))
  assert.equal(auth.user, null)
  assert.deepEqual(redirects, [])
})

test('public routes do not redirect after a failed refresh', async () => {
  current.meta.requiresAuth = false
  api.defaults.adapter = async (config) => reject(config, 401)
  await assert.rejects(api.get('/notifications/'))
  assert.equal(auth.user, null)
  assert.deepEqual(redirects, [])
})

test('initial navigation delegates redirection to the guard', async () => {
  current.matched = []
  api.defaults.adapter = async (config) => reject(config, 401)
  await assert.rejects(api.get('/notifications/'))
  assert.deepEqual(redirects, [])
})

test('login errors and forbidden business actions never trigger refresh or logout', async () => {
  let calls = 0
  api.defaults.adapter = async (config) => {
    calls++
    return reject(config, config.url === '/login/google/' ? 401 : 403)
  }
  await assert.rejects(api.post('/login/google/'))
  await assert.rejects(api.post('/organizations/'))
  assert.equal(calls, 2)
  assert.ok(auth.user)
  assert.deepEqual(redirects, [])
})

test('refresh 403 ends the session while preserving the original authentication error', async () => {
  api.defaults.adapter = async (config) => reject(config, config.url === '/refresh/' ? 403 : 401)
  await assert.rejects(api.get('/users/me/'), (error: AxiosError) => error.response?.status === 401)
  assert.equal(auth.user, null)
})

process.on('exit', () => hooks.deregister())
