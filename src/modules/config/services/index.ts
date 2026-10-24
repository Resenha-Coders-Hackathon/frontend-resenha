import { api } from '@/app/plugins/axios'
import type { UserSettings } from '../types'
import { validateAvatar } from '../utils'

export async function uploadAvatar(file: File, signal?: AbortSignal): Promise<string> {
  validateAvatar(file)
  const payload = new FormData()
  payload.append('file', file)
  const response = await api.post<{ url: string; public_id: string }>('/uploads/', payload, {
    signal,
  })
  return response.data.url
}

export async function fetchSettings(): Promise<UserSettings> {
  return (await api.get<UserSettings>('/users/me/settings/')).data
}

export async function updateSettings(payload: Partial<UserSettings>): Promise<UserSettings> {
  return (await api.patch<UserSettings>('/users/me/settings/', payload)).data
}

export async function requestEmailChange(new_email: string): Promise<void> {
  await api.post('/email-change/request/', { new_email })
}

export async function verifyEmailChange(code: string): Promise<void> {
  await api.post('/email-change/verify/', { code })
}

export async function confirmEmailChange(code: string, password: string): Promise<void> {
  await api.post('/email-change/confirm/', { code, password })
}
