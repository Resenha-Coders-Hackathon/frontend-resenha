import type { ISODate, UUID } from '@/shared/types'

/** GET /organizations/:id/dashboard/ — limited to the sectors the user can see. */
export interface Dashboard {
  open_tasks: number
  due_this_week: number
  done_this_week: number
  done_last_week: number
  overdue: number
  overdue_title: string | null
  today: { id: UUID; title: string; sector_name: string; due_date: ISODate; is_overdue: boolean }[]
  weekly_done: { week_start: ISODate; done: number }[]
  open_by_sector: { sector: string; open: number }[]
}
