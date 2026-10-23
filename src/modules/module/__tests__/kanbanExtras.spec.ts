import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'

const page = <T>(results: T[]) => ({ count: results.length, next: null, previous: null, results })
const member = (id: number, role = 'viewer') => ({
  id,
  user_id: `u${id}`,
  name: 'n',
  email: 'e',
  role,
})
const link = (id: string) => ({
  id,
  title: id,
  url: `https://x/${id}`,
  created_by_id: 'u',
  created_at: '',
})
const api = {
  listSectorMembers: async (_s: string, _p?: number) => page([member(1)]) as unknown,
  listSectorTeams: async (_s: string, _p?: number) =>
    page([{ id: 7, team_id: 't', team_name: 'T', role: 'editor' }]) as unknown,
  addSectorMember: async (_s: string, _p: unknown) => member(2) as unknown,
  removeSectorMember: async (_s: string, _id: number) => {},
  updateSectorMemberRole: async (_s: string, id: number, role: string) =>
    member(id, role) as unknown,
  addSectorTeam: async (_s: string, _p: unknown) =>
    ({ id: 8, team_id: 't2', team_name: 'T2', role: 'viewer' }) as unknown,
  removeSectorTeam: async (_s: string, _id: number) => {},
  listLinks: async (_t: string, _id: string, _p?: number) => page([link('a')]) as unknown,
  createLink: async (_t: string, _id: string, _p: unknown) => link('b') as unknown,
  deleteLink: async (_id: string) => {},
}
Object.assign(globalThis, { kanbanTestApi: api })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const parent = context.parentURL ?? ''
    if (
      (parent.endsWith('/stores/access.ts') || parent.endsWith('/stores/links.ts')) &&
      specifier === '../services'
    ) {
      const names = Object.keys(api)
      return {
        url: `data:text/javascript,${encodeURIComponent(names.map((n) => `export const ${n} = (...a) => globalThis.kanbanTestApi.${n}(...a);`).join('\n'))}`,
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
const { useSectorAccessStore } = await import('../stores/access.ts')
const { useLinksStore } = await import('../stores/links.ts')
hooks.deregister()

beforeEach(() => setActivePinia(createPinia()))

test('sector access: members and teams load, change role, link and unlink', async () => {
  const access = useSectorAccessStore()
  await access.load('s1')
  assert.equal(access.members.length, 1)
  assert.equal(access.teams.length, 1)
  await access.addMember({ user_id: 'u2' })
  await access.changeMemberRole(2, 'editor')
  assert.equal(access.members.find((m) => m.id === 2)?.role, 'editor')
  await access.removeMember(1)
  assert.deepEqual(
    access.members.map((m) => m.id),
    [2],
  )
  await access.linkTeam({ team_id: 't2' })
  assert.deepEqual(
    access.teams.map((t) => t.id),
    [7, 8],
  )
  await access.unlinkTeam(7)
  assert.deepEqual(
    access.teams.map((t) => t.id),
    [8],
  )
})

test('sector access refuses actions before a sector is loaded', async () => {
  await assert.rejects(() => useSectorAccessStore().addMember({ user_id: 'u' }), /Nenhum setor/)
})

test('switching sector clears the previous access lists', async () => {
  const access = useSectorAccessStore()
  await access.load('s1')
  api.listSectorMembers = async () => page([])
  api.listSectorTeams = async () => page([])
  await access.load('s2')
  assert.equal(access.members.length + access.teams.length, 0)
})

test('links are kept per target; add, put and remove', async () => {
  const links = useLinksStore()
  await links.load('task', 't1')
  assert.deepEqual(
    links.forTarget('task', 't1').map((l) => l.id),
    ['a'],
  )
  assert.deepEqual(links.forTarget('sector', 't1'), []) // same id, other target
  await links.add('task', 't1', { url: 'https://x/b' })
  links.put('task', 't1', link('drive')) // e.g. a Drive attachment
  links.put('task', 't1', link('drive')) // idempotent
  assert.deepEqual(
    links.forTarget('task', 't1').map((l) => l.id),
    ['a', 'b', 'drive'],
  )
  await links.remove('task', 't1', 'a')
  assert.deepEqual(
    links.forTarget('task', 't1').map((l) => l.id),
    ['b', 'drive'],
  )
})
