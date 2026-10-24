import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { reactive } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import type { Payment } from '../types/index.ts'

const auth = reactive({
  user: null as null | {
    id: string
    email: string
    is_subscriber: boolean
    subscription_price: string
  },
  async loadUser() {
    return this.user
  },
})
const calls: { url: string; body?: unknown; config?: unknown }[] = []
const payment: Payment = {
  id: 'payment-1',
  title: 'Pro',
  amount: '9.99',
  status: 'pending',
  payer_name: 'Maria Silva',
  payer_cpf: '12345678901',
  qr_code: 'pix-code',
  qr_code_base64: '',
  ticket_url: '',
  created_at: '2026-10-23T12:00:00Z',
  updated_at: '2026-10-23T12:00:00Z',
}
let getResponse = async (_config: unknown): Promise<unknown> => ({ results: [payment], next: null })
let postResponse = async (): Promise<unknown> => ({ payment_id: payment.id, status: 'pending' })
const api = {
  async get(url: string, config?: unknown) {
    calls.push({ url, config })
    return { data: await getResponse(config) }
  },
  async post(url: string, body: unknown, config?: unknown) {
    calls.push({ url, body, config })
    return { data: await postResponse() }
  },
}
Object.assign(globalThis, { paymentTestApi: api, paymentTestAuth: auth })
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.includes('/payments/')) {
      if (specifier === '@/app/plugins/axios')
        return {
          url: `data:text/javascript,${encodeURIComponent('export default globalThis.paymentTestApi; export const getErrorMessage = (e, fallback) => e.response?.data?.detail ?? fallback;')}`,
          shortCircuit: true,
        }
      if (specifier === '@/modules/auth')
        return {
          url: `data:text/javascript,${encodeURIComponent('export const useAuthStore = () => globalThis.paymentTestAuth;')}`,
          shortCircuit: true,
        }
      if (specifier === '../services')
        return { url: new URL('../services/index.ts', context.parentURL).href, shortCircuit: true }
      if (['./payment', './charge', './charges'].includes(specifier))
        return { url: new URL(`${specifier}.ts`, context.parentURL).href, shortCircuit: true }
      if (specifier === './mercadoPago')
        return {
          url: `data:text/javascript,${encodeURIComponent('export const tokenizeCard = async () => ({token: "one-time-token", payment_method_id: "visa", issuer_id: 7});')}`,
          shortCircuit: true,
        }
    }
    return nextResolve(specifier, context)
  },
})
const { usePaymentsStore } = await import('../stores/index.ts')
hooks.deregister()

beforeEach(() => {
  setActivePinia(createPinia())
  calls.length = 0
  auth.user = {
    id: 'user-1',
    email: 'user@test.com',
    is_subscriber: false,
    subscription_price: '9.99',
  }
  getResponse = async () => ({ results: [payment], next: null })
  postResponse = async () => ({ payment_id: payment.id, status: 'pending' })
})

test('Pix sends only backend fields and never a client-controlled amount', async () => {
  const store = usePaymentsStore()
  const submitted = { title: 'Pro', name: 'Maria Silva', cpf: '12345678901', amount: '0.01' }
  await store.create(submitted)
  assert.deepEqual(calls[0]?.body, { title: 'Pro', name: 'Maria Silva', cpf: '12345678901' })
  assert.equal(calls[0]?.url, '/payments/')
  assert.equal(store.current, null)
  assert.equal(store.isSubscriber, false)
  assert.equal(store.price, '9.99')
})

test('card submits only tokenized data and preserves pending backend status', async () => {
  const store = usePaymentsStore()
  const result = await store.createCard({
    title: 'Pro',
    holder: 'Maria Silva',
    cpf: '12345678901',
    number: '4111111111111111',
    expiry: '12/30',
    cvv: '123',
    installments: 1,
  })
  assert.equal(result.status, 'pending')
  assert.deepEqual(calls[0]?.body, {
    title: 'Pro',
    cpf: '12345678901',
    email: 'user@test.com',
    installments: 1,
    token: 'one-time-token',
    payment_method_id: 'visa',
    issuer_id: 7,
  })
  assert.equal(calls[0]?.url, '/payments/card/')
  assert.equal(store.isSubscriber, false)
})

test('a provider error never becomes a simulated approval', async () => {
  postResponse = async () => {
    throw { response: { data: { detail: 'Cartão recusado' } } }
  }
  const store = usePaymentsStore()
  await assert.rejects(
    store.createCard({
      title: 'Pro',
      holder: 'Maria',
      cpf: '12345678901',
      number: '4111111111111111',
      expiry: '12/30',
      cvv: '123',
      installments: 1,
    }),
    /Cartão recusado/,
  )
  assert.equal(store.current, null)
  assert.equal(store.isSubscriber, false)
})

test('payment reload traverses pagination and uses authoritative amount', async () => {
  getResponse = async (config) => {
    const page = (config as { params: { page: number } }).params.page
    return page === 1
      ? { results: [], next: 'https://backend/payments/?page=2' }
      : { results: [payment], next: null }
  }
  const store = usePaymentsStore()
  assert.equal((await store.load(payment.id))?.amount, '9.99')
  assert.equal(calls.length, 2)
  assert.equal(store.methodOf(payment.id), 'pix')
})

test('confirmed access comes from profile, not a local payment status', async () => {
  const store = usePaymentsStore()
  getResponse = async () => ({ results: [{ ...payment, status: 'approved' }], next: null })
  await store.load(payment.id)
  assert.equal(store.isSubscriber, false)
  auth.user!.is_subscriber = true
  assert.equal(store.isSubscriber, true)
  auth.user!.is_subscriber = false
  assert.equal(store.isSubscriber, false)
})

test('account switch clears billing records and discards late responses', async () => {
  const store = usePaymentsStore()
  await store.load(payment.id)
  let resolve!: (value: unknown) => void
  getResponse = () =>
    new Promise((done) => {
      resolve = done
    })
  const pending = store.load(payment.id)
  auth.user = {
    id: 'user-2',
    email: 'other@test.com',
    is_subscriber: false,
    subscription_price: '9.99',
  }
  resolve({ results: [payment], next: null })
  assert.equal(await pending, null)
  assert.equal(store.current, null)
  assert.deepEqual(store.payments, [])
})

test('anonymous payment creation is blocked before HTTP', async () => {
  const store = usePaymentsStore()
  auth.user = null
  await assert.rejects(
    store.create({ title: 'Pro', name: 'Maria Silva', cpf: '12345678901' }),
    /Entre/,
  )
  assert.equal(calls.length, 0)
})
