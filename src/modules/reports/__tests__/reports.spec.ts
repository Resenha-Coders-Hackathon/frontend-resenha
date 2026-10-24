import assert from 'node:assert/strict'
import { test } from 'node:test'
import { kpis, peopleCsv } from '../utils/index.ts'

const report = {
  days: 30,
  completed: 128,
  completed_previous: 108,
  avg_days_to_complete: 3.4,
  avg_days_previous: 4.0,
  on_time_pct: 87,
  on_time_pct_previous: 82,
  open: 20,
  overdue: 3,
  weekly_done: [],
  overdue_by_sector: [],
  people: [],
} as const

test('indicators compare with the previous period and colour the direction', () => {
  const [done, time, onTime, open] = kpis(report as never)
  assert.deepEqual(
    [done!.data, done!.description, done!.tone],
    ['128', '+19% vs. período anterior', 'good'],
  )
  assert.deepEqual(
    [time!.data, time!.description, time!.tone],
    ['3,4 dias', '−0,6 dia vs. período anterior', 'good'],
  )
  assert.deepEqual([onTime!.data, onTime!.description, onTime!.tone], ['87%', '+5 p.p.', 'good'])
  assert.deepEqual([open!.data, open!.description, open!.tone], ['20', '3 atrasadas', 'bad'])
})

test('a worse period is marked as bad and missing data is not invented', () => {
  const worse = { ...report, completed: 90, avg_days_to_complete: 5, on_time_pct: 70 }
  const [done, time, onTime] = kpis(worse as never)
  assert.equal(done!.tone, 'bad')
  assert.equal(time!.tone, 'bad')
  assert.equal(onTime!.tone, 'bad')

  const empty = {
    ...report,
    completed: 0,
    completed_previous: 0,
    avg_days_to_complete: null,
    avg_days_previous: null,
    on_time_pct: null,
    on_time_pct_previous: null,
    overdue: 0,
  }
  const cards = kpis(empty as never)
  assert.deepEqual(
    cards.map((card) => card.data),
    ['0', '—', '—', '20'],
  )
  assert.equal(cards[3]!.description, 'nenhuma atrasada')
  assert.ok(cards.every((card) => card.tone === undefined))
})

test('csv uses semicolons, quotes risky names and keeps accents', () => {
  const csv = peopleCsv([
    { user_id: '1', name: 'Ana; "Ju" Souza', completed: 4, on_time_pct: 92, open: 1, overdue: 0 },
    { user_id: '2', name: 'João', completed: 0, on_time_pct: null, open: 2, overdue: 1 },
  ])
  assert.equal(
    csv,
    '﻿pessoa;concluidas;no_prazo;abertas;atrasadas\n"Ana; ""Ju"" Souza";4;92%;1;0\nJoão;0;;2;1',
  )
})
