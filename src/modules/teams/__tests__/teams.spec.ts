import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'

const team = (id: string) => ({ id, name: id, description: '', created_at: '' })
const member = (id: number, role = 'member') => ({
  id,
  user_id: `u${id}`,
  name: 'n',
  email: 'e',
  role,
  joined_at: '',
})
const page = <T>(results: T[]) => ({ count: results.length, next: null, previous: null, results })
const api = {
  listTeams: async (_o: string, _p?: number) => page([team('t1')]) as unknown,
  createTeam: async (_o: string, _p: unknown) => team('t2') as unknown,
  updateTeam: async (_o: string, id: string, _p: unknown) =>
    ({ ...team(id), name: 'novo' }) as unknown,
  deleteTeam: async (_o: string, _id: string) => {},
  listTeamMembers: async (_o: string, _t: string, _p?: number) => page([member(1)]) as unknown,
  addTeamMember: async (_o: string, _t: string, _p: unknown) => member(2) as unknown,
  updateTeamMemberRole: async (_o: string, _t: string, id: number, p: { role: string }) =>
    member(id, p.role) as unknown,
  removeTeamMember: async (_o: string, _t: string, _id: number) => {},
}
Object.assign(globalThis, { teamsTestApi: api })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/stores/teams.ts') && specifier === '../services') {
      const names = Object.keys(api)
      return {
        url: `data:text/javascript,${encodeURIComponent(names.map((n) => `export const ${n} = (...a) => globalThis.teamsTestApi.${n}(...a);`).join('\n'))}`,
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
const { useTeamsStore } = await import('../stores/teams.ts')
hooks.deregister()

beforeEach(() => setActivePinia(createPinia()))

test('team CRUD keeps the list in sync', async () => {
  const teams = useTeamsStore()
  await teams.load('org')
  assert.deepEqual(
    teams.teams.map((t) => t.id),
    ['t1'],
  )
  await teams.create('org', { name: 'x' })
  assert.deepEqual(
    teams.teams.map((t) => t.id),
    ['t1', 't2'],
  )
  await teams.update('org', 't1', { name: 'novo' })
  assert.equal(teams.teams[0]?.name, 'novo')
  await teams.remove('org', 't2')
  assert.deepEqual(
    teams.teams.map((t) => t.id),
    ['t1'],
  )
})

test('member add, role change and remove', async () => {
  const teams = useTeamsStore()
  await teams.loadMembers('org', 't1')
  await teams.addMember('org', 't1', { user_id: 'u2' })
  assert.deepEqual(
    teams.members['t1']?.map((m) => m.id),
    [1, 2],
  )
  await teams.changeRole('org', 't1', 2, 'lead')
  assert.equal(teams.members['t1']?.find((m) => m.id === 2)?.role, 'lead')
  await teams.removeMember('org', 't1', 1)
  assert.deepEqual(
    teams.members['t1']?.map((m) => m.id),
    [2],
  )
})

test('switching organization drops the previous teams', async () => {
  const teams = useTeamsStore()
  await teams.load('org')
  api.listTeams = async () => page([team('z')])
  await teams.load('other')
  assert.deepEqual(
    teams.teams.map((t) => t.id),
    ['z'],
  )
})
