import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/modules/auth'
import { createPayment, createCardPayment, listPayments, tokenizeCard } from '../services'
import type { CardDetails } from '../services'
import type {
  CreatePaymentData,
  CreatePaymentResponse,
  CreateCardPaymentResponse,
  Payment,
  PaymentMethod,
} from '../types'

export const usePaymentsStore = defineStore('payments', () => {
  const auth = useAuthStore()
  const current = ref<Payment | null>(null)
  const payments = ref<Payment[]>([])
  const price = computed(() => auth.user?.subscription_price ?? null)
  const isSubscriber = computed(() => auth.user?.is_subscriber === true)
  const methods = ref<Record<string, PaymentMethod>>({})
  let generation = 0

  watch(
    () => auth.user?.id,
    () => {
      generation += 1
      current.value = null
      payments.value = []
      methods.value = {}
    },
    { flush: 'sync' },
  )

  async function refreshAccess(): Promise<void> {
    if (!(await auth.loadUser())) throw new Error('Entre na sua conta para continuar.')
  }

  async function create(data: CreatePaymentData): Promise<CreatePaymentResponse> {
    if (!auth.user) throw new Error('Entre na sua conta para continuar.')
    return createPayment({ title: data.title, cpf: data.cpf, name: data.name })
  }

  async function createCard(
    data: CardDetails & { title: string; installments: number },
  ): Promise<CreateCardPaymentResponse> {
    const user = auth.user
    if (!user) throw new Error('Entre na sua conta para continuar.')
    const card = await tokenizeCard(data)
    if (auth.user?.id !== user.id) throw new Error('Sua sessão mudou. Tente novamente.')
    const result = await createCardPayment({
      title: data.title,
      cpf: data.cpf,
      email: user.email,
      installments: data.installments,
      ...card,
    })
    if (auth.user?.id === user.id) methods.value[result.payment_id] = 'card'
    return result
  }

  function methodOf(id: string): PaymentMethod {
    const payment = find(id)
    return methods.value[id] ?? (payment?.payer_name || payment?.qr_code ? 'pix' : 'card')
  }

  function find(id: string): Payment | null {
    return current.value?.id === id
      ? current.value
      : (payments.value.find((item) => item.id === id) ?? null)
  }

  async function loadAll(): Promise<Payment[]> {
    const version = generation
    const result: Payment[] = []
    let page = 1
    while (true) {
      const response = await listPayments(page++)
      if (version !== generation) return []
      result.push(...response.results)
      if (!response.next) break
    }
    payments.value = result
    return result
  }

  async function load(id: string): Promise<Payment | null> {
    const version = generation
    const all = await loadAll()
    if (version !== generation) return null
    current.value = all.find((item) => item.id === id) ?? null
    await refreshAccess()
    return version === generation ? current.value : null
  }

  return {
    current,
    payments,
    price,
    isSubscriber,
    refreshAccess,
    create,
    createCard,
    methodOf,
    find,
    load,
    loadAll,
  }
})

export { useChargesStore } from './charges'
