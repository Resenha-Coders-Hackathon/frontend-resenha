import type { UUID, ISODateTime } from '@/shared/types'
import type { OrganizationRole, OrganizationMember } from '@/modules/organizations'

export type InviteRole = Exclude<OrganizationRole, 'owner'>
export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired'
export interface OrganizationInvite {
  id: UUID
  organization_id: UUID
  organization_name: string
  email: string
  role: InviteRole
  status: InviteStatus
  expires_at: ISODateTime
  created_at: ISODateTime
}
export interface CreateInviteRequest {
  email: string
  role?: InviteRole
}
export interface AcceptInviteRequest {
  token: string
}
export interface InviteAccepted extends OrganizationMember {
  organization_id: UUID
}
