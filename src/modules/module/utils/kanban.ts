import type { TaskPriority } from '../types'

export const priorityLabels: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

export function formatTaskDate(value: string | null, year = false): string {
  if (!value) return 'Sem prazo'
  // Date-only deadlines must not shift to the previous day in negative UTC offsets.
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) return 'Data inválida'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    ...(year ? { year: 'numeric' } : {}),
  })
    .format(date)
    .replaceAll(' de ', ' ')
    .replace('.', '')
}
