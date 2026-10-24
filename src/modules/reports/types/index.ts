import type { ISODate, UUID } from '@/shared/types'

export type ReportDays = 7 | 30 | 90

/** GET /organizations/:id/reports/?days= — só dos setores que o usuário vê. */
export interface Report {
  days: ReportDays
  completed: number
  completed_previous: number
  avg_days_to_complete: number | null
  avg_days_previous: number | null
  on_time_pct: number | null
  on_time_pct_previous: number | null
  open: number
  overdue: number
  weekly_done: { week_start: ISODate; done: number }[]
  overdue_by_sector: { sector: string; overdue: number }[]
  people: {
    user_id: UUID
    name: string
    completed: number
    on_time_pct: number | null
    open: number
    overdue: number
  }[]
}
