import axios from 'axios'
import api from '@/app/plugins/axios'
import type { CreatePaymentData, CreatePaymentResponse, PaginatedPayments } from '../types'

function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback

  const data: unknown = error.response?.data
  if (!data || typeof data !== 'object') return fallback

  if ('detail' in data && typeof data.detail === 'string') return data.detail

  for (const value of Object.values(data)) {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  }

  return fallback
}

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
