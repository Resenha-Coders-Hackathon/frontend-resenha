import assert from 'node:assert/strict'
import { test } from 'node:test'
import { inviteProblem } from '../utils/errors.ts'

const http = (status: number, data: unknown) => ({ response: { status, data } })

test('known invitation codes become specific messages', () => {
  const used = inviteProblem(http(400, { code: 'invite_used', organization_id: 'org-1' }))
  assert.equal(used.code, 'invite_used')
  assert.equal(used.organizationId, 'org-1')
  assert.match(used.message, /já foi aceito/)
  const wrong = inviteProblem(
    http(400, { code: 'invite_wrong_account', invited_email: 'g***@a.com' }),
  )
  assert.equal(wrong.invitedEmail, 'g***@a.com')
  assert.match(inviteProblem(http(400, { code: 'invite_expired' })).message, /expirou/)
})

test('403 and offline are told apart from a bad invitation', () => {
  assert.equal(inviteProblem(http(403, { detail: 'CSRF Failed' })).code, 'forbidden')
  assert.equal(inviteProblem(new Error('Network Error')).code, 'network')
  assert.equal(inviteProblem(http(500, {})).code, 'unknown')
})
