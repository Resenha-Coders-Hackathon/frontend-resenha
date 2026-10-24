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
  api.post = async (path) => { calls.push(`POST ${path}`) }
})

test('email and Google login submit credentials directly', async () => {
  await login({ email: 'a@example.com', password: 'password' })
  await loginWithGoogle('google-token')
  assert.deepEqual(calls, ['POST /login/', 'POST /login/google/'])
})

const apiError = (status: number, detail: string) =>
  Object.assign(new Error(detail), { isAxiosError: true, response: { status } })

test('Google errors tell the user what happened', async () => {
  const cases: [number, string, RegExp][] = [
    [403, 'Invalid Google credential.', /validar sua conta Google/],
    [403, 'Google e-mail is not verified.', /não está verificado/],
    [503, 'Google sign-in is temporarily unavailable. Try again shortly.', /indisponível/],
    [503, 'Google sign-in is not configured on the server.', /não está configurado/],
  ]
  for (const [status, detail, expected] of cases) {
    api.post = async () => { throw apiError(status, detail) }
    await assert.rejects(loginWithGoogle('token'), expected, detail)
  }
})

test('registration keeps its public code flow', async () => {
  await requestRegistrationCode({ email: 'a@example.com' })
  assert.deepEqual(calls, ['POST /registration/request/'])
})
