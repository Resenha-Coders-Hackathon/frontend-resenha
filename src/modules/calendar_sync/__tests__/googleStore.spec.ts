import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'

const file = (id: string) => ({
  id,
  name: id,
  mime_type: 'text/plain',
  size_bytes: 1,
  web_view_link: `https://drive/${id}`,
  modified_at: null,
})
const api = {
  getGoogleStatus: async () => ({ connected: true, drive: true }),
  disconnectGoogle: async () => {},
  listDriveFiles: async (_q?: string) => [file('a'), file('b')],
  uploadToDrive: async (_p: unknown) => ({ file: file('c'), link: null }) as unknown,
  attachDriveFile: async (_t: string, _f: string) => ({ id: 'l1' }) as unknown,
  getTaskCalendarStatus: async (_t: string) => ({ synced: false, last_synced_at: null }),
  syncTaskToCalendar: async (_t: string) => ({
    synced: true,
    last_synced_at: '2026-01-01T00:00:00Z',
  }),
  removeTaskFromCalendar: async (_t: string) => {},
}
Object.assign(globalThis, { driveTestApi: api })

const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/stores/google.ts') && specifier === '../services') {
      const names = Object.keys(api)
      return {
        url: `data:text/javascript,${encodeURIComponent(names.map((n) => `export const ${n} = (...a) => globalThis.driveTestApi.${n}(...a);`).join('\n'))}`,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
})
const { useGoogleStore } = await import('../stores/google.ts')
hooks.deregister()

beforeEach(() => {
  setActivePinia(createPinia())
  api.getGoogleStatus = async () => ({ connected: true, drive: true })
  api.listDriveFiles = async () => [file('a'), file('b')]
  api.uploadToDrive = async () => ({ file: file('c'), link: null })
})

test('loadStatus and loadFiles fill the store', async () => {
  const google = useGoogleStore()
  await google.loadStatus()
  await google.loadFiles('x')
  assert.deepEqual(google.status, { connected: true, drive: true })
  assert.equal(google.files.length, 2)
  assert.equal(google.isLoading, false)
})

test('failures are exposed in error and keep previous data', async () => {
  const google = useGoogleStore()
  await google.loadFiles()
  api.listDriveFiles = async () => {
    throw new Error('Drive fora do ar')
  }
  await google.loadFiles()
  assert.equal(google.error, 'Drive fora do ar')
  assert.equal(google.files.length, 2)
  assert.equal(google.isLoading, false)
})

test('upload puts the new file first, without duplicating', async () => {
  const google = useGoogleStore()
  await google.loadFiles()
  const result = await google.upload({ file: new Blob(['x']) as File })
  assert.equal(result?.file.id, 'c')
  assert.deepEqual(
    google.files.map((f) => f.id),
    ['c', 'a', 'b'],
  )
  api.uploadToDrive = async () => ({ file: file('a'), link: null })
  await google.upload({ file: new Blob(['x']) as File })
  assert.deepEqual(
    google.files.map((f) => f.id),
    ['a', 'c', 'b'],
  )
})

test('disconnect clears status and files; a failed one keeps them', async () => {
  const google = useGoogleStore()
  await google.loadStatus()
  await google.loadFiles()
  api.disconnectGoogle = async () => {
    throw new Error('falhou')
  }
  await google.disconnect()
  assert.equal(google.status.connected, true)
  api.disconnectGoogle = async () => {}
  await google.disconnect()
  assert.deepEqual(google.status, { connected: false, drive: false })
  assert.equal(google.files.length, 0)
})

test('attach returns the task link', async () => {
  const google = useGoogleStore()
  assert.deepEqual(await google.attach('t', 'f'), { id: 'l1' })
})

test('task calendar: add, remove and failure keep calendar state coherent', async () => {
  const google = useGoogleStore()
  await google.loadTaskCalendar('t1')
  assert.equal(google.calendar['t1']?.synced, false)
  assert.equal(await google.addTaskToCalendar('t1'), true)
  assert.equal(google.calendar['t1']?.synced, true)
  api.removeTaskFromCalendar = async () => {
    throw new Error('Google fora')
  }
  assert.equal(await google.removeTaskFromCalendarEvent('t1'), false)
  assert.equal(google.calendar['t1']?.synced, true)
  assert.equal(google.error, 'Google fora')
  api.removeTaskFromCalendar = async () => {}
  assert.equal(await google.removeTaskFromCalendarEvent('t1'), true)
  assert.equal(google.calendar['t1']?.synced, false)
})
