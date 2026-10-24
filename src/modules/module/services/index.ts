import { api } from '@/app/plugins/axios'
import type { Page } from '@/shared/types'
import type {
  AddSectorMemberRequest,
  ChecklistItem,
  Comment,
  AddSectorTeamRequest,
  Charge,
  ChargeResult,
  ContributionStatus,
  CreateChargeRequest,
  CreateChecklistItemRequest,
  CreateResourceLinkRequest,
  CreateSectorRequest,
  CreateStatusRequest,
  CreateTaskRequest,
  Dashboard,
  MoveTaskRequest,
  PayChargeRequest,
  PayChargeResponse,
  ResourceLink,
  Sector,
  SectorMember,
  SectorRole,
  SectorTeam,
  SectorProgress,
  Status,
  Task,
  TaskFilters,
  UpdateChecklistItemRequest,
  UpdateSectorRequest,
  UpdateStatusRequest,
  UpdateTaskRequest,
} from '../types'

const enc = encodeURIComponent

// ── Setores ────────────────────────────────────────────────────────────────
export async function listSectors(organizationId: string, page = 1): Promise<Page<Sector>> {
  return (
    await api.get<Page<Sector>>(`/organizations/${enc(organizationId)}/sectors/`, {
      params: { page },
    })
  ).data
}

export async function createSector(
  organizationId: string,
  payload: CreateSectorRequest,
): Promise<Sector> {
  return (await api.post<Sector>(`/organizations/${enc(organizationId)}/sectors/`, payload)).data
}

export async function getSector(id: string): Promise<Sector & { my_role: SectorRole }> {
  return (await api.get<Sector & { my_role: SectorRole }>(`/sectors/${enc(id)}/`)).data
}

export async function updateSector(id: string, payload: UpdateSectorRequest): Promise<Sector> {
  return (await api.patch<Sector>(`/sectors/${enc(id)}/`, payload)).data
}

export async function deleteSector(id: string): Promise<void> {
  await api.delete(`/sectors/${enc(id)}/`)
}

export async function getSectorProgress(id: string): Promise<SectorProgress> {
  return (await api.get<SectorProgress>(`/sectors/${enc(id)}/progress/`)).data
}

export async function listSectorMembers(id: string, page = 1): Promise<Page<SectorMember>> {
  return (await api.get<Page<SectorMember>>(`/sectors/${enc(id)}/members/`, { params: { page } }))
    .data
}

export async function addSectorMember(
  id: string,
  payload: AddSectorMemberRequest,
): Promise<SectorMember> {
  return (await api.post<SectorMember>(`/sectors/${enc(id)}/members/`, payload)).data
}

export async function removeSectorMember(id: string, memberId: number): Promise<void> {
  await api.delete(`/sectors/${enc(id)}/members/${memberId}/`)
}

export async function updateSectorMember(
  id: string,
  memberId: number,
  role: SectorRole,
): Promise<SectorMember> {
  return (await api.patch<SectorMember>(`/sectors/${enc(id)}/members/${memberId}/`, { role })).data
}

export async function updateSectorTeam(
  id: string,
  linkId: number,
  role: SectorRole,
): Promise<SectorTeam> {
  return (await api.patch<SectorTeam>(`/sectors/${enc(id)}/teams/${linkId}/`, { role })).data
}

// ── Colunas (status) ───────────────────────────────────────────────────────
export async function listStatuses(sectorId: string, page = 1): Promise<Page<Status>> {
  return (await api.get<Page<Status>>(`/sectors/${enc(sectorId)}/statuses/`, { params: { page } }))
    .data
}

export async function createStatus(
  sectorId: string,
  payload: CreateStatusRequest,
): Promise<Status> {
  return (await api.post<Status>(`/sectors/${enc(sectorId)}/statuses/`, payload)).data
}

export async function updateStatus(
  sectorId: string,
  statusId: string,
  payload: UpdateStatusRequest,
): Promise<Status> {
  return (await api.patch<Status>(`/sectors/${enc(sectorId)}/statuses/${enc(statusId)}/`, payload))
    .data
}

export async function deleteStatus(sectorId: string, statusId: string): Promise<void> {
  await api.delete(`/sectors/${enc(sectorId)}/statuses/${enc(statusId)}/`)
}

// ── Tasks ──────────────────────────────────────────────────────────────────
export async function listTasks(sectorId: string, filters: TaskFilters = {}): Promise<Page<Task>> {
  return (await api.get<Page<Task>>(`/sectors/${enc(sectorId)}/tasks/`, { params: filters })).data
}

export async function createTask(sectorId: string, payload: CreateTaskRequest): Promise<Task> {
  return (await api.post<Task>(`/sectors/${enc(sectorId)}/tasks/`, payload)).data
}

export async function getTask(id: string): Promise<Task> {
  return (await api.get<Task>(`/tasks/${enc(id)}/`)).data
}

