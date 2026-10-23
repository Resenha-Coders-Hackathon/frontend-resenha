import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UUID } from '@/shared/types'
import {
  createTeamsChannel,
  deleteMessage,
  editMessage,
  listChannels,
  listMessages,
  listOnlineMembers,
  markRead,
  openDirect,
  sendMessage,
  startMeet,
} from '../services'
import type { ChatChannel, ChatMessage, WriteChatMessageRequest } from '../types'

const TYPING_MS = 4000

export type ChatEvent =
  | {
      type: 'chat.message' | 'chat.message_updated' | 'chat.message_deleted'
      channel_id: UUID
      message: ChatMessage
    }
  | { type: 'chat.typing'; channel_id: UUID; user_id: UUID; name: string }

export const useChatStore = defineStore('chat', () => {
  const organizationId = ref<UUID | null>(null)
  const channels = ref<ChatChannel[]>([])
  // chronological (oldest first) per channel
  const messages = ref<Record<UUID, ChatMessage[]>>({})
  const activeId = ref<UUID | null>(null)
  const typing = ref<Record<UUID, string>>({})
  const error = ref('')
  // ids of the organization members online (refreshPresence)
  const online = ref<UUID[]>([])
  // next page of older messages per channel (absent: nothing more to load)
  const olderPage = ref<Record<UUID, number>>({})
  const timers = new Map<UUID, ReturnType<typeof setTimeout>>()
  let generation = 0

  function reset(): void {
    generation += 1
    timers.forEach(clearTimeout)
    timers.clear()
    organizationId.value = null
    channels.value = []
    messages.value = {}
    activeId.value = null
    typing.value = {}
    online.value = []
    olderPage.value = {}
    error.value = ''
  }

  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    const current = generation
    try {
      return await action()
    } catch (e) {
      if (current === generation) error.value = e instanceof Error ? e.message : 'Erro no chat.'
    }
  }

  async function refreshChannels(): Promise<void> {
    const orgId = organizationId.value
    if (!orgId) return
    const current = generation
    const loaded = await run(() => listChannels(orgId))
    if (loaded && current === generation) channels.value = loaded
  }

  /** Loads the channels of an organization and opens a direct chat with each other member. */
  async function load(orgId: UUID, otherUserIds: UUID[] = []): Promise<void> {
    if (organizationId.value !== orgId) reset()
    organizationId.value = orgId
    const current = generation
    error.value = ''
    // opening is idempotent on the backend; failures here must not hide the channel list
    await Promise.all(otherUserIds.map((id) => run(() => openDirect(orgId, id))))
    if (current !== generation) return
    await refreshChannels()
    if (current === generation && !channels.value.some((c) => c.id === activeId.value)) {
      const first = channels.value[0]
      if (first) await select(first.id)
    }
  }

  async function loadMessages(channelId: UUID): Promise<void> {
    const current = generation
    const page = await run(() => listMessages(channelId))
    if (!page || current !== generation) return
    if (page.next) olderPage.value[channelId] = 2
    else delete olderPage.value[channelId]
    const fetched = [...page.results].reverse()
    // keep anything pushed over the socket while the request was in flight
    const known = new Set(fetched.map((m) => m.id))
    const extra = (messages.value[channelId] ?? []).filter((m) => !known.has(m.id))
    messages.value[channelId] = [...fetched, ...extra]
  }

  async function select(channelId: UUID): Promise<void> {
    activeId.value = channelId
    const channel = channels.value.find((c) => c.id === channelId)
    if (channel) channel.unread_count = 0
    await loadMessages(channelId)
    if (activeId.value === channelId) await run(() => markRead(channelId))
  }

  function upsert(channelId: UUID, message: ChatMessage): void {
    const list = (messages.value[channelId] ??= [])
    const index = list.findIndex((m) => m.id === message.id)
    if (index >= 0) list[index] = message
    else list.push(message)
  }

  function touchChannel(channelId: UUID, message: ChatMessage, mine: boolean): void {
    const channel = channels.value.find((c) => c.id === channelId)
    if (!channel) return
    channel.last_message = {
      id: message.id,
      author_name: message.author_name,
      content: mine && channel.kind === 'direct' ? `Você: ${message.content}` : message.content,
      has_attachments: message.attachments.length > 0,
      created_at: message.created_at,
    }
  }

  /** `content` may be empty when files are attached. */
  async function send(
    content: string,
    extra: Omit<WriteChatMessageRequest, 'content'> = {},
  ): Promise<void> {
    const channelId = activeId.value
    const text = content.trim()
    if (!channelId || (!text && !extra.files?.length)) return
    const message = await run(() => sendMessage(channelId, text, extra))
    if (!message) return
    upsert(channelId, message)
    touchChannel(channelId, message, true)
  }

  /** Loads the next page of older messages of the active channel; false when there is nothing more. */
  async function loadOlder(): Promise<boolean> {
    const channelId = activeId.value
    const page = channelId ? olderPage.value[channelId] : undefined
    if (!channelId || !page) return false
    const current = generation
    const result = await run(() => listMessages(channelId, page))
    if (!result || current !== generation) return false
    const known = new Set((messages.value[channelId] ?? []).map((m) => m.id))
    const older = [...result.results].reverse().filter((m) => !known.has(m.id))
    messages.value[channelId] = [...older, ...(messages.value[channelId] ?? [])]
    if (result.next) olderPage.value[channelId] = page + 1
    else delete olderPage.value[channelId]
    return true
  }

  function hasOlder(channelId: UUID): boolean {
    return !!olderPage.value[channelId]
  }

  async function edit(messageId: UUID, content: string): Promise<boolean> {
    const channelId = activeId.value
    const text = content.trim()
    if (!channelId || !text) return false
    const message = await run(() => editMessage(messageId, text))
    if (message) upsert(channelId, message)
    return !!message
  }

  async function remove(messageId: UUID): Promise<boolean> {
    const channelId = activeId.value
    if (!channelId) return false
    const done = await run(async () => {
      await deleteMessage(messageId)
      return true
    })
    if (done) {
      messages.value[channelId] = (messages.value[channelId] ?? []).filter(
        (m) => m.id !== messageId,
      )
    }
    return !!done
  }

  /** Creates a conversation shared by two or more teams and selects it. */
  async function openTeamsChannel(
    teamIds: UUID[],
    name?: string,
  ): Promise<ChatChannel | undefined> {
    const orgId = organizationId.value
    if (!orgId) return
    const channel = await run(() => createTeamsChannel(orgId, { team_ids: teamIds, name }))
    if (!channel) return
    await refreshChannels()
    await select(channel.id)
    return channel
  }

  async function refreshPresence(): Promise<void> {
    const orgId = organizationId.value
    if (!orgId) return
    const current = generation
    const ids = await run(() => listOnlineMembers(orgId))
    if (ids && current === generation) online.value = ids
  }

  /** Posts a Google Meet link in the active channel; returns the link or an error message. */
  async function meet(): Promise<{ link?: string; error?: string }> {
    const channelId = activeId.value
    if (!channelId) return {}
    try {
      const message = await startMeet(channelId)
      upsert(channelId, message)
      touchChannel(channelId, message, true)
      return { link: message.content.match(/https?:\/\/\S+/)?.[0] }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Não foi possível iniciar o Meet.' }
    }
  }

  async function handleEvent(event: ChatEvent, currentUserId: UUID): Promise<void> {
    if (event.type === 'chat.typing') {
      if (event.user_id === currentUserId) return
      typing.value[event.channel_id] = event.name
      clearTimeout(timers.get(event.channel_id))
      timers.set(
        event.channel_id,
        setTimeout(() => delete typing.value[event.channel_id], TYPING_MS),
      )
      return
    }
    const { channel_id: channelId, message } = event
    // a conversation opened by someone else is not in our list yet
    if (!channels.value.some((c) => c.id === channelId)) await refreshChannels()
    if (event.type === 'chat.message_deleted') {
      messages.value[channelId] = (messages.value[channelId] ?? []).filter(
        (m) => m.id !== message.id,
      )
      return
    }
    if (messages.value[channelId] || channelId === activeId.value) upsert(channelId, message)
    if (event.type !== 'chat.message') return
    delete typing.value[channelId]
    const mine = message.author_id === currentUserId
    touchChannel(channelId, message, mine)
    const channel = channels.value.find((c) => c.id === channelId)
    if (!channel || mine) return
    if (channelId === activeId.value) void run(() => markRead(channelId))
    else channel.unread_count += 1
  }

  return {
    online,
    organizationId,
    channels,
    messages,
    activeId,
    typing,
    error,
    load,
    select,
    send,
    edit,
    remove,
    loadOlder,
    hasOlder,
    openTeamsChannel,
    refreshPresence,
    meet,
    handleEvent,
    reset,
  }
})
