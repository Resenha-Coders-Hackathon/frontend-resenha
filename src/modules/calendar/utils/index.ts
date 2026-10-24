import type { ISODate } from '@/shared/types'
import type { CalendarDay, CalendarItem, CalendarState } from '../types'

const DAY_MS = 86_400_000

// Datas ISO (YYYY-MM-DD) passam por UTC para o fuso do navegador não deslocar o dia.
const toIso = (time: number): ISODate => new Date(time).toISOString().slice(0, 10)
const fromIso = (date: ISODate): number => Date.parse(`${date}T00:00:00Z`)

export function todayIso(now = new Date()): ISODate {
  return toIso(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

/** Semanas (segunda a domingo) que cobrem o mês; `month` é 0–11. */
export function monthGrid(year: number, month: number): CalendarDay[][] {
  const first = Date.UTC(year, month, 1)
  const last = Date.UTC(year, month + 1, 0)
  const offset = (new Date(first).getUTCDay() + 6) % 7 // segunda = 0
  const start = first - offset * DAY_MS
  const weeks = Math.ceil((offset + (last - first) / DAY_MS + 1) / 7)

  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const time = start + (w * 7 + d) * DAY_MS
      const date = toIso(time)
      return {
        date,
        day: new Date(time).getUTCDate(),
        inMonth: new Date(time).getUTCMonth() === month,
      }
    }),
  )
}

/** Primeiro e último dia exibidos na grade: o intervalo a pedir ao backend. */
export function gridRange(weeks: CalendarDay[][]): { start: ISODate; end: ISODate } {
  return { start: weeks[0]![0]!.date, end: weeks.at(-1)!.at(-1)!.date }
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month + delta, 1))
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
}

export function monthTitle(year: number, month: number): string {
  const title = new Date(Date.UTC(year, month, 1)).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return title.charAt(0).toUpperCase() + title.slice(1)
}

export function groupByDate(items: CalendarItem[]): Map<ISODate, CalendarItem[]> {
  const byDate = new Map<ISODate, CalendarItem[]>()
  for (const item of items) byDate.set(item.due_date, [...(byDate.get(item.due_date) ?? []), item])
  return byDate
}

export const stateLabels: Record<CalendarState, string> = {
  done: 'Concluída',
  late: 'Atrasada',
  in_progress: 'Em andamento',
  todo: 'A fazer',
}
