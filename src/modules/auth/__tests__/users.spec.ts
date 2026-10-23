import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'

const user = (id: string) => ({ id, name: id, email: `${id}@x`, created_at: '' })
const api = {
  listUsers: async (_p: { search?: string; page?: number }) =>
    ({ count: 1, next: null, previous: null, results: [user('a')] }) as unknown,
}
Object.assign(globalThis, { usersTestApi: api })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/stores/users.ts') && specifier === '../services') {
      return {
        url: `data:text/javascript,${encodeURIComponent('export const listUsers = (...a) => globalThis.usersTestApi.listUsers(...a);')}`,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
})
const { useUsersStore } = await import('../stores/users.ts')
hooks.deregister()

beforeEach(() => setActivePinia(createPinia()))

test('search fills the list and trims the query', async () => {
  let sent: unknown
  api.listUsers = async (p) => (
    (sent = p),
    { count: 1, next: null, previous: null, results: [user('a')] }
  )
  const users = useUsersStore()
  await users.search('  ana ')
  assert.deepEqual(sent, { search: 'ana', page: 1 })
  assert.deepEqual(
    users.users.map((u) => u.id),
    ['a'],
  )
})

test('loadMore appends the next page and stops at the end', async () => {
  api.listUsers = async (p) =>
    p.page === 1
      ? { count: 2, next: 'n', previous: null, results: [user('a')] }
      : { count: 2, next: null, previous: 'p', results: [user('b')] }
  const users = useUsersStore()
  await users.search()
  assert.equal(users.hasMore, true)
  await users.loadMore()
  assert.deepEqual(
    users.users.map((u) => u.id),
    ['a', 'b'],
  )
  assert.equal(users.hasMore, false)
})

test('an older slow search never overwrites a newer one', async () => {
  const release: Array<() => void> = []
  api.listUsers = (p) =>
    new Promise((resolve) =>
      release.push(() =>
        resolve({ count: 1, next: null, previous: null, results: [user(p.search ?? '')] }),
      ),
    ) as Promise<unknown>
  const users = useUsersStore()
  const first = users.search('old')
  const second = users.search('new')
  release[1]!()
  await second
  release[0]!()
  await first
  assert.deepEqual(
    users.users.map((u) => u.id),
    ['new'],
  )
})

test('failures set the error and stop loading', async () => {
  api.listUsers = async () => {
    throw new Error('falhou')
  }
  const users = useUsersStore()
  await users.search('x')
  assert.equal(users.error, 'falhou')
  assert.equal(users.isLoading, false)
})
