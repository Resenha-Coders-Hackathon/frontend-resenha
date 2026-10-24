import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'
import type { AiAnswer, AiAskRequest } from '../types/index.ts'

class RequestError extends Error {
  status: number | undefined
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

function answer(overrides: Partial<AiAnswer> = {}): AiAnswer {
  return {
    answer: 'Resposta real.',
    conversation_id: 'server-conversation',
    actions: [],
    confirmation_token: null,
    ...overrides,
  }
}

const calls: AiAskRequest[] = []
const api = {
  AiRequestError: RequestError,
  askAi: async (_payload: AiAskRequest): Promise<AiAnswer> => answer(),
  analyzeAiFiles: async (_files: File[]): Promise<Blob> =>
    new Blob(['%PDF-test'], { type: 'application/pdf' }),
}
Object.assign(globalThis, { aiStoreTestApi: api })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/ai/stores/ai.ts') && specifier === '../services') {
      const source = `export const AiRequestError = globalThis.aiStoreTestApi.AiRequestError;
        export const askAi = (...args) => globalThis.aiStoreTestApi.askAi(...args);
        export const analyzeAiFiles = (...args) => globalThis.aiStoreTestApi.analyzeAiFiles(...args);`
      return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})
const { useAiStore } = await import('../stores/ai.ts')
hooks.deregister()

beforeEach(() => {
  setActivePinia(createPinia())
  calls.length = 0
  api.askAi = async (payload) => {
    calls.push(structuredClone(payload))
    return answer()
  }
  api.analyzeAiFiles = async () => new Blob(['%PDF-test'], { type: 'application/pdf' })
  useAiStore().setOwner('user-one')
})

test('send saves real replies and forwards backend conversation IDs on followup', async () => {
  const ai = useAiStore()
  assert.equal(await ai.ask('  Crie uma tarefa  '), true)
  assert.equal(calls[0]?.prompt, 'Crie uma tarefa')
  assert.equal(calls[0]?.conversation_id, undefined)
  assert.ok(calls[0]?.request_id)
  assert.equal(await ai.ask('Agora edite ela'), true)
  assert.equal(calls[1]?.conversation_id, 'server-conversation')
  assert.notEqual(calls[0]?.request_id, calls[1]?.request_id)
  assert.equal(ai.messages.length, 4)
  assert.equal(ai.messages[1]?.content, 'Resposta real.')
})

test('history uses independent conversations without listing nonexistent API routes', async () => {
  const ai = useAiStore()
  await ai.ask('Primeira')
  const first = ai.activeId!
  ai.newConversation()
  await ai.ask('Segunda')
  assert.equal(calls[1]?.conversation_id, undefined)
  assert.equal(ai.conversations.length, 2)
  ai.select(first)
  assert.equal(ai.messages[0]?.content, 'Primeira')
  assert.equal(ai.active?.server_id, 'server-conversation')
})

test('simultaneous submissions do not repeat requests', async () => {
  let finish!: (value: AiAnswer) => void
  api.askAi = async (payload) => {
    calls.push(payload)
    return new Promise((resolve) => {
      finish = resolve
    })
  }
  const ai = useAiStore()
  const first = ai.ask('Crie uma')
  assert.equal(await ai.ask('Crie uma'), false)
  assert.equal(calls.length, 1)
  finish(answer())
  await first
})

test('lost responses retain the exact request for retry and do not duplicate user entries', async () => {
  api.askAi = async (payload) => {
    calls.push(structuredClone(payload))
    throw new RequestError('Conexão interrompida')
  }
  const ai = useAiStore()
  assert.equal(await ai.ask('Criar apenas uma'), false)
  assert.ok(ai.active?.pending)
  assert.equal(ai.messages.length, 1)
  assert.equal(await ai.ask('Outra intenção'), false)
  assert.equal(calls.length, 1)
  api.askAi = async (payload) => {
    calls.push(structuredClone(payload))
    return answer()
  }
  assert.equal(await ai.retry(), true)
  assert.deepEqual(calls[0], calls[1])
  assert.equal(ai.messages.length, 2)
  assert.equal(ai.messages[0]?.status, 'sent')
  assert.equal(ai.active?.pending, null)
})

test('quota and server failures retain request IDs, validation errors allow correction', async () => {
  const ai = useAiStore()
  for (const status of [429, 500, 503]) {
    api.askAi = async () => {
      throw new RequestError('Falha temporária', status)
    }
    ai.newConversation()
    await ai.ask('Uma tarefa')
    assert.ok(ai.active?.pending)
  }
  api.askAi = async () => {
    throw new RequestError('Prompt inválido', 400)
  }
  ai.newConversation()
  await ai.ask('Inválido')
  assert.equal(ai.active?.pending, null)
  assert.equal(ai.error, 'Prompt inválido')
})

