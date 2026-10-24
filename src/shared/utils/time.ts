/** "agora", "há 12 min", "há 3 h", "ontem", "há 4 dias". */
export function relativeTime(date: string, now = Date.now()): string {
  const minutes = Math.round((now - new Date(date).getTime()) / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  const days = Math.round(hours / 24)
  return days === 1 ? 'ontem' : `há ${days} dias`
}
