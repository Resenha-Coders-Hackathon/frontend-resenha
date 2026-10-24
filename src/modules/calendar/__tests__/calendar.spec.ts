import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  groupByDate,
  gridRange,
  monthGrid,
  monthTitle,
  shiftMonth,
  todayIso,
} from '../utils/index.ts'

test('October 2026 starts on a Monday grid and fits five weeks', () => {
  const weeks = monthGrid(2026, 9)
  assert.equal(weeks.length, 5)
  assert.ok(weeks.every((week) => week.length === 7))
  assert.equal(weeks[0]![0]!.date, '2026-09-28') // 1 out 2026 é quinta
  assert.equal(weeks[0]![0]!.inMonth, false)
  assert.equal(weeks[0]![3]!.date, '2026-10-01')
  assert.equal(weeks.at(-1)!.at(-1)!.date, '2026-11-01')
})

test('a month that starts on Sunday needs the previous week and may need six rows', () => {
  const feb = monthGrid(2026, 1) // 1 fev 2026 é domingo
  assert.equal(feb[0]![0]!.date, '2026-01-26')
  assert.equal(feb.length, 5)
  const aug = monthGrid(2026, 7) // 1 ago 2026 é sábado, 31 dias: seis linhas
  assert.equal(aug.length, 6)
  assert.equal(aug[0]![5]!.date, '2026-08-01')
})

test('the requested range is the whole grid and stays within the 62 days the API allows', () => {
  for (let month = 0; month < 12; month++) {
    const { start, end } = gridRange(monthGrid(2026, month))
    const days = (Date.parse(end) - Date.parse(start)) / 86_400_000
    assert.ok(days >= 27 && days <= 41, `${month}: ${days}`)
  }
})

test('months roll over the year and titles are capitalised in Portuguese', () => {
  assert.deepEqual(shiftMonth(2026, 11, 1), { year: 2027, month: 0 })
  assert.deepEqual(shiftMonth(2026, 0, -1), { year: 2025, month: 11 })
  assert.equal(monthTitle(2026, 9), 'Outubro de 2026')
})

test('deliveries are grouped by day and today ignores the time zone', () => {
  const item = (id: string, due_date: string) =>
    ({
      id,
      title: id,
      due_date,
      state: 'todo',
      sector_id: 's',
      sector_name: 'S',
      in_google: false,
      assignee_name: null,
    }) as const
  const grouped = groupByDate([
    item('a', '2026-10-15'),
    item('b', '2026-10-15'),
    item('c', '2026-10-17'),
  ])
  assert.equal(grouped.get('2026-10-15')!.length, 2)
  assert.equal(grouped.get('2026-10-17')!.length, 1)
  assert.equal(todayIso(new Date(2026, 9, 24, 23, 59)), '2026-10-24')
})
