export type PaymentStatus = 'pending' | 'approved' | 'rejected'

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
  created_at: string
}
