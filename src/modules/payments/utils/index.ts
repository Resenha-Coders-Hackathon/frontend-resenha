import type { PaymentStatus } from '../types'

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCurrency(value: string | number): string {
  return currencyFormatter.format(Number(value) || 0)
}

// "123456" -> "1.234,56"
export function maskCurrency(value: string): string {
  const digits = onlyDigits(value).replace(/^0+/, '').slice(0, 10)
  if (!digits) return ''

  const padded = digits.padStart(3, '0')
  const integer = Number(padded.slice(0, -2)).toLocaleString('pt-BR')
  return `${integer},${padded.slice(-2)}`
}

// "1.234,56" -> "1234.56"
export function parseCurrency(masked: string): string {
  const digits = onlyDigits(masked)
  return digits ? (Number(digits) / 100).toFixed(2) : ''
}

// "12345678901" -> "123.456.789-01"
export function maskCpf(value: string): string {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Aguardando pagamento',
  approved: 'Pagamento aprovado',
  rejected: 'Pagamento recusado',
}

export function isPaymentApproved(status: PaymentStatus): boolean {
  return status === 'approved'
}

export function isPaymentFinal(status: PaymentStatus): boolean {
  return status !== 'pending'
}
