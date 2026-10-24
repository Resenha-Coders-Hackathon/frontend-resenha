import { getCurrentScope, onScopeDispose } from 'vue'
import type { UUID } from '@/shared/types'
import type { ChatEvent } from '../stores/chat'

const EVENTS = ['chat.message', 'chat.message_updated', 'chat.message_deleted', 'chat.typing']

// One socket for the whole app: the layout listens for alerts and the chat screen sends typing.
let socket: WebSocket | undefined
let retry: ReturnType<typeof setTimeout> | undefined
let delay = 1000
const listeners = new Set<(event: ChatEvent) => void>()
const active = () => listeners.size > 0 || users > 0
let users = 0

function connect(): void {
  retry = undefined
  if (!active()) return
  const url = new URL('/ws/', window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  const current = new WebSocket(url)
  socket = current
  current.onopen = () => {
    delay = 1000
  }
  current.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data)
      if (EVENTS.includes(payload?.type)) listeners.forEach((listener) => listener(payload))
    } catch {
      /* Ignore unrelated or malformed websocket events. */
    }
  }
  current.onclose = (event) => {
    if (socket === current) socket = undefined
    if (!active() || event.code === 4401) return
    retry = setTimeout(connect, delay)
    delay = Math.min(delay * 2, 30000)
  }
}

/** Real-time chat events over /ws/ (shared socket, reconnects with backoff). */
export function useChatSocket(onEvent?: (event: ChatEvent) => void) {
  users += 1
  if (onEvent) listeners.add(onEvent)
  if (!socket && !retry) connect()

  function sendTyping(channelId: UUID): void {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'chat.typing', channel_id: channelId }))
    }
  }

  function close(): void {
    if (onEvent) listeners.delete(onEvent)
    users = Math.max(0, users - 1)
    if (active()) return
    clearTimeout(retry)
    retry = undefined
    socket?.close()
    socket = undefined
  }

  if (getCurrentScope()) onScopeDispose(close)
  return { sendTyping, close }
}
