import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { listenForForegroundMessages, requestDeviceFcmToken } from '../composables'
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  registerDevice,
  unregisterDevice,
} from '../services'
import type { AppNotification, PushMessage } from '../types'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  const hasMore = ref(false)
  const isLoading = ref(false)
  const error = ref('')

  const pushToken = ref('')
  const pushEnabled = computed(() => !!pushToken.value)
  // Última push recebida com a aba aberta; a UI pode observar para mostrar um toast.
  const lastPush = ref<PushMessage | null>(null)
  let page = 1
  let stopForeground: (() => void) | undefined

  async function run<T>(action: () => Promise<T>, fallback: string): Promise<T | undefined> {
    error.value = ''
    try {
      return await action()
    } catch (e) {
      error.value = e instanceof Error ? e.message : fallback
    }
  }

  async function refreshUnreadCount(): Promise<void> {
    await run(async () => {
      unreadCount.value = (await listNotifications({ unread: true })).count
    }, 'Não foi possível contar as notificações.')
  }

  async function load(unread = false): Promise<void> {
    isLoading.value = true
    await run(async () => {
      const result = await listNotifications({ unread })
      items.value = result.results
      hasMore.value = !!result.next
      page = 1
    }, 'Não foi possível carregar as notificações.')
    isLoading.value = false
    if (!unread) await refreshUnreadCount()
  }

  async function loadMore(unread = false): Promise<void> {
    if (!hasMore.value || isLoading.value) return
    isLoading.value = true
    await run(async () => {
      const result = await listNotifications({ unread, page: page + 1 })
      items.value.push(...result.results)
      hasMore.value = !!result.next
      page += 1
    }, 'Não foi possível carregar mais notificações.')
    isLoading.value = false
  }

  async function markAsRead(id: number): Promise<void> {
    const item = items.value.find((notification) => notification.id === id)
    if (item?.is_read) return
    const done = await run(async () => {
      await markNotificationAsRead(id)
      return true
    }, 'Não foi possível marcar como lida.')
    if (!done) return
    if (item) item.is_read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  async function markAllAsRead(): Promise<void> {
    const done = await run(async () => {
      await markAllNotificationsAsRead()
      return true
    }, 'Não foi possível marcar todas como lidas.')
    if (!done) return
    items.value.forEach((notification) => (notification.is_read = true))
    unreadCount.value = 0
  }

  // Pede permissão, registra o token no backend e passa a escutar pushes em primeiro plano.
  async function enablePush(): Promise<void> {
    await run(async () => {
      const { token, messaging } = await requestDeviceFcmToken()
      await registerDevice(token)
      pushToken.value = token
      stopForeground?.()
      stopForeground = listenForForegroundMessages(messaging, (payload) => {
        lastPush.value = {
          title: payload.notification?.title ?? 'Nova notificação',
          body: payload.notification?.body ?? '',
        }
        void load()
      })
    }, 'Não foi possível ativar as notificações.')
  }

  // Chamar no logout: o backend pede para remover o token do dispositivo.
  async function disablePush(): Promise<void> {
    stopForeground?.()
    stopForeground = undefined
    const token = pushToken.value
    pushToken.value = ''
    if (token)
      await run(() => unregisterDevice(token), 'Não foi possível desativar as notificações.')
  }

  return {
    items,
    unreadCount,
    hasMore,
    isLoading,
    error,
    pushEnabled,
    lastPush,
    load,
    loadMore,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    enablePush,
    disablePush,
  }
})
