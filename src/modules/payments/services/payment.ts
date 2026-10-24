import api, { getErrorMessage } from '@/app/plugins/axios'
import type {
  CreatePaymentData,
  CreatePaymentResponse,
  PaginatedPayments,
  CreateCardPaymentData,
  CreateCardPaymentResponse,
} from '../types'

export async function createPayment(payment: CreatePaymentData): Promise<CreatePaymentResponse> {
  try {
    const response = await api.post<CreatePaymentResponse>('/payments/', payment, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível gerar o pagamento Pix.'))
  }
}

export async function listPayments(page = 1): Promise<PaginatedPayments> {
  try {
    const response = await api.get<PaginatedPayments>('/payments/', { params: { page } })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível consultar o pagamento.'))
  }
}

export async function createCardPayment(
  payment: CreateCardPaymentData,
): Promise<CreateCardPaymentResponse> {
  try {
    return (
      await api.post<CreateCardPaymentResponse>('/payments/card/', payment, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      })
    ).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível concluir o pagamento com cartão.'))
  }
}
