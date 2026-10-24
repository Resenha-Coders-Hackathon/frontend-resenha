import type { AppNotification } from '../types'

// O backend envia estes títulos em inglês; traduzimos os que ele gera hoje.
const titles: Record<string, string> = {
  'You were assigned to a task': 'Você foi atribuído a uma tarefa',
  'New comment on your task': 'Novo comentário na sua tarefa',
}

export function notificationTitle(title: string): string {
  const mention = title.match(/^(.+) mentioned you$/)
  return mention ? `${mention[1]} mencionou você` : (titles[title] ?? title)
}

export function notificationIcon(data: AppNotification['data']): string {
  if (data.channel_id) return 'alternate_email'
  if (data.task_id) return 'task_alt'
  return 'notifications'
}

// Para onde a notificação leva, a partir do que o backend guarda em `data`.
export function notificationPath(data: AppNotification['data']): string {
  if (data.channel_id) return '/chat'
  if (data.task_id) return '/kanban'
  return '/notificacoes'
}

export function relativeTime(date: string, now = Date.now()): string {
  const minutes = Math.round((now - new Date(date).getTime()) / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  return new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}
