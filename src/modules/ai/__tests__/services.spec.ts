import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import type { AiAnswer } from '../types/index.ts'

const calls: { url: string; body: unknown; config: unknown }[] = []
const result: AiAnswer = {
  answer: 'Criada.',
  conversation_id: 'conversation',
  actions: [],
  confirmation_token: null,
}
const api = {
  post: async (_url: string, _body: unknown, _config?: unknown): Promise<{ data: unknown }> => ({
    data: result,
  }),
}
Object.assign(globalThis, { aiServiceTestApi: api })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/ai/services/index.ts')) {
      if (specifier === '@/app/plugins/axios') {
        const source = `export const api = {post: (...args) => globalThis.aiServiceTestApi.post(...args)};
          export const getErrorMessage = (error, fallback) => error.isAxiosError ? (error.response?.data?.detail ?? fallback) : (error instanceof Error ? error.message : fallback);`
        return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
      }
      if (specifier === '../utils')
        return { url: new URL('../utils/index.ts', context.parentURL).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})
const { askAi, analyzeAiFiles, AiRequestError } = await import('../services/index.ts')
hooks.deregister()

beforeEach(() => {
  calls.length = 0
  api.post = async (url, body, config) => {
    calls.push({ url, body, config })
    return { data: result }
  }
})

function backendError(status: number, data: unknown): Error {
  return Object.assign(new Error('Request failed'), {
    isAxiosError: true,
    response: { status, data },
  })
}

test('ask posts the actual backend contract and returns all tool results', async () => {
  const payload = {
    prompt: '  Crie uma tarefa  ',
    request_id: crypto.randomUUID(),
    conversation_id: crypto.randomUUID(),
    confirmation_token: crypto.randomUUID(),
  }
  assert.deepEqual(await askAi(payload), result)
  assert.equal(calls[0]?.url, '/ai/ask/')
  assert.deepEqual(calls[0]?.body, { ...payload, prompt: 'Crie uma tarefa' })
})

test('invalid prompts are rejected before network access', async () => {
  await assert.rejects(askAi({ prompt: ' ', request_id: crypto.randomUUID() }), AiRequestError)
  await assert.rejects(
    askAi({ prompt: 'x'.repeat(10001), request_id: crypto.randomUUID() }),
    /10000/,
  )
  assert.equal(calls.length, 0)
})

test('status and backend details survive request failures for safe retry decisions', async () => {
  api.post = async () => {
    throw backendError(429, { detail: 'Quota exceeded' })
  }
  await assert.rejects(
    askAi({ prompt: 'Hello', request_id: crypto.randomUUID() }),
    (error: unknown) =>
      error instanceof AiRequestError && error.status === 429 && error.message === 'Quota exceeded',
  )
})

test('uploads use repeated files fields and blob responses without setting multipart headers', async () => {
  const pdf = new Blob(['%PDF-test'], { type: 'application/pdf' })
  api.post = async (url, body, config) => {
    calls.push({ url, body, config })
    return { data: pdf }
  }
  const files = [new File(['a'], 'a.png'), new File(['b'], 'b.pdf')]
  assert.equal(await analyzeAiFiles(files), pdf)
  assert.equal(calls[0]?.url, '/ai/analyze/')
  const body = calls[0]?.body
  assert.ok(body instanceof FormData)
  assert.deepEqual(
    body.getAll('files').map((value) => (typeof value === 'string' ? value : value.name)),
    ['a.png', 'b.pdf'],
  )
  assert.deepEqual(calls[0]?.config, { responseType: 'blob', timeout: 200_000 })
})

test('JSON validation errors returned as blobs are decoded, including nested file errors', async () => {
  api.post = async () => {
    throw backendError(
      400,
      new Blob(
        [
          JSON.stringify({
            files: { index: '1', file: 'fake.pdf', detail: ['Invalid PDF content.'] },
          }),
        ],
        { type: 'application/json' },
      ),
    )
  }
  await assert.rejects(analyzeAiFiles([new File(['bad'], 'fake.pdf')]), /Invalid PDF content/)
})

test('non-PDF success bodies and HTML failures never become download links', async () => {
  api.post = async () => ({ data: new Blob(['{}'], { type: 'application/json' }) })
  await assert.rejects(analyzeAiFiles([new File(['a'], 'a.png')]), /não retornou/)
  api.post = async () => {
    throw backendError(502, new Blob(['<html>proxy error</html>'], { type: 'text/html' }))
  }
  await assert.rejects(analyzeAiFiles([new File(['a'], 'a.png')]), /Não foi possível analisar/)
})
