export interface SendNotificationRequest {
  token: string
  title: string
  body: string
}

const NOTIFICATIONS_PATH = '/notifications/send/'

function getNotificationsEndpoint(): URL {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (!apiBaseUrl) {
    throw new Error('Configure VITE_API_BASE_URL com a URL base do backend.')
  }

  try {
    return new URL(`${apiBaseUrl.replace(/\/+$/, '')}${NOTIFICATIONS_PATH}`)
  } catch {
    throw new Error('VITE_API_BASE_URL não contém uma URL válida.')
  }
}

// O backend autentica pelo cookie access_token e, nesse caso, exige o header CSRF em POST.
function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]!) : ''
}

export function validateNotificationsConfiguration(): void {
  getNotificationsEndpoint()
}

export async function sendNotification(payload: SendNotificationRequest): Promise<void> {
  const response = await fetch(getNotificationsEndpoint(), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    body: JSON.stringify(payload),
  })

  if (response.status === 401 || response.status === 403) {
    throw new Error('Sessão inválida ou expirada. Faça login no backend e tente novamente.')
  }

  if (!response.ok) {
    throw new Error(`O backend recusou o envio da notificação (HTTP ${response.status}).`)
  }
}
