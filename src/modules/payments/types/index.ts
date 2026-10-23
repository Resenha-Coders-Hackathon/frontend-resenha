export type PaymentStatus =
  'pending' | 'approved' | 'in_process' | 'rejected' | 'cancelled' | 'refunded'

export interface CreatePaymentData {
  title: string
  amount: string
  name: string
  cpf: string
}

export interface Payment {
  id: string
  title: string
  amount: string
  status: PaymentStatus
  payer_name: string
  payer_cpf: string
  qr_code: string
  qr_code_base64: string
  ticket_url: string
  created_at: string
  updated_at: string
}

export interface CreatePaymentResponse {
  payment_id: string
  status: PaymentStatus
  qr_code: string
  qr_code_base64: string
  ticket_url: string
}

export interface PaginatedPayments {
  count: number
  next: string | null
  previous: string | null
  results: Payment[]
}

export type * from './ui'
