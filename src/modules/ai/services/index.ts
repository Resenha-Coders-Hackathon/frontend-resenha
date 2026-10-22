import axios from 'axios'
import { api, getErrorMessage } from '@/app/plugins/axios'
import type { AiAnswer } from '../types'

// Limite do AIAskSerializer no backend.
export const AI_PROMPT_MAX_LENGTH = 10000

// O backend é stateless (uma pergunta, uma resposta): não há histórico no servidor.
export async function askAi(prompt: string): Promise<string> {
  const text = prompt.trim()
  if (!text) throw new Error('Digite uma pergunta.')
  if (text.length > AI_PROMPT_MAX_LENGTH) {
    throw new Error(`A pergunta pode ter no máximo ${AI_PROMPT_MAX_LENGTH} caracteres.`)
  }

  try {
    return (await api.post<AiAnswer>('/ai/ask/', { prompt: text })).data.answer
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      throw new Error('A IA está ocupada no momento. Tente novamente em instantes.')
    }
    throw new Error(getErrorMessage(error, 'Não foi possível consultar a IA.'))
  }
}
