import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { listenForForegroundMessages, requestDeviceFcmToken } from '../composables'
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  registerDevice,
  unregisterDevice,
  sendNotification,
} from '../services'
import type { AppNotification, PushMessage } from '../types'

const TOKEN_KEY = 'resenha.pushToken'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  const hasMore = ref(false)
  const isLoading = ref(false)
  const error = ref('')
  const pushToken = ref('')
  const pushEnabled = computed(() => !!pushToken.value)
  const lastPush = ref<PushMessage | null>(null)
  const unreadOnly = ref(false)
  let page = 1
  let generation = 0
  let reloadRequested = false
  let stopForeground: (() => void) | undefined

  async function run<T>(action: () => Promise<T>, fallback: string): Promise<T | undefined> {
    const current = generation
    error.value = ''
    try {
      return await action()
    } catch (e) {
      if (current === generation) error.value = e instanceof Error ? e.message : fallback
    }
  }

  async function refreshUnreadCount(): Promise<void> {
    const current = generation
    await run(async () => {
      const result = await listNotifications({ unread: true })
      if (current === generation) unreadCount.value = result.count
    }, 'Não foi possível contar as notificações.')
  }

  async function load(unread = unreadOnly.value): Promise<void> {
    if (isLoading.value) {
      reloadRequested = true
      return
    }
    const current = generation
    unreadOnly.value = unread
    isLoading.value = true
    const loaded = await run(async () => {
      const result = await listNotifications({ unread })
      if (current !== generation) return
      items.value = result.results
      hasMore.value = !!result.next
      page = 1
      if (unread) unreadCount.value = result.count
      return true
    }, 'Não foi possível carregar as notificações.')
    if (current !== generation) return
    isLoading.value = false
    if (reloadRequested) {
      reloadRequested = false
      await load()
      return
    }
    if (loaded && !unread) await refreshUnreadCount()
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || isLoading.value) return
    const current = generation
    isLoading.value = true
    await run(async () => {
      const result = await listNotifications({ unread: unreadOnly.value, page: page + 1 })
      if (current !== generation) return
      items.value.push(...result.results)
      hasMore.value = !!result.next
      page += 1
    }, 'Não foi possível carregar mais notificações.')
    if (current !== generation) return
    isLoading.value = false
    if (reloadRequested) {
      reloadRequested = false
      await load()
    }
  }

  async function markAsRead(id: number): Promise<void> {
    const item = items.value.find((notification) => notification.id === id)
    if (item?.is_read) return
    const current = generation
    const done = await run(async () => {
      await markNotificationAsRead(id)
      return true
    }, 'Não foi possível marcar como lida.')
    if (!done || current !== generation) return
    if (item) item.is_read = true
    // Reading removes a row from the unread query and shifts offset pagination.
    if (unreadOnly.value) await load(true)
    else await refreshUnreadCount()
  }

  async function markAllAsRead(): Promise<void> {
    const current = generation
    const done = await run(async () => {
      await markAllNotificationsAsRead()
      return true
    }, 'Não foi possível marcar todas como lidas.')
    if (!done || current !== generation) return
    items.value.forEach((notification) => (notification.is_read = true))
    if (unreadOnly.value) items.value = []
    hasMore.value = unreadOnly.value ? false : hasMore.value
    unreadCount.value = 0
  }

  async function enablePush(): Promise<void> {
    const current = generation
    await run(async () => {
      const { token, messaging } = await requestDeviceFcmToken()
      if (current !== generation) return
      await registerDevice(token)
      if (current !== generation) {
        await unregisterDevice(token)
        return
      }
      const previous = localStorage.getItem(TOKEN_KEY)
      if (previous && previous !== token) await unregisterDevice(previous)
      localStorage.setItem(TOKEN_KEY, token)
      pushToken.value = token
      stopForeground?.()
      stopForeground = listenForForegroundMessages(messaging, (payload) => {
        lastPush.value = {
          title: payload.notification?.title ?? 'Nova notificação',
          body: payload.notification?.body ?? '',
          notification_id: payload.data?.notification_id,
        }
        void load()
      })
    }, 'Não foi possível ativar as notificações.')
  }

  async function restorePush(): Promise<void> {
    if (
      localStorage.getItem(TOKEN_KEY) &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      await enablePush()
    }
  }

  async function disablePush(): Promise<void> {
    const token = pushToken.value || localStorage.getItem(TOKEN_KEY)
    // Unregister before clearing local state so a failed logout can be retried.
    if (token) await unregisterDevice(token)
    localStorage.removeItem(TOKEN_KEY)
    stopForeground?.()
    stopForeground = undefined
    pushToken.value = ''
  }

  async function sendTest(): Promise<void> {
    if (!pushToken.value) return
    await sendNotification({
      token: pushToken.value,
      title: 'ResenhaCoders',
      body: 'As notificações deste navegador estão funcionando.',
    })
  }

  function reset(): void {
    generation += 1
    stopForeground?.()
    stopForeground = undefined
    items.value = []
    unreadCount.value = 0
    hasMore.value = false
    isLoading.value = false
    error.value = ''
    pushToken.value = ''
    lastPush.value = null
    unreadOnly.value = false
    page = 1
    reloadRequested = false
  }

  return {
    items,
    unreadCount,
    hasMore,
    isLoading,
    error,
    pushEnabled,
    lastPush,
    unreadOnly,
    load,
    loadMore,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    enablePush,
    restorePush,
    disablePush,
    sendTest,
    reset,
  }
})
