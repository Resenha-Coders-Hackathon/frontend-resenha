import type { UUID, ISODateTime } from '@/shared/types'

export type TeamRole = 'lead' | 'member'
export interface Team {
  id: UUID
  name: string
  description: string
  created_at: ISODateTime
}
export interface CreateTeamRequest {
  name: string
  description?: string
}
export type UpdateTeamRequest = Partial<CreateTeamRequest>
export interface TeamMember {
  id: number
  user_id: UUID
  name: string
  email: string
  role: TeamRole
  joined_at: ISODateTime
}
export interface AddTeamMemberRequest {
  user_id: UUID
  role?: TeamRole
}
export interface UpdateTeamMemberRoleRequest {
  role: TeamRole
}
