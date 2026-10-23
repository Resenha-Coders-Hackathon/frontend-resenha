import type { TaskPriority, UUID } from '@/shared/types'
import type { ChatAttachment, ChatMessage, ChatTaskReference } from './index'

/* Tipos só de tela (dados de demonstração). Os contratos da API ficam em ./index.ts. */

export interface DemoTaskReference extends ChatTaskReference {
  code: string
}

export interface DemoAttachment extends ChatAttachment {
  pages?: number
}

export interface DemoMessage extends Omit<ChatMessage, 'task' | 'attachments'> {
  task: DemoTaskReference | null
  attachments: DemoAttachment[]
}

export interface AssistantStep {
  id: string
  label: string
}

export interface AssistantTaskSuggestion {
  id: UUID
  title: string
  assignee: string
  due: string
  priority: TaskPriority
  integration: { label: string; icon: string } | null
  selected: boolean
}

export type AssistantEntry =
  | { id: string; kind: 'user'; time: string; content: string; attachment?: DemoAttachment }
  | {
      id: string
      kind: 'assistant'
      time: string
      duration?: string
      content: string
      steps?: AssistantStep[]
      tasks?: AssistantTaskSuggestion[]
      actions?: boolean
    }

export interface AssistantHistoryItem {
  id: string
  title: string
}
