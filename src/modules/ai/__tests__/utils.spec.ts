import assert from 'node:assert/strict'
import { test } from 'node:test'
import { aiActionNotes, aiVisibleActions, aiActionDeleted, aiActionLabel, aiActionTasks, aiActionTone } from '../utils/index.ts'
import type { AiAction } from '../types/index.ts'

const task = { id: 't1', title: 'Revisar', priority: 'high' }
const receipt = (over: Partial<AiAction>): AiAction => ({
  action: 'task_create',
  writes: true,
  status: 'succeeded',
  ...over,
})

test('labels receipts from the real action name', () => {
  assert.equal(aiActionLabel(receipt({})), 'Tarefa criada')
  assert.equal(aiActionLabel(receipt({ action: 'task_move' })), 'Tarefa movida')
  assert.equal(aiActionLabel(receipt({ action: 'task_list' })), 'Tarefas listadas')
})

test('extracts tasks only from successful task receipts', () => {
  assert.equal(aiActionTasks(receipt({ result: task })).length, 1)
  assert.equal(aiActionTasks(receipt({ action: 'task_list', result: { results: [task, {}] } })).length, 1)
  assert.equal(aiActionTasks(receipt({ status: 'failed', result: task })).length, 0)
  assert.equal(aiActionTasks(receipt({ action: 'sector_get', result: task })).length, 0)
})

test('tone and deletion reflect the receipt status, not the model text', () => {
  assert.equal(aiActionTone(receipt({ status: 'confirmation_required' })), 'pending')
  assert.equal(aiActionTone(receipt({ status: 'uncertain' })), 'error')
  assert.equal(aiActionDeleted(receipt({ action: 'task_delete' })), true)
  assert.equal(aiActionDeleted(receipt({ action: 'task_delete', status: 'confirmation_required' })), false)
})

test('hides failed reads but keeps failed writes visible', () => {
  const read = receipt({ action: 'status_list', writes: false, status: 'failed' })
  const write = receipt({ status: 'failed' })
  assert.deepEqual(aiVisibleActions([read, write]), [write])
  assert.deepEqual(aiVisibleActions(undefined), [])
})

test('reads server notes only from successful receipts', () => {
  const ok = receipt({ result: { ...task, notes: ['Horário registrado na descrição.', 3] } })
  assert.deepEqual(aiActionNotes(ok), ['Horário registrado na descrição.'])
  assert.deepEqual(aiActionNotes(receipt({ status: 'failed', result: { notes: ['x'] } })), [])
  assert.deepEqual(aiActionNotes(receipt({ result: task })), [])
})

test('recognizes a task draft receipt only when it succeeded', async () => {
  const { aiActionDraft } = await import('../utils/index.ts')
  const draft = { kind: 'task_draft', title: 'Fix' }
  assert.equal(aiActionDraft(receipt({ action: 'task_draft', writes: false, result: draft }))?.title, 'Fix')
  assert.equal(aiActionDraft(receipt({ action: 'task_draft', status: 'failed', result: draft })), null)
  assert.equal(aiActionDraft(receipt({ result: draft })), null)
})

test('matches people by name words, ignoring accents and "usuário"', async () => {
  const { matchPeople } = await import('../utils/index.ts')
  const people = [
    { id: '1', name: 'Matheus Michalski' },
    { id: '2', name: 'Nicole Souza' },
    { id: '3', name: 'Matheus Silva' },
  ]
  assert.deepEqual(matchPeople('usuário NICOLÉ', people).map((p) => p.id), ['2'])
  assert.deepEqual(matchPeople('matheus', people).map((p) => p.id), ['1', '3'])
  assert.deepEqual(matchPeople('matheus silva', people).map((p) => p.id), ['3'])
  assert.deepEqual(matchPeople('zeca', people), [])
})
