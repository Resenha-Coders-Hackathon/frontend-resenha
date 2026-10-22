import { api, getErrorMessage } from '@/app/plugins/axios'
import type { ListNotificationsParams, NotificationsPage } from '../types'

export interface SendNotificationRequest {
  token: string
  title: string
  body: string
}

export async function sendNotification(payload: SendNotificationRequest): Promise<void> {
  try {
    await api.post('/notifications/send/', payload)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível enviar a notificação.'))
  }
}

export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<NotificationsPage> {
  try {
    const { unread, page } = params
    const query = { ...(unread && { unread: 'true' }), ...(page && { page }) }
    return (await api.get<NotificationsPage>('/notifications/', { params: query })).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível carregar as notificações.'))
  }
}

export async function markNotificationAsRead(id: number): Promise<void> {
  try {
    await api.post(`/notifications/${id}/read/`)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível marcar como lida.'))
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await api.post('/notifications/read-all/')
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível marcar todas como lidas.'))
  }
}

export async function registerDevice(token: string): Promise<void> {
  try {
    await api.post('/notifications/devices/', { token })
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível registrar este dispositivo.'))
  }
}

export async function unregisterDevice(token: string): Promise<void> {
  try {
    await api.delete('/notifications/devices/', { data: { token } })
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível remover este dispositivo.'))
  }
}
