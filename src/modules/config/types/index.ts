export type ConfigTabId = 'profile' | 'notifications' | 'security' | 'preferences' | 'organization'

export interface ConfigTab {
  id: ConfigTabId
  label: string
  title: string
  description: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface ProfileForm {
  name: string
  email: string
  timezone: string
  language: string
  bio: string
  avatar_url: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  locale: string
  timezone: string
  push_enabled: boolean
  email_product: boolean
  email_weekly_digest: boolean
  email_security: boolean
  email_assigned: boolean
  email_mentions: boolean
  email_deadlines: boolean
  app_comments: boolean
  app_status: boolean
  app_ai: boolean
  date_format: DateFormat
  week_start: WeekStart
  compact_cards: boolean
  show_completed: boolean
}

export interface NotificationSettings {
  email_product: boolean
  email_weekly_digest: boolean
  email_security: boolean
  email_assigned: boolean
  email_mentions: boolean
  email_deadlines: boolean
  app_comments: boolean
  app_status: boolean
  app_ai: boolean
  push_enabled: boolean
}

export interface PasswordForm {
  current: string
  next: string
  confirmation: string
}

export interface ActiveSession {
  id: number
  device: string
  detail: string
  current: boolean
}

export interface PreferenceSettings {
  theme: UserSettings['theme']
  date_format: UserSettings['date_format']
  week_start: UserSettings['week_start']
  compact_cards: boolean
  show_completed: boolean
}

export type DateFormat = 'dd/mm/yyyy' | 'yyyy-mm-dd' | 'long'
export type WeekStart = 'sunday' | 'monday'
