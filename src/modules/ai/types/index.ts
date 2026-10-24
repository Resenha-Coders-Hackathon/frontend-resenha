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

/** Receipt of one tool call, built by the backend from the real outcome. */
export interface AiAction {
  action: string
  writes: boolean
  targets?: Record<string, unknown>
  status: 'succeeded' | 'failed' | 'uncertain' | 'confirmation_required'
  result?: unknown
  error?: unknown
  detail?: string
  replayed?: boolean
}

export interface AiAnswer {
  answer: string
  conversation_id: UUID
  actions: AiAction[]
  confirmation_token: UUID | null
  interrupted?: boolean
  choices?: string[]
  unverified?: boolean
}

export interface AiAskRequest {
  prompt: string
  conversation_id?: UUID
  request_id: UUID
  confirmation_token?: UUID
  context?: { organization_id?: UUID }
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
  choices?: string[]
  unverified?: boolean
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
