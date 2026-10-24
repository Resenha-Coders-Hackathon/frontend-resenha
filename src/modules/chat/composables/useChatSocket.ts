import { onScopeDispose } from 'vue'
import type { UUID } from '@/shared/types'
import type { ChatEvent } from '../stores/chat'

const EVENTS = ['chat.message', 'chat.message_updated', 'chat.message_deleted', 'chat.typing']

/** Real-time chat events over /ws/ (reconnects with backoff). */
export function useChatSocket(onEvent: (event: ChatEvent) => void) {
  let socket: WebSocket | undefined
  let retry: ReturnType<typeof setTimeout> | undefined
  let closed = false
  let delay = 1000

  function connect(): void {
    retry = undefined
    if (closed) return
    const url = new URL('/ws/', window.location.origin)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    socket = new WebSocket(url)
    socket.onopen = () => {
      delay = 1000
    }
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (EVENTS.includes(payload?.type)) onEvent(payload)
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

  function sendTyping(channelId: UUID): void {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'chat.typing', channel_id: channelId }))
    }
  }

  function close(): void {
    closed = true
    clearTimeout(retry)
    socket?.close()
  }

  connect()
  onScopeDispose(close)
  return { sendTyping, close }
}
