import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'

const calls: string[] = []
const api = {
  googleConnected: async () => false,
  googleAuthorizeUrl: async () => 'https://accounts.google.com/consent',
  googleConnect: async (code: string, state: string) => {
    calls.push(`connect:${code}:${state}`)
  },
}
Object.assign(globalThis, { googleTestApi: api })

const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL?.endsWith('/composables/useGoogleConnect.ts') &&
      specifier === '../services'
    ) {
      const names = Object.keys(api)
      return {
        url: `data:text/javascript,${encodeURIComponent(names.map((n) => `export const ${n} = (...a) => globalThis.googleTestApi.${n}(...a);`).join('\n'))}`,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
})
const { ensureGoogleConnected, finishGoogleConnect } =
  await import('../composables/useGoogleConnect.ts')
hooks.deregister()

const store = new Map<string, string>()
function setup(search = '') {
  Object.assign(globalThis, {
    sessionStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    },
    window: { location: { search, assign: (url: string) => calls.push(`go:${url}`) } },
  })
}

beforeEach(() => {
  store.clear()
  calls.length = 0
  api.googleConnected = async () => false
  setup()
})

test('already connected: no redirect', async () => {
  api.googleConnected = async () => true
  assert.equal(await ensureGoogleConnected(), true)
  assert.deepEqual(calls, [])
})

test('not connected: remembers the chat origin and goes to Google', async () => {
  assert.equal(await ensureGoogleConnected(), false)
  assert.deepEqual(calls, ['go:https://accounts.google.com/consent'])
  assert.equal(store.size, 1)
})

test('returning from Google finishes the connection once', async () => {
  await ensureGoogleConnected()
  calls.length = 0
  setup('?code=abc&state=xyz')
  assert.equal(await finishGoogleConnect(), true)
  assert.deepEqual(calls, ['connect:abc:xyz'])
  assert.equal(await finishGoogleConnect(), false) // flag consumed
})

test('a code without a pending chat request is ignored', async () => {
  setup('?code=abc&state=xyz')
  assert.equal(await finishGoogleConnect(), false)
  assert.deepEqual(calls, [])
})
