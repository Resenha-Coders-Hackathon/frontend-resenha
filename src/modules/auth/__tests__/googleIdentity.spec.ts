import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { beforeEach, mock, test } from 'node:test'

let mountGoogleButton: typeof import('../services/googleIdentity.ts').mountGoogleButton

let callback: (response: { credential: string }) => void
let render: ReturnType<typeof mock.fn>
let resize: () => void
let disconnect: ReturnType<typeof mock.fn>
let clientId = 0
const scripts: { onload?: () => void; onerror?: () => void; remove: () => void }[] = []

beforeEach(async () => {
  const service = await import(`../services/googleIdentity.ts?test=${randomUUID()}`)
  mountGoogleButton = service.mountGoogleButton
  scripts.length = 0
  render = mock.fn()
  disconnect = mock.fn()
  Object.assign(globalThis, {
    window: globalThis,
    google: {
      accounts: {
        id: {
          initialize: (options: { callback: typeof callback }) => {
            callback = options.callback
          },
          renderButton: render,
        },
      },
    },
    document: {
      createElement: () => ({ remove: mock.fn() }),
      head: {
        append: (script: (typeof scripts)[number]) => {
          scripts.push(script)
        },
      },
    },
    ResizeObserver: class {
      constructor(handler: () => void) {
        resize = handler
      }
      observe() {}
      disconnect = disconnect
    },
  })
})

function container(width: number) {
  // DOM doubles keep these tests independent of a browser or extra dependencies.
  return { clientWidth: width, replaceChildren: mock.fn() } as unknown as HTMLElement
}

function mount(element: HTMLElement, handler = mock.fn(), signal?: AbortSignal) {
  return mountGoogleButton(element, `client-${++clientId}`, 'signin_with', handler, signal)
}

test('uses the unscaled layout width and respects the Google 400px maximum', async () => {
  let cleanup = await mount(container(360))
  assert.equal(render.mock.calls[0].arguments[1].width, '360')
  cleanup()
  cleanup = await mount(container(540))
  assert.equal(render.mock.calls[1].arguments[1].width, '400')
  cleanup()
})

test('waits for a visible container and does not rerender an unchanged width', async () => {
  const element = container(0)
  const cleanup = await mount(element)
  assert.equal(render.mock.callCount(), 0)
  Object.defineProperty(element, 'clientWidth', { value: 320 })
  resize()
  resize()
  assert.equal(render.mock.callCount(), 1)
  cleanup()
  assert.equal(disconnect.mock.callCount(), 1)
})

test('a component disposed during SDK loading never registers its button or callback', async () => {
  const google = window.google
  delete window.google
  const controller = new AbortController()
  const handler = mock.fn()
  const pending = mount(container(360), handler, controller.signal)
  controller.abort()
  window.google = google
  scripts[0].onload?.()
  const cleanup = await pending
  assert.equal(render.mock.callCount(), 0)
  assert.equal(handler.mock.callCount(), 0)
  cleanup()
})

test('disposing an old button preserves the current credential callback', async () => {
  const oldHandler = mock.fn()
  const newHandler = mock.fn()
  const cleanupOld = await mount(container(360), oldHandler)
  const controller = new AbortController()
  const cleanupNew = await mount(container(360), newHandler, controller.signal)
  cleanupOld()
  callback({ credential: 'token' })
  assert.equal(oldHandler.mock.callCount(), 0)
  assert.equal(newHandler.mock.callCount(), 1)
  controller.abort()
  callback({ credential: 'late-token' })
  assert.equal(newHandler.mock.callCount(), 1)
  cleanupNew()
})

test('SDK network failures allow a later load to retry', async () => {
  const google = window.google
  delete window.google
  const pending = mount(container(360))
  scripts[0].onerror?.()
  await assert.rejects(pending, /Não foi possível carregar/)
  assert.equal(scripts.length, 1)
  const retry = mount(container(360))
  assert.equal(scripts.length, 2)
  window.google = google
  scripts[1].onload?.()
  const cleanup = await retry
  cleanup()
})

test('a stalled SDK load times out instead of leaving the button loading forever', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  delete window.google
  const pending = mount(container(360))
  const rejection = assert.rejects(pending, /demorou para carregar/)
  t.mock.timers.tick(15_000)
  await rejection
})
