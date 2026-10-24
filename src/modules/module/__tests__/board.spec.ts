import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  NO_FILTERS,
  activeFilters,
  dueLabel,
  filterTasks,
  linkOrigin,
  type BoardFilters,
} from '../utils/board.ts'
import type { Task } from '../types/kanban.ts'

const task = (over: Partial<Task>): Task => ({
  id: 'x',
  sector_id: 's',
  status_id: 'st',
  parent_id: null,
  title: 'Tarefa',
  description: '',
  priority: 'low',
  due_date: null,
  completed_at: null,
  assignee_id: null,
  assignee_name: null,
  position: 0,
  created_by_name: null,
  is_overdue: false,
  checklist_total: 0,
  checklist_done: 0,
  comment_count: 0,
  created_at: '',
  ...over,
})

const now = new Date(2026, 9, 24, 12) // 24/out/2026, horário local
const tasks = [
  task({
    id: 'a',
    title: 'Roteiro do vídeo',
    priority: 'high',
    assignee_id: 'me',
    due_date: '2026-10-24',
  }),
  task({
    id: 'b',
    title: 'Verba de mídia',
    is_overdue: true,
    assignee_name: 'Marina Souza',
    assignee_id: 'm',
    due_date: '2026-10-20',
  }),
  task({ id: 'c', title: 'Landing', priority: 'urgent', due_date: '2026-10-29' }),
  task({ id: 'd', title: 'Sem prazo', priority: 'medium' }),
]
const ids = (f: Partial<BoardFilters>, search = '') =>
  filterTasks(tasks, { ...NO_FILTERS, ...f }, search, 'me', now).map((t) => t.id)

test('filters by assignee, priority and due date', () => {
  assert.deepEqual(ids({}), ['a', 'b', 'c', 'd'])
  assert.deepEqual(ids({ assignee: 'me' }), ['a'])
  assert.deepEqual(ids({ assignee: 'none' }), ['c', 'd'])
  assert.deepEqual(ids({ assignee: 'm' }), ['b'])
  assert.deepEqual(ids({ priority: 'high+' }), ['a', 'c'])
  assert.deepEqual(ids({ priority: 'medium' }), ['d'])
  assert.deepEqual(ids({ due: 'overdue' }), ['b'])
  assert.deepEqual(ids({ due: 'today' }), ['a'])
  assert.deepEqual(ids({ due: 'week' }), ['a', 'c'])
  assert.deepEqual(ids({ due: 'none' }), ['d'])
})

test('filters combine and search ignores accents', () => {
  assert.deepEqual(ids({ priority: 'high+', due: 'week' }), ['a', 'c'])
  assert.deepEqual(ids({ priority: 'high+', assignee: 'none' }), ['c'])
  assert.deepEqual(ids({}, 'VIDEO'), ['a'])
  assert.deepEqual(ids({}, 'marina'), ['b'])
  assert.equal(activeFilters({ ...NO_FILTERS, due: 'week', priority: 'high+' }), 2)
})

test('due label counts days and hides for finished tasks', () => {
  assert.equal(dueLabel({ due_date: '2026-10-27', completed_at: null }, now), 'faltam 3 dias')
  assert.equal(dueLabel({ due_date: '2026-10-25', completed_at: null }, now), 'faltam 1 dia')
  assert.equal(dueLabel({ due_date: '2026-10-24', completed_at: null }, now), 'vence hoje')
  assert.equal(dueLabel({ due_date: '2026-10-22', completed_at: null }, now), 'atrasada há 2 dias')
  assert.equal(dueLabel({ due_date: '2026-10-22', completed_at: '2026-10-23T00:00:00Z' }, now), '')
})

test('link origin comes from the host', () => {
  assert.equal(linkOrigin('https://drive.google.com/x'), 'drive')
  assert.equal(linkOrigin('https://docs.google.com/document/d/1'), 'docs')
  assert.equal(linkOrigin('https://meet.google.com/abc'), 'meet')
  assert.equal(linkOrigin('https://exemplo.com'), 'link')
  assert.equal(linkOrigin('nao é url'), 'link')
})
