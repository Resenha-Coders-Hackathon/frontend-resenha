import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dueBadge, kpis } from '../utils/userHome.ts'

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
