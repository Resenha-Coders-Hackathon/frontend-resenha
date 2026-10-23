import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'

const found = (title: string) => ({ tasks: [{ title }], people: [], files: [] })
const api = {
  SEARCH_MIN_LENGTH: 2,
  searchOrganization: async (_org: string, _q: string) => found('x') as unknown,
}
Object.assign(globalThis, { searchTestApi: api })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/stores/search.ts') && specifier === '../services') {
      return {
        url: `data:text/javascript,${encodeURIComponent('export const SEARCH_MIN_LENGTH = 2; export const searchOrganization = (...a) => globalThis.searchTestApi.searchOrganization(...a);')}`,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
})
const { useSearchStore } = await import('../stores/search.ts')
hooks.deregister()

beforeEach(() => {
  setActivePinia(createPinia())
  api.searchOrganization = async () => found('x')
})

test('short queries do not hit the API and clear previous results', async () => {
  let calls = 0
  api.searchOrganization = async () => (calls++, found('x'))
  const search = useSearchStore()
  await search.search('org', 'ab')
  assert.equal(calls, 1)
  await search.search('org', ' a ')
  assert.equal(calls, 1)
  assert.deepEqual(search.results, { tasks: [], people: [], files: [] })
})

test('a slow old response never overwrites a newer one', async () => {
  const release: Array<() => void> = []
  api.searchOrganization = (_org, q) =>
    new Promise((resolve) => release.push(() => resolve(found(q)))) as Promise<unknown>
  const search = useSearchStore()
  const first = search.search('org', 'first')
  const second = search.search('org', 'second')
  release[1]!()
  await second
  release[0]!()
  await first
  assert.equal((search.results.tasks[0] as { title: string }).title, 'second')
  assert.equal(search.isLoading, false)
})

test('errors are exposed and keep loading false', async () => {
  api.searchOrganization = async () => {
    throw new Error('Não foi possível buscar.')
  }
  const search = useSearchStore()
  await search.search('org', 'abc')
  assert.equal(search.error, 'Não foi possível buscar.')
  assert.equal(search.isLoading, false)
})
