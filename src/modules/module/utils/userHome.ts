import type { BadgeTone } from './ui'
import type { Dashboard } from '../types'

const dayMs = 86_400_000

export function kpis(d: Dashboard, unreadNotifications: number) {
  const delta = d.done_this_week - d.done_last_week
  return [
    {
      title: 'Minhas tarefas abertas',
      data: String(d.open_tasks),
      description: `${d.due_this_week} vencem esta semana`,
    },
    {
      title: 'Concluídas na semana',
      data: String(d.done_this_week),
      description:
        delta === 0
          ? 'Igual à semana anterior'
          : `${delta > 0 ? '+' : ''}${delta} em relação à anterior`,
    },
    {
      title: 'Atrasadas',
      data: String(d.overdue),
      description: d.overdue_title ?? 'Nada atrasado',
    },
    {
      title: 'Notificações não lidas',
      data: String(unreadNotifications),
      description: unreadNotifications ? 'Veja em Notificações' : 'Tudo em dia',
    },
  ]
}

// `today` é a data local de referência (YYYY-MM-DD); due_date vem sem fuso.
export function dueBadge(
  dueDate: string,
  isOverdue: boolean,
  today: string,
): { label: string; tone: BadgeTone } {
  if (isOverdue) return { label: 'Atrasada', tone: 'danger' }
  const days = Math.round((Date.parse(dueDate) - Date.parse(today)) / dayMs)
  return days === 0 ? { label: 'Hoje', tone: 'warning' } : { label: 'Amanhã', tone: 'neutral' }
}

export function weekLabel(weekStart: string): string {
  return new Date(`${weekStart}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}
