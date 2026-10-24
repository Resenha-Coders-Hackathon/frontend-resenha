import type { TaskPriority } from '@/shared/types'

// barras de prioridade como no design (1 a 3); "urgente" usa as 3 em vermelho
export const PRIORITIES: { value: TaskPriority; label: string; bars: number; color: string }[] = [
  { value: 'low', label: 'Baixa', bars: 1, color: '#8a857d' },
  { value: 'medium', label: 'Média', bars: 2, color: '#c9720a' },
  { value: 'high', label: 'Alta', bars: 3, color: '#c9720a' },
  { value: 'urgent', label: 'Urgente', bars: 3, color: '#d02b1f' },
]

export const priorityOf = (value: TaskPriority) => PRIORITIES.find((p) => p.value === value)!

/** "2026-10-27" → "27 out" */
export function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '')
}
