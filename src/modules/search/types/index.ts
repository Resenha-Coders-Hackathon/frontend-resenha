import type { UUID, ISODate, ISODateTime, TaskPriority } from '@/shared/types'
import type { OrganizationRole } from '@/modules/organizations'

export interface SearchTask {
  id: UUID
  title: string
  sector_id: UUID
  sector_name: string
  status: string
  priority: TaskPriority
  due_date: ISODate | null
}
export interface SearchPerson {
  id: UUID
  name: string
  email: string
  role: OrganizationRole
}
export interface SearchFile {
  id: UUID
  file_name: string
  mime_type: string
  size_bytes: number
  url: string
  created_at: ISODateTime
}
export interface SearchResult {
  tasks: SearchTask[]
  people: SearchPerson[]
  files: SearchFile[]
}
