import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'

const org = (id: string, is_personal = false) => ({ id, name: id, is_personal })
const api = {
  listOrganizations: async (_p?: number) =>
    ({
      count: 3,
      next: null,
      previous: null,
      results: [org('me', true), org('a'), org('b')],
    }) as unknown,
  deleteOrganization: async (_id: string) => {},
}
const names = [
  'addMember',
  'createOrganization',
  'deleteOrganization',
  'listMembers',
  'listOrganizations',
  'removeMember',
  'updateMemberRole',
  'updateOrganization',
]
Object.assign(globalThis, { orgTestApi: api })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL?.endsWith('/organizations/stores/index.ts') &&
      specifier === '../services'
    ) {
      return {
        url: `data:text/javascript,${encodeURIComponent(names.map((n) => `export const ${n} = (...a) => globalThis.orgTestApi.${n}?.(...a);`).join('\n'))}`,
        shortCircuit: true,
      }
    }
    if (specifier === '@/shared/utils') {
      return {
        url: new URL('../../../shared/utils/index.ts', import.meta.url).href,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
})
const values = new Map<string, string>()
Object.assign(globalThis, {
  localStorage: {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => values.set(k, v),
    removeItem: (k: string) => values.delete(k),
  },
})
const { useOrganizationsStore } = await import('../stores/index.ts')
hooks.deregister()

beforeEach(() => {
  values.clear()
  setActivePinia(createPinia())
})

test('without a choice, the current organization skips the personal space', async () => {
  const store = useOrganizationsStore()
  await store.load()
  assert.equal(store.current?.id, 'a')
})

test('select switches the current organization and remembers it', async () => {
  const store = useOrganizationsStore()
  await store.load()
  store.select('b')
  assert.equal(store.current?.id, 'b')
  assert.equal(values.get('resenha.currentOrganization'), 'b')
  setActivePinia(createPinia()) // new session: restored from storage
  const again = useOrganizationsStore()
  await again.load()
  assert.equal(again.current?.id, 'b')
})

test('a remembered organization that no longer exists falls back', async () => {
  values.set('resenha.currentOrganization', 'gone')
  const store = useOrganizationsStore()
  await store.load()
  assert.equal(store.current?.id, 'a')
})

test('removing the selected organization clears the choice', async () => {
  const store = useOrganizationsStore()
  await store.load()
  store.select('b')
  await store.remove('b')
  assert.equal(store.current?.id, 'a')
})

test('only the personal space: it is still selected', async () => {
  api.listOrganizations = async () => ({
    count: 1,
    next: null,
    previous: null,
    results: [org('me', true)],
  })
  const store = useOrganizationsStore()
  await store.load()
  assert.equal(store.current?.id, 'me')
})
