export type ConfigTabId = 'profile' | 'notifications' | 'security' | 'preferences'

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
  firstName: string
  lastName: string
  email: string
  role: string
  timezone: string
  language: string
  bio: string
}

export interface NotificationSettings {
  emailAssigned: boolean
  emailMentions: boolean
  emailDeadlines: boolean
  emailDigest: boolean
  appComments: boolean
  appStatus: boolean
  appAi: boolean
}

export interface PasswordForm {
  current: string
  next: string
  confirmation: string
}

export interface ActiveSession {
  id: string
  device: string
  detail: string
  current: boolean
}

export interface PreferenceSettings {
  theme: 'light' | 'dark'
  dateFormat: string
  weekStart: string
  compactCards: boolean
  showCompleted: boolean
}
