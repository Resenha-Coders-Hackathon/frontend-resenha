import type { UUID, ISODateTime } from '@/shared/types'

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer'
export interface OrganizationLocation {
  latitude: number
  longitude: number
}
export interface Organization {
  id: UUID
  name: string
  slug: string
  team_size: '' | '1' | '2-10' | '11-50' | '51-200' | '201+'
  current_role: OrganizationRole
  description: string
  logo_url: string
  location: OrganizationLocation | null
  is_personal: boolean
  created_at: ISODateTime
}
export interface CreateOrganizationRequest {
  name: string
  slug?: string
  team_size?: Organization['team_size']
  description?: string
  logo_url?: string
  location?: OrganizationLocation | null
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

export interface OrganizationSector {
  id: UUID
  organization_id: UUID
  name: string
  is_private: boolean
}
