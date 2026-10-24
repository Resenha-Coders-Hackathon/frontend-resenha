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

// Para onde a notificação leva, a partir do que o backend guarda em `data`.
export function notificationPath(data: AppNotification['data']): string {
  if (data.channel_id) return '/chat'
  return '/notificacoes'
}

export type NotificationKind = 'mention' | 'assigned' | 'comment' | 'other'

// O backend não manda um tipo: ele sai do que a notificação carrega.
export function notificationKind(item: Pick<AppNotification, 'title' | 'data'>): NotificationKind {
  if (item.data.channel_id) return 'mention'
  if (item.title === 'You were assigned to a task') return 'assigned'
  if (item.title === 'New comment on your task') return 'comment'
  return 'other'
}

export const kindIcons: Record<NotificationKind, string> = {
  mention: 'alternate_email',
  assigned: 'person_add',
  comment: 'chat_bubble',
  other: 'notifications',
}

// Quem fez a ação, quando o título o cita ("Ana mentioned you"); sem nome devolve null.
export function notificationActor(title: string): string | null {
  return title.match(/^(.+) mentioned you$/)?.[1] ?? null
}
