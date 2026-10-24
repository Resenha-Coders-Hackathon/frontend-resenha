import assert from 'node:assert/strict'
import { test } from 'node:test'
import { activityText, dueBadge, kpis, relativeTime } from '../utils/userHome.ts'

const dashboard = {
  open_tasks: 6,
  due_this_week: 2,
  done_this_week: 9,
  done_last_week: 6,
  overdue: 1,
  overdue_title: 'Kit de identidade',
  today: [],
  weekly_done: [],
  open_by_sector: [],
  activity: [],
}

test('kpis describe the week and fall back when nothing is late', () => {
  const cards = kpis(dashboard, 3)
  assert.equal(cards[0]!.data, '6')
  assert.equal(cards[1]!.description, '+3 em relação à anterior')
  assert.equal(cards[2]!.description, 'Kit de identidade')
  assert.equal(cards[3]!.data, '3')
  assert.equal(kpis({ ...dashboard, overdue_title: null }, 0)[2]!.description, 'Nada atrasado')
})

test('dueBadge marks late, today and tomorrow', () => {
  assert.deepEqual(dueBadge('2026-10-20', true, '2026-10-23'), {
    label: 'Atrasada',
    tone: 'danger',
  })
  assert.deepEqual(dueBadge('2026-10-23', false, '2026-10-23'), { label: 'Hoje', tone: 'warning' })
  assert.deepEqual(dueBadge('2026-10-24', false, '2026-10-23'), {
    label: 'Amanhã',
    tone: 'neutral',
  })
})

test('relativeTime and activityText read naturally', () => {
  const now = Date.parse('2026-10-23T12:00:00Z')
  assert.equal(relativeTime('2026-10-23T11:48:00Z', now), 'há 12 min')
  assert.equal(relativeTime('2026-10-23T09:00:00Z', now), 'há 3 h')
  assert.equal(relativeTime('2026-10-22T12:00:00Z', now), 'ontem')
  const at = '2026-10-23T11:00:00Z'
  assert.equal(
    activityText({ kind: 'comment', person: 'Ana', task_title: 'FLX-1', at }),
    'Ana comentou em FLX-1',
  )
  assert.equal(
    activityText({ kind: 'done', person: null, task_title: 'FLX-1', at }),
    'Alguém concluiu FLX-1',
  )
})
