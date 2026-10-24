import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchAllPages } from '@/shared/utils'
import { getErrorMessage } from '@/app/plugins/axios'
import {
  acceptInvitation,
  acceptMyInvitation,
  declineMyInvitation,
  createInvitation,
  listInvitations,
  listMyInvitations,
  revokeInvitation,
} from '../services'
import type { Invitation, InviteRole } from '../types'

export interface InviteResult {
  email: string
  invitation?: Invitation
  error?: string
}

export const useInvitationsStore = defineStore('invitations', () => {
  const invitations = ref<Invitation[]>([])
  const mine = ref<Invitation[]>([])

  async function load(organizationId: string): Promise<void> {
    invitations.value = []
    invitations.value = await fetchAllPages((page) => listInvitations(organizationId, page))
  }

  async function loadMine(): Promise<void> {
    mine.value = await fetchAllPages(listMyInvitations)
  }

  // Envia um por e-mail; falhas individuais não cancelam as demais (permite reenviar só as que falharam).
  async function inviteMany(
    organizationId: string,
    emails: string[],
    role: InviteRole,
    sectorIds?: string[],
  ): Promise<InviteResult[]> {
    const results: InviteResult[] = []
    for (const email of emails) {
      try {
        const invitation = await createInvitation(organizationId, {
          email,
          role,
          sector_ids: sectorIds?.length ? sectorIds : undefined,
        })
        invitations.value = [...invitations.value, invitation]
        results.push({ email, invitation })
      } catch (error) {
        results.push({ email, error: getErrorMessage(error, 'Não foi possível enviar o convite.') })
      }
    }
    return results
  }

  async function revoke(organizationId: string, invitationId: string): Promise<void> {
    await revokeInvitation(organizationId, invitationId)
    invitations.value = invitations.value.filter((i) => i.id !== invitationId)
  }

  async function accept(token: string): Promise<string> {
    const { organization_id } = await acceptInvitation(token)
    mine.value = mine.value.filter((i) => i.organization_id !== organization_id)
    return organization_id
  }

  // Aceita pela lista (sem o token do e-mail); devolve a organização em que a pessoa entrou.
  async function acceptMine(id: string): Promise<string> {
    const { organization_id } = await acceptMyInvitation(id)
    mine.value = mine.value.filter((i) => i.id !== id)
    return organization_id
  }

  async function decline(id: string): Promise<void> {
    await declineMyInvitation(id)
    mine.value = mine.value.filter((i) => i.id !== id)
  }

  return { invitations, mine, load, loadMine, inviteMany, revoke, accept, acceptMine, decline }
})
