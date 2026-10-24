import assert from 'node:assert/strict'
import { test } from 'node:test'
import { notificationActor, notificationKind, notificationTitle } from '../utils/index.ts'

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
