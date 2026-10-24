import assert from 'node:assert/strict'
import { test } from 'node:test'
import { filterTasks } from '../utils/board.ts'
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
  is_overdue: false,
  checklist_total: 0,
  checklist_done: 0,
  comment_count: 0,
  created_at: '',
  ...over,
})

const tasks = [
  task({ id: 'a', title: 'Roteiro do vídeo', priority: 'high', assignee_id: 'me' }),
  task({ id: 'b', title: 'Verba de mídia', is_overdue: true, assignee_name: 'Marina Souza' }),
  task({ id: 'c', title: 'Landing', priority: 'urgent' }),
]
const ids = (list: Task[]) => list.map((t) => t.id)

test('chips filter by owner, lateness and priority', () => {
  assert.deepEqual(ids(filterTasks(tasks, 'all', '', 'me')), ['a', 'b', 'c'])
  assert.deepEqual(ids(filterTasks(tasks, 'mine', '', 'me')), ['a'])
  assert.deepEqual(ids(filterTasks(tasks, 'overdue', '', 'me')), ['b'])
  assert.deepEqual(ids(filterTasks(tasks, 'high', '', 'me')), ['a', 'c'])
})

test('search ignores accents and case, and matches the assignee', () => {
  assert.deepEqual(ids(filterTasks(tasks, 'all', 'VIDEO', null)), ['a'])
  assert.deepEqual(ids(filterTasks(tasks, 'all', 'marina', null)), ['b'])
})
