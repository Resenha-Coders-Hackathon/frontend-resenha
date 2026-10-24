import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { UUID } from '@/shared/types'
import { AiRequestError, analyzeAiFiles, askAi, createTaskFromDraft } from '../services'
import type {
  AiAskRequest,
  AiConversation,
  AiDraftState,
  AiMessage,
  AiTaskConfirm,
} from '../types'

export const useAiStore = defineStore('ai', () => {
  const conversations = ref<AiConversation[]>([])
  const activeId = ref<UUID | null>(null)
  const isAsking = ref(false)
  const isAnalyzing = ref(false)
  const error = ref('')
  const ownerId = ref<UUID | null>(null)
  // Draft cards by `<message id>:<action index>`; the draft itself lives in the receipt.
  const drafts = ref<Record<string, AiDraftState>>({})
  const active = computed(() => conversations.value.find((item) => item.id === activeId.value))
  const messages = computed(() => active.value?.messages ?? [])
  const isBusy = computed(() => isAsking.value || isAnalyzing.value)
  let generation = 0

  function clear(): void {
    generation += 1
    for (const conversation of conversations.value) {
      for (const message of conversation.messages) {
        if (message.report) URL.revokeObjectURL(message.report.url)
      }
    }
    conversations.value = []
    drafts.value = {}
    activeId.value = null
    error.value = ''
    isAsking.value = false
    isAnalyzing.value = false
  }

  function setOwner(id: UUID | null): void {
    if (ownerId.value === id) return
    clear()
    ownerId.value = id
  }

  function newConversation(): void {
    const item: AiConversation = {
      id: crypto.randomUUID(),
      server_id: null,
      title: 'Nova conversa',
      messages: [],
      confirmation_token: null,
      pending: null,
      expired: false,
    }
    conversations.value.unshift(item)
    activeId.value = item.id
    error.value = ''
  }

  function select(id: UUID): void {
    if (!conversations.value.some((item) => item.id === id)) return
    activeId.value = id
    error.value = ''
  }

  function conversation(): AiConversation | undefined {
    if (!ownerId.value) {
      error.value = 'Entre na sua conta para usar o assistente.'
      return
    }
    if (!active.value) newConversation()
    return active.value
  }

  function userMessage(content: string): AiMessage {
    return {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      status: 'sending',
    }
  }

  async function execute(target: AiConversation, payload: AiAskRequest): Promise<boolean> {
    const current = generation
    isAsking.value = true
    error.value = ''
    let pending = target.pending
    if (!pending) {
      const message = userMessage(payload.prompt)
      target.messages.push(message)
      if (target.messages.length === 1) target.title = payload.prompt.slice(0, 60)
      pending = { payload, message_id: message.id }
      target.pending = pending
    }
    const message = target.messages.find((entry) => entry.id === pending.message_id)
    if (message) {
      message.status = 'sending'
      message.error = undefined
    }
    try {
      // Keep the original payload on retry, including the original conversation ID.
      const result = await askAi({ ...pending.payload })
      if (generation !== current) return false
      target.server_id = result.conversation_id
      target.confirmation_token = result.confirmation_token
      target.pending = null
      if (message) message.status = 'sent'
      target.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.answer,
        created_at: new Date().toISOString(),
        actions: result.actions,
        confirmation_token: result.confirmation_token,
        choices: result.choices ?? [],
        unverified: result.unverified ?? false,
      })
      return true
    } catch (e) {
      if (generation !== current) return false
      const status = e instanceof AiRequestError ? e.status : undefined
      error.value =
        status === 404
          ? 'Esta conversa expirou. Inicie uma nova conversa para continuar.'
          : e instanceof Error
            ? e.message
            : 'Não foi possível consultar a IA.'
      if (message) {
        message.status = 'failed'
        message.error = error.value
      }
      // No new intent may replace a request whose outcome is still uncertain.
      // Retrying 429/network/5xx reuses its UUID so tool writes are not duplicated.
      if (status && status < 500 && status !== 429) {
        target.pending = null
        if (payload.confirmation_token) target.confirmation_token = null
      }
      if (status === 404) {
        target.expired = true
        target.confirmation_token = null
      }
      return false
    } finally {
      if (generation === current) isAsking.value = false
    }
  }

  async function ask(prompt: string, organizationId?: UUID | null): Promise<boolean> {
    const text = prompt.trim()
    if (!text || isBusy.value) return false
    const target = conversation()
    if (!target || target.expired) return false
    if (target.pending) {
      error.value = 'Tente enviar novamente a mensagem pendente antes de continuar.'
      return false
    }
    const payload: AiAskRequest = { prompt: text, request_id: crypto.randomUUID() }
    if (target.server_id) payload.conversation_id = target.server_id
    // The backend validates membership; the context only helps resolve targets.
    if (organizationId) payload.context = { organization_id: organizationId }
    return execute(target, payload)
  }

  async function retry(): Promise<boolean> {
    const target = active.value
    if (!target?.pending || isBusy.value) return false
    return execute(target, target.pending.payload)
  }

  async function confirmDeletion(): Promise<boolean> {
    const target = active.value
    if (!target?.server_id || !target.confirmation_token || target.pending || isBusy.value)
      return false
    return execute(target, {
      prompt: 'Confirmar exclusão da tarefa.',
      request_id: crypto.randomUUID(),
      conversation_id: target.server_id,
      confirmation_token: target.confirmation_token,
    })
  }

  async function confirmDraft(key: string, payload: AiTaskConfirm): Promise<boolean> {
    const target = active.value
    const state = drafts.value[key]
    if (!target || state?.status === 'creating' || state?.status === 'created') return false
    const current = generation
    drafts.value[key] = { status: 'creating' }
    try {
      // Same request_id on retry: the backend returns the first task, never a second.
      const task = await createTaskFromDraft(payload)
      if (generation !== current) return false
      drafts.value[key] = { status: 'created', task }
      target.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Tarefa criada.',
        created_at: new Date().toISOString(),
        actions: [{ action: 'task_create', writes: true, status: 'succeeded', result: task }],
        choices: ['Adicionar checklist', 'Criar outra tarefa', 'Nada mais'],
      })
      return true
    } catch (e) {
      if (generation !== current) return false
      drafts.value[key] = {
        status: 'failed',
        error: e instanceof Error ? e.message : 'Não foi possível criar a tarefa.',
      }
      return false
    }
  }

  function discardDraft(key: string): void {
    if (drafts.value[key]?.status === 'creating') return
    drafts.value[key] = { status: 'discarded' }
  }

  async function analyze(files: File[]): Promise<boolean> {
    if (!files.length || isBusy.value) return false
    const target = conversation()
    if (!target) return false
    const current = generation
    const message = userMessage('Analisar arquivos e gerar relatório PDF.')
    message.files = files.map((file) => ({ name: file.name, size: file.size }))
    target.messages.push(message)
    if (target.messages.length === 1) target.title = files[0]?.name ?? 'Análise de arquivos'
    isAnalyzing.value = true
    error.value = ''
    try {
      const blob = await analyzeAiFiles(files)
      if (generation !== current) return false
      const entry = target.messages.find((item) => item.id === message.id)
      if (entry) entry.status = 'sent'
      target.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Relatório gerado. Baixe o PDF para consultar a análise dos arquivos.',
        created_at: new Date().toISOString(),
        report: { url: URL.createObjectURL(blob), file_name: 'analysis-report.pdf' },
      })
      return true
    } catch (e) {
      if (generation !== current) return false
      error.value = e instanceof Error ? e.message : 'Não foi possível analisar os arquivos.'
      const entry = target.messages.find((item) => item.id === message.id)
      if (entry) {
        entry.status = 'failed'
        entry.error = error.value
      }
      return false
    } finally {
      if (generation === current) isAnalyzing.value = false
    }
  }

  return {
    conversations,
    activeId,
    active,
    messages,
    isAsking,
    isAnalyzing,
    isBusy,
    drafts,
    error,
    setOwner,
    newConversation,
    select,
    ask,
    retry,
    confirmDeletion,
    confirmDraft,
    discardDraft,
    analyze,
    clear,
  }
})