export async function updateTask(id: string, payload: UpdateTaskRequest): Promise<Task> {
  return (await api.patch<Task>(`/tasks/${enc(id)}/`, payload)).data
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${enc(id)}/`)
}

export async function moveTask(id: string, payload: MoveTaskRequest): Promise<Task> {
  return (await api.post<Task>(`/tasks/${enc(id)}/move/`, payload)).data
}

// ── Checklist e comentários ────────────────────────────────────────────────
export async function listChecklist(taskId: string, page = 1): Promise<Page<ChecklistItem>> {
  return (
    await api.get<Page<ChecklistItem>>(`/tasks/${enc(taskId)}/checklist/`, { params: { page } })
  ).data
}

export async function createChecklistItem(
  taskId: string,
  payload: CreateChecklistItemRequest,
): Promise<ChecklistItem> {
  return (await api.post<ChecklistItem>(`/tasks/${enc(taskId)}/checklist/`, payload)).data
}

export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  payload: UpdateChecklistItemRequest,
): Promise<ChecklistItem> {
  return (
    await api.patch<ChecklistItem>(`/tasks/${enc(taskId)}/checklist/${enc(itemId)}/`, payload)
  ).data
}

export async function deleteChecklistItem(taskId: string, itemId: string): Promise<void> {
  await api.delete(`/tasks/${enc(taskId)}/checklist/${enc(itemId)}/`)
}

export async function listComments(taskId: string, page = 1): Promise<Page<Comment>> {
  return (await api.get<Page<Comment>>(`/tasks/${enc(taskId)}/comments/`, { params: { page } }))
    .data
}

export async function createComment(taskId: string, content: string): Promise<Comment> {
  return (await api.post<Comment>(`/tasks/${enc(taskId)}/comments/`, { content })).data
}

export async function deleteComment(taskId: string, commentId: string): Promise<void> {
  await api.delete(`/tasks/${enc(taskId)}/comments/${enc(commentId)}/`)
}

export async function updateComment(
  taskId: string,
  commentId: string,
  content: string,
): Promise<Comment> {
  return (
    await api.patch<Comment>(`/tasks/${enc(taskId)}/comments/${enc(commentId)}/`, { content })
  ).data
}

// ── Papéis e times do setor ────────────────────────────────────────────────
export async function updateSectorMemberRole(
  sectorId: string,
  memberId: number,
  role: SectorRole,
): Promise<SectorMember> {
  return (await api.patch<SectorMember>(`/sectors/${enc(sectorId)}/members/${memberId}/`, { role }))
    .data
}

export async function listSectorTeams(sectorId: string, page = 1): Promise<Page<SectorTeam>> {
  return (await api.get<Page<SectorTeam>>(`/sectors/${enc(sectorId)}/teams/`, { params: { page } }))
    .data
}

export async function addSectorTeam(
  sectorId: string,
  payload: AddSectorTeamRequest,
): Promise<SectorTeam> {
  return (await api.post<SectorTeam>(`/sectors/${enc(sectorId)}/teams/`, payload)).data
}

export async function removeSectorTeam(sectorId: string, linkId: number): Promise<void> {
  await api.delete(`/sectors/${enc(sectorId)}/teams/${linkId}/`)
}

// ── Links de apoio (tarefa, setor ou organização) ──────────────────────────
export type LinkTarget = 'task' | 'sector' | 'organization'

const LINK_PATH: Record<LinkTarget, (id: string) => string> = {
  task: (id) => `/tasks/${enc(id)}/links/`,
  sector: (id) => `/sectors/${enc(id)}/links/`,
  organization: (id) => `/organizations/${enc(id)}/links/`,
}

export async function listLinks(
  target: LinkTarget,
  id: string,
  page = 1,
): Promise<Page<ResourceLink>> {
  return (await api.get<Page<ResourceLink>>(LINK_PATH[target](id), { params: { page } })).data
}

export async function createLink(
  target: LinkTarget,
  id: string,
  payload: CreateResourceLinkRequest,
): Promise<ResourceLink> {
  return (await api.post<ResourceLink>(LINK_PATH[target](id), payload)).data
}

export async function deleteLink(linkId: string): Promise<void> {
  await api.delete(`/links/${enc(linkId)}/`)
}

// ── Cobranças da tarefa (vaquinha paga por Pix) ───────────────────────────
export async function listCharges(taskId: string): Promise<Charge[]> {
  return (await api.get<Page<Charge>>(`/tasks/${enc(taskId)}/campaigns/`)).data.results
}

export async function createCharge(taskId: string, payload: CreateChargeRequest): Promise<Charge> {
  return (await api.post<Charge>(`/tasks/${enc(taskId)}/campaigns/`, payload)).data
}

export async function payCharge(
  chargeId: string,
  payload: PayChargeRequest,
): Promise<PayChargeResponse> {
  return (await api.post<PayChargeResponse>(`/campaigns/${enc(chargeId)}/contributions/`, payload))
    .data
}

/** O backend confirma com o Mercado Pago (webhook ou consulta) e devolve o resultado. */
export async function getChargeResult(contributionId: string): Promise<ChargeResult> {
  return (await api.get<ContributionStatus>(`/contributions/${enc(contributionId)}/`)).data.result
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export async function getDashboard(organizationId: string): Promise<Dashboard> {
  return (await api.get<Dashboard>(`/organizations/${enc(organizationId)}/dashboard/`)).data
}
