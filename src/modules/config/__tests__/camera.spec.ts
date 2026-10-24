import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cameraErrorMessage, captureSize, stopCamera } from '../utils/camera.ts'

test('camera captures keep the aspect ratio and cap large frames without upscaling', () => {
  assert.deepEqual(captureSize(4000, 3000), { width: 1600, height: 1200 })
  assert.deepEqual(captureSize(3000, 4000), { width: 1200, height: 1600 })
  assert.deepEqual(captureSize(640, 480), { width: 640, height: 480 })
})

test('camera errors provide permission, missing-device and busy-device guidance', () => {
  assert.match(cameraErrorMessage({ name: 'NotAllowedError' }), /autorizada/)
  assert.match(cameraErrorMessage({ name: 'NotFoundError' }), /Nenhuma câmera/)
  assert.match(cameraErrorMessage({ name: 'NotReadableError' }), /em uso/)
  assert.match(cameraErrorMessage(null), /escolha uma foto/)
})

test('camera cleanup stops every media track and tolerates an absent stream', () => {
  let stopped = 0
  // The cleanup only needs the track stop method; no browser media implementation is used.
  const stream = {
    getTracks: () => [
      {
        stop: () => {
          stopped++
        },
      },
      {
        stop: () => {
          stopped++
        },
      },
    ],
  }
  stopCamera(stream)
  stopCamera(null)
  assert.equal(stopped, 2)
})
