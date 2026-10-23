export interface ITasks {
  id: string
  sector_id: string
  status_id: string
  title: string
  description: string
  priority: string
  due_data: Date
  completed_at: Date
  assignee_id: string
  created_by: string
  position: number
  created_at: Date
}
