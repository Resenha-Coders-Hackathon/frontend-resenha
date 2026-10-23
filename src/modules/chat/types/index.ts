import type { UUID, ISODateTime } from '@/shared/types'

export interface ChatAttachment {
  id: UUID
  file_name: string
  mime_type: string
  size_bytes: number
  url: string
}
export interface ChatTaskReference {
  id: UUID
  title: string
  sector_id: UUID
  status: string
  completed: boolean
}
export interface ChatMention {
  id: UUID
  name: string
}
export interface ChatMessage {
  id: UUID
  channel_id: UUID
  author_id: UUID
  author_name: string
  content: string
  reply_to_id: UUID | null
  task: ChatTaskReference | null
  mentions: ChatMention[]
  attachments: ChatAttachment[]
  created_at: ISODateTime
  edited_at: ISODateTime | null
  deleted_at: ISODateTime | null
}
export type ChatChannelKind = 'organization' | 'team' | 'teams' | 'sector' | 'direct'
export interface ChatLastMessage {
  id: UUID
  author_name: string
  content: string
  has_attachments: boolean
  created_at: ISODateTime
}
export interface ChatChannel {
  id: UUID
  kind: ChatChannelKind
  name: string
  team_id: UUID | null
  team_ids: UUID[]
  sector_id: UUID | null
  unread_count: number
  member_count: number
  online: boolean | null
  last_message: ChatLastMessage | null
}
export interface OpenDirectChatRequest {
  user_id: UUID
}
export interface CreateTeamsChannelRequest {
  team_ids: UUID[]
  name?: string
}
/** Files must be sent using multipart/form-data. */
export interface WriteChatMessageRequest {
  content?: string
  reply_to?: UUID | null
  task?: UUID | null
  mentions?: UUID[]
  files?: File[]
}
export interface EditChatMessageRequest {
  content: string
}
