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

export function relativeTime(date: string, now = Date.now()): string {
  const minutes = Math.round((now - new Date(date).getTime()) / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  const days = Math.round(hours / 24)
  return days === 1 ? 'ontem' : `há ${days} dias`
}

const AVATAR_COLORS = ['#f0541e', '#1e9e5a', '#2563eb', '#7c4dff', '#d97706', '#0e9488']

// Quem fez a ação, quando o título o cita ("Ana mentioned you"); sem nome devolve null.
export function notificationActor(title: string): string | null {
  return title.match(/^(.+) mentioned you$/)?.[1] ?? null
}

export function actorAvatar(name: string): { initials: string; color: string } {
  const parts = name.trim().split(/\s+/)
  const initials = (
    (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')
  ).toUpperCase()
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return { initials, color: AVATAR_COLORS[hash % AVATAR_COLORS.length]! }
}
