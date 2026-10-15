export interface SendNotificationRequest {
  token: string
  title: string
  body: string
}

const NOTIFICATIONS_PATH = '/notifications'

interface NotificationsConfiguration {
  endpoint: URL
  accessToken: string
}

function getNotificationsConfiguration(): NotificationsConfiguration {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (!apiBaseUrl) {
    throw new Error('Configure VITE_API_BASE_URL com a URL base do backend.')
  }

  const accessToken = import.meta.env.VITE_NOTIFICATIONS_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('Configure VITE_NOTIFICATIONS_ACCESS_TOKEN para autenticar no backend.')
  }

  let endpoint: URL
  try {
    endpoint = new URL(`${apiBaseUrl.replace(/\/+$/, '')}${NOTIFICATIONS_PATH}`)
  } catch {
    throw new Error('VITE_API_BASE_URL não contém uma URL válida.')
  }

  return { endpoint, accessToken }
}

export function validateNotificationsConfiguration(): void {
  getNotificationsConfiguration()
}

export async function sendNotification(payload: SendNotificationRequest): Promise<void> {
  const { endpoint, accessToken } = getNotificationsConfiguration()

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`O backend recusou o envio da notificação (HTTP ${response.status}).`)
  }
}