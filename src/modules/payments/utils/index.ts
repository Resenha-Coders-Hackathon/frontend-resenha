import type { CardBrand, PaymentStatus } from '../types'

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
  in_process: 'Pagamento em processamento',
  rejected: 'Pagamento recusado',
  cancelled: 'Pagamento cancelado',
  refunded: 'Pagamento estornado',
}

export function isPaymentApproved(status: PaymentStatus): boolean {
  return status === 'approved'
}

export function isPaymentFinal(status: PaymentStatus): boolean {
  return !['pending', 'in_process'].includes(status)
}

// ---- cartão (só validação local; nada é enviado ao backend) ----

export function cardBrand(number: string): CardBrand {
  const digits = onlyDigits(number)
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(digits))
    return 'elo'
  if (/^4/.test(digits)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard'
  if (/^3[47]/.test(digits)) return 'amex'
  return 'unknown'
}

// "4111111111111111" -> "4111 1111 1111 1111" (amex: 4-6-5)
export function maskCardNumber(value: string): string {
  const digits = onlyDigits(value)
  if (cardBrand(digits) === 'amex') {
    return digits
      .slice(0, 15)
      .replace(/(\d{4})(\d{1,6})?(\d{1,5})?/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '))
  }
  return digits.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

// algoritmo de Luhn: confere o dígito verificador do cartão
export function isValidCardNumber(value: string): boolean {
  const digits = onlyDigits(value)
  if (digits.length < 13) return false
  let sum = 0
  for (let index = 0; index < digits.length; index++) {
    let digit = Number(digits[digits.length - 1 - index])
    if (index % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

// "1228" -> "12/28"
export function maskExpiry(value: string): string {
  return onlyDigits(value)
    .slice(0, 4)
    .replace(/(\d{2})(\d)/, '$1/$2')
}

export function isValidExpiry(value: string): boolean {
  const [month, year] = value.split('/').map(Number)
  if (!month || !year || month > 12) return false
  const now = new Date()
  const fullYear = 2000 + year
  return (
    fullYear > now.getFullYear() || (fullYear === now.getFullYear() && month >= now.getMonth() + 1)
  )
}

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  elo: 'Elo',
  unknown: 'Cartão',
}
