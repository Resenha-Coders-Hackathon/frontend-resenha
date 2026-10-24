import type { ISODate, ISODateTime, UUID } from '@/shared/types'

/** Cobrança (vaquinha) anexada a uma tarefa; paga por Pix. */
export interface Charge {
  id: UUID
  organization_id: UUID
  task_id: UUID | null
  title: string
  description: string
  goal_amount: string
  raised: string
  contributors: number
  deadline: ISODate | null
  status: 'active' | 'closed'
  paid: boolean
  created_by_id: UUID
  created_at: ISODateTime
}
export interface CreateChargeRequest {
  title: string
  goal_amount: string
  deadline?: ISODate | null
}
export interface PayChargeRequest {
  amount: string
  cpf: string
  name: string
  message?: string
  anonymous?: boolean
}
export interface PayChargeResponse {
  contribution_id: UUID
  payment_id: UUID
  status: string
  qr_code: string
  qr_code_base64: string
  ticket_url: string
}
export type ChargeResult = 'approved' | 'rejected' | 'pending'
export interface ContributionStatus {
  contribution_id: UUID
  campaign_id: UUID
  amount: string
  result: ChargeResult
}
