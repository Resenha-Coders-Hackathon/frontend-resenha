import assert from 'node:assert/strict'
import { test } from 'node:test'
import { avatar } from '../people.ts'
import { relativeTime } from '../time.ts'

test('avatar uses the first and last name and keeps the colour stable', () => {
  assert.equal(avatar('Beatriz Costa').initials, 'BC')
  assert.equal(avatar('Maria da Silva Souza').initials, 'MS')
  assert.equal(avatar('Marina').initials, 'M')
  assert.equal(avatar('').initials, '?')
  assert.equal(avatar('Beatriz Costa').color, avatar('Beatriz Costa').color)
})

test('relative time reads naturally', () => {
  const now = Date.parse('2026-10-24T12:00:00Z')
  assert.equal(relativeTime('2026-10-24T11:59:40Z', now), 'agora')
  assert.equal(relativeTime('2026-10-24T11:48:00Z', now), 'há 12 min')
  assert.equal(relativeTime('2026-10-24T09:00:00Z', now), 'há 3 h')
  assert.equal(relativeTime('2026-10-23T12:00:00Z', now), 'ontem')
  assert.equal(relativeTime('2026-10-20T12:00:00Z', now), 'há 4 dias')
})
