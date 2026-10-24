import axios from 'axios'
import { api, getErrorMessage } from '@/app/plugins/axios'
import type { AiAnswer, AiAskRequest, AiPerson, AiTask, AiTaskConfirm } from '../types'
import { aiErrorDetails } from '../utils'

// Limite do AIAskSerializer no backend.
export const AI_PROMPT_MAX_LENGTH = 10000

export class AiRequestError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AiRequestError'
    this.status = status
  }
}

function requestError(error: unknown, fallback: string): AiRequestError {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined
  const detail = getErrorMessage(error, fallback)
  const nested = axios.isAxiosError(error) ? aiErrorDetails(error.response?.data) : ''
  return new AiRequestError(nested || detail, status)
}

export async function askAi(payload: AiAskRequest): Promise<AiAnswer> {
  const text = payload.prompt.trim()
  if (!text) throw new AiRequestError('Digite uma pergunta.', 400)
  if (text.length > AI_PROMPT_MAX_LENGTH) {
    throw new AiRequestError(
      `A pergunta pode ter no máximo ${AI_PROMPT_MAX_LENGTH} caracteres.`,
      400,
    )
  }

  try {
    return (await api.post<AiAnswer>('/ai/ask/', { ...payload, prompt: text })).data
  } catch (error) {
    throw requestError(error, 'Não foi possível consultar a IA.')
  }
}

export async function analyzeAiFiles(files: File[]): Promise<Blob> {
  if (!files.length) throw new Error('Selecione pelo menos um arquivo.')
  const body = new FormData()
  files.forEach((file) => body.append('files', file))
  try {
    const response = await api.post<Blob>('/ai/analyze/', body, { responseType: 'blob' })
    if (!response.data.type.toLowerCase().startsWith('application/pdf')) {
      throw new Error('A análise não retornou um relatório PDF.')
    }
    return response.data
  } catch (error) {
    // Axios also returns JSON error bodies as blobs with responseType='blob'.
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      const text = await error.response.data.text()
      try {
        const data: unknown = JSON.parse(text)
        error.response.data = data
      } catch {
        // Keep non-JSON responses out of the UI; show the service fallback.
      }
    }
    throw requestError(error, 'Não foi possível analisar os arquivos.')
  }
}

/** People who can be assigned in a sector (feeds the draft card selectors). */
export async function fetchTaskOptions(sectorId: string): Promise<AiPerson[]> {
  try {
    const { data } = await api.get<{ people: AiPerson[] }>('/ai/tasks/options/', {
      params: { sector_id: sectorId },
    })
    return data.people
  } catch (error) {
    throw requestError(error, 'Não foi possível carregar as pessoas do setor.')
  }
}

/** Creates the confirmed draft. The same request_id never creates a second task. */
export async function createTaskFromDraft(
  payload: AiTaskConfirm,
): Promise<AiTask & { notes: string[] }> {
  try {
    return (await api.post<AiTask & { notes: string[] }>('/ai/tasks/', payload)).data
  } catch (error) {
    throw requestError(error, 'Não foi possível criar a tarefa.')
  }
}
