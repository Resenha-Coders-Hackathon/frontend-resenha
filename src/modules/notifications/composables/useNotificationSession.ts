import { onUnmounted, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useNotificationsStore } from '../stores'
import { desktopAlertsOn, showDesktopAlert, userAway } from './desktopAlerts'

export function useNotificationSession(userId: () => string | undefined): void {
  const notifications = useNotificationsStore()

  const stop = watch(
    userId,
    (id, _previous, onCleanup) => {
      notifications.reset()
      if (!id) return

      void notifications.refreshUnreadCount()
      void notifications.restorePush()
      let socket: WebSocket | undefined
      let retry: ReturnType<typeof setTimeout> | undefined
      let closed = false
      let delay = 1000

      function showToast(title: string, body: string, notificationId?: string): void {
        if (userAway() && desktopAlertsOn()) {
          showDesktopAlert({
            title,
            body,
            tag: `notification-${notificationId ?? title}`,
            onClick: () => window.location.assign('/notificacoes'),
          })
          return
        }
        toast(title, {
          id: notificationId ? `notification-${notificationId}` : undefined,
          description: body,
          action: {
            label: 'Ver',
            onClick: () => {
              window.location.assign('/notificacoes')
            },
          },
        })
      }

      const stopPush = watch(
        () => notifications.lastPush,
        (message) => {
          if (message) showToast(message.title, message.body, message.notification_id)
        },
      )

      function connect(): void {
        retry = undefined
        if (closed) return
        const url = new URL('/ws/', window.location.origin)
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
        socket = new WebSocket(url)
        socket.onopen = () => {
          delay = 1000
          void notifications.load()
        }
        socket.onmessage = (event) => {
          if (closed) return
          try {
            const payload = JSON.parse(event.data)
            if (payload.type !== 'notification.created') return
            void notifications.load()
            if (typeof payload.notification?.title === 'string') {
              showToast(
                payload.notification.title,
                payload.notification.message,
                String(payload.notification.id),
              )
            }
          } catch {
            /* Ignore unrelated or malformed websocket events. */
          }
        }
        socket.onclose = (event) => {
          if (closed || event.code === 4401) return
          retry = setTimeout(connect, delay)
          delay = Math.min(delay * 2, 30000)
        }
      }

      function refresh(): void {
        void notifications.refreshUnreadCount()
        if (socket?.readyState === WebSocket.CLOSED && !retry) connect()
      }

      connect()
      window.addEventListener('focus', refresh)
      onCleanup(() => {
        closed = true
        stopPush()
        clearTimeout(retry)
        socket?.close()
        window.removeEventListener('focus', refresh)
      })
    },
    { immediate: true },
  )

  onUnmounted(() => {
    stop()
    notifications.reset()
  })
}
