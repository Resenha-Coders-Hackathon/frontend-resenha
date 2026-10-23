import { ref } from 'vue'
import { defineStore } from 'pinia'
import { createPayment, listPayments } from '../services'
import type { CardPaymentData, CreatePaymentData, Payment, PaymentMethod } from '../types'

export const usePaymentsStore = defineStore('payments', () => {
  const current = ref<Payment | null>(null)
  // forma de pagamento por id (o backend atual só conhece Pix)
  const methods = ref<Record<string, PaymentMethod>>({})

  async function create(data: CreatePaymentData): Promise<Payment> {
    const response = await createPayment(data)
    const now = new Date().toISOString()

    current.value = {
      id: response.payment_id,
      title: data.title,
      amount: data.amount,
      status: response.status,
      payer_name: data.name,
      payer_cpf: data.cpf,
      qr_code: response.qr_code,
      qr_code_base64: response.qr_code_base64,
      ticket_url: response.ticket_url,
      created_at: now,
      updated_at: now,
    }
    return current.value
  }

  // Cartão ainda não é integrado: simula a aprovação localmente, sem enviar os dados do cartão.
  async function createCard(data: CardPaymentData): Promise<Payment> {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const now = new Date().toISOString()
    const id = `card-${crypto.randomUUID()}`

    current.value = {
      id,
      title: data.title,
      amount: data.amount,
      status: 'approved',
      payer_name: data.holder,
      payer_cpf: data.cpf,
      qr_code: '',
      qr_code_base64: '',
      ticket_url: '',
      created_at: now,
      updated_at: now,
    }
    methods.value[id] = 'card'
    return current.value
  }

  function methodOf(id: string): PaymentMethod {
    return methods.value[id] ?? 'pix'
  }

  function find(id: string): Payment | null {
    return current.value?.id === id ? current.value : null
  }

  async function load(id: string): Promise<Payment | null> {
    const payments = await listPayments()
    const payment = payments.results.find((item) => item.id === id) ?? null
    if (payment) current.value = payment
    return payment
  }

  return { current, create, createCard, methodOf, find, load }
})
