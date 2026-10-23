import assert from 'node:assert/strict'
import { test } from 'node:test'
import { registerHooks } from 'node:module'

const posted: unknown[] = []
Object.assign(globalThis, {
  uploadTestApi: {
    api: {
      post: async (_url: string, body: unknown) => (
        posted.push(body),
        { data: { url: 'u', public_id: 'p' } }
      ),
    },
    getErrorMessage: (_e: unknown, fallback: string) => fallback,
  },
})
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL?.endsWith('/uploads/services/index.ts') &&
      specifier === '@/app/plugins/axios'
    ) {
      return {
        url: `data:text/javascript,${encodeURIComponent('export const api = globalThis.uploadTestApi.api; export const getErrorMessage = (...a) => globalThis.uploadTestApi.getErrorMessage(...a);')}`,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
})
const { uploadFile, MAX_UPLOAD_BYTES } = await import('../services/index.ts')
hooks.deregister()

test('sends the file as multipart and returns the url', async () => {
  const result = await uploadFile(new File(['x'], 'a.txt'))
  assert.deepEqual(result, { url: 'u', public_id: 'p' })
  assert.ok(posted[0] instanceof FormData)
  assert.ok((posted[0] as FormData).get('file') instanceof File)
})

test('rejects files over 10 MB without calling the API', async () => {
  posted.length = 0
  const big = { size: MAX_UPLOAD_BYTES + 1 } as File
  await assert.rejects(() => uploadFile(big), /10 MB/)
  assert.equal(posted.length, 0)
})
