export interface AppNotification {
  id: number
  title: string
  message: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

// Resposta paginada do DRF (PAGE_SIZE = 20 no backend).
export interface NotificationsPage {
  count: number
  next: string | null
  previous: string | null
  results: AppNotification[]
}

export interface ListNotificationsParams {
  unread?: boolean
  page?: number
}

export interface PushMessage {
  title: string
  body: string
}

export interface DeviceTokenRequest {
  token: string
}
export interface SendPushRequest {
  token: string
  title: string
  body?: string
}
