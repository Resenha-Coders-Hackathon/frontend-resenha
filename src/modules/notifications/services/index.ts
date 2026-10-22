import { api, getErrorMessage } from '@/app/plugins/axios'

export interface SendNotificationRequest {
  token: string
  title: string
  body: string
}

export async function sendNotification(payload: SendNotificationRequest): Promise<void> {
  try {
    await api.post('v1/notifications/send/', payload)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível enviar a notificação.'))
  }
}
