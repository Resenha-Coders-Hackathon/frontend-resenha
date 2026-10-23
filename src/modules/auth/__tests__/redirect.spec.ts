import assert from 'node:assert/strict'
import { test } from 'node:test'
import { safeRedirect } from '../utils/index.ts'

test('keeps invitation tokens and internal routes', () => {
  for (const path of [
    '/invitations/accept?token=abc_-123',
    '/organizacoes',
    '/tarefas/123#details',
  ]) {
    assert.equal(safeRedirect(path), path)
  }
})

test('rejects external, malformed and browser-normalized external destinations', () => {
  for (const input of [
    undefined,
    null,
    ['//evil.test'],
    '',
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    '/%5cevil.test',
    '/%2f%2fevil.test',
    '/\nevil.test',
    '/%',
    'javascript:alert(1)',
  ]) {
    assert.equal(safeRedirect(input), '/')
  }
})
