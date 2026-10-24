import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  actorAvatar,
  notificationActor,
  notificationKind,
  notificationTitle,
  relativeTime,
} from '../utils/index.ts'

test('the kind comes from what the notification carries', () => {
  assert.equal(
    notificationKind({ title: 'Ana mentioned you', data: { channel_id: 'c' } }),
    'mention',
  )
  assert.equal(notificationKind({ title: 'You were assigned to a task', data: {} }), 'assigned')
  assert.equal(notificationKind({ title: 'New comment on your task', data: {} }), 'comment')
  assert.equal(notificationKind({ title: 'Algo novo', data: {} }), 'other')
})

test('titles are translated and the actor is read from mentions', () => {
  assert.equal(notificationTitle('Ana mentioned you'), 'Ana mencionou você')
  assert.equal(notificationTitle('You were assigned to a task'), 'Você foi atribuído a uma tarefa')
  assert.equal(notificationActor('Ana Lima mentioned you'), 'Ana Lima')
  assert.equal(notificationActor('You were assigned to a task'), null)
})

test('relative time reads naturally', () => {
  const now = Date.parse('2026-10-24T12:00:00Z')
  assert.equal(relativeTime('2026-10-24T11:59:40Z', now), 'agora')
  assert.equal(relativeTime('2026-10-24T11:48:00Z', now), 'há 12 min')
  assert.equal(relativeTime('2026-10-24T09:00:00Z', now), 'há 3 h')
  assert.equal(relativeTime('2026-10-23T12:00:00Z', now), 'ontem')
  assert.equal(relativeTime('2026-10-20T12:00:00Z', now), 'há 4 dias')
})

test('avatar initials use the first and last name, with a stable colour', () => {
  assert.equal(actorAvatar('Beatriz Costa').initials, 'BC')
  assert.equal(actorAvatar('Marina').initials, 'M')
  assert.equal(actorAvatar('Beatriz Costa').color, actorAvatar('Beatriz Costa').color)
})
