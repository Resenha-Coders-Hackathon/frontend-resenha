import type { ISODateTime } from '@/shared/types'

const AVATAR_COLORS = ['#1e9e5a', '#f0541e', '#2563eb', '#7c4dff', '#d97706', '#0e7490']

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')).toUpperCase()
}

// cores definidas no design para os membros de exemplo
const KNOWN_COLORS: Record<string, string> = {
  'Beatriz Costa': '#1e9e5a',
  'Marina Souza': '#f0541e',
  'Rafael Lima': '#2563eb',
  'Gustavo Rocha': '#7c4dff',
  'Camila Alves': '#d97706',
}

// cor estável por nome, para o mesmo autor ter sempre a mesma cor
export function avatarColor(name: string): string {
  if (KNOWN_COLORS[name]) return KNOWN_COLORS[name]
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]!
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function daysAgo(value: ISODateTime) {
  return Math.round((startOfDay(new Date()) - startOfDay(new Date(value))) / 86_400_000)
}

export function formatTime(value: ISODateTime): string {
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// horário na lista de conversas: hoje → 10:41, ontem → "ontem", depois → dia da semana
export function formatListTime(value: ISODateTime): string {
  const diff = daysAgo(value)
  if (diff === 0) return formatTime(value)
  if (diff === 1) return 'ontem'
  return new Date(value).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

export function formatDayLabel(value: ISODateTime): string {
  const diff = daysAgo(value)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
