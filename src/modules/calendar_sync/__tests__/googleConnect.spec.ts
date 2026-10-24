import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'

const calls: string[] = []
const api = {
  getGoogleStatus: async () => ({ connected: false, drive: false }),
  getGoogleAuthorizeUrl: async (drive?: boolean) =>
    `https://accounts.google.com/consent?drive=${!!drive}`,
  connectGoogle: async (code: string, state: string) => {
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
  api.getGoogleStatus = async () => ({ connected: false, drive: false })
  setup()
})

test('already connected: no redirect', async () => {
  api.getGoogleStatus = async () => ({ connected: true, drive: false })
  assert.equal(await ensureGoogleConnected(), true)
  assert.deepEqual(calls, [])
})

test('connected without Drive, Drive required: asks for consent again', async () => {
  api.getGoogleStatus = async () => ({ connected: true, drive: false })
  assert.equal(await ensureGoogleConnected({ drive: true }), false)
  assert.deepEqual(calls, ['go:https://accounts.google.com/consent?drive=true'])
})

test('connected with Drive, Drive required: no redirect', async () => {
  api.getGoogleStatus = async () => ({ connected: true, drive: true })
  assert.equal(await ensureGoogleConnected({ drive: true }), true)
})

test('not connected: goes to Google remembering where to return', async () => {
  assert.equal(await ensureGoogleConnected({ returnTo: '/chat' }), false)
  assert.deepEqual(calls, ['go:https://accounts.google.com/consent?drive=false'])
  assert.deepEqual(JSON.parse([...store.values()][0]!), { returnTo: '/chat' })
})

test('returning from Google finishes the connection once and gives the route back', async () => {
  await ensureGoogleConnected({ returnTo: '/chat' })
  calls.length = 0
  setup('?code=abc&state=xyz')
  assert.equal(await finishGoogleConnect(), '/chat')
  assert.deepEqual(calls, ['connect:abc:xyz'])
  assert.equal(await finishGoogleConnect(), null) // flag consumed
})

test('a code without a pending request is ignored', async () => {
  setup('?code=abc&state=xyz')
  assert.equal(await finishGoogleConnect(), null)
  assert.deepEqual(calls, [])
})
