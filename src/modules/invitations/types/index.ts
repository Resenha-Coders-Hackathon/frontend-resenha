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
  sector_ids: UUID[]
  status: InviteStatus
  expires_at: ISODateTime
  created_at: ISODateTime
}
export interface CreateInviteRequest {
  email: string
  role?: InviteRole
  sector_ids?: UUID[]
}
export interface AcceptInviteRequest {
  token: string
}
export interface InviteAccepted extends OrganizationMember {
  organization_id: UUID
}

export type Invitation = OrganizationInvite

export interface InvitePreview {
  organization_name: string
  role: InviteRole
  email: string
  expires_at: ISODateTime
  has_account: boolean
}
export type InviteErrorCode =
  'invite_invalid' | 'invite_used' | 'invite_expired' | 'invite_wrong_account'
