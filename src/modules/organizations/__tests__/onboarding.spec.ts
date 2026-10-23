import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseInvitationEmails, workspaceSlug } from '../utils/index.ts'

test('parses invite chips without sending duplicate e-mail addresses', () => {
  assert.deepEqual(
    parseInvitationEmails(
      ' a@example.invalid, b@example.invalid; A@example.invalid\nb@example.invalid ',
    ),
    ['A@example.invalid', 'b@example.invalid'],
  )
  assert.deepEqual(parseInvitationEmails(' , ; '), [])
})
test('suggests a valid workspace address from its name', () => {
  assert.equal(workspaceSlug(' São Paulo & Norte Studio! '), 'sao-paulo-norte-studio')
  assert.equal(workspaceSlug('A'.repeat(64)), 'a'.repeat(63))
  assert.equal(workspaceSlug('...'), '')
  assert(!workspaceSlug('a'.repeat(62) + ' - tail').endsWith('-'))
})
