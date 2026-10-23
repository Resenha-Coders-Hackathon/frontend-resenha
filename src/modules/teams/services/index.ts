import { api } from '@/app/plugins/axios'
import type { Page, UUID } from '@/shared/types'
import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  Team,
  TeamMember,
  UpdateTeamMemberRoleRequest,
  UpdateTeamRequest,
} from '../types'

const enc = encodeURIComponent
const base = (orgId: UUID) => `/organizations/${enc(orgId)}/teams/`

export async function listTeams(orgId: UUID, page = 1): Promise<Page<Team>> {
  return (await api.get<Page<Team>>(base(orgId), { params: { page } })).data
}

export async function createTeam(orgId: UUID, payload: CreateTeamRequest): Promise<Team> {
  return (await api.post<Team>(base(orgId), payload)).data
}

export async function getTeam(orgId: UUID, teamId: UUID): Promise<Team> {
  return (await api.get<Team>(`${base(orgId)}${enc(teamId)}/`)).data
}

export async function updateTeam(
  orgId: UUID,
  teamId: UUID,
  payload: UpdateTeamRequest,
): Promise<Team> {
  return (await api.patch<Team>(`${base(orgId)}${enc(teamId)}/`, payload)).data
}

export async function deleteTeam(orgId: UUID, teamId: UUID): Promise<void> {
  await api.delete(`${base(orgId)}${enc(teamId)}/`)
}

export async function listTeamMembers(
  orgId: UUID,
  teamId: UUID,
  page = 1,
): Promise<Page<TeamMember>> {
  return (
    await api.get<Page<TeamMember>>(`${base(orgId)}${enc(teamId)}/members/`, { params: { page } })
  ).data
}

export async function addTeamMember(
  orgId: UUID,
  teamId: UUID,
  payload: AddTeamMemberRequest,
): Promise<TeamMember> {
  return (await api.post<TeamMember>(`${base(orgId)}${enc(teamId)}/members/`, payload)).data
}

export async function updateTeamMemberRole(
  orgId: UUID,
  teamId: UUID,
  memberId: number,
  payload: UpdateTeamMemberRoleRequest,
): Promise<TeamMember> {
  return (await api.patch<TeamMember>(`${base(orgId)}${enc(teamId)}/members/${memberId}/`, payload))
    .data
}

export async function removeTeamMember(orgId: UUID, teamId: UUID, memberId: number): Promise<void> {
  await api.delete(`${base(orgId)}${enc(teamId)}/members/${memberId}/`)
}
