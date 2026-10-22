import { ref } from 'vue'
import { defineStore } from 'pinia'
import { askAi } from '../services'
import type { AiMessage } from '../types'

export const useAiStore = defineStore('ai', () => {
  const messages = ref<AiMessage[]>([])
  const isAsking = ref(false)
  const error = ref('')

  async function ask(prompt: string): Promise<void> {
    if (isAsking.value) return
    error.value = ''
    isAsking.value = true
    try {
      const answer = await askAi(prompt)
      messages.value.push({ role: 'user', content: prompt.trim() })
      messages.value.push({ role: 'assistant', content: answer })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Não foi possível consultar a IA.'
    } finally {
      isAsking.value = false
    }
  }

  function clear(): void {
    messages.value = []
    error.value = ''
  }

  return { messages, isAsking, error, ask, clear }
})
