import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'

const api = {
  listNotifications: async (_params?: unknown) => ({
    count: 0,
    next: null,
    results: [] as unknown[],
  }),
  markNotificationAsRead: async (_id: number) => {},
  markAllNotificationsAsRead: async () => {},
  registerDevice: async (_token: string) => {},
  unregisterDevice: async (_token: string) => {},
  sendNotification: async (_payload: unknown) => {},
}
const push = {
  requestDeviceFcmToken: async () => ({ token: 'current', messaging: {} }),
  listenForForegroundMessages: () => () => {},
}
Object.assign(globalThis, { notificationTestApi: api, notificationTestPush: push })

// Resolve only this store's boundaries; Vue and Pinia remain real.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/notifications/stores/notifications.ts')) {
      if (specifier === '../composables/desktopAlerts')
        return {
          url: new URL('../composables/desktopAlerts.ts', import.meta.url).href,
          shortCircuit: true,
        }
      const source =
        specifier === '../services'
          ? 'notificationTestApi'
          : specifier === '../composables'
            ? 'notificationTestPush'
            : undefined
      if (source) {
        const names = Object.keys(source === 'notificationTestApi' ? api : push)
        return {
          url: `data:text/javascript,${encodeURIComponent(names.map((name) => `export const ${name} = (...args) => globalThis.${source}.${name}(...args);`).join('\n'))}`,
          shortCircuit: true,
        }
      }
    }
    return nextResolve(specifier, context)
  },
})
const { useNotificationsStore } = await import('../stores/notifications.ts')
hooks.deregister()

beforeEach(() => {
  setActivePinia(createPinia())
  const values = new Map<string, string>()
  Object.assign(globalThis, {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  })
  api.listNotifications = async () => ({ count: 0, next: null, results: [] })
  api.unregisterDevice = async () => {}
})

const item = (id: number) => ({
  id,
  title: 'Assigned',
  message: 'Task',
  data: {},
  is_read: false,
  created_at: '2026-10-23T12:00:00Z',
})

test('unread pagination keeps its filter and removes read items', async () => {
  const store = useNotificationsStore()
  const calls: unknown[] = []
  api.listNotifications = async (params: unknown) => {
    calls.push(params)
    return calls.length === 1
      ? { count: 2, next: '/?page=2', results: [item(1)] }
      : { count: 1, next: null, results: [item(2)] }
  }
  await store.load(true)
  await store.loadMore()
  assert.deepEqual(calls, [{ unread: true }, { unread: true, page: 2 }])
  await store.markAsRead(1)
  assert.deepEqual(
    store.items.map((n) => n.id),
    [2],
  )
  assert.equal(store.unreadCount, 1)
  await store.markAllAsRead()
  assert.deepEqual(store.items, [])
  assert.equal(store.hasMore, false)
})

test('late responses cannot repopulate a previous account after reset', async () => {
  const store = useNotificationsStore()
  let resolve!: (value: { count: number; next: null; results: unknown[] }) => void
  api.listNotifications = () =>
    new Promise((done) => {
      resolve = done
    })
  const pending = store.load(true)
  store.reset()
  resolve({ count: 1, next: null, results: [item(1)] })
  await pending
  assert.deepEqual(store.items, [])
  assert.equal(store.unreadCount, 0)
  assert.equal(store.isLoading, false)
})

test('a failed list remains visible instead of being cleared by the count request', async () => {
  const store = useNotificationsStore()
  api.listNotifications = async () => {
    throw new Error('offline')
  }
  await store.load()
  assert.equal(store.error, 'offline')
  assert.equal(store.isLoading, false)
})

test('an event received during a list request triggers a fresh load', async () => {
  const store = useNotificationsStore()
  let finish!: (value: { count: number; next: null; results: unknown[] }) => void
  let calls = 0
  api.listNotifications = async () => {
    calls += 1
    if (calls === 1)
      return new Promise((done) => {
        finish = done
      })
    return { count: 2, next: null, results: [item(2), item(1)] }
  }
  const pending = store.load(true)
  await store.load(true)
  finish({ count: 1, next: null, results: [item(1)] })
  await pending
  assert.equal(calls, 2)
  assert.deepEqual(
    store.items.map((n) => n.id),
    [2, 1],
  )
  assert.equal(store.unreadCount, 2)
})

test('push activation registers and restores the device token', async () => {
  const store = useNotificationsStore()
  const calls: string[] = []
  api.registerDevice = async (token) => {
    calls.push(token)
  }
  await store.enablePush()
  assert.equal(store.pushEnabled, true)
  assert.equal(localStorage.getItem('resenha.pushToken'), 'current')
  assert.deepEqual(calls, ['current'])
})

test('failed unregister preserves token so logout can be retried after reload', async () => {
  const store = useNotificationsStore()
  localStorage.setItem('resenha.pushToken', 'saved')
  api.unregisterDevice = async () => {
    throw new Error('offline')
  }
  await assert.rejects(store.disablePush(), /offline/)
  assert.equal(localStorage.getItem('resenha.pushToken'), 'saved')
  const removed: string[] = []
  api.unregisterDevice = async (token) => {
    removed.push(token)
  }
  await store.disablePush()
  assert.deepEqual(removed, ['saved'])
  assert.equal(localStorage.getItem('resenha.pushToken'), null)
})
