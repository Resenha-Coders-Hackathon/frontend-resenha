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
