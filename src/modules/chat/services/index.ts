import { api, getErrorMessage } from '@/app/plugins/axios'
import type { Page, UUID } from '@/shared/types'
import type { ChatChannel, ChatMessage } from '../types'

export async function listChannels(organizationId: UUID): Promise<ChatChannel[]> {
  try {
    return (await api.get<ChatChannel[]>(`/organizations/${organizationId}/chat/channels/`)).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível carregar as conversas.'))
  }
}

export async function openDirect(organizationId: UUID, userId: UUID): Promise<ChatChannel> {
  try {
    const body = { user_id: userId }
    return (await api.post<ChatChannel>(`/organizations/${organizationId}/chat/direct/`, body)).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível abrir a conversa.'))
  }
}

/** Newest first, as the backend returns it. */
export async function listMessages(channelId: UUID, page = 1): Promise<Page<ChatMessage>> {
  try {
    return (
      await api.get<Page<ChatMessage>>(`/chat/channels/${channelId}/messages/`, {
        params: { page },
      })
    ).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível carregar as mensagens.'))
  }
}

export async function sendMessage(channelId: UUID, content: string): Promise<ChatMessage> {
  try {
    return (await api.post<ChatMessage>(`/chat/channels/${channelId}/messages/`, { content })).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível enviar a mensagem.'))
  }
}

export async function markRead(channelId: UUID): Promise<void> {
  try {
    await api.post(`/chat/channels/${channelId}/read/`)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível marcar como lida.'))
  }
}

export async function startMeet(channelId: UUID): Promise<ChatMessage> {
  try {
    return (await api.post<ChatMessage>(`/chat/channels/${channelId}/meet/`)).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível iniciar o Meet.'))
  }
}
