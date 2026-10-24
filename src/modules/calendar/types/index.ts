import type { ISODate, UUID } from '@/shared/types'

/** Cor da entrega no calendário: concluída, atrasada, em andamento ou a fazer. */
export type CalendarState = 'done' | 'late' | 'in_progress' | 'todo'

/** GET /organizations/:id/calendar/ — entregas dos setores que o usuário vê. */
export interface CalendarItem {
  id: UUID
  title: string
  due_date: ISODate
  state: CalendarState
  sector_id: UUID
  sector_name: string
  /** Já está no meu Google Agenda. */
  in_google: boolean
  assignee_name: string | null
}

export interface CalendarDay {
  date: ISODate
  day: number
  inMonth: boolean
}
