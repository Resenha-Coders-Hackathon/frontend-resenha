import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchAllPages } from '@/shared/utils'
import {
  createSector,
  createStatus,
  createTask,
  deleteSector,
  deleteStatus,
  deleteTask,
  getSectorProgress,
  listSectors,
  listStatuses,
  listTasks,
  moveTask,
  updateSector,
  updateStatus,
  updateTask,
} from '../services'
import type {
  CreateSectorRequest,
  CreateStatusRequest,
  CreateTaskRequest,
  Sector,
  SectorProgress,
  Status,
  Task,
  UpdateSectorRequest,
  UpdateStatusRequest,
  UpdateTaskRequest,
} from '../types'

export const useSectorsStore = defineStore('sectors', () => {
  const sectors = ref<Sector[]>([])
  const organizationId = ref<string | null>(null)

  async function load(orgId: string): Promise<void> {
    // limpa antes de buscar: evita mostrar setores de outra organização
    if (organizationId.value !== orgId) sectors.value = []
    organizationId.value = orgId
    const items = await fetchAllPages((page) => listSectors(orgId, page))
    if (organizationId.value === orgId) sectors.value = items
  }

  async function create(orgId: string, payload: CreateSectorRequest): Promise<Sector> {
    const created = await createSector(orgId, payload)
    if (organizationId.value === orgId) sectors.value = [...sectors.value, created]
    return created
  }

  async function update(id: string, payload: UpdateSectorRequest): Promise<Sector> {
    const updated = await updateSector(id, payload)
    sectors.value = sectors.value.map((s) => (s.id === id ? updated : s))
    return updated
  }

  async function remove(id: string): Promise<void> {
    await deleteSector(id)
    sectors.value = sectors.value.filter((s) => s.id !== id)
  }

  const progress = (id: string): Promise<SectorProgress> => getSectorProgress(id)

  return { sectors, organizationId, load, create, update, remove, progress }
})

// Quadro (colunas + tasks) de um setor por vez.
export const useKanbanStore = defineStore('kanban', () => {
  const sectorId = ref<string | null>(null)
  const statuses = ref<Status[]>([])
  const tasks = ref<Task[]>([])

  async function load(id: string): Promise<void> {
    if (sectorId.value !== id) {
      statuses.value = []
      tasks.value = []
    }
    sectorId.value = id
    const [loadedStatuses, loadedTasks] = await Promise.all([
      fetchAllPages((page) => listStatuses(id, page)),
      fetchAllPages((page) => listTasks(id, { page, ordering: 'position' })),
    ])
    if (sectorId.value !== id) return
    statuses.value = [...loadedStatuses].sort((a, b) => a.position - b.position)
    tasks.value = loadedTasks
  }

  const tasksByStatus = (statusId: string) =>
    tasks.value.filter((t) => t.status_id === statusId).sort((a, b) => a.position - b.position)

  async function addStatus(payload: CreateStatusRequest): Promise<Status> {
    const created = await createStatus(requireSector(), payload)
    statuses.value = [...statuses.value, created].sort((a, b) => a.position - b.position)
    return created
  }

  async function removeStatus(statusId: string): Promise<void> {
    await deleteStatus(requireSector(), statusId)
    statuses.value = statuses.value.filter((s) => s.id !== statusId)
  }

  async function editStatus(id: string, payload: UpdateStatusRequest): Promise<Status> {
    const sector = requireSector()
    const previousCategory = statuses.value.find((status) => status.id === id)?.category
    const updated = await updateStatus(sector, id, payload)
    if (sectorId.value === sector) {
      statuses.value = statuses.value
        .map((status) => (status.id === id ? updated : status))
        .sort((a, b) => a.position - b.position)
      // The backend synchronizes completion dates when a column changes category.
      if (previousCategory !== updated.category) {
        const refreshed = await fetchAllPages((page) =>
          listTasks(sector, { page, ordering: 'position' }),
        )
        if (sectorId.value === sector) tasks.value = refreshed
      }
    }
    return updated
  }

  async function addTask(payload: CreateTaskRequest): Promise<Task> {
    const created = await createTask(requireSector(), payload)
    tasks.value = [...tasks.value, created]
    return created
  }

  async function editTask(id: string, payload: UpdateTaskRequest): Promise<Task> {
    return replace(await updateTask(id, payload))
  }

  async function removeTask(id: string): Promise<void> {
    await deleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  // Atualização otimista; em erro volta ao estado anterior e relança.
  async function move(id: string, statusId: string, position?: number): Promise<Task> {
    const sector = requireSector()
    const previous = tasks.value
    const current = previous.find((t) => t.id === id)
    if (!current) throw new Error('Tarefa não encontrada.')
    const status = statuses.value.find((item) => item.id === statusId)
    if (!status) throw new Error('Coluna não encontrada.')
    const siblings = tasksByStatus(statusId).filter((task) => task.id !== id)
    if (current.status_id !== statusId && status.wip_limit && siblings.length >= status.wip_limit) {
      throw new Error(
        'Esta coluna atingiu o limite de tarefas. Aumente o limite ou mova uma tarefa.',
      )
    }
    const targetPosition = Math.max(0, Math.min(position ?? siblings.length, siblings.length))
    const completedAt =
      status.category === 'done' ? (current.completed_at ?? new Date().toISOString()) : null
    siblings.splice(targetPosition, 0, {
      ...current,
      status_id: statusId,
      completed_at: completedAt,
      is_overdue: completedAt ? false : current.is_overdue,
    })
    const ordered = new Map(siblings.map((task, index) => [task.id, { ...task, position: index }]))
    tasks.value = tasks.value.map((task) => ordered.get(task.id) ?? task)
    try {
      const moved = await moveTask(id, { status: statusId, position: targetPosition })
      return sectorId.value === sector ? replace(moved) : moved
    } catch (error) {
      if (sectorId.value === sector) tasks.value = previous
      throw error
    }
  }

  function replace(task: Task): Task {
    tasks.value = tasks.value.map((t) => (t.id === task.id ? task : t))
    return task
  }

  function requireSector(): string {
    if (!sectorId.value) throw new Error('Nenhum setor carregado.')
    return sectorId.value
  }

  return {
    sectorId,
    statuses,
    tasks,
    load,
    tasksByStatus,
    addStatus,
    editStatus,
    removeStatus,
    addTask,
    editTask,
    removeTask,
    move,
  }
})
