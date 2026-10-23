import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchAllPages } from '@/shared/utils'
import {
  addSectorMember,
  addSectorTeam,
  listSectorMembers,
  listSectorTeams,
  removeSectorMember,
  removeSectorTeam,
  updateSectorMemberRole,
} from '../services'
import type {
  AddSectorMemberRequest,
  AddSectorTeamRequest,
  SectorMember,
  SectorRole,
  SectorTeam,
} from '../types'

// Quem tem acesso a um setor (pessoas e times), um setor por vez.
export const useSectorAccessStore = defineStore('sectorAccess', () => {
  const sectorId = ref<string | null>(null)
  const members = ref<SectorMember[]>([])
  const teams = ref<SectorTeam[]>([])

  async function load(id: string): Promise<void> {
    if (sectorId.value !== id) {
      members.value = []
      teams.value = []
    }
    sectorId.value = id
    const [loadedMembers, loadedTeams] = await Promise.all([
      fetchAllPages((page) => listSectorMembers(id, page)),
      fetchAllPages((page) => listSectorTeams(id, page)),
    ])
    if (sectorId.value !== id) return
    members.value = loadedMembers
    teams.value = loadedTeams
  }

  function requireSector(): string {
    if (!sectorId.value) throw new Error('Nenhum setor carregado.')
    return sectorId.value
  }

  async function addMember(payload: AddSectorMemberRequest): Promise<SectorMember> {
    const member = await addSectorMember(requireSector(), payload)
    members.value = [...members.value, member]
    return member
  }

  async function changeMemberRole(memberId: number, role: SectorRole): Promise<SectorMember> {
    const updated = await updateSectorMemberRole(requireSector(), memberId, role)
    members.value = members.value.map((m) => (m.id === memberId ? updated : m))
    return updated
  }

  async function removeMember(memberId: number): Promise<void> {
    await removeSectorMember(requireSector(), memberId)
    members.value = members.value.filter((m) => m.id !== memberId)
  }

  async function linkTeam(payload: AddSectorTeamRequest): Promise<SectorTeam> {
    const link = await addSectorTeam(requireSector(), payload)
    teams.value = [...teams.value, link]
    return link
  }

  async function unlinkTeam(linkId: number): Promise<void> {
    await removeSectorTeam(requireSector(), linkId)
    teams.value = teams.value.filter((t) => t.id !== linkId)
  }

  return {
    sectorId,
    members,
    teams,
    load,
    addMember,
    changeMemberRole,
    removeMember,
    linkTeam,
    unlinkTeam,
  }
})
