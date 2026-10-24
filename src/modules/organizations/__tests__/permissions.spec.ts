import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assignableRoles, canManageMember } from '../utils/permissions.ts'

test('only owners can manage administrators and nobody can demote owners', () => {
  assert.equal(canManageMember('owner', 'admin'), true)
  assert.equal(canManageMember('admin', 'admin'), false)
  assert.equal(canManageMember('owner', 'owner'), false)
  assert.equal(canManageMember('member', 'viewer'), false)
  assert.equal(canManageMember('viewer', 'member'), false)
})

test('role choices match the server grant hierarchy', () => {
  assert.deepEqual(assignableRoles('owner'), ['admin', 'member', 'viewer'])
  assert.deepEqual(assignableRoles('admin'), ['member', 'viewer'])
  assert.deepEqual(assignableRoles('member'), [])
  assert.deepEqual(assignableRoles('viewer'), [])
})
