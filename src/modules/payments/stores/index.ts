import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { CreatePaymentData, Payment, PaymentStatus } from '../types'

// Somente front: o pagamento vive em memória e se perde ao recarregar a página.
const FAKE_PIX_CODE =
  '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913ResenhaCoders6008Joinville62070503***6304ABCD'

export const usePaymentsStore = defineStore('payments', () => {
  const current = ref<Payment | null>(null)

  function create(data: CreatePaymentData): Payment {
    current.value = {
      id: crypto.randomUUID(),
      title: data.title,
      amount: data.amount,
      status: 'pending',
      payer_name: data.name,
      payer_cpf: data.cpf,
      qr_code: FAKE_PIX_CODE,
      created_at: new Date().toISOString(),
    }
    return current.value
  }

  function find(id: string): Payment | null {
    return current.value?.id === id ? current.value : null
  }

  function setStatus(id: string, status: PaymentStatus): void {
    const payment = find(id)
    if (payment) payment.status = status
  }

  return { current, create, find, setStatus }
})
