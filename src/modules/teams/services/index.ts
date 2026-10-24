import { api } from '@/app/plugins/axios'
import type { Page } from '@/shared/types'
import type { Team, TeamMember, CreateTeamRequest, TeamRole } from '../types'

const base = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/teams/`

export async function listTeams(organizationId: string, page = 1): Promise<Page<Team>> {
  return (await api.get<Page<Team>>(base(organizationId), { params: { page } })).data
}

export async function createTeam(organizationId: string, data: CreateTeamRequest): Promise<Team> {
  return (await api.post<Team>(base(organizationId), data)).data
}

export async function updateTeam(
  organizationId: string,
  teamId: string,
  data: CreateTeamRequest,
): Promise<Team> {
  return (await api.patch<Team>(`${base(organizationId)}${encodeURIComponent(teamId)}/`, data)).data
}

export async function deleteTeam(organizationId: string, teamId: string): Promise<void> {
  await api.delete(`${base(organizationId)}${encodeURIComponent(teamId)}/`)
}

export async function listTeamMembers(
  organizationId: string,
  teamId: string,
  page = 1,
): Promise<Page<TeamMember>> {
  return (
    await api.get<Page<TeamMember>>(
      `${base(organizationId)}${encodeURIComponent(teamId)}/members/`,
      { params: { page } },
    )
  ).data
}

export async function addTeamMember(
  organizationId: string,
  teamId: string,
  userId: string,
  role: TeamRole,
): Promise<TeamMember> {
  return (
    await api.post<TeamMember>(`${base(organizationId)}${encodeURIComponent(teamId)}/members/`, {
      user_id: userId,
      role,
    })
  ).data
}

export async function updateTeamMember(
  organizationId: string,
  teamId: string,
  memberId: number,
  role: TeamRole,
): Promise<TeamMember> {
  return (
    await api.patch<TeamMember>(
      `${base(organizationId)}${encodeURIComponent(teamId)}/members/${memberId}/`,
      { role },
    )
  ).data
}

export async function removeTeamMember(
  organizationId: string,
  teamId: string,
  memberId: number,
): Promise<void> {
  await api.delete(`${base(organizationId)}${encodeURIComponent(teamId)}/members/${memberId}/`)
}
