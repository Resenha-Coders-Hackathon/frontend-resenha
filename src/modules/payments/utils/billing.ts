import type { BadgeTone } from './ui'

/* Dados de demonstração do faturamento (não integrado ao backend). */

export type InvoiceStatus = 'pending' | 'paid' | 'failed'

export interface Invoice extends Record<string, unknown> {
  id: string
  number: string
  date: string
  amount: number
  status: InvoiceStatus
}

export const INVOICE_STATUS: Record<
  InvoiceStatus,
  { label: string; tone: BadgeTone; action: string }
> = {
  pending: { label: 'Pendente', tone: 'warning', action: 'Pagar' },
  paid: { label: 'Paga', tone: 'success', action: 'PDF' },
  failed: { label: 'Falhou', tone: 'danger', action: 'Tentar' },
}

export const INVOICES: Invoice[] = [
  { id: 'i482', number: '#0482', date: '23 out', amount: 480, status: 'pending' },
  { id: 'i481', number: '#0481', date: '06 out', amount: 232, status: 'paid' },
  { id: 'i470', number: '#0470', date: '06 set', amount: 232, status: 'paid' },
  { id: 'i455', number: '#0455', date: '06 ago', amount: 203, status: 'paid' },
  { id: 'i431', number: '#0431', date: '06 jul', amount: 203, status: 'failed' },
]

export const SUBSCRIPTION = {
  plan: 'Pro',
  cycle: 'Mensal',
  pricePerSeat: 29,
  nextCharge: 232,
  nextChargeDate: '06/11',
  seatsUsed: 8,
  seats: 25,
  credits: { used: 312, total: 500, renewsAt: '01/11' },
}

export const PAYMENT_METHODS = [
  {
    id: 'visa',
    icon: 'credit_card',
    title: 'Visa •••• 4242',
    description: 'Expira 08/29',
    primary: true,
  },
  {
    id: 'pix',
    icon: 'qr_code_2',
    title: 'Pix',
    description: 'Para pagamentos avulsos',
    primary: false,
  },
  {
    id: 'billing',
    icon: 'domain',
    title: 'Dados de cobrança',
    description: 'Norte Studio LTDA · CNPJ 12.345.678/0001-90',
    primary: false,
  },
]
