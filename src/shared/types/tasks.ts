import type { UUID, ISODate, ISODateTime } from './api'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

/** TaskSerializer response; dates remain strings at the JSON boundary. */
export interface ITasks {
  id: UUID
  sector_id: UUID
  status_id: UUID
  parent_id: UUID | null
  title: string
  description: string
  priority: TaskPriority
  due_date: ISODate | null
  completed_at: ISODateTime | null
  assignee_id: UUID | null
  assignee_name: string | null
  position: number
  is_overdue: boolean
  created_at: ISODateTime
}
