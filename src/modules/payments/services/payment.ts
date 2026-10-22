import api, { getErrorMessage } from '@/app/plugins/axios'
import type { CreatePaymentData, CreatePaymentResponse, PaginatedPayments } from '../types'

export async function createPayment(payment: CreatePaymentData): Promise<CreatePaymentResponse> {
  try {
    const response = await api.post<CreatePaymentResponse>('v1/payments/', payment, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível gerar o pagamento Pix.'))
  }
}

export async function listPayments(): Promise<PaginatedPayments> {
  try {
    const response = await api.get<PaginatedPayments>('v1/payments/')
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível consultar o pagamento.'))
  }
}
