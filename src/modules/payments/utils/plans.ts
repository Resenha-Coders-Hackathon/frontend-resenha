import type { BillingCycle, Plan, PlanId } from '../types'

// valores de exemplo do protótipo (vêm do design)
export const YEARLY_DISCOUNT = 0.2

// membros da organização de exemplo, usados para calcular o total do plano
export const ORG_MEMBERS = 24

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Para times pequenos começando a se organizar',
    monthlyPrice: 0,
    priceNote: 'para sempre',
    cta: 'Plano atual',
    highlighted: false,
    features: [
      { label: 'Até 10 membros e 3 setores', icon: 'check' },
      { label: 'Boards ilimitados com A fazer, Em andamento e Concluído', icon: 'check' },
      { label: 'Chat entre membros e canais por setor', icon: 'check' },
      { label: 'Anexos até 100 MB por tarefa', icon: 'check' },
      { label: 'Integrações com Google Drive, Docs e Meet', icon: 'locked' },
      { label: 'Assistente de IA', icon: 'locked' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para times que querem menos trabalho manual',
    monthlyPrice: 29,
    priceNote: 'por membro / mês',
    cta: 'Ativar 14 dias grátis',
    highlighted: true,
    features: [
      { label: 'Membros e setores ilimitados', icon: 'check' },
      { label: 'Chat com IA que cria tarefas a partir de texto', icon: 'ai' },
      { label: 'Leitura de PDF, DOCX e imagens anexadas', icon: 'ai' },
      { label: '500 créditos de IA por mês', icon: 'ai' },
      { label: 'Google Drive, Docs, Meet e cobranças na tarefa', icon: 'check' },
      { label: 'Anexos até 2 GB por tarefa', icon: 'check' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Empresa',
    description: 'Para várias organizações e exigências de segurança',
    monthlyPrice: 59,
    priceNote: 'por membro / mês',
    cta: 'Falar com vendas',
    highlighted: false,
    features: [
      { label: 'Tudo do Pro, com créditos de IA ilimitados', icon: 'check' },
      { label: 'Várias organizações na mesma conta', icon: 'check' },
      { label: 'SSO, auditoria e permissões por setor', icon: 'shield' },
      { label: 'Retenção de dados configurável (LGPD)', icon: 'check' },
      { label: 'Suporte prioritário com SLA', icon: 'check' },
    ],
  },
]

export function findPlan(id: unknown): Plan | undefined {
  return PLANS.find((plan) => plan.id === id)
}

// preço por membro no ciclo escolhido (anual mostra o equivalente mensal com desconto)
export function planPrice(plan: Plan, cycle: BillingCycle): number {
  return cycle === 'yearly'
    ? Math.round(plan.monthlyPrice * (1 - YEARLY_DISCOUNT) * 100) / 100
    : plan.monthlyPrice
}

// total cobrado: membros × preço × meses do ciclo
export function planTotal(planId: PlanId, cycle: BillingCycle, members = ORG_MEMBERS): number {
  const plan = findPlan(planId)
  if (!plan) return 0
  return planPrice(plan, cycle) * members * (cycle === 'yearly' ? 12 : 1)
}

export const CYCLE_LABELS: Record<BillingCycle, string> = { monthly: 'mensal', yearly: 'anual' }
