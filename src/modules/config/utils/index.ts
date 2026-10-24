import type { UpdateUserRequest } from '@/modules/auth'
import type { NotificationSettings, ProfileForm, UserSettings } from '../types/index.ts'

export function profileName(value: string): string {
  const name = value.trim()
  if (!name) throw new Error('Informe seu nome.')
  if (name.length > 255) throw new Error('O nome deve ter no máximo 255 caracteres.')
  return name
}

export const AVATAR_MAX_SIZE = 10 * 1024 * 1024

export function validateAvatar(file: Pick<File, 'type' | 'size'>): void {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Escolha uma imagem JPG, PNG ou WebP.')
  }
  if (!file.size) throw new Error('A imagem está vazia. Escolha outro arquivo.')
  if (file.size > AVATAR_MAX_SIZE) throw new Error('A imagem deve ter no máximo 10 MB.')
}

export function profilePayload(profile: ProfileForm): UpdateUserRequest {
  return {
    name: profileName(profile.name),
    bio: profile.bio,
    avatar_url: profile.avatar_url.trim(),
  }
}

export function notificationSettings(settings: UserSettings): NotificationSettings {
  return {
    email_product: settings.email_product,
    email_weekly_digest: settings.email_weekly_digest,
    email_security: settings.email_security,
    email_assigned: settings.email_assigned,
    email_mentions: settings.email_mentions,
    email_deadlines: settings.email_deadlines,
    app_comments: settings.app_comments,
    app_status: settings.app_status,
    app_ai: settings.app_ai,
    push_enabled: settings.push_enabled,
  }
}
