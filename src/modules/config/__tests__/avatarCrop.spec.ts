import assert from 'node:assert/strict'
import { test } from 'node:test'
import { avatarCrop, clampAvatarZoom } from '../utils/avatarCrop.ts'

test('centers a square crop inside portrait, landscape and square images', () => {
  assert.deepEqual(avatarCrop(1200, 800, 1), { x: 200, y: 0, size: 800 })
  assert.deepEqual(avatarCrop(800, 1200, 1), { x: 0, y: 200, size: 800 })
  assert.deepEqual(avatarCrop(800, 800, 1), { x: 0, y: 0, size: 800 })
})

test('zoom crops a smaller source region without stretching the image', () => {
  assert.deepEqual(avatarCrop(1200, 800, 2), { x: 400, y: 200, size: 400 })
  assert.deepEqual(avatarCrop(1200, 800, 0.5), avatarCrop(1200, 800, 1))
})

test('dragging cannot move the crop outside the source image', () => {
  assert.deepEqual(avatarCrop(1200, 800, 2, -1000, -1000), { x: 0, y: 0, size: 400 })
  assert.deepEqual(avatarCrop(1200, 800, 2, 5000, 5000), { x: 800, y: 400, size: 400 })
})

test('gesture, wheel and button zoom stay within the allowed range', () => {
  assert.equal(clampAvatarZoom(0.5), 1)
  assert.equal(clampAvatarZoom(2.5), 2.5)
  assert.equal(clampAvatarZoom(100), 5)
})
