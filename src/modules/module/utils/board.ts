import type { TaskPriority } from '@/shared/types'
import type { Task } from '../types'

export interface BoardFilters {
  /** '' todos · 'me' minhas · 'none' sem responsável · ou o id de uma pessoa */
  assignee: string
  /** 'high+' = alta ou urgente */
  priority: '' | TaskPriority | 'high+'
  due: '' | 'overdue' | 'today' | 'week' | 'none'
}

export const NO_FILTERS: BoardFilters = { assignee: '', priority: '', due: '' }

export const activeFilters = (f: BoardFilters) => Object.values(f).filter(Boolean).length

const norm = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const isoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** Dias entre hoje e a entrega (negativo = já passou). */
export function daysUntil(due: string, now = new Date()): number {
  const day = 86_400_000
  return Math.round((Date.parse(`${due}T00:00:00Z`) - Date.parse(`${isoDay(now)}T00:00:00Z`)) / day)
}

export function dueLabel(task: Pick<Task, 'due_date' | 'completed_at'>, now = new Date()): string {
  if (!task.due_date || task.completed_at) return ''
  const days = daysUntil(task.due_date, now)
  if (days === 0) return 'vence hoje'
  const abs = Math.abs(days)
  const unit = abs === 1 ? 'dia' : 'dias'
  return days > 0 ? `faltam ${abs} ${unit}` : `atrasada há ${abs} ${unit}`
}

/** Aplica os filtros e a busca (título, descrição, responsável) às tarefas do quadro. */
export function filterTasks(
  tasks: Task[],
  filters: BoardFilters,
  search: string,
  userId: string | null,
  now = new Date(),
): Task[] {
  const needle = norm(search.trim())
  return tasks.filter((task) => {
    const { assignee, priority, due } = filters
    if (assignee === 'me' && task.assignee_id !== userId) return false
    if (assignee === 'none' && task.assignee_id) return false
    if (assignee && assignee !== 'me' && assignee !== 'none' && task.assignee_id !== assignee)
      return false
    if (priority === 'high+' && task.priority !== 'high' && task.priority !== 'urgent') return false
    if (priority && priority !== 'high+' && task.priority !== priority) return false
    if (due === 'overdue' && !task.is_overdue) return false
    if (due === 'none' && task.due_date) return false
    if (due === 'today' || due === 'week') {
      if (!task.due_date) return false
      const days = daysUntil(task.due_date, now)
      if (days < 0 || days > (due === 'today' ? 0 : 6)) return false
    }
    return (
      !needle ||
      norm(`${task.title} ${task.description} ${task.assignee_name ?? ''}`).includes(needle)
    )
  })
}

export type LinkOrigin = 'drive' | 'docs' | 'meet' | 'link'

export const LINK_ORIGINS: Record<LinkOrigin, { label: string; icon: string; color: string }> = {
  drive: { label: 'Google Drive', icon: 'folder', color: '#1e9e5a' },
  docs: { label: 'Google Docs', icon: 'description', color: '#2563eb' },
  meet: { label: 'Google Meet', icon: 'videocam', color: '#0e9488' },
  link: { label: 'Link', icon: 'link', color: '#8a857d' },
}

export function linkOrigin(url: string): LinkOrigin {
  try {
    const host = new URL(url).hostname
    if (host === 'drive.google.com') return 'drive'
    if (host === 'docs.google.com') return 'docs'
    if (host === 'meet.google.com') return 'meet'
  } catch {
    // url inválida cai em "link"
  }
  return 'link'
}
