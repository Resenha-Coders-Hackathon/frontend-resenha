import type { Task } from '../types'

export type BoardFilter = 'all' | 'mine' | 'overdue' | 'high'

const norm = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Aplica o chip de filtro e a busca (título, descrição, responsável) às tarefas do quadro. */
export function filterTasks(
  tasks: Task[],
  filter: BoardFilter,
  search: string,
  userId: string | null,
): Task[] {
  const needle = norm(search.trim())
  return tasks.filter((task) => {
    if (filter === 'mine' && task.assignee_id !== userId) return false
    if (filter === 'overdue' && !task.is_overdue) return false
    if (filter === 'high' && task.priority !== 'high' && task.priority !== 'urgent') return false
    return (
      !needle ||
      norm(`${task.title} ${task.description} ${task.assignee_name ?? ''}`).includes(needle)
    )
  })
}
