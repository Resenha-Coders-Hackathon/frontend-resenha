import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UUID } from '@/shared/types'
import { fetchAllPages } from '@/shared/utils'
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  listTeamMembers,
  listTeams,
  removeTeamMember,
  updateTeam,
  updateTeamMemberRole,
} from '../services'
import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  Team,
  TeamMember,
  TeamRole,
  UpdateTeamRequest,
} from '../types'

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref<Team[]>([])
  const organizationId = ref<UUID | null>(null)
  // members of the team opened last, by team id
  const members = ref<Record<UUID, TeamMember[]>>({})

  async function load(orgId: UUID): Promise<void> {
    // limpa antes de buscar: evita mostrar times de outra organização
    if (organizationId.value !== orgId) {
      teams.value = []
      members.value = {}
    }
    organizationId.value = orgId
    const items = await fetchAllPages((page) => listTeams(orgId, page))
    if (organizationId.value === orgId) teams.value = items
  }

  async function create(orgId: UUID, payload: CreateTeamRequest): Promise<Team> {
    const created = await createTeam(orgId, payload)
    if (organizationId.value === orgId) teams.value = [...teams.value, created]
    return created
  }

  async function update(orgId: UUID, teamId: UUID, payload: UpdateTeamRequest): Promise<Team> {
    const updated = await updateTeam(orgId, teamId, payload)
    teams.value = teams.value.map((t) => (t.id === teamId ? updated : t))
    return updated
  }

  async function remove(orgId: UUID, teamId: UUID): Promise<void> {
    await deleteTeam(orgId, teamId)
    teams.value = teams.value.filter((t) => t.id !== teamId)
    delete members.value[teamId]
  }

  async function loadMembers(orgId: UUID, teamId: UUID): Promise<void> {
    members.value[teamId] = await fetchAllPages((page) => listTeamMembers(orgId, teamId, page))
  }

  async function addMember(
    orgId: UUID,
    teamId: UUID,
    payload: AddTeamMemberRequest,
  ): Promise<TeamMember> {
    const member = await addTeamMember(orgId, teamId, payload)
    members.value[teamId] = [...(members.value[teamId] ?? []), member]
    return member
  }

  async function changeRole(
    orgId: UUID,
    teamId: UUID,
    memberId: number,
    role: TeamRole,
  ): Promise<TeamMember> {
    const updated = await updateTeamMemberRole(orgId, teamId, memberId, { role })
    members.value[teamId] = (members.value[teamId] ?? []).map((m) =>
      m.id === memberId ? updated : m,
    )
    return updated
  }

  async function removeMember(orgId: UUID, teamId: UUID, memberId: number): Promise<void> {
    await removeTeamMember(orgId, teamId, memberId)
    members.value[teamId] = (members.value[teamId] ?? []).filter((m) => m.id !== memberId)
  }

  function reset(): void {
    teams.value = []
    members.value = {}
    organizationId.value = null
  }

  return {
    teams,
    members,
    organizationId,
    load,
    create,
    update,
    remove,
    loadMembers,
    addMember,
    changeRole,
    removeMember,
    reset,
  }
})
