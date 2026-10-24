import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { reactive } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import type { Charge } from '../types/index.ts'

const auth = reactive({ user: null as null | { id: string } })
const calls: { method: string; url: string; body?: unknown; config?: unknown }[] = []
const charge: Charge = {
  id: 'charge-1',
  organization_id: 'org-1',
  task_id: 'task-1',
  title: 'Fatura #0482',
  description: '',
  goal_amount: '480.00',
  raised: '0.00',
  contributors: 0,
  deadline: null,
  status: 'active',
  paid: false,
  created_by_id: 'user-1',
  created_at: '2026-10-24T12:00:00Z',
}
let getResponse = async (_url: string): Promise<unknown> => ({ results: [charge] })
let postResponse = async (_url: string): Promise<unknown> => charge
const api = {
  async get(url: string, config?: unknown) {
    calls.push({ method: 'get', url, config })
    return { data: await getResponse(url) }
  },
  async post(url: string, body: unknown, config?: unknown) {
    calls.push({ method: 'post', url, body, config })
    return { data: await postResponse(url) }
  },
}
Object.assign(globalThis, { chargeTestApi: api, chargeTestAuth: auth })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.includes('/payments/')) {
      if (specifier === '@/app/plugins/axios')
        return {
          url: `data:text/javascript,${encodeURIComponent('export default globalThis.chargeTestApi; export const getErrorMessage = (e, fallback) => e.response?.data?.detail ?? fallback;')}`,
          shortCircuit: true,
        }
      if (specifier === '@/modules/auth')
        return {
          url: `data:text/javascript,${encodeURIComponent('export const useAuthStore = () => globalThis.chargeTestAuth;')}`,
          shortCircuit: true,
        }
      if (specifier === '../services')
        return { url: new URL('../services/index.ts', context.parentURL).href, shortCircuit: true }
      if (specifier === './payment' || specifier === './charge')
        return {
          url: new URL(`${specifier}.ts`, context.parentURL).href,
          shortCircuit: true,
        }
      if (specifier === './mercadoPago')
        return {
          url: `data:text/javascript,${encodeURIComponent('export const tokenizeCard = async () => ({});')}`,
          shortCircuit: true,
        }
    }
    return nextResolve(specifier, context)
  },
})
const { useChargesStore } = await import('../stores/charges.ts')
hooks.deregister()

beforeEach(() => {
  setActivePinia(createPinia())
  calls.length = 0
  auth.user = { id: 'user-1' }
  getResponse = async () => ({ results: [charge] })
  postResponse = async () => charge
})

test('loads the charges of a task from the task route', async () => {
  const store = useChargesStore()
  await store.load('task-1')
  assert.equal(calls[0]?.url, '/tasks/task-1/campaigns/')
  assert.deepEqual(store.forTask('task-1'), [charge])
  assert.deepEqual(store.forTask('other'), [])
})

test('creating a charge posts it to the task and reloads the list', async () => {
  const store = useChargesStore()
  await store.create('task-1', { title: 'Fatura #0482', goal_amount: '480.00', deadline: null })
  assert.equal(calls[0]?.method, 'post')
  assert.equal(calls[0]?.url, '/tasks/task-1/campaigns/')
  assert.deepEqual(calls[0]?.body, {
    title: 'Fatura #0482',
    goal_amount: '480.00',
    deadline: null,
  })
  assert.equal(calls[1]?.method, 'get')
})

test('paying sends the Pix data to the charge and an idempotency key', async () => {
  postResponse = async () => ({ contribution_id: 'c-1', payment_id: 'p-1', qr_code: 'pix' })
  const store = useChargesStore()
  const body = { amount: '25.50', cpf: '12345678901', name: 'Maria Silva', anonymous: false }
  const result = await store.pay(charge, body)
  assert.equal(calls[0]?.url, '/campaigns/charge-1/contributions/')
  assert.deepEqual(calls[0]?.body, body)
  assert.ok((calls[0]?.config as { headers: Record<string, string> }).headers['Idempotency-Key'])
  assert.equal(result.contribution_id, 'c-1')
})

test('pending result does not reload; approved reloads the task charges', async () => {
  const store = useChargesStore()
  getResponse = async (url) =>
    url.startsWith('/contributions/') ? { result: 'pending' } : { results: [charge] }
  assert.equal(await store.result('c-1', 'task-1'), 'pending')
  assert.equal(calls.length, 1)

  getResponse = async (url) =>
    url.startsWith('/contributions/')
      ? { result: 'approved' }
      : { results: [{ ...charge, paid: true }] }
  assert.equal(await store.result('c-1', 'task-1'), 'approved')
  assert.equal(store.forTask('task-1')[0]?.paid, true)
})

test('rejected result is reported without reloading', async () => {
  const store = useChargesStore()
  getResponse = async () => ({ result: 'rejected' })
  assert.equal(await store.result('c-1', 'task-1'), 'rejected')
  assert.equal(calls.length, 1)
})

test('backend errors surface as readable messages', async () => {
  const store = useChargesStore()
  postResponse = async () => {
    throw { response: { data: { detail: 'This campaign is closed.' } } }
  }
  await assert.rejects(
    store.pay(charge, { amount: '5.00', cpf: '12345678901', name: 'Maria' }),
    /closed/,
  )
})

test('anonymous users are blocked before HTTP', async () => {
  const store = useChargesStore()
  auth.user = null
  await assert.rejects(store.create('task-1', { title: 'x', goal_amount: '5.00' }), /Entre/)
  await assert.rejects(
    store.pay(charge, { amount: '5.00', cpf: '12345678901', name: 'Maria' }),
    /Entre/,
  )
  assert.equal(calls.length, 0)
})

test('account switch discards charges and late responses', async () => {
  const store = useChargesStore()
  await store.load('task-1')
  let resolve!: (value: unknown) => void
  getResponse = () => new Promise((done) => (resolve = done))
  const pending = store.load('task-1')
  auth.user = { id: 'user-2' }
  await Promise.resolve()
  resolve({ results: [charge] })
  await pending
  assert.deepEqual(store.forTask('task-1'), [])
})