test('deletion confirmation sends only the server token on a new request', async () => {
  api.askAi = async (payload) => {
    calls.push(structuredClone(payload))
    return answer({ confirmation_token: 'delete-token' })
  }
  const ai = useAiStore()
  await ai.ask('Exclua ela')
  api.askAi = async (payload) => {
    calls.push(payload)
    return answer({ actions: [{ action: 'task_delete', writes: true, status: 'succeeded' }] })
  }
  assert.equal(await ai.confirmDeletion(), true)
  assert.equal(calls[1]?.confirmation_token, 'delete-token')
  assert.equal(calls[1]?.conversation_id, 'server-conversation')
  assert.notEqual(calls[0]?.request_id, calls[1]?.request_id)
  assert.equal(ai.active?.confirmation_token, null)
  assert.equal(ai.messages.at(-1)?.actions?.[0]?.status, 'succeeded')
  assert.equal(await ai.confirmDeletion(), false)
})

test('failed confirmation invalidates stale tokens without claiming deletion', async () => {
  api.askAi = async () => answer({ confirmation_token: 'delete-token' })
  const ai = useAiStore()
  await ai.ask('Excluir')
  api.askAi = async () => {
    throw new RequestError('A tarefa mudou', 400)
  }
  await ai.confirmDeletion()
  assert.equal(ai.active?.confirmation_token, null)
  assert.equal(ai.messages.filter((message) => message.role === 'assistant').length, 1)
  assert.equal(ai.error, 'A tarefa mudou')
})

test('normal messages clear superseded confirmations using backend results', async () => {
  api.askAi = async () => answer({ confirmation_token: 'delete-token' })
  const ai = useAiStore()
  await ai.ask('Excluir')
  api.askAi = async () => answer()
  await ai.ask('Cancele a exclusão')
  assert.equal(ai.active?.confirmation_token, null)
})

test('expired server context requires a new conversation without silently repeating writes', async () => {
  const ai = useAiStore()
  await ai.ask('Primeira')
  api.askAi = async () => {
    throw new RequestError('Not found', 404)
  }
  await ai.ask('Edite ela')
  assert.equal(ai.active?.expired, true)
  assert.equal(ai.active?.pending, null)
  assert.equal(await ai.ask('Tente de novo'), false)
  assert.match(ai.error, /expirou/)
})

test('account changes clear history and discard replies that arrive after reset', async () => {
  let finish!: (value: AiAnswer) => void
  api.askAi = async () =>
    new Promise((resolve) => {
      finish = resolve
    })
  const ai = useAiStore()
  const pending = ai.ask('Segredo da primeira conta')
  ai.setOwner('user-two')
  finish(answer())
  await pending
  assert.equal(ai.messages.length, 0)
  assert.equal(ai.conversations.length, 0)
  assert.equal(ai.isAsking, false)
})

test('failed old requests cannot overwrite the new account error or loading state', async () => {
  let fail!: (error: Error) => void
  api.askAi = async () =>
    new Promise((_resolve, reject) => {
      fail = reject
    })
  const ai = useAiStore()
  const pending = ai.ask('Primeira conta')
  ai.setOwner('user-two')
  fail(new Error('Erro antigo'))
  await pending
  assert.equal(ai.error, '')
  assert.equal(ai.isAsking, false)
})

test('file analysis produces a real report URL and reset releases it', async (t) => {
  const revoke = t.mock.method(URL, 'revokeObjectURL', () => {})
  const ai = useAiStore()
  const file = new File(['image'], 'meeting.png', { type: 'image/png' })
  let received: File[] = []
  api.analyzeAiFiles = async (files) => {
    received = files
    return new Blob(['%PDF'], { type: 'application/pdf' })
  }
  assert.equal(await ai.analyze([file]), true)
  assert.deepEqual(received, [file])
  const report = ai.messages.at(-1)?.report
  assert.ok(report?.url.startsWith('blob:'))
  assert.equal(ai.messages[0]?.files?.[0]?.name, 'meeting.png')
  ai.clear()
  assert.equal(revoke.mock.callCount(), 1)
})

test('analysis failures do not create a fake download and anonymous sending is blocked', async () => {
  const ai = useAiStore()
  api.analyzeAiFiles = async () => {
    throw new Error('Arquivo inválido')
  }
  assert.equal(await ai.analyze([new File(['x'], 'fake.pdf')]), false)
  assert.equal(
    ai.messages.some((message) => message.report),
    false,
  )
  assert.equal(ai.error, 'Arquivo inválido')
  ai.setOwner(null)
  assert.equal(await ai.ask('Sem conta'), false)
  assert.equal(ai.conversations.length, 0)
})

test('sends the organization context and keeps backend choices on the answer', async () => {
  api.askAi = async (payload) => {
    calls.push(structuredClone(payload))
    return answer({ choices: ['Revisar', 'Publicar'] })
  }
  const ai = useAiStore()
  calls.length = 0
  await ai.ask('Exclua a tarefa', 'org-1')
  assert.deepEqual(calls[0]?.context, { organization_id: 'org-1' })
  assert.deepEqual(ai.messages.at(-1)?.choices, ['Revisar', 'Publicar'])
  await ai.ask('Revisar')
  assert.equal(calls[1]?.context, undefined)
})

test('keeps the backend unverified flag on the assistant message', async () => {
  api.askAi = async () => answer({ unverified: true })
  const ai = useAiStore()
  await ai.ask('Crie uma tarefa')
  assert.equal(ai.messages.at(-1)?.unverified, true)
})
