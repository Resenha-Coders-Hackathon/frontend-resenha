import type { UUID, ISODateTime } from '@/shared/types'

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer'
export interface Organization {
  id: UUID
  name: string
  description: string
  logo_url: string
  is_personal: boolean
  created_at: ISODateTime
}
export interface CreateOrganizationRequest {
  name: string
  description?: string
  logo_url?: string
}
export type UpdateOrganizationRequest = Partial<CreateOrganizationRequest>
export interface OrganizationMember {
  id: number
  user_id: UUID
  name: string
  email: string
  role: OrganizationRole
  joined_at: ISODateTime
}
export interface AddOrganizationMemberRequest {
  email: string
  role?: OrganizationRole
}
export interface UpdateOrganizationMemberRoleRequest {
  role: OrganizationRole
}
