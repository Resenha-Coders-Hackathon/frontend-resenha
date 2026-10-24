import { api, getErrorMessage } from '@/app/plugins/axios'
import type { Page, UUID } from '@/shared/types'
import type {
  ChatChannel,
  ChatMessage,
  CreateTeamsChannelRequest,
  WriteChatMessageRequest,
} from '../types'

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

export async function sendMessage(
  channelId: UUID,
  content: string,
  extra: Omit<WriteChatMessageRequest, 'content'> = {},
): Promise<ChatMessage> {
  try {
    const { files, ...fields } = extra
    const url = `/chat/channels/${channelId}/messages/`
    if (files?.length) {
      // anexos exigem multipart/form-data
      const body = new FormData()
      body.append('content', content)
      if (fields.reply_to) body.append('reply_to', fields.reply_to)
      if (fields.task) body.append('task', fields.task)
      fields.mentions?.forEach((id) => body.append('mentions', id))
      files.forEach((file) => body.append('files', file))
      return (await api.post<ChatMessage>(url, body)).data
    }
    return (await api.post<ChatMessage>(url, { content, ...fields })).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível enviar a mensagem.'))
  }
}

export async function editMessage(messageId: UUID, content: string): Promise<ChatMessage> {
  try {
    return (await api.patch<ChatMessage>(`/chat/messages/${messageId}/`, { content })).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível editar a mensagem.'))
  }
}

export async function deleteMessage(messageId: UUID): Promise<void> {
  try {
    await api.delete(`/chat/messages/${messageId}/`)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível apagar a mensagem.'))
  }
}

export async function createTeamsChannel(
  organizationId: UUID,
  payload: CreateTeamsChannelRequest,
): Promise<ChatChannel> {
  try {
    return (
      await api.post<ChatChannel>(`/organizations/${organizationId}/chat/team-channels/`, payload)
    ).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível criar a conversa entre times.'))
  }
}

/** Ids of the organization members that are online now. */
export async function listOnlineMembers(organizationId: UUID): Promise<UUID[]> {
  try {
    return (await api.get<{ online: UUID[] }>(`/organizations/${organizationId}/chat/presence/`))
      .data.online
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível consultar quem está online.'))
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
