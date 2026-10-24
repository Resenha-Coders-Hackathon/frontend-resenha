/* Tipos de apresentação dos pagamentos. */

export type PaymentMethod = 'card' | 'pix'

export type BillingCycle = 'monthly' | 'yearly'

export type PlanId = 'free' | 'pro' | 'enterprise'

export interface PlanFeature {
  label: string
  // check = incluso, ai = recurso de IA, shield = segurança, locked = não incluso
  icon: 'check' | 'ai' | 'shield' | 'locked'
}

export interface Plan {
  id: PlanId
  name: string
  description: string
  // preço mensal por membro; 0 = grátis
  monthlyPrice: number
  priceNote: string
  cta: string
  highlighted: boolean
  features: PlanFeature[]
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'unknown'
