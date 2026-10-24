import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'

type TestUser = { is_subscriber: boolean } | null
const auth = {
  user: null as TestUser,
  async loadUser(): Promise<TestUser> {
    return this.user
  },
}

Object.assign(globalThis, { assistantAccessTestAuth: auth })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/chat/router/index.ts')) {
      if (specifier === '@/modules/auth') {
        return {
          url: `data:text/javascript,${encodeURIComponent(
            'export const useAuthStore = () => globalThis.assistantAccessTestAuth;',
          )}`,
          shortCircuit: true,
        }
      }
      if (specifier === 'vue-sonner') {
        return {
          url: `data:text/javascript,${encodeURIComponent('export const toast = { error() {} };')}`,
          shortCircuit: true,
        }
      }
    }
    return nextResolve(specifier, context)
  },
})
const { chatRoutes } = await import('../router/index.ts')
hooks.deregister()

const assistantRoute = chatRoutes.find((route) => route.path === '/assistente')
assert.ok(assistantRoute)
assert.equal(typeof assistantRoute.beforeEnter, 'function')
const guard = assistantRoute.beforeEnter as () => Promise<unknown>

beforeEach(() => {
  auth.user = null
})

test('anonymous users are redirected before the assistant layout loads', async () => {
  assert.deepEqual(await guard(), {
    name: 'Login',
    query: { redirect: '/assistente' },
  })
})

test('authenticated free users are redirected to plans', async () => {
  auth.user = { is_subscriber: false }
  assert.deepEqual(await guard(), { name: 'Plans' })
})

test('only authenticated subscribers enter the assistant', async () => {
  auth.user = { is_subscriber: true }
  assert.equal(await guard(), true)
})
