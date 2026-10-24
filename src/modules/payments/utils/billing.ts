import type { BadgeTone } from './ui'

/* Apresentação dos pagamentos retornados pelo backend. */

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
  pending: { label: 'Pendente', tone: 'warning', action: 'Consultar' },
  paid: { label: 'Paga', tone: 'success', action: 'Consultar' },
  failed: { label: 'Falhou', tone: 'danger', action: 'Consultar' },
}
