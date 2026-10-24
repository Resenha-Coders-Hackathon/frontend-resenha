import type { ISODateTime, ITasks, UUID } from '@/shared/types'

export interface AiTask extends ITasks {
  description_truncated?: boolean
}

export interface AiSector {
  id: UUID
  name: string
  organization_id: UUID
  organization_name: string
  statuses: { id: UUID; name: string; category: 'todo' | 'in_progress' | 'done' }[]
}

/** Results returned by the backend tool registry, not task proposals. */
export interface AiAction {
  name: string
  ok: boolean
  task?: AiTask
  tasks?: AiTask[]
  sectors?: AiSector[]
  deleted_task_id?: UUID
  confirmation_required?: boolean
  ambiguous?: boolean
  has_more?: boolean
  error?: unknown
}

export interface AiAnswer {
  answer: string
  conversation_id: UUID
  actions: AiAction[]
  confirmation_token: UUID | null
}

export interface AiAskRequest {
  prompt: string
  conversation_id?: UUID
  request_id: UUID
  confirmation_token?: UUID
}

export interface AiReport {
  url: string
  file_name: string
}

export interface AiMessage {
  id: UUID
  role: 'user' | 'assistant'
  content: string
  created_at: ISODateTime
  status?: 'sending' | 'sent' | 'failed'
  error?: string
  actions?: AiAction[]
  confirmation_token?: UUID | null
  report?: AiReport
  files?: { name: string; size: number }[]
}

export interface AiPendingRequest {
  payload: AiAskRequest
  message_id: UUID
}

/** Client-session history; the backend has no conversation-list endpoint. */
export interface AiConversation {
  id: UUID
  server_id: UUID | null
  title: string
  messages: AiMessage[]
  confirmation_token: UUID | null
  pending: AiPendingRequest | null
  expired: boolean
}
