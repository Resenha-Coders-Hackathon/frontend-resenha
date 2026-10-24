import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'
import type { Task, Status, MoveTaskRequest } from '../types/kanban.ts'

const task = (id: string, status_id = 'todo', position = 0): Task => ({
  id,
  sector_id: 'sector',
  status_id,
  parent_id: null,
  title: id,
  description: '',
  priority: 'low',
  due_date: null,
  completed_at: null,
  assignee_id: null,
  assignee_name: null,
  position,
  is_overdue: true,
  created_by_name: null,
  checklist_total: 0,
  checklist_done: 0,
  comment_count: 0,
  created_at: '',
})
const status = (id: string, category: Status['category'] = 'todo'): Status => ({
  id,
  name: id,
  color: '#000000',
  category,
  position: 0,
  wip_limit: null,
})
const page = <T>(results: T[]) => ({ count: results.length, next: null, previous: null, results })
let move: (id: string, payload: MoveTaskRequest) => Promise<Task>
let refreshed: Task[] = []
let updated = status('todo')
const api = {
  listStatuses: async () => page([status('todo'), status('done', 'done')]),
  listTasks: async () => page(refreshed),
  moveTask: (id: string, payload: MoveTaskRequest) => move(id, payload),
  updateStatus: async () => updated,
}
Object.assign(globalThis, { boardIntegrationApi: api })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/stores/index.ts') && specifier === '../services') {
      const names = [
        'createSector',
        'createStatus',
        'createTask',
        'deleteSector',
        'deleteStatus',
        'deleteTask',
        'getTask',
        'getSectorProgress',
        'listSectors',
        'listStatuses',
        'listTasks',
        'moveTask',
        'updateSector',
        'updateStatus',
        'updateTask',
      ]
      return {
        url: `data:text/javascript,${encodeURIComponent(
          names
            .map(
              (name) =>
                `export const ${name} = (...args) => globalThis.boardIntegrationApi.${name}(...args);`,
            )
            .join('\n'),
        )}`,
        shortCircuit: true,
      }
    }
    if (specifier === '@/shared/utils')
      return {
        url: new URL('../../../shared/utils/index.ts', import.meta.url).href,
        shortCircuit: true,
      }
    return nextResolve(specifier, context)
  },
})
const { useKanbanStore } = await import('../stores/index.ts')
hooks.deregister()
beforeEach(() => {
  setActivePinia(createPinia())
  refreshed = []
  move = async (id, payload) => ({ ...task(id, payload.status), position: payload.position ?? 0 })
})
function board() {
  const store = useKanbanStore()
  store.sectorId = 'sector'
  store.statuses = [status('todo'), status('done', 'done')]
  store.tasks = [task('a'), task('b', 'done')]
  return store
}

test('full columns reject incoming tasks without calling the backend', async () => {
  const store = board()
  store.statuses[1]!.wip_limit = 1
  move = async () => {
    throw new Error('backend must not be called')
  }
  await assert.rejects(store.move('a', 'done'), /limite/)
  assert.equal(store.tasks[0]?.status_id, 'todo')
})
test('optimistic completion and ordering roll back when a move fails', async () => {
  const store = board()
  const previous = structuredClone(store.$state.tasks.map((item) => ({ ...item })))
  move = async (_id, payload) => {
    assert.equal(payload.position, 1)
    assert.equal(store.tasks[0]?.status_id, 'done')
    assert.ok(store.tasks[0]?.completed_at)
    assert.equal(store.tasks[0]?.is_overdue, false)
    throw new Error('offline')
  }
  await assert.rejects(store.move('a', 'done'), /offline/)
  assert.deepEqual(store.tasks, previous)
})
test('failed requests never restore tasks from a previous sector', async () => {
  const store = board()
  move = async () => {
    store.sectorId = 'other-sector'
    store.tasks = [task('other')]
    throw new Error('offline')
  }
  await assert.rejects(store.move('a', 'done'), /offline/)
  assert.equal(store.tasks[0]?.id, 'other')
})
test('changing column category reloads backend completion dates', async () => {
  const store = board()
  updated = status('todo', 'done')
  refreshed = [{ ...task('a'), completed_at: '2026-10-23T12:00:00Z', is_overdue: false }]
  await store.editStatus('todo', { category: 'done' })
  assert.equal(store.tasks[0]?.completed_at, '2026-10-23T12:00:00Z')
  assert.equal(store.statuses[0]?.category, 'done')
})
