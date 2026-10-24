import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'

const calls: string[] = []
const api = {
  get: async (path: string) => { calls.push(`GET ${path}`) },
  post: async (path: string) => { calls.push(`POST ${path}`) },
}
Object.assign(globalThis, { authTestApi: api })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/auth/services/index.ts') && specifier === '@/app/plugins/axios') {
      return {
        url: `data:text/javascript,${encodeURIComponent('export const api = globalThis.authTestApi; export const getErrorMessage = (error) => error.message;')}`,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
})
const { login, loginWithGoogle, requestRegistrationCode } = await import('../services/index.ts')
hooks.deregister()

beforeEach(() => {
  calls.length = 0
  api.get = async (path) => { calls.push(`GET ${path}`) }
})

test('email and Google login initialize CSRF before submitting credentials', async () => {
  await login({ email: 'a@example.com', password: 'password' })
  await loginWithGoogle('google-token')
  assert.deepEqual(calls, ['GET /csrf/', 'POST /login/', 'GET /csrf/', 'POST /login/google/'])
})

test('credentials are not submitted if CSRF initialization fails', async () => {
  api.get = async () => { throw new Error('offline') }
  await assert.rejects(login({ email: 'a@example.com', password: 'password' }), /offline/)
  assert.deepEqual(calls, [])
})

test('registration keeps its public code flow', async () => {
  await requestRegistrationCode({ email: 'a@example.com' })
  assert.deepEqual(calls, ['POST /registration/request/'])
})
