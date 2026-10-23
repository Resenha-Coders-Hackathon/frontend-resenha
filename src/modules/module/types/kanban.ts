import type { UUID, ISODate, ISODateTime, ITasks } from '@/shared/types'

export type { TaskPriority } from '@/shared/types'
export type Task = ITasks
export type SectorRole = 'manager' | 'editor' | 'viewer'
export type StatusCategory = 'todo' | 'in_progress' | 'done'

export interface Sector {
  id: UUID
  organization_id: UUID
  name: string
  description: string
  icon: string
  color: string
  is_private: boolean
  created_at: ISODateTime
}
export interface CreateSectorRequest {
  name: string
  description?: string
  icon?: string
  color?: string
  is_private?: boolean
}
export type UpdateSectorRequest = Partial<CreateSectorRequest>
export interface SectorMember {
  id: number
  user_id: UUID
  name: string
  email: string
  role: SectorRole
}
export interface AddSectorMemberRequest {
  user_id: UUID
  role?: SectorRole
}
export interface SectorTeam {
  id: number
  team_id: UUID
  team_name: string
  role: SectorRole
}
export interface AddSectorTeamRequest {
  team_id: UUID
  role?: SectorRole
}
export interface SectorProgress {
  total: number
  completed: number
  overdue: number
  percent: number
}
export interface Status {
  id: UUID
  name: string
  color: string
  category: StatusCategory
  position: number
  wip_limit: number | null
}
export interface CreateStatusRequest {
  name: string
  category: StatusCategory
  color?: string
  position?: number
  wip_limit?: number | null
}
export type UpdateStatusRequest = Partial<CreateStatusRequest>
export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: Task['priority']
  due_date?: ISODate | null
  assignee?: UUID | null
  status?: UUID
  parent?: UUID
}
export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, 'status' | 'parent'>>
export interface MoveTaskRequest {
  status: UUID
  position?: number
}
export interface ChecklistItem {
  id: UUID
  content: string
  is_done: boolean
  position: number
}
export interface CreateChecklistItemRequest {
  content: string
  is_done?: boolean
  position?: number
}
export type UpdateChecklistItemRequest = Partial<CreateChecklistItemRequest>
export interface Comment {
  id: UUID
  author_id: UUID
  author_name: string
  content: string
  created_at: ISODateTime
}
export interface WriteCommentRequest {
  content: string
}
export interface ResourceLink {
  id: UUID
  title: string
  url: string
  created_by_id: UUID
  created_at: ISODateTime
}
export interface CreateResourceLinkRequest {
  title?: string
  url: string
}
export type UpdateResourceLinkRequest = Partial<CreateResourceLinkRequest>
