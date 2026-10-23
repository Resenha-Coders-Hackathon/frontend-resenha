import { api } from '@/app/plugins/axios'
import type { Page } from '@/shared/types'
import type { Invitation, InviteRole } from '../types'

export async function listInvitations(id: string, page = 1): Promise<Page<Invitation>> {
  return (
    await api.get<Page<Invitation>>(`/organizations/${encodeURIComponent(id)}/invitations/`, {
      params: { page },
    })
  ).data
}
export async function createInvitation(
  id: string,
  payload: { email: string; role: InviteRole; sector_ids?: string[] },
): Promise<Invitation> {
  return (
    await api.post<Invitation>(`/organizations/${encodeURIComponent(id)}/invitations/`, payload)
  ).data
}
export async function revokeInvitation(id: string, invitationId: string): Promise<void> {
  await api.delete(
    `/organizations/${encodeURIComponent(id)}/invitations/${encodeURIComponent(invitationId)}/`,
  )
}
export async function acceptInvitation(token: string): Promise<{ organization_id: string }> {
  return (await api.post<{ organization_id: string }>('/invitations/accept/', { token })).data
}
